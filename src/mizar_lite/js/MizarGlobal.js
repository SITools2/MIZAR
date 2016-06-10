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

/**
 * Mizar widget Global
 */
define(["jquery", "underscore-min",
        "gw/Utils/Event",
        "./Utils", "MizarCore", "MizarWidgetGui",
        "text!templates/mizarCore.html"],
    function ($, _, Event, Utils, MizarCore, MizarWidgetGui, mizarCoreHTML) {

        var parentElement;
        var options;
        var self;

        var getMizarUrl = function () {
            /**
             *    Store the mizar base urlferf
             *    Used to access to images(Compass, Mollweide, Target icon for name resolver)
             *    Also used to define "star" icon for point data on-fly
             *    NB: Not the best solution of my life.... TODO: think how to improve it..
             */
            // Search throught all the loaded scripts for minified version
            var scripts = document.getElementsByTagName('script');
            var mizarSrc = _.find(scripts, function (script) {
                return script.src.indexOf("MizarWidget.min") !== -1;
            });

            // Depending on its presence decide if Mizar is used on prod or on dev
            var mizarBaseUrl;
            if (mizarSrc) {
                // Prod
                // Extract mizar's url
                mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/') + '/';
            }
            else {
                // Dev
                // Basically use the relative path from index page
                mizarSrc = _.find(scripts, function (script) {
                    return script.src.indexOf("MizarGlobal") !== -1;
                });
                mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/') + '/../';
            }
            return mizarBaseUrl;
        }

        /**
         * Mizar Widget Global constructor
         */
        var MizarGlobal = function (div, userOptions, callbackInitMain) {
            Event.prototype.constructor.call(this);

            var mizarBaseUrl = getMizarUrl();

            // Sky mode by default
            this.mode = (!_.isEmpty(userOptions.mode)) ? userOptions.mode : "sky";

            parentElement = div;
            self = this;

            var sitoolsBaseUrl = userOptions.sitoolsBaseUrl ? userOptions.sitoolsBaseUrl : "http://demonstrator.telespazio.com/sitools";
            var isMobile = ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch));

            options = {
                "sitoolsBaseUrl": sitoolsBaseUrl,
                "mizarBaseUrl": mizarBaseUrl,
                "continuousRendering": userOptions
                    .hasOwnProperty('continuousRendering') ? userOptions.continuousRendering : !isMobile,
                "coordSystem": userOptions.hasOwnProperty('coordSystem') ? userOptions.coordSystem
                    : "EQ",
                "debug": userOptions.hasOwnProperty('debug') ? userOptions.debug
                    : false,
                "nameResolver": {
                    "jsObject": "./name_resolver/DefaultNameResolver",
                    "baseUrl": sitoolsBaseUrl + '/mizar/plugin/nameResolver',
                    // "baseUrl" : "http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oxp/ALL"
                    "zoomFov": 15,
                    "duration": 3000
                },
                "reverseNameResolver": {
                    // "jsObject" :
                    // "./reverse_name_resolver/DefaultReverseNameResolver",
                    "jsObject": "./reverse_name_resolver/CDSReverseNameResolver",
                    // "baseUrl": sitoolsBaseUrl +
                    // '/mizar/plugin/reverseNameResolver',
                    "baseUrl": "http://alasky.u-strasbg.fr/cgi/simbad-flat/simbad-quick.py?Ident={coordinates}&SR={radius}",
                },
                "coverageService": {
                    "baseUrl": sitoolsBaseUrl
                    + "/project/mizar/plugin/coverage?moc="
                },
                "solarObjects": {
                    "baseUrl": sitoolsBaseUrl
                    + "/project/mizar/plugin/solarObjects/"
                },
                "votable2geojson": {
                    "baseUrl": sitoolsBaseUrl
                    + "/project/mizar/plugin/votable2geojson"
                },
                "cutOut": {
                    "baseUrl": sitoolsBaseUrl + "/cutout"
                },
                "zScale": {
                    "baseUrl": sitoolsBaseUrl + "/zscale"
                },
                "healpixcut": {
                    "baseUrl": sitoolsBaseUrl + "/healpixcut"
                },
                "shortener": {
                    "baseUrl": sitoolsBaseUrl + "/shortener"
                },
                "navigation": {
                    "initTarget": [85.2500, -2.4608],
                    "initFov": 20,
                    "inertia": true,
                    "minFov": 0.001,
                    "zoomFactor": 0,
                    "isMobile": isMobile,
                    "mouse": {
                        "zoomOnDblClick": true
                    }
                },
                "stats": {
                    "verbose": false,
                    "visible": false
                },
                "positionTracker": {
                    "position": "bottom"
                },
                "elevationTracker": {
                    "position": "bottom"
                },
                "isMobile": isMobile,
                "hipsServiceUrl": userOptions.hasOwnProperty('hipsServiceUrl') ? userOptions.hipsServiceUrl : undefined
            };

            // Async Load of MizarWidgetGui if GUI activated
            if (userOptions.guiActivated) {

                // Create mizar core HTML
                var mizarContent = _.template(mizarCoreHTML, {});
                $(mizarContent).appendTo(div);

                self.mizarCore = new MizarCore(div, options, userOptions);

                self.mizarWidgetGui = new MizarWidgetGui(div, {
                    isMobile: isMobile,
                    mode: userOptions.mode,
                    mizarGlobal: self,
                    sky: self.mizarCore.scene,
                    navigation: self.mizarCore.navigation,
                    options: options
                });

            } else {
                // Create mizar core HTML
                var mizarContent = _.template(mizarCoreHTML, {});
                $(mizarContent).appendTo(div);

                self.mizarCore = new MizarCore(div, options, userOptions);
            }

        };

        /**************************************************************************************************************/

        Utils.inherits(Event, MizarGlobal);

        /**************************************************************************************************************/

        /**
         * Get the current Mizar context (Sky/Planet)
         */
        MizarGlobal.prototype.getContext = function () {
            return this.mizarCore.activatedContext;
        };

        /**************************************************************************************************************/

        /**
         * Get the current Scene
         */
        MizarGlobal.prototype.getScene = function () {
            return this.mizarCore.scene;
        };

        /**************************************************************************************************************/

        /**
         * Get the current Navigation
         */
        MizarGlobal.prototype.getNavigation = function () {
            return this.mizarCore.navigation;
        };

        /**************************************************************************************************************/

        /**
         * Get Mizar Core
         */
        MizarGlobal.prototype.getCore = function () {
            return this.mizarCore;
        };

        /**************************************************************************************************************/

        /**
         * Get Mizar Gui
         */
        MizarGlobal.prototype.getGui = function () {
            return this.mizarWidgetGui;
        };

        /**************************************************************************************************************/

        /**
         * Get layers depending on the mode
         * @param {string} mode
         */
        MizarGlobal.prototype.getLayers = function (mode) {
            if (this.mizarCore) {
                return this.mizarCore.getLayers(mode);
            }
        };

        /**************************************************************************************************************/

        /**
         * Get layer with the given name
         * @param {String} layerName
         */
        MizarGlobal.prototype.getLayer = function (layerName) {
            if (this.mizarCore) {
                return this.mizarCore.getLayer(layerName);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add additional layer(OpenSearch, GeoJSON, HIPS, grid coordinates)
         *    @param {Object} layerDesc
         *        Layer description
         *    @param {Layer} planetLayer
         *        Planet layer, if described layer must be added to planet (optional)
         *    @return
         *        The created layer
         */
        MizarGlobal.prototype.addLayer = function (layerDesc, planetLayer) {
            if (this.mizarCore) {
                return this.mizarCore.addLayer(layerDesc, planetLayer);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Set the credits popup
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setShowCredits = function (visible) {
            if (this.mizarCore) {
                this.mizarCore.setShowCredits(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove compass GUI
         *    Only on desktop due performance issues
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setCompassGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setCompassGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove angle distance GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setAngleDistanceSkyGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setAngleDistanceSkyGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Activate Switch To 2D
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setSwitchTo2D = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setSwitchTo2D(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove samp GUI Only on desktop
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setSampGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setSampGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove shortener GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setShortenerUrlGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setShortenerUrlGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove 2d map GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setMollweideMapGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setMollweideMapGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove reverse name resolver GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setReverseNameResolverGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setReverseNameResolverGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove name resolver GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setNameResolverGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setNameResolverGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI layer manager view
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setCategoryGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setCategoryGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI image viewer GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setImageViewerGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setImageViewerGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI Export GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setExportGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setExportGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove position tracker GUI
         *    @param {boolean} visible
         */
        MizarGlobal.prototype.setPositionTrackerGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setPositionTrackerGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Toggle between between 3D and 2D
         *    @param {Layer} layer the current layer
         */
        MizarGlobal.prototype.toggleDimension = function (gwLayer) {
            if (this.mizarCore) {
                this.mizarCore.toggleDimension(gwLayer);
            }
        };

        /**************************************************************************************************************/

        /**
         * Toggle between planet and sky mode
         *
         * @param {Layer} gwLayer
         * @param {String} planetDimension (2D or 3D)
         * @param {Function} callback
         */
        MizarGlobal.prototype.toggleContext = function (gwLayer, planetDimension, callback) {
            if (this.mizarCore) {
                this.mizarCore.toggleContext(gwLayer, planetDimension, callback);
            }
        };

        /**************************************************************************************************************/

        /**
         * Get additional layers depending on current context
         */
        MizarGlobal.prototype.getAdditionalLayers = function () {
            return this.getContext().getAdditionalLayers();
        };

        return MizarGlobal;

    });
