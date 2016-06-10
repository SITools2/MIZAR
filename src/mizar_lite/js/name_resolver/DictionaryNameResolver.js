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
 *    Abstract class for Layer Wrapper
 *    Implemented by Concrete transformer in order to transform opensearch request in owner request
 */
define(["jquery", "underscore-min", "../Utils", "../name_resolver/AbstractNameResolver","gw/Layer/VectorLayer", "gw/Renderer/FeatureStyle"],
    function ($, _, Utils, AbstractNameResolver, VectorLayer, FeatureStyle) {

        /**************************************************************************************************************/

        var dictionary;
        var context;
        var nameResolverLayer;

        /**
         *    NameResolverCDSWrapper ctx constructor
         */
        var DictionaryNameResolver = function (ctx) {
            AbstractNameResolver.prototype.constructor.call(this, ctx);
            context = ctx;
            dictionary = retrieveDictionary(ctx);
        };

        /**
         *    In case if base url isn't a service but a json containing all known places
         *    this method allows to retrieve it
         */
        var retrieveDictionary = function (context) {
            var containsDictionary = context.configuration.nameResolver.baseUrl.indexOf("json") >= 0;
            if (containsDictionary) {
                // Dictionary as json
                var marsResolverUrl = context.configuration.nameResolver.baseUrl.replace('mizar_gui', 'mizar_lite');
                $.ajax({
                    type: "GET",
                    dataType : "json",
                    url: marsResolverUrl,
                    success: function (response) {
                        dictionary = response;
                        nameResolverLayer = new VectorLayer();
                        for (var i = 0; i < response.features.length; i++) {
                            var feature = response.features[i];
                            feature.properties.style = new FeatureStyle({
                                label: feature.properties.Name,
                                fillColor: [1, 0.7, 0, 1]
                            });
                        }
                        nameResolverLayer.addFeatureCollection(response);
                        context.globe.addLayer(nameResolverLayer);
                    },
                    error: function (thrownError) {
                        console.error(thrownError);
                    }
                });
            }
            else {
                dictionary = null;
            }
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractNameResolver, DictionaryNameResolver);

        DictionaryNameResolver.prototype.remove = function () {
            if (nameResolverLayer) {
                context.globe.removeLayer(nameResolverLayer);
                nameResolverLayer = null;
            }
            dictionary = null;
        };
        /**
         *    Convert passed url into an url understandable by the service (input transformer)
         */
        DictionaryNameResolver.prototype.handle = function (options) {
            this.options = options;
            var objectName = this.options.objectName;
            var context = this.options.context;
            var onError = this.options.onError;
            var onComplete = this.options.onComplete;
            var onSuccess = this.options.onSuccess;
            var searchLayer = this.options.searchLayer;
            var zoomTo = this.options.zoomTo;

            // Planet resolver(Mars only currently)
            var feature = _.find(dictionary.features, function (f) {
                return f.properties.Name.toLowerCase() === objectName.toLowerCase();
            });

            if (feature) {
                var lon = parseFloat(feature.properties.center_lon);
                var lat = parseFloat(feature.properties.center_lat);
                zoomTo(lon, lat, onSuccess, {features: [feature]});
            }
            else {
                if (onError) {
                    onError();
                }
            }
        };
        return DictionaryNameResolver;
    });
