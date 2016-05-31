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
 * AdditionalLayersView module
 * @class AdditionalLayersCore
 */
define(["jquery", "underscore-min", "gw/Renderer/FeatureStyle", "gw/Layer/OpenSearchLayer", "gw/Layer/HEALPixFITSLayer", "gw/Layer/MocLayer", "gw/Layer/PlanetLayer", "gw/Layer/VectorLayer", "gui_core/dialog/ErrorDialog", "Utils"],
    function ($, _, FeatureStyle, OpenSearchLayer, HEALPixFITSLayer, MocLayer, PlanetLayer, VectorLayer, ErrorDialog, Utils) {

        var mizar;
        var sky;
        var navigation;

        /**************************************************************************************************************/

        /**
         *    Generate point legend in canvas 2d
         *
         *    @param gwLayer GlobWeb layer
         *    @param canvas Canvas
         *    @param imageUrl Image source url used for point texture
         */
        function generatePointLegend(gwLayer, canvas, imageUrl) {
            var context = canvas.getContext('2d');
            var icon = new Image();
            icon.crossOrigin = '';
            icon.onload = function () {
                // var width = (icon.width > canvas.width) ? canvas.width : icon.width;
                // var height = (icon.height > canvas.height) ? canvas.height : icon.height;
                context.drawImage(icon, 5, 0, 10, 10);

                // colorize icon
                var data = context.getImageData(0, 0, canvas.width, canvas.height);
                for (var i = 0, length = data.data.length; i < length; i += 4) {
                    data.data[i] = gwLayer.style.fillColor[0] * 255;
                    data.data[i + 1] = gwLayer.style.fillColor[1] * 255;
                    data.data[i + 2] = gwLayer.style.fillColor[2] * 255;
                }

                context.putImageData(data, 0, 0);
            };
            icon.src = imageUrl;
        };

        /**************************************************************************************************************/

        /**
         *    Generate line legend in canvas 2d
         */
        function generateLineLegend(gwLayer, canvas) {
            var context = canvas.getContext('2d');

            var margin = 2;
            context.beginPath();
            context.moveTo(margin, canvas.height - margin);
            context.lineTo(canvas.width / 2 - margin, margin);
            context.lineTo(canvas.width / 2 + margin, canvas.height - margin);
            context.lineTo(canvas.width - margin, margin);
            context.lineWidth = 1;

            // set line color
            context.strokeStyle = FeatureStyle.fromColorToString(gwLayer.style.fillColor);
            context.stroke();
        };

        /**************************************************************************************************************/

        /**
         * Generate HTML from layer and template
         * @param template
         * @param gwLayer
         * @param shortName
         * @param isMobile
         * @returns {*}
         */
        function createHTMLFromTemplate(template, gwLayer, shortName, isMobile) {
            return template({
                layer: gwLayer,
                OpenSearchLayer: OpenSearchLayer,
                HEALPixFITSLayer: HEALPixFITSLayer,
                shortName: shortName,
                isMobile: isMobile
            });
        };

        /**************************************************************************************************************/

        /**
         * Set sublayers visibility
         * @param gwLayer
         * @param isOn
         */
        function setSublayersVisibility(gwLayer, isOn) {
            var i;
            if (isOn) {
                for (i = 0; i < gwLayer.subLayers.length; i++) {
                    sky.addLayer(gwLayer.subLayers[i]);
                }
            }
            else {
                for (i = 0; i < gwLayer.subLayers.length; i++) {
                    sky.removeLayer(gwLayer.subLayers[i]);
                }
            }
        };

        /**************************************************************************************************************/

        /**
         *    Build visible tiles url
         */
        function buildVisibleTilesUrl(layer) {
            // Find max visible order & visible pixel indices
            var maxOrder = 3;
            var pixelIndices = "";
            for (var i = 0; i < sky.tileManager.visibleTiles.length; i++) {
                var tile = sky.tileManager.visibleTiles[i];
                if (maxOrder < tile.order) {
                    maxOrder = tile.order;
                }

                pixelIndices += tile.pixelIndex;
                if (i < sky.tileManager.visibleTiles.length - 1) {
                    pixelIndices += ",";
                }
            }
            return layer.serviceUrl + "/search?order=" + maxOrder + "&healpix=" + pixelIndices + "&coordSystem=EQUATORIAL";
        };

        /**************************************************************************************************************/

        /**
         * Zoom to barycenter of all features contained by layer
         *    (available for GlobWeb.VectorLayers only)
         * @param {Layer} layer
         */
        function zoomTo(layer) {
            var sLon = 0;
            var sLat = 0;
            var nbGeometries = 0;

            if (layer.features.length > 0) {
                for (var i = 0; i < layer.features.length; i++) {
                    var barycenter = Utils.computeGeometryBarycenter(layer.features[i].geometry);
                    sLon += barycenter[0];
                    sLat += barycenter[1];
                    nbGeometries++;
                }
                //TODO : compute the fov of the zoomTo according to the shape.
                mizar.activatedContext.navigation.zoomTo([sLon / nbGeometries, sLat / nbGeometries]);
            }
        };

        /**************************************************************************************************************/

        return {
            /**
             * @constructor
             * @param m
             * @param s
             * @param nav
             */
            init: function (m, s, nav) {
                mizar = m;
                sky = s;
                navigation = nav;
            },
            generatePointLegend: generatePointLegend,
            generateLineLegend: generateLineLegend,
            buildVisibleTilesUrl: buildVisibleTilesUrl,
            createHTMLFromTemplate: createHTMLFromTemplate,
            setSublayersVisibility: setSublayersVisibility,
            zoomTo: zoomTo
        };
    });
