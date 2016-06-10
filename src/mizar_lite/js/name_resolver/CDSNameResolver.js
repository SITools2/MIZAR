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
define(["jquery", "underscore-min", "../Utils", "../name_resolver/AbstractNameResolver"],
    function ($, _, Utils, AbstractNameResolver) {

        /**************************************************************************************************************/

        /**
         *    CDSNameResolver context constructor
         */
        var CDSNameResolver = function (options) {

            AbstractNameResolver.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractNameResolver, CDSNameResolver);

        /**************************************************************************************************************/

        /**
         *    Convert passed url into an url understandable by the service (input transformer)
         */
        CDSNameResolver.prototype.handle = function (options) {
            this.options = options;
            var objectName = this.options.objectName;
            var context = this.options.context;
            var onError = this.options.onError;
            var onComplete = this.options.onComplete;
            var onSuccess = this.options.onSuccess;
            var searchLayer = this.options.searchLayer;
            var zoomTo = this.options.zoomTo;

            var url = "http://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-oxp/A?" + objectName;
            $.ajax({
                type: "GET",
                url: url,
                dataType: "xml",
                success: function (xmlResponse) {
                    var target = $(xmlResponse).find("Target");

                    var features = [];

                    $(target).find("Resolver").each(function(index) {
                        var resolver = this;
                        var ra = $(resolver).find("jradeg");
                        var dec = $(resolver).find("jdedeg");

                        if(!_.isEmpty(ra.text()) && !_.isEmpty(dec.text())) {
                            ra = parseFloat(ra.text());
                            dec = parseFloat(dec.text());
                            var feature = {};
                            feature.ra=ra;
                            feature.dec=dec;
                            feature.credit = $(resolver).attr('name');
                            features.push(feature);
                        }
                    });

                    var response = {
                        totalResults: features.length,
                        type: "FeatureCollection",
                        features: [
                        ]
                    };

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
                               "identifier": "CDS0",
                               "credits": feature.credit
                           }
                       })
                    });

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
                complete: function (xhr, textStatus) {
                    if (onComplete) {
                        onComplete(xhr);
                    }
                }
            });
        };

        return CDSNameResolver;

    });
