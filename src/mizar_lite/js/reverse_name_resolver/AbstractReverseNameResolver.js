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
 *    Implemented by Concrete transformers in order to transform opensearch request in owner request
 */
define(["jquery", "underscore-min"],
    function ($, _) {

        /**************************************************************************************************************/

        /**
         *   Abstract Wrapper constructor
         */
        var AbstractReverseNameResolver = function (options) {
            this.options = options;
            //var urlParts = options.url.split('?');
            //this.baseUrl = urlParts[0];
            //
            //this.type = options.type;

        };

        /**************************************************************************************************************/

        /**
         *    Convert passed url into an url understandable by the service
         */
        AbstractReverseNameResolver.prototype.init = function () {
        };
        /**
         *    Convert passed url into an url understandable by the service
         */
        AbstractReverseNameResolver.prototype.remove = function () {
        };

        /**************************************************************************************************************/

        /**
         *    Convert returned data from service into intelligible data for Mizar (output transformer)
         */
        AbstractReverseNameResolver.prototype.handle = function () {
        };

        /**************************************************************************************************************/

        ///**
        // *    Extract HealpixId, order from url
        // */
        //AbstractReverseNameResolver.prototype.extractFilters = function (url) {
        //    var filtersUrl = url.substring(url.indexOf('?') + 1, url.length);
        //
        //    var filtersParts = filtersUrl.split('&');
        //
        //    var startOrder, startHealpixID;
        //    var order, healpixID;
        //    _.each(filtersParts, function (part) {
        //
        //        var keyAndValue = part.split('=');
        //
        //        if (keyAndValue[0] === "order") {
        //            order = keyAndValue[1];
        //        }
        //        if (keyAndValue[0] === "healpix") {
        //            healpixID = keyAndValue[1];
        //        }
        //    });
        //
        //    return this.filters = {
        //        "healpixID": healpixID,
        //        "order": order
        //    };
        //};

        return AbstractReverseNameResolver;
    });
