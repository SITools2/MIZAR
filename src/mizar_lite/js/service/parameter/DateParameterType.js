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
 *    Date parameter types
 *    Implemented by Concrete Parameters Type such as geometry parameter, number & string parameter...
 */
define(["jquery", "underscore-min", "../../Utils", "./AbstractParameter", "../../selectize"],
    function ($, _, Utils, AbstractParameter, selectize) {

        var dateParameterTemplate = '<input type="text" class="selectize-input" style="width:inherit;">';

        /**
         *   Abstract Parameter constructor
         */
        var DateParameterType = function (options) {

            AbstractParameter.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractParameter, DateParameterType);

        /**************************************************************************************************************/

        DateParameterType.prototype.convertParametersToHTML = function (parameter) {
            var parametersHTML = '<div name="' + parameter.name + '"><label>' + parameter.label + ' : </label>';
            parametersHTML += '<div style="width:300px;">' + dateParameterTemplate + '</div>';
            parametersHTML += '</div>';

            return parametersHTML;
        };

        DateParameterType.prototype.bindEventsParameters = function (parameter) {

            $('div [name=' + parameter.name + '] input')
                .datepicker({
                    dateFormat: "mm-dd-yy",
                    beforeShow: function (input) {
                        $(input).css({
                            "position": "relative",
                            "z-index": 101
                        });
                    }
                });
        };

        return DateParameterType;
    });
