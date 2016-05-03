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

define(["jquery", "gui_core/SelectionToolLite", "gw/Layer/VectorLayer", "gw/Renderer/FeatureStyle", "gw/Utils/Numeric", "gw/Renderer/Ray", "Utils", "gw/Renderer/glMatrix"],
    function ($, SelectionToolLite, VectorLayer, FeatureStyle, Numeric, Ray, Utils) {


        /**
         *    @constructor
         *    @param options Configuration options
         *        <ul>
         *            <li>globe: Globe</li>
         *            <li>navigation: Navigation</li>
         *            <li>onselect: On selection callback</li>
         *            <li>style: Selection tool style</li>
         *        </ul>
         */
        var SelectionTool = function (options) {
            // Required options
            var globe = options.globe;
            var navigation = options.navigation;
            var onselect = options.onselect;

            this.activated = options.activated || false;
            this.renderContext = globe.renderContext;
            this.coordinateSystem = globe.coordinateSystem;

            SelectionToolLite.init(options);

            // Set style
            var style;
            if (options && options['style']) {
                style = options['style'];
            }
            else {
                style = new FeatureStyle();
            }
            style.zIndex = 2;

            // Layer containing selection feature
            this.selectionLayer = new VectorLayer({
                style: style
            });
            globe.addLayer(this.selectionLayer);

            this.selectionFeature = null;

            // Selection attributes
            this.radius;	// Window radius
            this.pickPoint; // Window pick point
            this.geoRadius; // Radius in geographic reference
            this.geoPickPoint; // Pick point in geographic reference

            var self = this;
            var dragging = false;
            var state;

            this.renderContext.canvas.addEventListener("mousedown", function (event) {

                var pickPoint = [event.layerX, event.layerY];
                var geoPickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);

                if (!self.activated && !self.selectionFeature) {
                    return;
                }

                // Dragging : moving/resizing OR drawing selection
                if (self.activated) {
                    // Draw
                    navigation.stop();
                    dragging = true;
                    self.pickPoint = pickPoint;
                    self.geoPickPoint = geoPickPoint;
                    self.radius = 0.;
                    state = "resize";
                }
                else {
                    var pickIsInside = Utils.pointInRing(geoPickPoint, self.selectionFeature.geometry.coordinates[0]);
                    if (!pickIsInside) {
                        return;
                    }
                    navigation.stop();
                    dragging = true;
                    // Resize/move
                    var inside = false;
                    // Check if user clicked on one of control points
                    for (var i = 0; i < self.selectionFeature.geometry.coordinates[0].length; i++) {
                        var controlPoint = self.selectionFeature.geometry.coordinates[0][i];
                        inside |= Utils.pointInSphere(geoPickPoint, controlPoint, 20);
                    }

                    if (inside) {
                        state = "resize";
                    }
                    else {
                        state = "move";
                    }
                }
            });

            this.renderContext.canvas.addEventListener("mousemove", function (event) {
                if (!dragging)
                    return;

                var geoPickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);
                if (state === "resize") {
                    // Update radius
                    self.radius = Math.sqrt(Math.pow(event.layerX - self.pickPoint[0], 2) + Math.pow(event.layerY - self.pickPoint[1], 2));
                    SelectionToolLite.computeGeoRadius(geoPickPoint);
                }
                else if (state === "move") {
                    // Update pick point position
                    self.pickPoint = [event.layerX, event.layerY];
                    self.geoPickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);

                    // TODO: scale radius of selection shape if fov has been changed(or not?)
                }
                SelectionToolLite.updateSelection();
            });

            this.renderContext.canvas.addEventListener("mouseup", function (event) {
                if (!dragging)
                    return;

                // Compute geo radius
                var stopPickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);

                var coordinates = SelectionToolLite.computeSelection();
                if (self.activated && onselect) {
                    onselect(coordinates);
                }

                // Reactivate standard navigation events
                navigation.start();
                dragging = false;
            });
        };

        /**************************************************************************************************************/

        /**
         *    Activate/desactivate the tool
         */
        SelectionTool.prototype.toggle = function () {
            this.activated = !this.activated;
            if (this.activated) {
                // TODO : Find more sexy image for cursor
                $(this.renderContext.canvas).css('cursor', 'url(css/images/selectionCursor.png)');
            }
            else {
                $(this.renderContext.canvas).css('cursor', 'default');
            }
        };

        /**************************************************************************************************************/

        /**
         *    Clear selection
         */
        SelectionTool.prototype.clear = function () {
          SelectionToolLite.clear();
        };

        return SelectionTool;

    });
