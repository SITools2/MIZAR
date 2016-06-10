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
 *    Abstract class for services parameters
 *    Implemented by Concrete Parameters in order to perform searches based on different criteria
 */
define(["jquery", "underscore-min"],
    function ($, _) {

        /**************************************************************************************************************/

        /**
         *   Abstract Parameter constructor
         */
        var AbstractParameter = function (options) {

        };

        /**
         *
         */
        AbstractParameter.prototype.add = function (parameter) {
            this.parameters.push(parameter);

            return this.parameters;
        };

        /**************************************************************************************************************/

        /**
         *
         */
        AbstractParameter.prototype.remove = function (parameter) {
            var indexToRemove = -1;
            _.each(this.parameters, function (param, index) {
                if (param.key == parameter.key) {
                    indexToRemove = index;
                    return false;
                }
            });

            if (indexToRemove != -1) {
                this.parameters.splice(indexToRemove, 1);
            }

            return this.parameters;

        };

        /**************************************************************************************************************/

        /**
         *
         */
        AbstractParameter.prototype.convertParametersToHTML = function () {
        };


        return AbstractParameter;
    });

