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
 * Mizar widget Core
 */
define(["jquery", "underscore-min",
        "./context/PlanetContext",
        "./context/SkyContext",

        "text!../data/backgroundSurveys.json", "./layer/LayerManager",
        "./service/NameResolver", "./service/ReverseNameResolver",
        "./service/MocBase", "./Utils",
        "./gui_core/dialog/ErrorDialog",
        "./gui_core/dialog/AboutDialog",
        "./uws/UWSManager",
        "./gui_core/ImageManagerLite",

        // GlobWeb
        "gw/Layer/TileWireframeLayer",
        "gw/Utils/Stats", "gw/AttributionHandler", "gw/Utils/Event",

        "gw/Navigation/TouchNavigationHandler",
        "gw/Navigation/MouseNavigationHandler",
        "gw/Navigation/KeyboardNavigationHandler",
        "gw/Renderer/ConvexPolygonRenderer",
        "gw/Renderer/PointSpriteRenderer",
        "gw/Renderer/LineStringRenderable",
        "gw/Renderer/PointRenderer",
        "gw/Renderer/glMatrix", // load for all the application

        "./name_resolver/NameResolverManager",
        "./reverse_name_resolver/ReverseNameResolverManager"],
    function ($, _, PlanetContext, SkyContext,
              backgroundSurveys, LayerManager, NameResolver,
              ReverseNameResolver, MocBase, Utils,
              ErrorDialog, AboutDialog, UWSManager, ImageManagerLite, TileWireframeLayer, Stats,
              AttributionHandler, Event) {

        /**
         * Private variables
         */
        var parentElement;
        var options;
        var planetContext;
        var skyContext;
        var self;

        /**************************************************************************************************************/

        /**
         * Apply shared parameters to options if exist
         */
        var _applySharedParameters = function () {
            var documentURI = window.document.documentURI;
            // Retrieve shared parameters
            var sharedParametersIndex = documentURI
                .indexOf("sharedParameters=");
            if (sharedParametersIndex !== -1) {
                var startIndex = sharedParametersIndex
                    + "sharedParameters=".length;
                var sharedString = documentURI.substr(startIndex);
                if (options.shortener) {
                    $.ajax({
                        type: "GET",
                        url: options.shortener.baseUrl + '/'
                        + sharedString,
                        async: false, // TODO: create callback
                        success: function (sharedConf) {
                            _mergeWithOptions(sharedConf);
                        },
                        error: function (thrownError) {
                            console.error(thrownError);
                        }
                    });
                } else {
                    console
                        .log("Shortener plugin isn't defined, try to extract as a string");
                    var sharedParameters = JSON
                        .parse(decodeURI(sharedString));
                    _mergeWithOptions(sharedParameters);
                }
            }
        };

        /**************************************************************************************************************/

        /**
         * Remove "C"-like comment lines from string
         */
        var _removeComments = function (string) {
            var starCommentRe = new RegExp("/\\\*(.|[\r\n])*?\\\*/", "g");
            var slashCommentRe = new RegExp("[^:]//.*[\r\n]", "g");
            string = string.replace(slashCommentRe, "");
            string = string.replace(starCommentRe, "");

            return string;
        };

        /**************************************************************************************************************/

        /**
         * Merge retrieved shared parameters with Mizar configuration
         */
        var _mergeWithOptions = function (sharedParameters) {
            // Navigation
            options.navigation.initTarget = sharedParameters.initTarget;
            options.navigation.initFov = sharedParameters.fov;
            options.navigation.up = sharedParameters.up;

            // Layer visibility
            options.layerVisibility = sharedParameters.visibility;
        };

        /**************************************************************************************************************/

        /**
         * Store the mizar base url Used to access to images(Compass,
         * Mollweide, Target icon for name resolver) Also used to define
         * "star" icon for point data on-fly NB: Not the best solution of my
         * life.... TODO: think how to improve it..
         */
        // Search throught all the loaded scripts for minified version
        var scripts = document.getElementsByTagName('script');
        var mizarSrc = _.find(scripts, function (script) {
            return script.src.indexOf("MizarWidget.min") !== -1;
        });

        // Depending on its presence decide if Mizar is used on prod or on
        // dev
        var mizarBaseUrl;
        if (mizarSrc) {
            // Prod
            // Extract mizar's url
            mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/')
                + '/';
        } else {
            // Dev
            // Basically use the relative path from index page
            mizarSrc = _.find(scripts, function (script) {
                return script.src.indexOf("MizarWidget") !== -1;
            });
            mizarBaseUrl = mizarSrc.src.split('/').slice(0, -1).join('/')
                + '/../';
        }

        /**
         * Mizar widget constructor
         * @class
         * @constructor
         */
        var MizarWidgetCore = function (div, globalOptions, userOptions) {
            Event.prototype.constructor.call(this);

            // Sky mode by default
            //this.mode = "sky";
            this.mode = (!_.isEmpty(userOptions.mode)) ? userOptions.mode : "sky";

            self = this;

            parentElement = div;
            options = globalOptions;

            var extendableOptions = ["navigation", "nameResolver",
                "stats", "positionTracker", "elevationTracker"];
            // Merge default options with user ones
            for (var i = 0; i < extendableOptions.length; i++) {
                var option = extendableOptions[i];
                $.extend(options[option], userOptions[option]);
            }

            _applySharedParameters();

            // Get background surveys only
            // Currently in background surveys there are not only background
            // layers but also catalog ones
            // TODO : Refactor it !
            var layers = [];
            if (userOptions.backgroundSurveys) {
                // Use user defined background surveys
                layers = userOptions.backgroundSurveys;
            } else {
                // // Use built-in background surveys
                // backgroundSurveys = _removeComments(backgroundSurveys);
                // try
                // {
                // layers = $.parseJSON(backgroundSurveys);
                // }
                // catch (e) {
                // ErrorDialog.open("Background surveys parsing error<br/>
                // For more details see http://jsonlint.com/.");
                // console.error(e.message);
                // return false;
                // }
                $.ajax({
                    type: "GET",
                    async: false, // Deal with it..
                    url: mizarBaseUrl
                    + "data/backgroundSurveys.json",
                    dataType: "text",
                    success: function (response) {
                        response = _removeComments(response);
                        try {
                            layers = $.parseJSON(response);
                        } catch (e) {
                            ErrorDialog.open("Background surveys parsing error<br/> For more details see http://jsonlint.com/.");
                            console.error(e.message);
                            return false;
                        }
                    },
                    error: function (thrownError) {
                        console.error(thrownError);
                    }
                });
            }

            this.loadContext(this.mode, div, userOptions);
            LayerManager.init(this, options);



            // Add surveys
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                var gwLayer = self.addLayer(layer);

                // Update layer visibility according to options
                if (options.layerVisibility
                    && options.layerVisibility.hasOwnProperty(layer.name)) {
                    gwLayer.visible(options.layerVisibility[layer.name]);
                }

                self.publish("backgroundSurveysReady");
            }

            // Add stats
            if (options.stats.visible) {
                new Stats(this.sky.renderContext, {
                    element: "fps",
                    verbose: options.stats.verbose
                });
                $("#fps").show();
            }

            this.sky.coordinateSystem.type = options.coordSystem;

            // Add attribution handler
            new AttributionHandler(this.sky, {
                element: 'attributions'
            });

            // Initialize name resolver
            NameResolver.init(this, this.activatedContext, options);

            // Initialize reverse name resolver
            ReverseNameResolver.init(this, this.activatedContext);

            // UWS services initialization
            UWSManager.init(options);

            // Initialization of tools useful for different modules
            Utils.init(this);

            // Initialize moc base
            MocBase.init(this, options);

            // Fullscreen mode
            document.addEventListener("keydown", function (event) {
                // Ctrl + Space
                if (event.ctrlKey === true && event.keyCode === 32) {
                    $('.canvas > canvas').siblings(":not(canvas)").each(
                        function () {
                            $(this).fadeToggle();
                        });
                }
            });
        };

        /**************************************************************************************************************/

        Utils.inherits(Event, MizarWidgetCore);

        /**************************************************************************************************************/

        /**
         * Load Context according to mode
         *
         * @param {string} mode sky/planet
         * @param {string} div mizar Element ID
         * @param {object} userOptions
         */
        MizarWidgetCore.prototype.loadContext = function (mode, div, userOptions) {
            switch (mode) {
                case "sky":
                    // Initialize sky&globe contexts
                    skyContext = new SkyContext(div, $.extend({
                        canvas: $(div).find('#GlobWebCanvas')[0]
                    }, options));

                    this.activatedContext = skyContext;
                    this.sky = skyContext.globe;
                    this.navigation = skyContext.navigation;

                    // Load providers
                    this.activatedContext.loadProviders();

                    // TODO : Extend GlobWeb base layer to be able to publish events
                    // by itself
                    // to avoid the following useless call
                    this.activatedContext.globe.subscribe("features:added", function (featureData) {
                        self.publish("features:added", featureData);
                    });
                    break;

                case "planet":
                    options.mode = "3d";
                    options.canvas = $(div).find('#GlobWebCanvas')[0];
                    planetContext = new PlanetContext(div, options);

                    this.activatedContext = planetContext;
                    this.sky = planetContext.globe;
                    this.navigation = planetContext.navigation;

                    // Load providers
                    this.activatedContext.loadProviders();

                    this.activatedContext.setComponentVisibility("categoryDiv", true);
                    this.activatedContext.setComponentVisibility("searchDiv", false);
                    this.activatedContext.setComponentVisibility("posTracker", this.activatedContext.components.posTracker);
                    this.activatedContext.setComponentVisibility("elevTracker", this.activatedContext.components.posTracker);
                    this.activatedContext.setComponentVisibility("compassDiv", false);
                    this.activatedContext.setComponentVisibility("measureContainer", true);
                    this.activatedContext.setComponentVisibility("switch2DContainer", false);
                    this.activatedContext.setComponentVisibility("measurePlanetContainer", true);

                    var planetVM = mat4.create();
                    this.activatedContext.navigation.computeInverseViewMatrix();
                    mat4.inverse(this.activatedContext.navigation.inverseViewMatrix, planetVM);

                    this.sky.renderContext.tileErrorTreshold = 3;
                    // Store old view matrix & fov to be able to rollback to sky context
                    this.oldVM = this.sky.renderContext.viewMatrix;
                    this.oldFov = this.sky.renderContext.fov;
                    this.navigation.globe.isSky = true;

                    //planetContext.globe.publish("baseLayersReady");
                    var defaultLayer = userOptions.defaultLayer || "Viking";

                    // Add smooth animation from sky context to planet context
                    this.navigation.toViewMatrix(planetVM, 45, 2000, function () {
                        planetContext.show();
                        planetContext.globe.refresh();
                        var marsLayer = mizar.getLayer("Mars");
                        mizar.getMizarCore().getLayerManager().setBackgroundSurvey(defaultLayer);
                        planetContext.globe.baseImagery.tiling = mizar.getLayer("DSS").tiling;
                        self.publish("mizarMode:toggle", marsLayer);
                        $(".backToSky").hide();
                    });
                    break;
            }
        };

        /**************************************************************************************************************/

        /**
         * Set a predefined background survey
         * @param {String} survey the layerName
         */
        MizarWidgetCore.prototype.setBackgroundSurvey = function (survey) {
            LayerManager.setBackgroundSurvey(survey);
        };

        /**************************************************************************************************************/

        /**
         * Set a custom background survey
         */
        MizarWidgetCore.prototype.setCustomBackgroundSurvey = function (layerDesc) {
            layerDesc.background = true; // Ensure that background option
            // is set to true
            var layer = LayerManager.addLayerFromDescription(layerDesc);
            LayerManager.setBackgroundSurvey(layerDesc.name);
            return layer;
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
        MizarWidgetCore.prototype.addLayer = function (layerDesc, planetLayer) {
            this.publish('layer:fitsSupported', layerDesc, planetLayer);
            return LayerManager.addLayerFromDescription(layerDesc, planetLayer);
        };

        /**************************************************************************************************************/

        /**
         * Remove the given layer
         *
         * @param {Layer} layer to remove
         */
        MizarWidgetCore.prototype.removeLayer = function (layer) {
            LayerManager.removeLayer(layer);
        };

        /**************************************************************************************************************/

        /**
         * Point to a given location
         *
         * @param {String} location
         *            Could be: 1) Coordinates in hms/dms : "0:42:14.33
         *            41:16:7.5" 2) Coordinates in decimal degree : "11.11
         *            41.3" 3) Astronomical object name : m31, Mars, Polaris
         *  @param {Function} callback
         */
        MizarWidgetCore.prototype.goTo = function (location, callback) {
            NameResolver.goTo(location, callback);
        };

        /**************************************************************************************************************/

        /**
         * Return current fov
         */
        MizarWidgetCore.prototype.getCurrentFov = function () {
            return this.navigation.getFov();
        };

        /**************************************************************************************************************/

        /**
         * Set zoom(in other words fov)
         * @param {Number} fovInDegrees
         * @param {Function} callback
         */
        MizarWidgetCore.prototype.setZoom = function (fovInDegrees, callback) {
            var geoPos = this.sky.coordinateSystem
                .from3DToGeo(this.navigation.center3d);
            this.navigation.zoomTo(geoPos, fovInDegrees, 1000, callback);
        };

        /**************************************************************************************************************/

        /**
         * TODO used in MizarWidgetGui
         *
         * Set coordinate system
         *
         * @param newCoordSystem
         *            "EQ" or "GAL"(respectively equatorial or galactic)
         */
        MizarWidgetCore.prototype.setCoordinateSystem = function(newCoordSystem) {
				this.sky.coordinateSystem.type = newCoordSystem;

				if (this.mollweideViewer) {
					this.mollweideViewer.setCoordSystem(newCoordSystem);
				}

				// Publish modified event to update compass north
				this.navigation.publish('modified');
			};

        /**************************************************************************************************************/

        /**
         * Get all layers
         */
        MizarWidgetCore.prototype.getLayers = function () {
            return LayerManager.getLayers();
        };

        /**************************************************************************************************************/

        /**
         * Get layer with the given name
         * @param {String} layerName
         */
        MizarWidgetCore.prototype.getLayer = function (layerName) {
            var layers = this.getLayers();
            return _.findWhere(layers, {
                name: layerName
            });
        };

        /**************************************************************************************************************/

        /**
         *
         * Get LayerManager already initialized
         */
        MizarWidgetCore.prototype.getLayerManager = function () {
            return LayerManager;
        };

        /**************************************************************************************************************/

        /**
         * Convert votable to json from url
         * @param {String} url
         * @param {Function} callback
         */
        MizarWidgetCore.prototype.convertVotable2JsonFromURL = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url);
            self = this;
            xhr.onload = function () {
                var xml = xhr.responseXML;
                if (xml) {
                    self.convertVotable2JsonFromXML(xhr.responseText,
                        callback);
                } else {
                    console.log("No XML response");
                }
            };
            xhr.onerror = function (err) {
                console.log("Error getting table " + url + "\n" + "(" + err
                    + ")");
            };
            xhr.send(null);
        };

        /**************************************************************************************************************/

        /**
         * Convert votable to json from xml
         * @param {Object} xml xml votable
         * @param {Function} callback
         */
        MizarWidgetCore.prototype.convertVotable2JsonFromXML = function (xml, callback) {
            try {
                // Send response of xml to SiTools2 to convert it to GeoJSON
                $.ajax({
                    type: "POST",
                    url: options.votable2geojson.baseUrl,
                    data: {
                        votable: xml,
                        coordSystem: "EQUATORIAL"
                    },
                    success: function (response) {
                        callback(response);
                    },
                    error: function (thrownError) {
                        console.error(thrownError);
                    }
                });
            } catch (e) {
                console.log("Error displaying table:\n" + e.toString());
            }
        };

        /**************************************************************************************************************/

        /**
         * Request moc layer for the given layer
         * @param {Layer} layer
         * @param {Function} callback
         */
        MizarWidgetCore.prototype.requestMoc = function (layer, callback) {
            var mocLayer = MocBase.findMocSublayer(layer);
            layer.globe = this.sky;

            // Create if doesn't exist
            if (!mocLayer) {
                MocBase.createMocSublayer(layer, function (layer) {
                    callback(MocBase.findMocSublayer(layer));
                }, function (layer) {
                    callback(MocBase.findMocSublayer(layer));
                });
            } else {
                callback(mocLayer);
            }
        };

        /**************************************************************************************************************/

        /**
         * Request sky coverage based on moc TODO: Refactor MocBase !
         */
        MizarWidgetCore.prototype.requestSkyCoverage = function (layer, callback) {
            MocBase.getSkyCoverage(layer, function (layer) {
                callback(layer.coverage);
            }, function (layer) {
                callback(layer.coverage);
            });
        };

        /**************************************************************************************************************/

        /**
         * Intersect the given layers
         */
        MizarWidgetCore.prototype.xMatch = function (layers) {
            return MocBase.intersectLayers(layers);
        };

        /**************************************************************************************************************/

        /**
         *    Add fits image to the given feature data
         */
        MizarWidgetCore.prototype.requestFits = function (featureData) {
            featureData.isFits = true; // TODO: Refactor it
            ImageManagerLite.addImage(featureData);
        };

        /**************************************************************************************************************/

        /**
         *    Remove fits image to the given feature data
         */
        MizarWidgetCore.prototype.removeFits = function (featureData) {
            ImageManagerLite.removeImage(featureData);
        };

        /**************************************************************************************************************/

        /**
         *    Set the credits popup
         */
        MizarWidgetCore.prototype.setShowCredits = function (visible) {
            this.activatedContext.showCredits(visible);
        };


        /**************************************************************************************************************/

        /**
         * View planet with the given name
         */
        MizarWidgetCore.prototype.viewPlanet = function (planetName, planetDimension) {
            var planetLayer = this.getLayer(planetName);
            if (planetLayer) {
                // HACK : mizar must be in sky mode to be toggled to earth
                // mode
                // TODO: think about better mode management..
                this.mode = "sky";
                this.toggleMode(planetLayer, planetDimension);
            } else {
                console.error("No planet with name : " + planetName
                    + " has been found");
            }

        };

        /**************************************************************************************************************/

        /**
         * Toggle between planet/sky mode
         */
        MizarWidgetCore.prototype.toggleMode = function (gwLayer, planetDimension, callback) {
            //this.publish("mizarMode:toggleActivated", gwLayer, planetDimension, callback);
            mizar.getMizarGui().toggleMode(gwLayer, planetDimension, callback);
        };

        /**************************************************************************************************************/

        /**
         * Toggle between planet/sky mode
         */
        MizarWidgetCore.prototype.toggleDimension = function (gwLayer) {
            if (this.mode === "sky") {
                return;
            }

            var dimension = this.activatedContext.toggleDimension();
            var callback = function () {
                this.viewPlanet("Mars", dimension);
            }.bind(this);

            this.toggleMode(undefined, undefined, callback);

            // // Hide planet
            // planetContext.hide();
            // // Destroy planet context
            // planetContext.destroy();
            // planetContext = null;

            // this.viewPlanet("Mars", dimension);
        };

        return MizarWidgetCore;

    });
