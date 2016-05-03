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
 * Tool designed to select areas on globe
 */

define(["jquery", "gw/Layer/VectorLayer", "gw/Renderer/FeatureStyle", "gw/Utils/Numeric", "gw/Renderer/Ray", "Utils", "gw/Renderer/glMatrix"],
    function ($, VectorLayer, FeatureStyle, Numeric, Ray, Utils) {


        /**
         *    Compute selection tool radius between pickPoint and the given point
         */
        function computeGeoRadius(pt) {
            // Find angle between start and stop vectors which is in fact the radius
            var dotProduct = vec3.dot(vec3.normalize(this.coordinateSystem.fromGeoTo3D(pt)), vec3.normalize(this.coordinateSystem.fromGeoTo3D(this.geoPickPoint)));
            var theta = Math.acos(dotProduct);
            this.geoRadius = Numeric.toDegree(theta);
        }

        /**********************************************************************************************/

        /**
         *    Compute selection for the given pick point depending on radius
         */
        function computeSelection() {
            var rc = this.renderContext;
            var tmpMat = mat4.create();

            // Compute eye in world space
            mat4.inverse(rc.viewMatrix, tmpMat);
            var eye = [tmpMat[12], tmpMat[13], tmpMat[14]];

            // Compute the inverse of view/proj matrix
            mat4.multiply(rc.projectionMatrix, rc.viewMatrix, tmpMat);
            mat4.inverse(tmpMat);

            // Scale to [-1,1]
            var widthScale = 2 / rc.canvas.width;
            var heightScale = 2 / rc.canvas.height;
            var points = [
                [(this.pickPoint[0] - this.radius) * widthScale - 1., ((rc.canvas.height - this.pickPoint[1]) - this.radius) * heightScale - 1., 1, 1],
                [(this.pickPoint[0] - this.radius) * widthScale - 1., ((rc.canvas.height - this.pickPoint[1]) + this.radius) * heightScale - 1., 1, 1],
                [(this.pickPoint[0] + this.radius) * widthScale - 1., ((rc.canvas.height - this.pickPoint[1]) + this.radius) * heightScale - 1., 1, 1],
                [(this.pickPoint[0] + this.radius) * widthScale - 1., ((rc.canvas.height - this.pickPoint[1]) - this.radius) * heightScale - 1., 1, 1]
            ];

            // Transform the four corners of selection shape into world space
            // and then for each corner compute the intersection of ray starting from the eye with the sphere
            var worldCenter = [0, 0, 0];
            for (var i = 0; i < 4; i++) {
                mat4.multiplyVec4(tmpMat, points[i]);
                vec3.scale(points[i], 1.0 / points[i][3]);
                vec3.subtract(points[i], eye, points[i]);
                vec3.normalize(points[i]);

                var ray = new Ray(eye, points[i]);
                var pos3d = ray.computePoint(ray.sphereIntersect(worldCenter, this.coordinateSystem.radius));
                points[i] = this.coordinateSystem.from3DToGeo(pos3d);
            }

            return points;
        }

        /**************************************************************************************************************/

        /**
         *    Update selection coordinates
         */
        function updateSelection() {
            if (this.selectionFeature)
                this.selectionLayer.removeFeature(this.selectionFeature);

            var coordinates = this.computeSelection();
            // Close the polygon
            coordinates.push(coordinates[0]);

            this.selectionFeature = {
                "geometry": {
                    "gid": "selectionShape",
                    "coordinates": [coordinates],
                    "type": "Polygon"
                },
                "type": "Feature"
            };

            this.selectionLayer.addFeature(this.selectionFeature);
        }

        /**************************************************************************************************************/

        /**
         *    Clear selection
         */
        function clear() {
            if (this.selectionFeature)
                this.selectionLayer.removeFeature(this.selectionFeature);

            this.pickPoint = null;
            this.radius = null;
            this.geoPickPoint = null;
            this.geoRadius = null;
        };

        /**************************************************************************************************************/

        return {
            init : function (options) {
                this.renderContext = options.globe.renderContext;
                this.coordinateSystem = options.globe.coordinateSystem;
            },
            computeGeoRadius :computeGeoRadius,
            computeSelection : computeSelection,
            updateSelection : updateSelection,
            clear : clear
        };

    });
