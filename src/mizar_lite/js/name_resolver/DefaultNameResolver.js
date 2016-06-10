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
         *    DefaultNameResolver context constructor
         */
        var DefaultNameResolver = function (options) {
            AbstractNameResolver.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractNameResolver, DefaultNameResolver);

        /**************************************************************************************************************/

        /**
         *    Convert passed url into an url understandable by the service (input transformer)
         */
        DefaultNameResolver.prototype.handle = function (options) {
            this.options = options;
            var objectName = this.options.objectName;
            var context = this.options.context;
            var onError = this.options.onError;
            var onComplete = this.options.onComplete;
            var onSuccess = this.options.onSuccess;
            var searchLayer = this.options.searchLayer;
            var zoomTo = this.options.zoomTo;

            var url = context.configuration.nameResolver.baseUrl + "/" + objectName + "/EQUATORIAL";
            $.ajax({
                type: "GET",
                url: url,
                success: function (response) {
                    // Check if response contains features
                    if (response.type === "FeatureCollection") {
                        var firstFeature = response.features[0];
                        var zoomToCallback = function() {
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

        /**************************************************************************************************************/

        return DefaultNameResolver;

    });
