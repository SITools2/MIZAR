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

        //var stringParameterTemplate = '<select multiple="multiple" size="5" style="width: 50%;"></select>';
        var stringParameterTemplate = '<select style="width:300px;" data-placeholder="" multiple>';
        var stringOptionTemplate = _.template('<option name="string_option_<%=param.key%>" value="<%=param.value%>" ><%=param.value%></option>');

        /**
         *   Abstract Parameter constructor
         */
        var StringParameterType = function (options) {

            AbstractParameter.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractParameter, StringParameterType);

        /**************************************************************************************************************/

        StringParameterType.prototype.convertParametersToHTML = function (parameter) {
            var parametersHTML = '<div name="' + parameter.name + '"><label>' + parameter.label + ' : </label>' + stringParameterTemplate;


            _.each(parameter.values, function (p) {
                parametersHTML += stringOptionTemplate({param: p});
            });
            parametersHTML += '</select></div>';

            return parametersHTML;
        };

        StringParameterType.prototype.bindEventsParameters = function (parameter) {

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
                    },
                    onOptionAdd: this.checkAddedOptionType
                });
        };

        StringParameterType.prototype.checkAddedOptionType = function (value, data) {
        };

        return StringParameterType;
    });
