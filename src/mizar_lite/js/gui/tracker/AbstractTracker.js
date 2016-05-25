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
 *    Abstract class for tracker (position, elevation...)
 *    Implemented by concrete trackers like ElevationTracker and PositionTracker
 */
define(["jquery"],
    function ($) {

        /**************************************************************************************************************/

        /**
         * Abstract Tracker constructor
         * @param {object} options
         * @constructor
         */
        var AbstractTracker = function (options) {
            this.options = options;
        };

        /**************************************************************************************************************/

        /**
         * Update the tracker
         * @param event
         */
        AbstractTracker.prototype.update = function (event) {
        };

        /**************************************************************************************************************/

        /**
         * Compute from geoPosition
         * @param {array} geoPosition
         */
        AbstractTracker.prototype.compute = function (geoPosition) {
        };

        /**************************************************************************************************************/

        return AbstractTracker;
    });
