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

define(["jquery", "underscore-min", "../Utils", "../name_resolver/AbstractNameResolver"],
    function ($, _, Utils, AbstractNameResolver) {
        /**************************************************************************************************************/

        /**
         *    CDSNameResolver context constructor
         */
        var IMCCENameResolver = function (options) {

            AbstractNameResolver.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractNameResolver, IMCCENameResolver);

        /**************************************************************************************************************/

        /**
         *    Convert passed url into an url understandable by the service (input transformer)
         */
        IMCCENameResolver.prototype.handle = function (options) {
            this.options = options;
            var objectName = this.options.objectName;
            var onError = this.options.onError;
            var onComplete = this.options.onComplete;
            var onSuccess = this.options.onSuccess;
            var searchLayer = this.options.searchLayer;
            var zoomTo = this.options.zoomTo;
            var features = [];
            var url = "http://vo.imcce.fr/webservices/ssodnet/resolver.php?name=" + objectName +"&mime=json&from=Mizar";
            $.ajax({
                type: "GET",
                url: url,
                dataType: "json",
                success: function (jsonResponse) {

                    function parseResponse(data, features) {
                        _.each(data, function(data) {
                            var ra = data.ra;
                            var dec = data.dec;

                            if(_.isNumber(ra) && _.isNumber(dec)) {
                                ra = parseFloat(ra);
                                dec = parseFloat(dec);
                                var feature = {};
                                feature.ra=ra;
                                feature.dec=dec;
                                feature.credit = "IMCCE";
                                feature.id = data.id;
                                feature.type = data.type;
                                feature.name = data.name;
                                features.push(feature);
                            }
                        });
                    }
                    function createsGeoJsonResponse (features, response) {
                        _.each(features, function(feature) {
                            response.features.push({
                                type: 'Feature',
                                geometry: {
                                    coordinates: [feature.ra, feature.dec],
                                    "type": "Point"
                                },
                                "properties": {
                                    "crs": {
                                        "type": "name",
                                        "properties": {
                                            "name": "equatorial.ICRS"
                                        }
                                    },
                                    "identifier": feature.id,
                                    "type": feature.type,
                                    "name":feature.name,
                                    "credits": feature.credits
                                }
                            })
                        });
                    }

                    var data = jsonResponse.data;
                    parseResponse(data, features);
                    var response = {
                        totalResults: features.length,
                        type: "FeatureCollection",
                        features: [
                        ]
                    };
                    createsGeoJsonResponse(features, response);

                    // Check if response contains features
                    if (response.type === "FeatureCollection" && response.features.length > 0) {
                        var firstFeature = response.features[0];
                        var zoomToCallback = function () {
                            searchLayer(objectName, onSuccess, onError, response);
                        };
                        zoomTo(firstFeature.geometry.coordinates[0], firstFeature.geometry.coordinates[1], zoomToCallback, response);

                    } else {
                        onError();
                    }
                },
                error: function (xhr) {
                    searchLayer(objectName, onSuccess, onError);
                    console.error(xhr.responseText);
                },
                complete: function (xhr) {
                    if (onComplete) {
                        onComplete(xhr);
                    }
                }
            });
        };

        return IMCCENameResolver;

    });