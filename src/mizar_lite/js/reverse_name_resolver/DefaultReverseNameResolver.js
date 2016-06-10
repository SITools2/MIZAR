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
define(["jquery", "underscore-min", "../Utils", "../reverse_name_resolver/AbstractReverseNameResolver", "gw/Tiling/HEALPixBase"],
    function ($, _, Utils, AbstractReverseNameResolver, HEALPixBase) {

        /**************************************************************************************************************/

        /**
         *    DefaultReverseNameResolver context constructor
         */
        var DefaultReverseNameResolver = function (options) {
            AbstractReverseNameResolver.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractReverseNameResolver, DefaultReverseNameResolver);

        /**************************************************************************************************************/

        /**
         *    Convert passed url into an url understandable by the service (input transformer)
         */
        DefaultReverseNameResolver.prototype.handle = function (options) {
            var self = this;

            var maxOrder = options.maxOrder;
            var equatorialCoordinates = options.equatorialCoordinates;
            var context = options.context;

            var requestUrl = context.configuration.reverseNameResolver.baseUrl + '/EQUATORIAL/' + equatorialCoordinates[0] + " " + equatorialCoordinates[1] + ";" + maxOrder;

            $.ajax({
                type: "GET",
                url: requestUrl,
                success: function (response) {
                    if (options && options.success)
                        options.success(response);
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    if (options && options.error)
                        options.error(xhr);
                }
            });
        };

        /**************************************************************************************************************/

        return DefaultReverseNameResolver;

    });
