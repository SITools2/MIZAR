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
        "MizarWidgetCore",
        "text!./templates/mizarCore.html",
        "text!../data/backgroundSurveys.json"],
    function ($, _, MizarWidgetCore, mizarCoreHTML) {

        var parentElement;
        var options;
        var planetContext;
        var skyContext;
        var mizarWidgetGui, mizarWidgetCore;

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
                    return script.src.indexOf("MizarWidget") !== -1;
                });
                mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/') + '/../';
            }
            return mizarBaseUrl;
        }

        /**
         * Mizar widget Global constructor
         */
        var MizarWidgetGlobal = function (div, userOptions) {

            var mizarBaseUrl = getMizarUrl();

            // Sky mode by default
            var mode = (!_.isEmpty(userOptions.mode)) ? userOptions.mode : "sky";

            parentElement = div;

            var sitoolsBaseUrl = userOptions.sitoolsBaseUrl ? userOptions.sitoolsBaseUrl
                : "http://demonstrator.telespazio.com/sitools";
            var isMobile = ('ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch));

            options = {
                "sitoolsBaseUrl": sitoolsBaseUrl,
                "mizarBaseUrl": mizarBaseUrl,
                "continuousRendering": userOptions
                    .hasOwnProperty('continuousRendering') ? userOptions.continuousRendering
                    : !isMobile,
                "coordSystem": userOptions.hasOwnProperty('coordSystem') ? userOptions.coordSystem
                    : "EQ",
                "debug": userOptions.hasOwnProperty('debug') ? userOptions.debug
                    : false,
                "nameResolver": {
                    "jsObject": "./name_resolver/DefaultNameResolver",
                    "baseUrl": sitoolsBaseUrl
                    + '/mizar/plugin/nameResolver',
                    // "baseUrl" :
                    // "http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oxp/ALL"
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
                "hipsServiceUrl": userOptions
                    .hasOwnProperty('hipsServiceUrl') ? userOptions.hipsServiceUrl
                    : undefined
            };

            //var extendableOptions = ["navigation", "nameResolver",
            //    "stats", "positionTracker", "elevationTracker"];
            //// Merge default options with user ones
            //for (var i = 0; i < extendableOptions.length; i++) {
            //    var option = extendableOptions[i];
            //    $.extend(options[option], userOptions[option]);
            //}

            // Create mizar core HTML
            var mizarContent = _.template(mizarCoreHTML, {});
            $(mizarContent).appendTo(div);

            this.sky = null;
            this.navigation = null;

            // TODO move to MizarWidgetGui if possible ??
            /** * Refactor into common ? ** */
                // Fade hover styled image effect
            //$("body").on("mouseenter", "span.defaultImg", function () {
            //    // stuff to do on mouseover
            //    $(this).stop().animate({
            //        "opacity": "0"
            //    }, 100);
            //    $(this).siblings('.hoverImg').stop().animate({
            //        "opacity": "1"
            //    }, 100);
            //});
            //$("body").on("mouseleave", "span.defaultImg", function () {
            //    // stuff to do on mouseleave
            //    $(this).stop().animate({
            //        "opacity": "1"
            //    }, 100);
            //    $(this).siblings('.hoverImg').stop().animate({
            //        "opacity": "0"
            //    }, 100);
            //});

            mizarWidgetCore = new MizarWidgetCore(div, options, userOptions);

            if (userOptions.guiActivated) {
                var mizarWidgetGuiRequire = require('mizar_gui/MizarWidgetGui');
                mizarWidgetGui = new mizarWidgetGuiRequire(div, userOptions, {
                    mizar: this,
                    navigation: this.navigation,
                    configuration: options
                });
            }

        };

        /************************************************************************************************************* */

        /**
         * Get all layers
         */
        MizarWidgetGlobal.prototype.getLayers = function () {
            return mizarWidgetCore.getLayers();
        };

        /************************************************************************************************************* */

        /**
         * Get layer with the given name
         */
        MizarWidgetGlobal.prototype.getLayer = function (layerName) {
            return mizarWidgetCore.getLayer(layerName);
        };

        /************************************************************************************************************* */

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
            return mizarWidgetCore.addLayer(layerDesc, planetLayer);
        };

        /************************************************************************************************************* */

        /**
         *    Set the credits popup
         */
        MizarWidgetGlobal.prototype.setShowCredits = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setShowCredits(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove compass GUI
         *    Only on desktop due performance issues
         */
        MizarWidgetGlobal.prototype.setCompassGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setCompassGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove angle distance GUI
         */
        MizarWidgetGlobal.prototype.setAngleDistanceSkyGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setAngleDistanceSkyGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Activate Switch To 2D
         */
        MizarWidgetGlobal.prototype.setSwitchTo2D = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setSwitchTo2D(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove samp GUI
         *    Only on desktop
         */
        MizarWidgetGlobal.prototype.setSampGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setSampGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove shortener GUI
         */
        MizarWidgetGlobal.prototype.setShortenerUrlGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setShortenerUrlGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove 2d map GUI
         */
        MizarWidgetGlobal.prototype.set2dMapGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.set2dMapGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove reverse name resolver GUI
         */
        MizarWidgetGlobal.prototype.setReverseNameResolverGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setReverseNameResolverGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove name resolver GUI
         */
        MizarWidgetGlobal.prototype.setNameResolverGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setNameResolverGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI layer manager view
         */
        MizarWidgetGlobal.prototype.setCategoryGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setCategoryGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI image viewer GUI
         */
        MizarWidgetGlobal.prototype.setImageViewerGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setImageViewerGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove jQueryUI Export GUI
         */
        MizarWidgetGlobal.prototype.setExportGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setExportGui(visible);
            }
        };

        /**************************************************************************************************************/

        /**
         *    Add/remove position tracker GUI
         */
        MizarWidgetGlobal.prototype.setPositionTrackerGui = function (visible) {
            if (mizarWidgetGui) {
                mizarWidgetGui.setPositionTrackerGui(visible);
            }
        };

        /**************************************************************************************************************/

        return MizarWidgetGlobal;

    });
