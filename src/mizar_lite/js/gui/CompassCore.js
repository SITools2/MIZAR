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
 * Compass module : map control with "north" composant
 */
define(["jquery"], function ($) {

    /**
     *    Private variables
     */
    var parentElement = null;
    var globe = null;
    var navigation = null;
    var svgDoc;

    /**************************************************************************************************************/

    /**
     *
     * @param {object} event
     */
    function _alignWithNorth(event) {
        var up = [0, 0, 1];
        var coordinateSystem = globe.coordinateSystem;
        var temp = [];
        coordinateSystem.from3DToEquatorial(up, temp, false);
        temp = coordinateSystem.convert(temp, coordinateSystem.type, 'EQ');
        coordinateSystem.fromEquatorialTo3D(temp, up, false);
        navigation.moveUpTo(up);
    };

    /**************************************************************************************************************/

    /**
     * Function updating the north position on compass
     * @param {HTMLElement} northText
     */
    function updateNorth() {
        var geo = [];
        var coordinateSystem = globe.coordinateSystem;
        coordinateSystem.from3DToEquatorial(navigation.center3d, geo, false);
        geo = coordinateSystem.convert(geo, 'EQ', coordinateSystem.type);

        var LHV = [];
        coordinateSystem.getLHVTransform(geo, LHV);

        var temp = [];
        var north = [LHV[4], LHV[5], LHV[6]];
        var vertical = [LHV[8], LHV[9], LHV[10]];

        var up = vec3.create(navigation.up);
        coordinateSystem.from3DToEquatorial(up, temp, false);
        temp = coordinateSystem.convert(temp, 'EQ', coordinateSystem.type);
        coordinateSystem.fromEquatorialTo3D(temp, up, false);
        vec3.normalize(up);

        // Find angle between up and north
        var cosNorth = vec3.dot(up, north) / (vec3.length(up) * vec3.length(north));
        var radNorth = Math.acos(cosNorth);
        if (isNaN(radNorth)) {
            return;
        }
        var degNorth = radNorth * 180 / Math.PI;

        // Find sign between up and north
        var sign;
        vec3.cross(up, north, temp);
        sign = vec3.dot(temp, [vertical[0], vertical[1], vertical[2]]);
        if (sign < 0) {
            degNorth *= -1;
        }

        var northText = svgDoc.getElementById("NorthText");
        northText.setAttribute("transform", "rotate(" + degNorth + " 40 40)");
    };

    /**************************************************************************************************************/

    /**
     *    Remove compass element
     */
    function remove() {
        navigation.unsubscribe("modified", updateNorth);
        document.getElementById(parentElement).innerHTML = '';
    };

    /**************************************************************************************************************/

    return {
        init: function (options) {
            parentElement = options.element;
            globe = options.globe;
            navigation = options.navigation;
            svgDoc = options.svgDoc;
        },
        updateNorth: updateNorth,
        _alignWithNorth: _alignWithNorth,
        remove: remove

    };
});
