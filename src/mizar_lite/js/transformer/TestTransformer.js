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
 *    Abstract class for Layer Transformer
 *    Implemented by Concrete transformer in order to transform opensearch request in owner request
 */
define(["../jquery", "../underscore-min", "../Utils", "../transformer/AbstractTransformer"],
    function ($, _, Utils, AbstractTransformer) {

        /**************************************************************************************************************/

        /**
         *    Concrete Transformer context constructor
         */
        var TestTransformer = function (options) {

            AbstractTransformer.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractTransformer, TestTransformer);

        /**************************************************************************************************************/

        /**
         *    Convert passed url into an url understandable by the service (input transformer)
         */
        TestTransformer.prototype.convertUrl = function (url) {
            var filters = this.extractFilters(url);

            var formattedUrl = this.baseUrl + "/search?test-order=" + filters.order + "&test-healpix=" + filters.healpixID;

            return formattedUrl;
        };

        /**************************************************************************************************************/

        /**
         *    Convert returned data from service into intelligible data for Mizar (output transformer)
         */
        TestTransformer.prototype.convertResponse = function (data) {
            return data;
        };

        return TestTransformer;

    });
