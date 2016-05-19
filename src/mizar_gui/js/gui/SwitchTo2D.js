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
 * Tool used to switch between 3D and 2D in planet mode
 */

define(["jquery", "jquery.ui"],
    function ($) {

        var globe;

        /**
         *    @constructor
         *    @param options Configuration options
         *        <ul>
         *            <li>globe: Globe</li>
         *            <li>navigation: Navigation</li>
         *            <li>onselect: On select callback</li>
         *        </ul>
         */
        var SwitchTo2D = function (options) {

            globe = options.globe;
            this.activated = false;
            this.renderContext = globe.renderContext;
            this.mode = options.mode;
            this.mizar = options.mizar;

            var self = this;

            $('#switch2DButton').on('click', function () {
                self.toggle2DSwitch();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });
        };

        /**********************************************************************************************/

        /**
         *    Switch between modes
         */
        SwitchTo2D.prototype.toggle2DSwitch = function () {
            mizar.toggleDimension();
            $('#switch2DButton').toggleClass('selected');
        };

        /**************************************************************************************************************/

        return SwitchTo2D;

    });
