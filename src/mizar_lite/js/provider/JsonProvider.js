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
 *    JSON provider module
 *
 *    Module providing JSON file in GeoJSON format from equatorial
 *
 */
define(["jquery", "provider/AbstractProvider", "../layer/LayerManager", "gw/Parser/JsonProcessor", "Utils"],
    function ($, AbstractProvider, LayerManager, JsonProcessor, Utils) {

        var self;

        /**
         * JsonProvider context constructor
         * @param {object} options
         * @constructor
         */
        var JsonProvider = function (options) {
            AbstractProvider.prototype.constructor.call(this, options);
            self = this;
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractProvider, JsonProvider);

        /**************************************************************************************************************/

        /**
         *    Load JSON file and call handleFeatures
         *
         *    @param gwLayer GlobWeb layer
         *    @param configuration Url to JSON containing feature collection in equatorial coordinates
         *
         */
        JsonProvider.prototype.loadFiles = function (gwLayer, configuration) {
            $.ajax({
                type: "GET",
                url: configuration.url,
                success: function (response) {
                    self.handleFeatures(gwLayer, response);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    console.error(xhr.responseText);
                }
            });
        };

        /**************************************************************************************************************/

        /**
         * Transform response into GeoJSON format and add to the layer
         * @param {object} gwLayer
         * @param {object} response
         */
        JsonProvider.prototype.handleFeatures = function (gwLayer, response) {
            JsonProcessor.handleFeatureCollection(gwLayer, response);
            gwLayer.addFeatureCollection(response);
        }

        /***************************************************************************************************/

        return JsonProvider;

        // Register the data provider
        //LayerManager.registerDataProvider("JSON", loadFiles);

    });
