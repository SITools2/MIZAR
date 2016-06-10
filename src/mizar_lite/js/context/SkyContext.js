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
 * Sky context (inherited from MizarContext)
 */
define(["jquery", "underscore-min", "gw/Context/Sky", "gw/Navigation/AstroNavigation", "gw/Utils/Utils",
        "./MizarContext", "../layer/LayerManager", "../provider/StarProvider", "../provider/ConstellationProvider",
        "../provider/JsonProvider", "../provider/OpenSearchProvider", "tracker/PositionTracker", "gui_core/PickingManagerCore", "jquery.ui"],
    function ($, _, Sky, AstroNavigation, Utils,
              MizarContext, LayerManager, StarProvider, ConstellationProvider,
              JsonProvider, OpenSearchProvider, PositionTracker, PickingManagerCore) {

        /**************************************************************************************************************/

        /**
         *    Sky context constructor
         *    @param parentElement
         *        Element containing the canvas
         *    @param options Configuration properties for the Globe
         *        <ul>
         *            <li>canvas : the canvas for WebGL, can be string (id) or a canvas element</li>
         *            <li>Same as Mizar options</li>
         *        </ul>
         */
        var SkyContext = function (parentElement, options) {
            MizarContext.prototype.constructor.call(this, parentElement, options);

            this.initCanvas(options.canvas, parentElement);

            // Initialize sky
            try {
                // Create the sky
                this.globe = new Sky({
                    canvas: options.canvas,
                    tileErrorTreshold: 1.5,
                    continuousRendering: options.continuousRendering,
                    renderTileWithoutTexture: false,
                    radius: 10.,
                    minFar: 15		// Fix problem with far buffer, with planet rendering
                });
            }
            catch (err) {
                document.getElementById('GlobWebCanvas').style.display = "none";
                document.getElementById('loading').style.display = "none";
                document.getElementById('webGLNotAvailable').style.display = "block";
            }
            this.initGlobeEvents(this.globe);

            if (options.isMobile) {
                this.initTouchNavigation(options);
            }
            this.navigation = new AstroNavigation(this.globe, options.navigation);

            // Eye position tracker initialization
            this.positionTracker = new PositionTracker({
                element: "posTracker",
                globe: this.globe,
                navigation: this.navigation,
                isMobile: this.isMobile,
                positionTracker: options.positionTracker
            });
        };

        /**************************************************************************************************************/

        Utils.inherits(MizarContext, SkyContext);

        /**************************************************************************************************************/

        /**
         *    Get additional layers of sky context
         */
        SkyContext.prototype.getAdditionalLayers = function () {
            return _.filter(LayerManager.getLayers("sky"), function (layer) {
                return layer.category !== "background";
            });
        };

        /**************************************************************************************************************/

        /**
         * Load specific sky providers and register them to the LayerManager
         */
        SkyContext.prototype.loadProviders = function () {
            MizarContext.prototype.loadProviders.call(this);

            var starProvider = new StarProvider();
            var constellationProvider = new ConstellationProvider();
            var openSearchProvider = new OpenSearchProvider();

            LayerManager.registerDataProvider("constellation", constellationProvider.loadFiles);
            LayerManager.registerDataProvider("star", starProvider.loadFiles);
            LayerManager.registerDataProvider("OpenSearch", function (gwLayer, configuration) {
                openSearchProvider.loadFiles(gwLayer, configuration, 1);
            });
        };

        /**************************************************************************************************************/

        /**
         * Change background survey
         * @param {string} survey the name of the layer
         */
        SkyContext.prototype.setBackgroundSurvey = function (survey) {
            var globe = this.globe;
            var gwLayer;

            var mizarCore = mizar.getCore();
            var gwLayers = mizar.getLayers("sky");

            // Find the layer by name among all the layers
            gwLayer = _.findWhere(gwLayers, {name: survey});
            if (gwLayer) {
                // Check if is not already set
                if (gwLayer !== globe.baseImagery) {
                    // Change visibility's of previous layer, because visibility is used to know the active background layer in the layers list (layers can be shared)
                    if (globe.baseImagery) {
                        globe.baseImagery.visible(false);
                    }
                    globe.setBaseImagery(gwLayer);
                    gwLayer.visible(true);

                    // Clear selection
                    PickingManagerCore.getSelection().length = 0;

                    for (var i = 0; i < gwLayers.length; i++) {
                        var currentLayer = gwLayers[i];
                        if (currentLayer.subLayers) {
                            var len = currentLayer.subLayers.length;
                            for (var j = 0; j < len; j++) {
                                var subLayer = currentLayer.subLayers[j];
                                if (subLayer.name === "SolarObjectsSublayer") {
                                    PickingManagerCore.removePickableLayer(subLayer);
                                    globe.removeLayer(subLayer);
                                    currentLayer.subLayers.splice(j, 1);
                                }
                            }
                        }
                    }
                    mizarCore.publish("backgroundLayer:change", gwLayer);
                }
            } else {
                mizarCore.publish("backgroundSurveyError", "Survey " + survey + " hasn't been found");
            }
        };

        /**************************************************************************************************************/

        return SkyContext;

    });
