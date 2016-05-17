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
        "./Utils",
        "text!../templates/mizarCore.html",
        "text!../data/backgroundSurveys.json"],
    function ($, _, Event, Utils, mizarCoreHTML) {

        var parentElement;
        var options;
        var self;

        var getMizarUrl = function () {
            /**
             *    Store the mizar base url
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
                    return script.src.indexOf("MizarWidgetGlobal") !== -1;
                });
                mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/') + '/../';
            }
            return mizarBaseUrl;
        }

        /**
         * Mizar Widget Global constructor
         */
        var MizarWidgetGlobal = function (div, userOptions, callbackInitMain) {
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
                require(['mizar_gui/MizarWidgetGui'], function (MizarWidgetGui) {

                    // Create mizar core HTML
                    var mizarContent = _.template(mizarCoreHTML, {});
                    $(mizarContent).appendTo(div);

                    require(['MizarWidgetCore'], function (MizarWidgetCore) {
                        self.mizarWidgetCore = new MizarWidgetCore(div, options, userOptions);

                        self.mizarWidgetGui = new MizarWidgetGui(div, {
                            isMobile: isMobile,
                            mode: userOptions.mode,
                            mizarGlobal: self,
                            sky: self.mizarWidgetCore.sky,
                            navigation: self.mizarWidgetCore.navigation,
                            options: options
                        });
                        callbackInitMain(); // init GUI and layers
                    });

                });
            } else {
                require(['MizarWidgetCore'], function (MizarWidgetCore) {
                    // Create mizar core HTML
                    var mizarContent = _.template(mizarCoreHTML, {});
                    $(mizarContent).appendTo(div);

                    self.mizarWidgetCore = new MizarWidgetCore(div, options, userOptions);
                    callbackInitMain(); // init GUI and layers
                });
            }

        };

        /**************************************************************************************************************/

        Utils.inherits(Event, MizarWidgetGlobal);

        /**************************************************************************************************************/

        /**
         * Get Mizar Core
         */
        MizarWidgetGlobal.prototype.getMizarCore = function () {
            return this.mizarWidgetCore;
        };

        /**************************************************************************************************************/

        /**
         * Get Mizar Gui
         */
        MizarWidgetGlobal.prototype.getMizarGui = function () {
            return this.mizarWidgetGui;
        };

        /**************************************************************************************************************/

        /**
         * Get all layers
         */
        MizarWidgetGlobal.prototype.getLayers = function () {
            if (this.mizarWidgetCore) {
                return this.mizarWidgetCore.getLayers();
            }
        };

        /**************************************************************************************************************/

        /**
         * Get layer with the given name
         */
        MizarWidgetGlobal.prototype.getLayer = function (layerName) {
            if (this.mizarWidgetCore) {
                return this.mizarWidgetCore.getLayer(layerName);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add additional layer(OpenSearch, GeoJSON, HIPS, grid coordinates)
         *    @param layerDesc
         *        Layer description
         *    @param planetLayer
         *        Planet layer, if described layer must be added to planet (optional)
         *    @return
         *        The created layer
         */
        MizarWidgetGlobal.prototype.addLayer = function (layerDesc, planetLayer) {
            if (this.mizarWidgetCore) {
                return this.mizarWidgetCore.addLayer(layerDesc, planetLayer);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Set the credits popup
         */
        MizarWidgetGlobal.prototype.setShowCredits = function (visible) {
            if (this.mizarWidgetCore) {
                this.mizarWidgetCore.setShowCredits(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove compass GUI
         *    Only on desktop due performance issues
         */
        MizarWidgetGlobal.prototype.setCompassGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setCompassGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove angle distance GUI
         */
        MizarWidgetGlobal.prototype.setAngleDistanceSkyGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setAngleDistanceSkyGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Activate Switch To 2D
         */
        MizarWidgetGlobal.prototype.setSwitchTo2D = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setSwitchTo2D(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove samp GUI
         *    Only on desktop
         */
        MizarWidgetGlobal.prototype.setSampGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setSampGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove shortener GUI
         */
        MizarWidgetGlobal.prototype.setShortenerUrlGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setShortenerUrlGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove 2d map GUI
         */
        MizarWidgetGlobal.prototype.setMollweideMapGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setMollweideMapGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove reverse name resolver GUI
         */
        MizarWidgetGlobal.prototype.setReverseNameResolverGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setReverseNameResolverGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove name resolver GUI
         */
        MizarWidgetGlobal.prototype.setNameResolverGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setNameResolverGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI layer manager view
         */
        MizarWidgetGlobal.prototype.setCategoryGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setCategoryGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI image viewer GUI
         */
        MizarWidgetGlobal.prototype.setImageViewerGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setImageViewerGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI Export GUI
         */
        MizarWidgetGlobal.prototype.setExportGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setExportGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove position tracker GUI
         */
        MizarWidgetGlobal.prototype.setPositionTrackerGui = function (visible) {
            if (this.mizarWidgetGui) {
                this.mizarWidgetGui.setPositionTrackerGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Toggle between between 3D and 2D
         */
        MizarWidgetGlobal.prototype.toggleDimension = function (gwLayer) {
            if (this.mizarWidgetCore) {
                this.mizarWidgetCore.toggleDimension(gwLayer);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Toggle between planet and sky mode
         */
        MizarWidgetGlobal.prototype.toggleMode = function (gwLayer, planetDimension, callback) {
            if (this.mizarWidgetCore) {
                this.mizarWidgetCore.toggleMode(gwLayer, planetDimension, callback);
            }
        };

        return MizarWidgetGlobal;

    });
