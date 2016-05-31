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
 * Tool designed to measure the distance between two points
 */

define(["jquery", "underscore-min", "gui_core/MeasureToolSkyCore", "Utils", "jquery.ui"],
    function ($, _, MeasureToolSkyCore, Utils) {

        var globe, navigation, onselect, scale, self;

        /**
         *    @constructor
         *    @param options Configuration options
         *        <ul>
         *            <li>globe: Globe</li>
         *            <li>navigation: Navigation</li>
         *            <li>onselect: On select callback</li>
         *        </ul>
         */
        var MeasureToolSky = function (options) {
            // Required options
            globe = options.globe;
            navigation = options.navigation;
            onselect = options.onselect;

            MeasureToolSkyCore.init(options);

            this.renderContext = globe.renderContext;

            // Measure attributes
            //this.distance;
            //this.pickPoint; // Window pick point
            //this.secondPickPoint; // Window second pick point
            //this.geoDistance;
            //this.geoPickPoint; // Pick point in geographic reference
            //this.secondGeoPickPoint; // Pick point in geographic reference

            self = this;

            self.renderContext.canvas.addEventListener("mousedown", $.proxy(MeasureToolSkyCore._handleMouseDown, this));
            self.renderContext.canvas.addEventListener("mouseup", $.proxy(MeasureToolSkyCore._handleMouseUp, this));
            self.renderContext.canvas.addEventListener("mousemove", $.proxy(MeasureToolSkyCore._handleMouseMove, this));

            if (options.isMobile) {
                self.renderContext.canvas.addEventListener("touchend", $.proxy(MeasureToolSkyCore._handleMouseUp, this));
                self.renderContext.canvas.addEventListener("touchmove", $.proxy(MeasureToolSkyCore._handleMouseMove, this));
                self.renderContext.canvas.addEventListener("touchstart", $.proxy(MeasureToolSkyCore._handleMouseDown, this));
            }
            $('#measureSkyInvoker').on('click', function () {
                self.toggle();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });
        };


        /**
         *    Enable/disable the tool
         */
        MeasureToolSky.prototype.toggle = function () {
            MeasureToolSkyCore.activated = !MeasureToolSkyCore.activated;
            if (MeasureToolSkyCore.activated) {
                $(self.renderContext.canvas).css('cursor', 'url(css/images/selectionCursor.png)');
            }
            else {
                $(self.renderContext.canvas).css('cursor', 'default');
                MeasureToolSkyCore.clear();
            }
            $('#measureSkyInvoker').toggleClass('selected');
        };

        return MeasureToolSky;

    });
