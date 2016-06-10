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
 *    Abstract class for additional layer services
 *    Implemented by Concrete Service in order to perform an action on data
 */
define(["jquery", "../underscore-min"],
    function ($, _) {

        /**************************************************************************************************************/

        /**
         *   Abstract Service constructor
         */
        var AbstractServiceParameter = function (options) {

            this.serviceUrl = options.serviceUrl;
            this.selectionType = options.selectionType;
            this.outputType = options.outputType;

            this.parameters = [];

        };

        /**************************************************************************************************************/

        /**
         * Init parameters defined programmatically
         */
        AbstractServiceParameter.prototype.initParameters = function () {
        };

        /**************************************************************************************************************/

        /**
         * Get all service parameters
         */
        AbstractServiceParameter.prototype.getParameters = function () {
            return this.parameters;
        };

        /**************************************************************************************************************/

        /**
         * Convert parameters to an intelligible way for the called service
         */
        AbstractServiceParameter.prototype.convertParameters = function () {
        };

        /**************************************************************************************************************/

        /**
         * Convert parameters to an intelligible way for the called service
         */
        AbstractServiceParameter.prototype.convertParametersToHTML = function () {
        };

        /**************************************************************************************************************/

        /**
         *    Call service
         */
        AbstractServiceParameter.prototype.callService = function (parameters, doneCallback, failCallback, alwaysCallback) {
            $.ajax({
                method: 'GET',
                url: this.serviceUrl,
                data: parameters
            }).done(function (data, status) {
                (doneCallback != undefined) ? doneCallback(data, status) : null;
            }).fail(function (response, status) {
                (failCallback != undefined) ? failCallback(response, status) : null;
            }).always(function () {
                (alwaysCallback != undefined) ? alwaysCallback(response, status) : null;
            })
        };

        return AbstractServiceParameter;
    });
