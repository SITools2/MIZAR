/*******************************************************************************
 * Copyright 2012-2015 CNES - CENTRE NATIONAL d'ETUDES SPATIALES
 *
 * This file is part of SITools2.
 *
 * SITools2 is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SITools2 is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with SITools2. If not, see <http://www.gnu.org/licenses/>.
 ******************************************************************************/
/*global define: false */

/**
 * Tool designed to measure the distance between two points in planet mode
 */

define(["jquery", "underscore-min", "Utils", "gw/Layer/VectorLayer", "gw/Renderer/Ray", "gw/Utils/Numeric", "gw/Renderer/FeatureStyle", "gw/Renderer/glMatrix", "jquery.ui"],
    function ($, _, Utils, VectorLayer, Ray, Numeric, FeatureStyle) {

        var globe, navigation, onselect, scale;

        /**
         *    @constructor
         *    @param options Configuration options
         *        <ul>
         *            <li>globe: Globe</li>
         *            <li>navigation: Navigation</li>
         *            <li>onselect: On select callback</li>
         *        </ul>
         */
        var MeasureToolPlanet = function (options) {
            // Required options
            globe = options.globe;
            navigation = options.navigation;
            onselect = options.onselect;
            scale = options.planetLayer.elevationLayer.scale;

            this.activated = false;
            this.renderContext = globe.renderContext;

            // Layer containing measure feature
            this.measureLayer = new VectorLayer();
            globe.addLayer(this.measureLayer, options.planetLayer);

            this.measureFeature = null;

            this.mode = options.mode;

            // Measure attributes
            this.distance;
            this.pickPoint; // Window pick point
            this.secondPickPoint; // Window second pick point
            this.geoDistance;
            this.geoPickPoint; // Pick point in geographic reference
            this.secondGeoPickPoint; // Pick point in geographic reference

            this.measureLabel;

            var self = this;
            var dragging = false;
            this.elevations = [];

            var _handleMouseDown = function (event) {
                event.preventDefault();
                if (!self.activated) {
                    return;
                }

                self.distance = 0;
                // Disable standard navigation events
                navigation.stop();

                dragging = true;
                self.elevations = [];

                if (event.type.search("touch") >= 0) {
                    self.pickPoint = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
                }
                else {
                    self.pickPoint = [event.layerX, event.layerY];
                }
                self.geoPickPoint = globe.getLonLatFromPixel(self.pickPoint[0], self.pickPoint[1]);

                //self.storeDistanceAndElevation(self.geoPickPoint, self.geoPickPoint);
            };

            var _handleMouseUp = function (event) {
                event.preventDefault();
                if (!self.activated) {
                    return;
                }

                // Compute geo radius
                var stopPickPoint;
                if (event.type.search("touch") >= 0) {
                    stopPickPoint = globe.getLonLatFromPixel(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
                }
                else {

                    stopPickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);
                }

                // Find angle between start and stop vectors which is in fact the radius
                var dotProduct = vec3.dot(vec3.normalize(globe.coordinateSystem.fromGeoTo3D(stopPickPoint)), vec3.normalize(globe.coordinateSystem.fromGeoTo3D(self.geoPickPoint)));
                var theta = Math.acos(dotProduct);
                self.geoDistance = Numeric.toDegree(theta);

                if (onselect) {
                    onselect();
                }

                // Enable standard navigation events
                navigation.start();
                dragging = false;

                $.proxy(self.displayButtonElevation(event), self);

            };

            var _handleMouseMove = function (event) {
                event.preventDefault();
                if (!self.activated || !dragging) {
                    return;
                }
                if (event.type.search("touch") >= 0) {
                    self.secondPickPoint = [event.changedTouches[0].clientX, event.changedTouches[0].clientY];
                }
                else {
                    self.secondPickPoint = [event.layerX, event.layerY];
                }

                self.secondGeoPickPoint = globe.getLonLatFromPixel(self.secondPickPoint[0], self.secondPickPoint[1]);

                //self.storeDistanceAndElevation(self.geoPickPoint, self.secondGeoPickPoint);

                // Update radius
                self.distance = Math.sqrt(Math.pow(self.secondPickPoint[0] - self.pickPoint[0], 2) + Math.pow(self.secondPickPoint[1] - self.pickPoint[1], 2));

                if (self.secondGeoPickPoint == undefined) {
                    var dotProduct = vec3.dot(vec3.normalize(globe.coordinateSystem.fromGeoTo3D(self.secondPickPoint)), vec3.normalize(globe.coordinateSystem.fromGeoTo3D(self.geoPickPoint)));
                }
                else {
                    var dotProduct = vec3.dot(vec3.normalize(globe.coordinateSystem.fromGeoTo3D(self.secondGeoPickPoint)), vec3.normalize(globe.coordinateSystem.fromGeoTo3D(self.geoPickPoint)));
                }
                var theta = Math.acos(dotProduct);
                self.geoDistance = Numeric.toDegree(theta);

                self.updateMeasure();
            };

            this.renderContext.canvas.addEventListener("contextmenu", function () {
                return false;
            });
            this.renderContext.canvas.addEventListener("mousedown", $.proxy(_handleMouseDown, this));
            this.renderContext.canvas.addEventListener("mouseup", $.proxy(_handleMouseUp, this));
            this.renderContext.canvas.addEventListener("mousemove", $.proxy(_handleMouseMove, this));

            if (options.isMobile) {
                this.renderContext.canvas.addEventListener("touchend", $.proxy(_handleMouseUp, this));
                this.renderContext.canvas.addEventListener("touchmove", $.proxy(_handleMouseMove, this));
                this.renderContext.canvas.addEventListener("touchstart", $.proxy(_handleMouseDown, this));
            }
            $('#measurePlanetInvoker').on('click', function () {
                self.toggle();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });
        };

        /**********************************************************************************************/

        MeasureToolPlanet.prototype.computeIntersection = function (points) {
            var rc = this.renderContext;
            var tmpMat = mat4.create();

            // Computes eye in world space
            mat4.inverse(rc.viewMatrix, tmpMat);
            var eye = [tmpMat[12], tmpMat[13], tmpMat[14]];

            // Computes the inverse of view/proj matrix
            mat4.multiply(rc.projectionMatrix, rc.viewMatrix, tmpMat);
            mat4.inverse(tmpMat);

            // Transforms the four corners of measured shape into world space
            // and then for each corner computes the intersection of ray starting from the eye to the sphere
            var worldCenter = [0, 0, 0];
            for (var i = 0; i < points.length; i++) {
                mat4.multiplyVec4(tmpMat, points[i]);
                vec3.scale(points[i], 1.0 / points[i][3]);
                vec3.subtract(points[i], eye, points[i]);
                vec3.normalize(points[i]);

                var ray = new Ray(eye, points[i]);
                var pos3d = ray.computePoint(ray.sphereIntersect(worldCenter, globe.coordinateSystem.radius));
                //var pos3d = ray.computePoint(ray.sphereIntersect(worldCenter, 1));
                points[i] = globe.coordinateSystem.from3DToGeo(pos3d);
            }

            return points;
        };

        /**********************************************************************************************/

        function rotateVector2D(vec, theta) {
            theta = theta * Math.PI / 180;
            var cs = Math.cos(theta);
            var sn = Math.sin(theta);

            return [vec[0] * cs - vec[1] * sn, vec[0] * sn + vec[1] * cs];
        }

        function normalize2D(vec, dest) {
            if (!dest) {
                dest = vec;
            }

            var length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1]);
            dest[0] = vec[0] / length;
            dest[1] = vec[1] / length;
            return dest;
        }

        /**********************************************************************************************/

        /**
         *    Computes the measure for the given pick point depending on the second point
         */
        MeasureToolPlanet.prototype.computeMeasure = function () {
            var rc = this.renderContext;
            // Scale to [-1,1]
            var widthScale = 2 / rc.canvas.width;
            var heightScale = 2 / rc.canvas.height;

            var diff = [this.secondPickPoint[0] - this.pickPoint[0], this.secondPickPoint[1] - this.pickPoint[1]];
            normalize2D(diff);

            // First arrow
            var arrow = rotateVector2D(diff, 30);
            var arrow2 = rotateVector2D(diff, -30);
            arrow = [this.pickPoint[0] + 10 * arrow[0], this.pickPoint[1] + 10 * arrow[1]];
            arrow2 = [this.pickPoint[0] + 10 * arrow2[0], this.pickPoint[1] + 10 * arrow2[1]];

            var diff2 = [-diff[0], -diff[1]];
            var arrow3 = rotateVector2D(diff2, 30);
            var arrow4 = rotateVector2D(diff2, -30);
            arrow3 = [this.secondPickPoint[0] + 10 * arrow3[0], this.secondPickPoint[1] + 10 * arrow3[1]];
            arrow4 = [this.secondPickPoint[0] + 10 * arrow4[0], this.secondPickPoint[1] + 10 * arrow4[1]];

            var points = [
                [arrow[0] * widthScale - 1, (rc.canvas.height - arrow[1]) * heightScale - 1, 1, 1],
                [this.pickPoint[0] * widthScale - 1, (rc.canvas.height - this.pickPoint[1]) * heightScale - 1, 1, 1],
                [arrow2[0] * widthScale - 1, (rc.canvas.height - arrow2[1]) * heightScale - 1, 1, 1],
                [this.pickPoint[0] * widthScale - 1, (rc.canvas.height - this.pickPoint[1]) * heightScale - 1, 1, 1]
            ];

            ////calcul des points intermédiaires
            //var distance = 1;
            //var x = this.pickPoint[0], y = this.pickPoint[1];
            //while (x < this.secondPickPoint[0] && y < this.secondPickPoint[1]) {
            //    x += distance * diff[0];
            //    y += distance * diff[1];
            //    points.push([x * widthScale - 1, (rc.canvas.height - y) * heightScale - 1, 1, 1]);
            //}

            //ajout du dernier point
            points.push(
                [this.secondPickPoint[0] * widthScale - 1, (rc.canvas.height - this.secondPickPoint[1]) * heightScale - 1, 1, 1],
                [arrow3[0] * widthScale - 1, (rc.canvas.height - arrow3[1]) * heightScale - 1, 1, 1],
                [this.secondPickPoint[0] * widthScale - 1, (rc.canvas.height - this.secondPickPoint[1]) * heightScale - 1, 1, 1],
                [arrow4[0] * widthScale - 1, (rc.canvas.height - arrow4[1]) * heightScale - 1, 1, 1]
            );


            this.computeIntersection(points);
            return points;
        };

        /**************************************************************************************************************/

        /**
         *    Updates measure coordinates
         */
        MeasureToolPlanet.prototype.updateMeasure = function () {
            this.clear();

            var coordinates = this.computeMeasure();

            this.measureFeature = {
                "geometry": {
                    "gid": "measureShape",
                    "coordinates": coordinates,
                    "type": "LineString"
                },
                "properties": {
                    "style": new FeatureStyle({
                        //zIndex: 2,
                        fillColor: [1, 0, 0, 1]
                    })
                },
                "type": "Feature"
            };


            var center = [(this.secondPickPoint[0] + this.pickPoint[0]) / 2, (this.secondPickPoint[1] + this.pickPoint[1]) / 2];
            var ray = Ray.createFromPixel(this.renderContext, center[0], center[1]);
            var center3d = ray.computePoint(ray.sphereIntersect([0, 0, 0], globe.coordinateSystem.radius));

            var geoCenter = globe.coordinateSystem.from3DToGeo(center3d);

            var distance = this.calculateDistanceElevation(this.geoPickPoint, this.secondGeoPickPoint);
            distance = Utils.roundNumber(distance.toFixed(3), 2);

            this.measureLabel = {
                geometry: {
                    type: "Point",
                    gid: "measureShape",
                    coordinates: geoCenter
                },
                properties: {
                    style: new FeatureStyle({
                        //label: globe.coordinateSystem.fromDegreesToDMS(this.geoDistance),
                        //label: globe.coordinateSystem.from3DToGeo(geoCenter),
                        label: distance + " km",
                        fillColor: [1, 1, 1, 1],
                        //zIndex: 10000,
                        extrusionScale : -1000
                    })
                }
            };

            this.measureLayer.addFeature(this.measureFeature);
            this.measureLayer.addFeature(this.measureLabel);
        };

        /**************************************************************************************************************/

        /**
         *    Enable/disable the tool
         */
        MeasureToolPlanet.prototype.toggle = function () {
            this.activated = !this.activated;
            if (this.activated) {
                $(this.renderContext.canvas).css('cursor', 'url(css/images/selectionCursor.png)');
            }
            else {
                $(this.renderContext.canvas).css('cursor', 'default');
                $('#elevationTrackingBtn').hide();
                try {
                    $('#popupElevation').dialog('close');
                } catch (e) {}

                this.clear();
            }
            $('#measurePlanetInvoker').toggleClass('selected');
        };

        /**************************************************************************************************************/

        /**
         * Display a popup proposing to display elevation tracking
         */
        MeasureToolPlanet.prototype.displayButtonElevation = function (event) {

            $('#elevationTrackingBtn').button()
                .click($.proxy(this.displayPopupElevation, this))
                .show()
                .position({
                    my: "left+3 bottom-3",
                    of: event,
                    collision: "fit"
                });

        };

        /**************************************************************************************************************/

        /**
         * Display a popup proposing to display elevation tracking
         */
        MeasureToolPlanet.prototype.displayPopupElevation = function (event) {

            this.elevations = [];
            var intermediatePoints = this.calculateIntermediateElevationPoint(this.geoPickPoint, this.secondGeoPickPoint);

            this.storeDistanceAndElevation(intermediatePoints[0], intermediatePoints[0]);
            for (var i = 0; i < intermediatePoints.length; i++) {
                this.storeDistanceAndElevation(intermediatePoints[0], intermediatePoints[i]);
            }

            $("#popupElevation").dialog({
                width: 500,
                height: 400,
                position: {
                    my: "right top",
                    at: "right top",
                    of: window
                }
            });

            $.plot("#popupElevation", [{
                data: this.elevations, label: "elevation (m)"
            }], {
                series: {
                    color: "#F68D12",
                    lines: {
                        show: true
                    },
                    points: {
                        show: true
                    }
                },
                grid: {
                    hoverable: true
                },
                tooltip: {
                    show: true,
                    content: "Distance: %x | Elevation: %y",
                    cssClass: "flotTip",
                    shifts: {
                        x: -25,
                        y: -60
                    }
                },
                xaxis: {
                    axisLabel: 'Distance (km)',
                    axisLabelUseCanvas: false,
                    axisLabelFontSizePixels: 20
                },
                yaxis: {
                    axisLabel: 'Elevation (m)',
                    axisLabelUseCanvas: false,
                    axisLabelFontSizePixels: 20
                },
                zoom: {
                    interactive: true
                },
                pan: {
                    interactive: true
                }
            });
        };

        /**************************************************************************************************************/
        /**
         *    Clear measure
         */
        MeasureToolPlanet.prototype.clear = function () {
            if (this.measureFeature) {
                this.measureLayer.removeFeature(this.measureFeature);
            }
            if (this.measureLabel) {
                this.measureLayer.removeFeature(this.measureLabel);
            }

        };

        /**************************************************************************************************************/

        MeasureToolPlanet.prototype.calculateIntermediateElevationPoint = function (firstPoint, secondPoint) {
            var scale = 25;
            var intervalX = (firstPoint[0] - secondPoint[0]) / scale;
            var intervalY = (firstPoint[1] - secondPoint[1]) / scale;

            var intermediatePoints = [];
            intermediatePoints[0] = firstPoint;
            for (var i = 1; i < scale; i++) {

                var x = (intermediatePoints[i - 1][0] - intervalX);
                var y = (intermediatePoints[i - 1][1] - intervalY);
                intermediatePoints[i] = [x, y];
            }
            intermediatePoints[scale] = secondPoint;
            return intermediatePoints;
        };

        /**
         *
         * url calcul distance : http://www.movable-type.co.uk/scripts/latlong.html
         *
         * @param firstPoint
         * @param secondPoint
         * @returns {number}
         */
        MeasureToolPlanet.prototype.calculateDistanceElevation = function (firstPoint, secondPoint) {
            var R = 3390000; // metres TODO Utiliser le système de ref de JC
            var φ1 = Numeric.toRadian(firstPoint[1]);
            var φ2 = Numeric.toRadian(secondPoint[1]);
            var Δφ = Numeric.toRadian(secondPoint[1] - firstPoint[1]);
            var Δλ = Numeric.toRadian(secondPoint[0] - firstPoint[0]);

            var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            var distance = R * c;

            return distance / 1000;

        };

        MeasureToolPlanet.prototype.storeDistanceAndElevation = function (firstPoint, secondPoint) {
            var distance = this.calculateDistanceElevation(firstPoint, secondPoint);
            distance = Utils.roundNumber(distance.toFixed(3), 2);

            var elevation = navigation.globe.getElevation(secondPoint[0], secondPoint[1]);
            elevation = Utils.roundNumber(elevation / scale, 0)
            var pointElevation = [distance, elevation];

            this.elevations.push(pointElevation);
            //console.dir(this.elevations);
        }

        return MeasureToolPlanet;

    });
