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
 * Planet context
 */
define(["jquery", "gw/Context/Globe", "gw/AttributionHandler", "gw/Navigation/Navigation", "gw/Utils/Utils", "./MizarContext", "../gui/PositionTracker", "../gui/ElevationTracker", "gw/Navigation/FlatNavigation", "gw/Projection/MercatorCoordinateSystem", "gw/Layer/WCSElevationLayer", "jquery.ui"],
    function ($, Globe, AttributionHandler, Navigation, Utils, MizarContext, PositionTracker, ElevationTracker, FlatNavigation, MercatorCoordinateSystem, WCSElevationLayer) {

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
            PositionTracker.init({element: "posTracker", globe: this.globe, positionTracker: options.positionTracker});

            if (this.mode == "3d") {
                ElevationTracker.init({
                    element: "elevTracker",
                    globe: this.globe,
                    elevationTracker: options.elevationTracker,
                    //elevationLayer: options.planetLayer.elevationLayer
                    //elevationLayer: options.planetLayer.elevationLayer
                    //elevationLayer: new WCSElevationLayer({
                    //    baseUrl : "http://idoc-wcsmars.ias.u-psud.fr/wcsmap"
                    //})
                });
                this.navigation = new Navigation(this.globe, options.navigation);
                //this.navigation.zoomTo(options.initTarget, 18000000);
                this.navigation.zoomTo([85.2500, -2.4608], 18000000);
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

        return PlanetContext;

    });
