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
 *    String parameters types
 *    Implemented by Concrete Parameters Type such as geometry parameter, number & string parameter...
 */
define(["jquery", "underscore-min", "../../Utils", "./AbstractParameter", "../../selectize"],
    function ($, _, Utils, AbstractParameter, selectize) {

        // <option>Best Practices</option>

        var numberParameterTemplate = '<select style="width:300px;" data-placeholder="" multiple>';
        var numberOptionTemplate = _.template('<option name="string_option_<%=param.key%>" value="<%=param.value%>" ><%=param.value%></option>');

        /**
         *   Abstract Parameter constructor
         */
        var NumberParameterType = function (options) {

            AbstractParameter.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractParameter, NumberParameterType);

        /**************************************************************************************************************/

        NumberParameterType.prototype.convertParametersToHTML = function (parameter) {
            var parametersHTML = '<div name="' + parameter.name + '"><label>' + parameter.label + ' : </label>' + numberParameterTemplate;


            _.each(parameter.values, function (p) {
                parametersHTML += numberOptionTemplate({param: p});
            });
            parametersHTML += '</select></div>';

            return parametersHTML;
        };

        NumberParameterType.prototype.bindEventsParameters = function (parameter) {

            $('div [name=' + parameter.name + '] select')
                .selectize({
                    create: true,
                    plugins: ['remove_button'],
                    delimiter: ',',
                    persist: false,
                    create: function (input) {
                        return {
                            value: input,
                            text: input
                        }
                    }
                    //createFilter: new RegExp(/[^a-z ]\ *([.0-9])*\d/g),
                    //onOptionAdd : this.checkAddedOptionType
                });
        };

        NumberParameterType.prototype.checkAddedOptionType = function (value, data) {
            var onlyNumber = new RegExp(/[^a-z ]\ *([.0-9])*\d/g);
            //var onlyNumber = new RegExp(/^\d+$/g);

            if (value.match(onlyNumber) == null) {
                this.removeOption(value);
                alert('Need to be a number');
            }
        };

        return NumberParameterType;
    });
