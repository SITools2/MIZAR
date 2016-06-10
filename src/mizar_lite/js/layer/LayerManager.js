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
 * LayerManager module
 */
define(["jquery", "underscore-min", "gw/Renderer/FeatureStyle", "gw/Layer/HEALPixLayer", "gw/Layer/VectorLayer", "gw/Layer/CoordinateGridLayer",
    "gw/Layer/TileWireframeLayer", "gw/Layer/OpenSearchLayer", "gw/Layer/WMSLayer", "gw/Layer/MocLayer", "gw/Layer/PlanetLayer",
    "gw/Layer/HEALPixFITSLayer", "gw/Layer/AtmosphereLayer", "gw/Layer/BingLayer", "gw/Layer/OSMLayer", "gw/Layer/WMTSLayer", "gui_core/PickingManagerCore", "../Utils", "gw/Parser/JsonProcessor",  "string"],
    function ($, _, FeatureStyle, HEALPixLayer, VectorLayer, CoordinateGridLayer, TileWireframeLayer, OpenSearchLayer, WMSLayer,
              MocLayer, PlanetLayer, HEALPixFITSLayer, AtmosphereLayer, BingLayer, OSMLayer, WMTSLayer, PickingManagerCore, Utils, JsonProcessor, String) {

        /**
         * Private variables
         */
        var sky;
        var gwLayers = [];
        var planetLayers = [];
        var configuration;

// GeoJSON data providers
        var dataProviders = {};
        var mizarCore;


        /**
         * Private functions
         */

        /**************************************************************************************************************/

        /**
         * Create simple vector layer
         * @param {String} name
         * @returns {Layer} layer
         */
        function createSimpleLayer(name) {
            // Generate random color
            var rgb = Utils.generateColor();
            var rgba = rgb.concat([1]);

            // Create style
            var options = {
                name: name,
                id: _.uniqueId(name + '_'),
                style: new FeatureStyle({
                    iconUrl: configuration.mizarBaseUrl + "css/images/star.png",
                    fillColor: rgba,
                    strokeColor: rgba,
                    visible: true
                })
            };

            // Create vector layer
            var gwLayer = new VectorLayer(options);
            // Add the type GeoJSON to be able to zoom on the layer ! (cf HTML generation of additional layer)
            gwLayer.type = "GeoJSON";
            gwLayer.deletable = true;
            gwLayer.pickable = true;

            return gwLayer;
        }

        /**************************************************************************************************************/

        /**
         * Create layer from configuration file
         * @param {Object} layerDesc
         * @returns {Layer} layer
         */
        function createLayerFromConf(layerDesc) {
            var gwLayer;

            // Ensure that the attribution link will be opened in new tab
            if (layerDesc.attribution && layerDesc.attribution.search('<a') >= 0 && layerDesc.attribution.search('target=') < 0) {
                layerDesc.attribution = layerDesc.attribution.replace(' ', ' target=_blank ');
            }

            // Update layer color
            if (layerDesc.color) {
                layerDesc.color = FeatureStyle.fromStringToColor(layerDesc.color);
            }
            else {
                // Generate random color
                var rgb = Utils.generateColor();
                layerDesc.color = rgb.concat([1]);
            }

            // Layer opacity must be in range [0, 1]
            if (layerDesc.opacity) {
                layerDesc.opacity /= 100;
            }
            // Layers are not visible by default
            if (!layerDesc.visible) {
                layerDesc.visible = false;
            }

            // Create style if needed
            if (!layerDesc.style) {
                layerDesc.style = new FeatureStyle({
                    rendererHint: "Basic",
                    opacity: layerDesc.opacity,
                    iconUrl: layerDesc.icon ? layerDesc.icon : configuration.mizarBaseUrl + "css/images/star.png",
                    fillColor: layerDesc.color,
                    strokeColor: layerDesc.color
                });
            }

            // Depending on type of layer, create layer
            switch (layerDesc.type) {
                case "atmosphere":
                    gwLayer = new AtmosphereLayer(layerDesc);
                    break;
                case "tileWireframe":
                    gwLayer = new TileWireframeLayer(layerDesc);
                    break;
                case "healpix":

                    if (layerDesc.fitsSupported) {
                        gwLayer = new HEALPixFITSLayer(layerDesc);
                    }
                    else {
                        gwLayer = new HEALPixLayer(layerDesc);
                    }

                    /*if (layerDesc.transformer != undefined && layerDesc.serviceUrl != undefined) {
                        var transformerFunction = require(layerDesc.transformer.jsObject);
                        var options = {
                            url : layerDesc.serviceUrl,
                            type : layerDesc.transformer.type
                        };
                        gwLayer.transformer = new transformerFunction(options);
                    }*/

                    if (layerDesc.availableServices) {
                        gwLayer.availableServices = layerDesc.availableServices;
                        gwLayer.healpixCutFileName = layerDesc.healpixCutFileName;
                    }

                    break;

                case "coordinateGrid":
                    gwLayer = new CoordinateGridLayer(layerDesc);
                    break;

                case "healpixGrid":
                    gwLayer = new TileWireframeLayer(layerDesc);
                    break;

                case "GeoJSON":
                    gwLayer = new VectorLayer(layerDesc);
                    gwLayer.pickable = layerDesc.hasOwnProperty('pickable') ? layerDesc.pickable : true;

                    break;

                case "DynamicOpenSearch":

                    gwLayer = new OpenSearchLayer(layerDesc);

                    /*if (layerDesc.transformer != undefined && layerDesc.serviceUrl != undefined) {
                        var transformerFunction = require(layerDesc.transformer.jsObject);
                        var options = {
                            url : layerDesc.serviceUrl
                        };
                        gwLayer.transformer = new transformerFunction(options);
                    }*/

                    if (layerDesc.displayProperties) {
                        gwLayer.displayProperties = layerDesc.displayProperties;
                    }
                    gwLayer.pickable = layerDesc.hasOwnProperty('pickable') ? layerDesc.pickable : true;
                    gwLayer.availableServices = layerDesc.availableServices;
                    break;

                case "Moc":
                    layerDesc.style.fill = true;
                    layerDesc.style.fillColor[3] = 0.3; // make transparent
                    gwLayer = new MocLayer(layerDesc);
                    gwLayer.dataType = "line";
                    break;
                case "Vector":
                    gwLayer = createSimpleLayer(layerDesc.name);
                    gwLayer.pickable = layerDesc.hasOwnProperty('pickable') ? layerDesc.pickable : true;
                    gwLayer.deletable = false;
                    break;
                case "Planet":
                    gwLayer = new PlanetLayer(layerDesc);
                    break;
                case "WMS":
                    gwLayer = new WMSLayer(layerDesc);
                    break;
                case "WMTS":
                    gwLayer = new WMTSLayer(layerDesc);
                    break;
                case "OSM":
                    gwLayer = new OSMLayer(layerDesc);
                    break;
                case "Bing":
                    gwLayer = new BingLayer(layerDesc);
                    break;
                default:
                    console.error(layerDesc.type + " isn't not implemented");
                    return null;
            }
            gwLayer.type = layerDesc.type;
            gwLayer.dataType = layerDesc.dataType;
            // Store category name on GlobWeb layer object to be able to restore it later
            gwLayer.category = layerDesc.background ? "background" : layerDesc.category;

            gwLayer.subscribe("visibility:changed", onVisibilityChange);

            return gwLayer;
        }

        /**************************************************************************************************************/

        /**
         * Execute when layer visibility is changed
         * @param {Layer} layer
         */
        function onVisibilityChange(layer) {

            if(layer.visible() && layer.properties && layer.properties.hasOwnProperty("initialRa") && layer.properties.hasOwnProperty("initialDec") && layer.properties.hasOwnProperty("initialFov")) {
                if (mizarCore.mode === "sky") {
                    //mizar.activatedContext.navigation.zoomTo([layer.properties.initialRa, layer.properties.initialDec], layer.properties.initialFov, 3000);
                    var fov = mizarCore.activatedContext.navigation.renderContext.fov;
                    mizarCore.activatedContext.navigation.zoomTo([layer.properties.initialRa, layer.properties.initialDec], fov, 3000);
                }
                else {
                    mizarCore.activatedContext.navigation.zoomTo([layer.properties.initialRa, layer.properties.initialDec], layer.properties.initialFov, 3000, null);
                }
            }
        }

        /**************************************************************************************************************/

        /**
         *    Fill the LayerManager table
         *    @param {Layer} layer
         */
        function initLayers(layers) {
            for (var i = 0; i < layers.length; i++) {
                var layer = layers[i];
                this.addLayerFromDescription(layer);
            }
        }

        /**************************************************************************************************************/

        /**
         *    Load HIPS layers from passed service url
         *
         * @param {Array} hipsServiceUrlArray HIPS service URL
         * @param {String}imageFormat HIPS format
         * @param callback
         */
        function checkHipsServiceIsAvailable(hipsServiceUrlArray, imageFormat, callback) {
            if (hipsServiceUrlArray.length == 0) {
                return callback(undefined);
            }
            var url = hipsServiceUrlArray.shift();
            $.ajax({
                type: 'GET',
                url: url+"/Norder3/Allsky."+imageFormat,
                dataType : 'text'
                //context: layerManager,
                //timeout: 10000
            }).done(function (data, status, xhr) {
                if (xhr.status == 200) {
                    return callback(url);
                }
            }).error(function () {
                checkHipsServiceIsAvailable(hipsServiceUrlArray, imageFormat, callback);
            });
        }

        /**************************************************************************************************************/

        /**
         * Load HIPS layers from passed service url
         * @param layerManager
         * @param {String} hipsServiceUrl
         */
        function loadHIPSLayers(layerManager, hipsServiceUrl) {
            $.ajax({
                type: 'GET',
                url: hipsServiceUrl,
                context: layerManager,
                dataType : 'json'

            }).done(function (hipsLayersJSON) {
                _.each(hipsLayersJSON, function (hipsLayer) {
                    var hipsServiceUrlArray = getHipsServiceUrlArray(hipsLayer);
                    var imageFormat = (hipsLayer.hips_tile_format.match("jpeg")) ? "jpg" : "png";
                    var hipsUrl = this.checkHipsServiceIsAvailable(hipsServiceUrlArray, imageFormat, function (hipsServiceUrl) {
                       if(hipsServiceUrl == undefined){
                           console.log("Cannot add layer " + hipsLayer.obs_title + " no mirror available");
                           return;
                       }
                        $.proxy(addHIPSLayer, layerManager)(hipsLayer, hipsServiceUrl);
                    });
                }, layerManager);
            });
        }

        /**************************************************************************************************************/

        /**
         * Get service url from HIPS Layer
         *
         * @param hipsLayer
         * @returns {Array}
         */
        function getHipsServiceUrlArray(hipsLayer){
            var hipsServiceUrlArray = [];

            if(hipsLayer.hips_service_url) {
                hipsServiceUrlArray.push(hipsLayer.hips_service_url);
            }
            if(hipsLayer.hips_service_url_1) {
                hipsServiceUrlArray.push(hipsLayer.hips_service_url_1);
            }
            if(hipsLayer.hips_service_url_2) {
                hipsServiceUrlArray.push(hipsLayer.hips_service_url_2);
            }
            return hipsServiceUrlArray;
        }

        /**************************************************************************************************************/

        /**
         * Add HIPS Layer to Mizar
         *
         * @param hipsLayer
         * @param hipsServiceUrl
         */
        function addHIPSLayer(hipsLayer, hipsServiceUrl) {
            var imageFormat;
            if(hipsLayer.hips_tile_format) {
                 imageFormat = (hipsLayer.hips_tile_format.match("png")) ? "png" : "jpg";
            } else {
                console.log("No hips_tile_format defined for layer  : " + hipsLayer.obs_title );
                imageFormat = "png";
            }
            var coordSystem;
            if (hipsLayer.hips_frame === "equatorial")
                coordSystem = "EQ";
            else if (hipsLayer.hips_frame === "galactic")
                coordSystem = "GAL";

            // Skipping no public layers
            if (hipsLayer.hasOwnProperty("hips_status") && !hipsLayer.hips_status.match('public') === null) {
                return;
            }

            var layerToAdd = {
                category: "Image",
                type: "healpix",
                name: (_.isArray(hipsLayer.obs_collection) ? hipsLayer.obs_collection[0] : hipsLayer.obs_collection),
                description: hipsLayer.obs_description,
                baseUrl: hipsServiceUrl,
                numberOfLevels: hipsLayer.hips_order,
                copyright: hipsLayer.obs_copyright,
                attribution: hipsLayer.obs_copyright,
                copyrightUrl: hipsLayer.obs_copyright_url,
                ack: hipsLayer.obs_ack,
                serviceUrl: hipsLayer.moc_access_url,
                format: imageFormat,
                coordSystem : coordSystem,
                background: false,
                visible: false,
                properties : {
                    initialRa : hipsLayer.hasOwnProperty("obs_initial_ra")? parseFloat(hipsLayer.obs_initial_ra) : undefined,
                    initialDec : hipsLayer.hasOwnProperty("obs_initial_dec")? parseFloat(hipsLayer.obs_initial_dec) : undefined,
                    initialFov : hipsLayer.hasOwnProperty("obs_initial_fov")? parseFloat(hipsLayer.obs_initial_fov) : undefined,
                    mocCoverage : hipsLayer.hasOwnProperty("moc_sky_fraction")? hipsLayer.moc_sky_fraction : undefined
                }
            };

            if(hipsLayer.hasOwnProperty("moc_access_url")){
                layerToAdd.availableServices = ["Moc"];
            }

            var healpixLayer = mizarCore.addLayer(layerToAdd);

            if(hipsLayer.hasOwnProperty("moc_access_url")) {
                healpixLayer.serviceUrl = hipsLayer.moc_access_url;
            }
        }

        /**************************************************************************************************************/

        return {
            /**
             *    Init
             *
             *    @param m
             *        mizarCore
             *    @param conf
             *        Mizar configuration
             */
            init: function (m, conf) {
                mizarCore = m;
                configuration = conf;
                // Store the sky in the global module variable
                sky = mizarCore.scene;

                PickingManagerCore.init(m);

                // TODO : Call init layers
                //initLayers(configuration.layers);
                loadHIPSLayers(this, conf.hipsServiceUrl);
            },

            /**
             *    Register data provider
             *
             *    @param type Type of data
             *    @param loadFunc Callback function loading and adding data to the layer
             */
            registerDataProvider: function (type, loadFunc) {
                dataProviders[type.toString()] = loadFunc;
            },

            /**
             *    Get current layers
             *    @param {string} mode the current mode sky or planet
             *    @return {Array} layers
             */
            getLayers: function (mode) {
                var layers = [];
                if (mode == "sky") {
                    layers = gwLayers;
                } else if (mode == "planet") {
                    layers = this.getPlanetLayers();
                } else if (mode == "all") {
                    layers = this.getAllLayers();
                } else {
                    console.log("Unknow mode. Correct mode are 'sky' or 'planet' ");
                }
                return layers;
            },

            /**
             *    Get current layers
             *    @returns {Array} layers
             */
            getAllLayers: function () {
                return _.union(gwLayers, this.getPlanetLayers());
            },

            /**
             * Get only planet layers
             * @returns {Array} layers
             */
            getPlanetLayers: function() {
                var layers = planetLayers;
                var planetLayer = _.filter(gwLayers, function (layer) {
                    return (layer instanceof PlanetLayer);
                });

                if (planetLayer && planetLayer.length > 0) {
                    for (var i = 0; i < planetLayer.length; i++) {
                        layers = _.union(layers, planetLayer[i].layers);
                    }
                }
                return layers;
            },

            /**
             *    Get current layer by ID
             *
             *    @param layerId
             *          The layer ID
             */
            getLayerById: function (layerId) {
                _.find(_.union(this.getAllLayers()), function (layer) {
                    return (layer.layerId === layerId);
                });
            },

            /**
             *    Get one or several layers having the same name
             *
             *    @param layerName
             *          The layer name
             *    @return an array of layers
             */
            getLayerByName: function (layerName) {
                return _.findWhere(this.getAllLayers(), {name: layerName});
            },

            /**
             *    Add layer to activated globe(could be globe or sky)
             *    Triggers events createion events
             *
             *    @param gwLayer
             *        GlobWeb layer to add
             */
            addLayerToGlobe: function (gwLayer) {
                var globe = mizarCore.activatedContext.globe;
                if (gwLayer.category === "background") {
                    // Add to engine
                    if (gwLayer.visible()) {
                        // Change visibility's of previous layer(maybe GlobWeb should do it ?)
                        if (globe.baseImagery) {
                            globe.baseImagery.visible(false);
                        }

                        globe.setBaseImagery(gwLayer);
                        gwLayer.visible(true);
                    }

                    // Publish the event
                    mizarCore.publish("backgroundLayer:add", gwLayer);
                }
                else {
                    // Add to engine
                    if (!(gwLayer instanceof PlanetLayer)) {
                        globe.addLayer(gwLayer);
                    }

                    // Publish the event
                    mizarCore.publish("additionalLayer:add", gwLayer);
                }
            },

            /**
             *    Add layer to globe depending on Mizar's mode
             *
             *    @param gwLayer
             *        GlobWeb layer
             *    @param planetLayer
             *        Planet layer, if described layer must be added to planet (optional)
             */
            addLayer: function (gwLayer, planetLayer) {
                if (planetLayer) {
                    // Add layer to planet
                    planetLayer.layers.push(gwLayer);
                    if (mizarCore.mode === "planet") {
                        this.addLayerToGlobe(gwLayer);
                    }
                }
                else {
                    // Store planet base imageries to be able to set background from name
                    if (gwLayer instanceof PlanetLayer) {
                        for (var i = 0; i < gwLayer.baseImageries.length; i++) {
                            planetLayers.push(gwLayer.baseImageries[i]);
                        }
                    }

                    // Add layer to sky
                    gwLayers.push(gwLayer);
                    if (mizarCore.mode === "sky") {
                        this.addLayerToGlobe(gwLayer);
                    }
                }
            },

            /**
             *    Create layer from layer description and add it engine
             *
             *    @param layerDesc
             *        Layer description
             *    @param planetLayer
             *        Planet layer, if described layer must be added to planet (optional)
             *    @return
             *        Created layer if doesn't already exist, existing layer otherwise
             */
            addLayerFromDescription: function (layerDesc, planetLayer) {

                var gwLayer = _.findWhere(gwLayers, {name: layerDesc.name});
                if (!gwLayer) {
                    gwLayer = createLayerFromConf(layerDesc);
                    if (gwLayer) {
                        this.addLayer(gwLayer, planetLayer);
                    }

                    // Fill data-provider-type layer by features coming from data object
                    if (layerDesc.data && dataProviders[layerDesc.data.type]) {
                        var callback = dataProviders[layerDesc.data.type];
                        var data = callback(gwLayer, layerDesc.data);
                    }

                    if (gwLayer.pickable) {
                        PickingManagerCore.addPickableLayer(gwLayer);
                    }
                }

                return gwLayer;
            },

            /**
             *    Remove the given layer
             *    @param gwLayer
             *        GlobWeb layer
             */
            removeLayer: function (gwLayer) {

                var index = gwLayers.indexOf(gwLayer);
                gwLayers.splice(index, 1);
                if (gwLayer.pickable) {
                    PickingManagerCore.removePickableLayer(gwLayer);
                }

                mizarCore.publish("layer:remove", gwLayer);
                sky.removeLayer(gwLayer);
            },

            /**
             *    Create layer from FITS
             */
            createLayerFromFits: function (name, fits) {
                var gwLayer = createSimpleLayer(name);
                gwLayer.dataType = "line";

                // Create feature
                var coords = Utils.getPolygonCoordinatesFromFits(fits);
                var feature = {
                    "geometry": {
                        "gid": name,
                        "coordinates": [coords],
                        "type": "Polygon"
                    },
                    "properties": {
                        "identifier": name
                    },
                    "type": "Feature"
                };

                gwLayer.addFeature(feature);
                PickingManagerCore.addPickableLayer(gwLayer);
                this.addLayer(gwLayer, mizarCore.activatedContext.planetLayer);
                return gwLayer;
            },

            /**
             *    Create layer from GeoJSON
             */
            createLayerFromGeoJson: function (name, geoJson) {
                // Add feature collection
                var gwLayer = createSimpleLayer(name);

                // Add feature collection
                JsonProcessor.handleFeatureCollection(gwLayer, geoJson);
                gwLayer.addFeatureCollection(geoJson);
                PickingManagerCore.addPickableLayer(gwLayer);

                this.addLayer(gwLayer, mizarCore.activatedContext.planetLayer);
                return gwLayer;
            },

            /**
             *    Get one or several layers corresponding to the given query string
             *
             *    @param queryString
             *          The query string
             *    @return an array of layers
             */
            searchGlobeLayer: function (query) {
                var results = [];
                var layers = this.getLayers();
                //Search by name
                results = _.filter(layers, function(layer) {
                    return (String(layer.name).contains(query) || String(layer.description||"").contains(query));
                });
                return results;
            },

            searchPlanetLayer: function (query) {
                var results = [];
                var layers = this.getPlanetLayers();
                //Search by name
                results = _.filter(layers, function(layer) {
                    return (String(layer.name).contains(query) || String(layer.description||"").contains(query));
                });
                return results;
            },

            createSimpleLayer: createSimpleLayer,
            checkHipsServiceIsAvailable : checkHipsServiceIsAvailable,
            getPickingManagerCore : function () {
                return PickingManagerCore;
            }
        };

    });
