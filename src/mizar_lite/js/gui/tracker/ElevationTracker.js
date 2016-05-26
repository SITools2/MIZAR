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
/*global define: false */

/**
 * Elevation tracker : show elevation in meters from current mouse position
 */
define(["jquery", "./AbstractTracker", "Utils"],
    function ($, AbstractTracker, Utils) {

        var globe;
        var element;
        var scale;
        var self;

        /**
         * ElevationTracker context constructor
         * @param options
         *          <ul>
         *              <li>globe : the globe</li>
         *              <li>element : tracker div element</li>
         *              <li>elevationTracker : if a tracker is already defined</li>
         *              <li>elevationLayer : eleveationLayer from planetLayer</li>
         *              <li>isMobile : mobile mode or not</li>
         * @constructor
         */
        var ElevationTracker = function (options) {
            AbstractTracker.prototype.constructor.call(this, options);

            self = this;
            globe = options.globe;
            element = options.element;
            if (options.elevationLayer != null) {
                scale = options.elevationLayer.hasOwnProperty('scale') ? options.elevationLayer.scale : 1;
                if (options.elevationTracker.position) {
                    $("#" + element).css(options.elevationTracker.position, "2px");
                }

                globe.renderContext.canvas.addEventListener('mousemove', self.update);
                if (options.isMobile) {
                    globe.renderContext.canvas.addEventListener('touchmove', self.update);
                }
            }
        };

        /**************************************************************************************************************/

        Utils.inherits(AbstractTracker, ElevationTracker);

        /**************************************************************************************************************/

        /**
         * Update the tracker
         * @param {object} event
         */
        ElevationTracker.prototype.update = function (event) {
            if (event.type.search("touch") >= 0) {
                event.clientX = event.changedTouches[0].clientX;
                event.clientY = event.changedTouches[0].clientY;
            }

            var geoPos = globe.getLonLatFromPixel(event.clientX, event.clientY);
            if (geoPos && mizar.mode === "planet") {
                var elevation = self.compute([geoPos[0], geoPos[1]]);
                document.getElementById(element).innerHTML = Utils.roundNumber(elevation / scale, 0) + " meters";
            } else {
                document.getElementById(element).innerHTML = "";
            }
        };

        /**************************************************************************************************************/

        /**
         * Compute elevation from a specific point
         * @param geoPosition
         * @returns {number} elevation
         */
        ElevationTracker.prototype.compute = function (geoPosition) {
            return globe.getElevation(geoPosition[0], geoPosition[1]);
        };

        /**************************************************************************************************************/

        return ElevationTracker;

    });
