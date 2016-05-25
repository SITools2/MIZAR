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
 *    OpenSearch provider module
 *
 *    Module providing JSON file in GeoJSON format from OpenSearch response
 */
define(["jquery", "provider/AbstractProvider", "../layer/LayerManager", "gw/Parser/JsonProcessor"],
    function ($, AbstractProvider, LayerManager, JsonProcessor) {

        var self;

        /**
         * OpenSearchProvider context constructor
         * @param {object} options
         * @constructor
         */
        var OpenSearchProvider = function (options) {
            self = this;
            AbstractProvider.prototype.constructor.call(this, options);
        };

        /***************************************************************************************************/

        /**
         *    Load JSON file and call handleFeatures
         *
         *    @param gwLayer GlobWeb layer
         *    @param configuration Url to JSON containing feature collection in equatorial coordinates
         *
         */
        OpenSearchProvider.prototype.loadFiles = function (gwLayer, configuration, startIndex) {
            $.ajax({
                type: "GET",
                url: configuration.url + "startIndex=" + startIndex + "&count=500",
                success: function (response) {
                    self.handleFeatures(gwLayer, configuration, startIndex, response)
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.error(xhr.responseText);
                }
            });
        };

        /***************************************************************************************************/

        OpenSearchProvider.prototype.handleFeatures = function (gwLayer, configuration, startIndex, response) {
            JsonProcessor.handleFeatureCollection(gwLayer, response);
            gwLayer.addFeatureCollection(response);
            if (startIndex + response.features.length < response.totalResults) {
                self.loadFiles(gwLayer, configuration.url, startIndex + response.features.length);
            }
        };

        /***************************************************************************************************/

        return OpenSearchProvider;

    });
