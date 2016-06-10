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
define(["jquery", "underscore-min", "../../Utils", "./AbstractParameter"],
    function ($, _, Utils, AbstractParameter, selectize) {

        var galacticParameter = '<input type="radio" id="galactic" name="coordSystem" value="galactic" />' +
            '<label for="galactic" style="font-size: 11px;">Galactic</label>';
        var equatorialParameter = '<input type="radio" id="equatorial" name="coordSystem" value="equatorial" />' +
            '<label for="equatorial" style="font-size: 11px;">Equatorial</label>';

        var pointGeometryParameter = '<input type="checkbox" id="point" name="geometry" value="point">' +
            '<label for="point" style="font-size: 11px;">Point</label>';

        var multipointGeometryParameter = '<input type="checkbox" id="multipoint" name="geometry" value="multipoint">' +
            '<label for="multipoint" style="font-size: 11px;">Multipoint</label>';

        var linestringGeometryParameter = '<input type="checkbox" id="linestring" name="geometry" value="linestring">' +
            '<label for="linestring" style="font-size: 11px;">Linestring</label>';

        var multilinestringGeometryParameter = '<input type="checkbox" id="multilinestring" name="geometry" value="multilinestring">' +
            '<label for="multilinestring" style="font-size: 11px;">MultilineString</label>';

        var polygonGeometryParameter = '<input type="checkbox" id="polygon" name="geometry" value="polygon">' +
            '<label for="polygon" style="font-size: 11px;">Polygon</label>';

        var multipolygonGeometryParameter = '<input type="checkbox" id="multipolygon" name="geometry" value="multipolygon">' +
            '<label for="multipolygon" style="font-size: 11px;">Multipolygon</label>';


        var healpixParameterTemplate = _.template('<label for="healpixParam" class="numberBetween" style="font-size: 11px;">Healpix </label>' +
            '<input class="selectize-input items not-full has-options" type="textfield" id="healpixParam" name="geometry" value="<%=param.value%>">');
        var orderParameterTemplate = _.template('<label for="orderParam" class="numberBetween" style="font-size: 11px;">Order </label>' +
            '<input class="selectize-input items not-full has-options" type="textfield" id="orderParam" name="geometry" value="<%=param.value%>">');

        /**
         *   Shape and geometry coordinates parameter constructor
         */
        var ShapeAndGeoCoordParameterType = function (options) {

            AbstractParameter.prototype.constructor.call(this, options);
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractParameter, ShapeAndGeoCoordParameterType);

        /**************************************************************************************************************/

        ShapeAndGeoCoordParameterType.prototype.convertParametersToHTML = function (parameter) {
            var parametersHTML = '<div name="' + parameter.name + '"><label>System coordinates</label>';

            parametersHTML += '<div name="coordSystemDiv">' + galacticParameter + equatorialParameter + '</div>' + '<br>';

            //parametersHTML += '<label>Geometry</label><div name="geometryDiv">' + pointGeometryParameter + multipointGeometryParameter + linestringGeometryParameter + multilinestringGeometryParameter
            //    + polygonGeometryParameter + multipolygonGeometryParameter + '</div></div>';

            var healpixParameter, orderParameter;
            _.each(parameter.values, function (p) {
                if (p.key == "healpixParam") {
                    healpixParameter = healpixParameterTemplate({
                        param: p
                    });
                } else {
                    orderParameter = orderParameterTemplate({
                        param: p
                    });
                }
            });

            parametersHTML += '<label>Geometry</label><div name="geometryDiv" style="width:300px; display: flex;">' + healpixParameter + '</div></div>';

            return parametersHTML;
        };

        ShapeAndGeoCoordParameterType.prototype.bindEventsParameters = function (parameter) {

            $('div [name="coordSystemDiv"]').buttonset();
            //$('div [name="geometryDiv"]').buttonset();

            // Set Coordinates System from Mizar value
            if (mizar.activatedContext.globe.coordinateSystem.type == "EQ") {
                $('div [name="coordSystemDiv"] > #equatorial').attr('checked', true).button('refresh');
            } else {
                $('div [name="coordSystemDiv"] > #galactic').attr('checked', true).button('refresh');
            }

            $('div [name="coordSystemDiv"]').button({
                disabled: true
            });
        };

        return ShapeAndGeoCoordParameterType;
    });
