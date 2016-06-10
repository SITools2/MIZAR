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
 * Name resolver module : API allowing to search object name and zoom to it
 */
define(["jquery", "underscore-min", "gw/Renderer/FeatureStyle", "gw/Layer/VectorLayer", "gw/Tiling/HEALPixBase", "text!data/mars_resolver.json", "../layer/LayerManager", "jquery.ui"],
    function ($, _, FeatureStyle, VectorLayer, HEALPixBase, marsResolverJSON, layerManager) {

// Name resolver globals
        var mizar;
        var context;

// Name resolver properties
        var duration;
        var zoomFov;
        var targetLayer; 			  // Layer containing target feature(cross) on zoom
        var targetFeature;			  // Zooming destination feature


//Wrapper Object
        var nameResolverImplementation = null;

        /**************************************************************************************************************/

        /**
         *    Update targetFeature and add it to the target layer
         *
         *    @param lon Destination longitude/right ascension in degrees
         *    @param lat Destination latitude/declination in degrees
         */
        function addTarget(lon, lat) {
            targetFeature = {
                "geometry": {
                    "coordinates": [
                        lon,
                        lat
                    ],
                    "type": "Point"
                },
                "type": "Feature"
            };

            targetLayer.addFeature(targetFeature);
        }

        /**************************************************************************************************************/

        /**
         *    Search for object name
         *    Object name could be:
         *        * Degree in "HMS DMS" or "deg deg"
         *        * Object name as "Mars", "m31", "Mizar"
         *        * For debug : healpix(order, pixelIndex)
         */
        function search(objectName, onSuccess, onError, onComplete) {
            var globe = context.globe;
            // regexp used only to distinct equatorial coordinates and objects
            // TODO more accurate ( "x < 24h", "x < 60mn", etc.. )
            objectName = objectName.replace(/\s{2,}/g, ' '); // Replace multiple spaces by a single one
            var coordinatesExp = new RegExp("\\d{1,2}[h|:]\\d{1,2}[m|:]\\d{1,2}([\\.]\\d+)?s?\\s[-+]?[\\d]+[°|:]\\d{1,2}['|:]\\d{1,2}([\\.]\\d+)?\"?", "g");
            var healpixRE = /^healpix\((\d)+,(\d+)\)/;
            var degRE = /^(\d+(\.\d+)?),?\s(-?\d+(\.\d+)?)/;
            var layerRE = /^layer:(.)*?/;
            var matchHealpix = healpixRE.exec(objectName);
            var matchDegree = degRE.exec(objectName);
            var matchLayer = layerRE.exec(objectName);
            if (matchHealpix) {
                var order = parseInt(matchHealpix[1]);
                var pixelIndex = parseInt(matchHealpix[2]);

                // Compute vertices
                var nside = Math.pow(2, order);
                /*jslint bitwise: true */
                var pix = pixelIndex & (nside * nside - 1);
                var ix = HEALPixBase.compress_bits(pix);
                /*jslint bitwise: true */
                var iy = HEALPixBase.compress_bits(pix >>> 1);
                /*jslint bitwise: true */
                var face = (pixelIndex >>> (2 * order));

                var i = 0.5;
                var j = 0.5;
                var vert = HEALPixBase.fxyf((ix + i) / nside, (iy + j) / nside, face);
                var geoPos = [];
                globe.coordinateSystem.from3DToGeo(vert, geoPos);
                zoomTo(geoPos[0], geoPos[1], onSuccess);
            }
            else if (objectName.match(coordinatesExp)) {
                // Format to equatorial coordinates
                var word = objectName.split(" "); // [RA, Dec]

                word[0] = word[0].replace(/h|m|:/g, " ");
                word[0] = word[0].replace("s", "");
                word[1] = word[1].replace(/°|'|:/g, " ");
                word[1] = word[1].replace("\"", "");

                // Convert to geo and zoom
                var geoPos = [];
                globe.coordinateSystem.fromEquatorialToGeo([word[0], word[1]], geoPos);
                geoPos = globe.coordinateSystem.convert(geoPos, globe.coordinateSystem.type, 'EQ');
                zoomTo(geoPos[0], geoPos[1], onSuccess);
            }
            else if (matchDegree) {
                var lon = parseFloat(matchDegree[1]);
                var lat = parseFloat(matchDegree[3]);
                var geo = [lon, lat];

                if (mizar.mode === "sky") {
                    geo = globe.coordinateSystem.convert(geo, globe.coordinateSystem.type, 'EQ');
                }

                zoomTo(geo[0], geo[1], onSuccess);
            }
            else {
                var options = {
                    objectName: objectName,
                    context: context,
                    onError: onError,
                    onComplete: onComplete,
                    onSuccess: onSuccess,
                    searchLayer: searchLayer,
                    zoomTo: zoomTo
                };

                if (nameResolverImplementation) {
                    nameResolverImplementation.handle(options);
                } else {
                    alert("No name resolver found")
                }
            }
        }


        function searchLayer(objectName, onSuccess, onError, response) {
            var layers = [];
            if (mizar.mode == "planet") {
                layers = layerManager.searchPlanetLayer(objectName);
            }
            else {
                layers = layerManager.searchGlobeLayer(objectName);
            }

            if (layers.length === 0 && !response) {
                if (onError) {
                    onError();
                }
                return;
            }

            layers = _.sortBy(layers, function (layer) {
                return (layer.category == "background") ? 0 : 1;
            });


            var results;
            // Check if response contains features
            if (response && response.type === "FeatureCollection") {
                results = response;
            } else {
                var results = {};
                results.type = "FeatureCollection";
                results.features = [];
            }

            _.each(layers, function (layer) {
                results.features.push(
                    {
                        type: 'Feature',
                        properties: {
                            type: 'layer',
                            name: layer.name,
                            description: layer.description,
                            layerType: layer.type,
                            visible: layer._visible,
                            background: layer.category == "background"
                        }
                    }
                )
            });

            onSuccess(results);
        }

        /**************************************************************************************************************/

        /**
         *    Zoom to the given longitude/latitude and add target at the end
         *    @param lon Longitude
         *    @param lat Latitude
         *    @param callback Callback once animation is over
         *    @param args Callback arguments
         */
        function zoomTo(lon, lat, callback, args) {
            // Add target feature on animation stop
            var addTargetCallback = function () {
                addTarget(lon, lat);
                if (callback) {
                    callback.call(this, args);
                }
            };

            if (mizar.mode === "sky") {
                context.navigation.zoomTo([lon, lat], zoomFov, duration, addTargetCallback);
            }
            else {
                context.navigation.zoomTo([lon, lat], zoomFov, duration, null, addTargetCallback);
            }
        }

        /**************************************************************************************************************/

        /**
         *    Delete target image
         */
        function removeTarget() {
            if (targetFeature) {
                targetLayer.removeFeature(targetFeature);
                targetFeature = null;
            }
        }

        /**************************************************************************************************************/


        /**************************************************************************************************************/

        return {
            init: function (m, ctx) {
                if (!context) {
                    mizar = m;
                    this.setContext(ctx);
                } else {
                    console.error("Name resolver is already initialized");
                }
            },

            /**
             *    Unregister all event handlers
             */
            remove: function () {
                if (context) {
                    context.globe.removeLayer(targetLayer);
                    if (nameResolverImplementation != undefined) {
                        nameResolverImplementation.remove();
                    }
                    context.navigation.unsubscribe("modified", removeTarget);
                    context = null;
                }
            },

            goTo: search,
            zoomTo: zoomTo,

            /**
             *    Set context
             */
            setContext: function (ctx) {
                // Remove previous context
                this.remove();
                context = ctx;

                //instantiate name resolver nameResolverImplementation object
                var nameResolverClass;
                if (context.configuration.nameResolver != undefined) {
                    nameResolverClass = require(context.configuration.nameResolver.jsObject);
                }
                else {
                    //Use default name resolver if none defined...
                    nameResolverClass = require("./name_resolver/DefaultNameResolver");
                }

                nameResolverImplementation = new nameResolverClass(context);

                var style = new FeatureStyle({
                    iconUrl: ctx.configuration.mizarBaseUrl + "css/images/target.png",
                    fillColor: [1, 1, 1, 1]
                });
                targetLayer = new VectorLayer({style: style});

                ctx.globe.addLayer(targetLayer);

                // Update name resolver properties
                duration = ctx.configuration.nameResolver.duration ? context.configuration.nameResolver.duration : 3000;
                zoomFov = ctx.configuration.nameResolver.zoomFov ? context.configuration.nameResolver.zoomFov : 15;

                ctx.navigation.subscribe("modified", removeTarget);
            }
        };

    });
