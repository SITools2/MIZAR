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
 * Mollweider viewer module : Sky representation in mollweide coordinate system
 */
define(["jquery", "gui_core/MollweideViewerLite", "Utils"],
    function ($, MollweideViewerLite) {

    var mizarBaseUrl;

    /*************************************************************************/

    var MollweideViewer = function (options) {

        mizarBaseUrl = options.mizarBaseUrl;

        // Init options
        this.globe = options.globe;
        var navigation = options.navigation;

        MollweideViewerLite.init(options);

        // Interaction parameters
        var dragging = false;

        // Init image background
        var canvas = document.getElementById('mollweideCanvas');
        var context = canvas.getContext('2d');
        var self = this;

        this.setCoordSystem(this.globe.coordinateSystem.type);

        /**********************************************************************************************/

        /**
         * Get mouse position on canvas
         */
        function getMousePos(event) {
            // Difference between chrome and firefox;
            var offX = (event.offsetX) ? event.offsetX : (event.layerX - event.target.offsetLeft);
            var offY = (event.offsetY) ? event.offsetY : (event.layerY - event.target.offsetTop);

            return [offX, offY];
        }

        /**********************************************************************************************/

        // Interact with mollweide projection
        canvas.addEventListener('mousedown', function (event) {

            var mPos = getMousePos(event);
            MollweideViewerLite.updateNavigation(mPos);
            dragging = true;
            return true;
        });

        canvas.addEventListener('mousemove', function (event) {

            if (!dragging)
                return;

            var mPos = getMousePos(event);
            MollweideViewerLite.updateNavigation(mPos);
        });

        canvas.addEventListener('mouseup', function () {
            dragging = false;
        });

        /**********************************************************************************************/

        // Show/hide mollweide projection
        $('#slideArrow').click(function () {

            if (parseFloat($(this).parent().css('left')) < 0) {
                // Show
                $('#mollweideContent').css({boxShadow: "0px 0px 8px 1px rgba(255, 158, 82, 0.92)"});
                $(this).css('background-position', '0px 0px');
                $(this).parent().animate({left: '0px'}, 300);
                // Update fov when navigation modified
                navigation.subscribe("modified", MollweideViewerLite.updateMollweideFov);
                MollweideViewerLite.updateMollweideFov(MollweideViewerLite.getImageObj());
            }
            else {
                // Hide
                $('#mollweideContent').css({boxShadow: "none"});
                $(this).css('background-position', '0px -20px');
                $(this).parent().animate({left: '-266px'}, 300);
                navigation.unsubscribe("modified", MollweideViewerLite.updateMollweideFov);
            }
        });

        // Fix for Google Chrome : avoid dragging
        canvas.addEventListener("dragstart", function (event) {
            event.preventDefault();
            return false;
        });
    };

    /**********************************************************************************************/

    /**
     *  Change coordinate system background
     *
     *  @param coordSystem {String} Coordinate system to set
     *          <ul>
     *              <li>"EQ" : Equatorial</li>
     *              <li>"GAL" : Galactic</li>
     *          <ul>
     */
    MollweideViewer.prototype.setCoordSystem = function (coordSystem) {
        // Update mollweideViewer background image
        $(MollweideViewerLite.getImageObj()).attr("src", mizarBaseUrl + "css/images/MollweideSky_" + coordSystem + ".png");
    };

    /**********************************************************************************************/

    return MollweideViewer;

});
