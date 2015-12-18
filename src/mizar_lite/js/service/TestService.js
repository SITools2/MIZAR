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
 *    Test Service
 */
define(["../jquery", "../underscore-min", "../Utils", "./AbstractService", "./parameter/StringParameterType", "./parameter/NumberParameterType", "./parameter/NumberBetweenParameterType", "./parameter/DateParameterType", "./parameter/DateBetweenParameterType", "./parameter/SelectDateBetweenParameterType", "./parameter/ShapeAndGeoCoordParameterType", "text!../templates/testService.html"],
    function ($, _, Utils, AbstractService, StringParameterType, NumberParameterType, NumberBetweenParameterType, DateParameterType, DateBetweenParameterType, SelectDateBetweenParameterType, ShapeAndGeoCoordParameterType, testService) {


        // Template generating the services html
        var testServiceTemplate = _.template(testService);

        var globe = null;
        var layers = [];


        /**
         *    Test Service context constructor
         */
        var TestService = function () {

            var options = {
                selectionType: 'SINGLE',
                outputType: 'GEOJSON',
                serviceId: _.uniqueId()
            };

            AbstractService.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractService, TestService);

        /**************************************************************************************************************/

        /**
         * Init parameters defined programmatically
         */
        TestService.prototype.initParameters = function () {


            return this.parameters = [{
                name: 'CoordSystem',
                type: ShapeAndGeoCoordParameterType
            }, {
                name: 'PAN',
                label : 'String',
                type: StringParameterType,
                values: [{
                    key: "toto_0",
                    value: "toto_value_0"
                }, {
                    key: "toto_1",
                    value: "toto_value_1"
                }]
            }, {
                name: 'XS',
                label : 'String',
                type: NumberParameterType,
                values: [{
                    key: "number_0",
                    value: "15.23"
                }, {
                    key: "number_1",
                    value: "10.25"
                }]
            }, {
                name: 'Number',
                label : 'Number Between',
                type: NumberBetweenParameterType,
                values: [{
                    field: "minField",
                    key: "between_1",
                    value: "15.23"
                }, {
                    field: "maxField",
                    key: "between_2",
                    value: "10.25"
                }]
            }, {
                name: 'Date_field',
                label : 'Date',
                type: DateParameterType
            }, {
                name: 'Date_field_between',
                label : 'Date between',
                type: DateBetweenParameterType
            }, {
                name: 'Select_date_between',
                label : 'Select Date between',
                type: SelectDateBetweenParameterType,
                values: [{
                    field: "minField",
                    key: "between_1",
                    value: "10-20-2014"
                }, {
                    field: "maxField",
                    key: "between_2",
                    value: "12-01-2015"
                }, {
                    field: "minField",
                    key: "between_3",
                    value: "04-15-2013"
                }, {
                    field: "maxField",
                    key: "between_4",
                    value: "01-10-2015"
                }]
            }];
        };

        /**************************************************************************************************************/

        /**
         * Convert parameters to an intelligible way for the called service
         */
        TestService.prototype.convertParameters = function () {
        };

        /**************************************************************************************************************/

        /**
         * Convert parameters to an intelligible way for the called service
         */
        TestService.prototype.convertParametersToHTML = function () {
            var htmlParameters = "";

            _.each(this.parameters, function (parameter) {
                htmlParameters += new parameter.type(parameter).convertParametersToHTML(parameter);
            });

            return htmlParameters;
        };

        /**************************************************************************************************************/

        /**
         * Bind events to parameters
         */
        TestService.prototype.bindEventsParameters = function () {

            _.each(this.parameters, function (parameter) {
                new parameter.type(parameter).bindEventsParameters(parameter);
            });

        };

        /**************************************************************************************************************/

        /**
         *    Event for display button
         */
        TestService.prototype.displayClickEvent = function () {
            var layer = $(this).parent().data("layer");

            var convertedParameters = this.convertParameters();

            this.callService(convertedParameters, function () {
                alert('done !');
            });

        }

        /**************************************************************************************************************/

        /**
         *    Add HTML of Test Service
         */
        TestService.prototype.addHTMLTestService = function (layer) {

            var htmlParameters = this.convertParametersToHTML();

            var content = testServiceTemplate({
                layer: layer,
                htmlParameters: htmlParameters,
                serviceId: this.serviceId
            });

            $(content)
                .appendTo('#TestService .testService_parameters')
                .data("layer", layer);

            this.bindEventsParameters();

            var button = '<input id="launchService_' + layer.id + '" type="button" value="Launch service">';
            $(button)
                .appendTo('#TestService .testService_parameters')
                .button()
                .click($.proxy(this.displayClickEvent, this));

        }

        TestService.prototype.init = function (gl) {
            globe = gl;

        }

        /**************************************************************************************************************/

        /**
         *    Add layer to the service
         */
        TestService.prototype.addLayer = function (layer) {
            layers.push(layer);

            if (!layer.subLayers) {
                layer.subLayers = [];
            }

            this.serviceUrl = layer.serviceUrl;
            this.initParameters();

            this.addHTMLTestService(layer);
        }

        /**************************************************************************************************************/

        /**
         *    Remove layer from the service
         */
        TestService.prototype.removeLayer = function (layer) {
            for (var i = 0; i < layers.length; i++) {
                if (layers[i].id == layer.id) {
                    layers.splice(i, 1);
                }
            }

            $("#TestService #testService_parameters_" + layer.id).remove();
        },

            /**************************************************************************************************************/

        /**
         *    Add service to jQueryUI tabs
         *
         *    @param tabs jQueryUI tabs selector
         */
            TestService.prototype.addService = function (tabs) {
                // Append headers
                $('<li style="display: none;"><a href="#TestService">Test Service</a></li>')
                    .appendTo(tabs.children(".ui-tabs-nav"))
                    .fadeIn(300);

                // Append content
                tabs.append('<div id="TestService">\
						<div class="testService_parameters"></div>\
					</div>');

                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    this.addHTMLTestService(layer);
                }
            }

        /**************************************************************************************************************/

        /**
         *    Remove service from jQueryUI tabs
         *
         *    @param tabs jQueryUI tabs selector
         */
        TestService.prototype.removeService = function (tabs) {
            // Remove MocService tab(content&header)
            $('li[aria-controls="TestService"]').remove();
            $("#TestService").remove();
            tabs.tabs("refresh");
        }

        return TestService;

    });
