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
 * Planet context (inherited from MizarContext)
 */
define(["jquery", "underscore-min", "gw/Context/Globe", "gw/AttributionHandler", "gw/Navigation/Navigation", "gw/Utils/Utils",
    "./MizarContext", "../layer/LayerManager", "../provider/JsonProvider", "tracker/PositionTracker",
    "tracker/ElevationTracker", "gw/Navigation/FlatNavigation", "gw/Projection/MercatorCoordinateSystem", "gw/Layer/WCSElevationLayer", "jquery.ui"],
    function ($, _, Globe, AttributionHandler, Navigation, Utils, MizarContext,
              LayerManager, JsonProvider, PositionTracker,
              ElevationTracker, FlatNavigation, MercatorCoordinateSystem, WCSElevationLayer) {

        /**************************************************************************************************************/

        /**
         *    PlanetContext constructor
         *
         *    @param parentElement
         *        Element containing the canvas
         *    @param options Configuration properties for the Globe
         *        <ul>
         *            <li>planetLayer : Planet layer to set</li>
         *            <li>renderContext : Sky <RenderContext> object</li>
         *            <li>Same as Mizar options</li>
         *        </ul>
         */
        var PlanetContext = function (parentElement, options) {

            MizarContext.prototype.constructor.call(this, parentElement, options);
            this.mode = options.mode;

            if (options.canvas) {
                this.initCanvas(options.canvas, parentElement);
            }

            // Initialize globe
            try {
                this.globe = new Globe({
                    tileErrorTreshold: 3,
                    continuousRendering: false,
                    renderContext: options.renderContext,
                    canvas: options.canvas,
                    shadersPath: "../mizar_lite/externals/GlobWeb/shaders/"
                });
            }
            catch (err) {
                document.getElementById('GlobWebCanvas').style.display = "none";
                document.getElementById('loading').style.display = "none";
                document.getElementById('webGLNotAvailable').style.display = "block";
            }
            this.initGlobeEvents(this.globe);

            // Add attribution handler
            new AttributionHandler(this.globe, {element: 'globeAttributions'});

            // Initialize planet context
            this.planetLayer = options.planetLayer;
            if (this.planetLayer) {
                this.globe.addLayer(this.planetLayer);
            }

            if (options.isMobile) {
                this.initTouchNavigation(options);
            }
            // Don't update view matrix on creation, since we want to use animation on context change
            options.navigation.updateViewMatrix = false;

            // Eye position tracker initialization

            this.positionTracker = new PositionTracker({
                element: "posTracker",
                globe: this.globe,
                positionTracker: options.positionTracker
            });

            if (this.mode == "3d") {
                //ElevationTracker.init({
                //    element: "elevTracker",
                //    globe: this.globe,
                //    elevationTracker: options.elevationTracker,
                //    elevationLayer: (options.planetLayer != undefined) ? options.planetLayer.elevationLayer : undefined
                //});
                this.elevationTracker = new ElevationTracker({
                    element: "elevTracker",
                    globe: this.globe,
                    elevationTracker: options.elevationTracker,
                    elevationLayer: (options.planetLayer != undefined) ? options.planetLayer.elevationLayer : undefined
                });

                this.navigation = new Navigation(this.globe, options.navigation);
                var initTarget = options.initTarget || [85.2500, -2.4608];
                this.navigation.zoomTo(initTarget, 18000000);
            } else {
                this.navigation = new FlatNavigation(this.globe, options.navigation);
                this.globe.setCoordinateSystem(new MercatorCoordinateSystem());
                this.navigation.pan(options.initTarget);
            }

            this.globe.publish("baseLayersReady");

        };

        /**************************************************************************************************************/

        Utils.inherits(MizarContext, PlanetContext);

        /**************************************************************************************************************/

        /**
         *    Get additional layers of planet context
         */
        PlanetContext.prototype.getAdditionalLayers = function () {
            return this.planetLayer.layers;
        };

        /**************************************************************************************************************/

        /**
         * Get the current elevation tracker
         * @returns {ElevationTracker|*}
         */
        PlanetContext.prototype.getElevationTracker = function () {
            return this.elevationTracker | console.log("No elevationTracker defined");
        };

        /**************************************************************************************************************/

        /**
         *    Destroy method
         */
        PlanetContext.prototype.destroy = function () {
            this.globe.removeLayer(this.planetLayer);
            this.hide();
            this.globe.destroy();
            this.globe = null;
        };

        /**************************************************************************************************************/

        /**
         * Change planet dimension
         *
         * @param gwLayer
         * @returns the new mode dimension
         */
        PlanetContext.prototype.toggleDimension = function (gwLayer) {
            if (this.mode == "2d") {
                this.mode = "3d";
            } else {
                this.mode = "2d";
            }
            return this.mode;
        };

        /**************************************************************************************************************/

        /**
         * Load specific planet providers and register them to the LayerManager
         */
        PlanetContext.prototype.loadProviders = function () {
            MizarContext.prototype.loadProviders.call(this);
        };

        /**************************************************************************************************************/

        /**
         * Change background survey
         * @param {string} survey the name of the layer
         */
        PlanetContext.prototype.setBackgroundSurvey = function (survey) {
            var globe = this.globe;
            var gwLayer;

            var planetLayers = mizar.getLayers("planet");
            gwLayer = _.findWhere(planetLayers, {name: survey});

            if (!_.isEmpty(gwLayer)) {
                if (globe.baseImagery) {
                    globe.baseImagery.visible(false);
                }
                globe.setBaseImagery(gwLayer);
                gwLayer.visible(true);
                mizar.getCore().publish("backgroundLayer:change", gwLayer);
            }
        };

        /**************************************************************************************************************/

        return PlanetContext;

    });
