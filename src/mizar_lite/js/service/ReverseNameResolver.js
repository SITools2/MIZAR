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
 * Name resolver module : search object name from its coordinates
 * TODO : move _handleMouseDown&Up to View ?
 */
define(["../jquery", "gw/Tiling/HEALPixBase"], function ($, HEALPixBase) {

    var mizar;
    var context;
    var HOUR_TO_DEG = 15.;

    /**************************************************************************************************************/

    return {
        init: function (m, context) {
            mizar = m;
            this.setContext(context);
        },

        /**************************************************************************************************************/

        /**
         *    Send request to reverse name resolver service for the given point
         *    @param geoPick    Geographic position of point of interest
         *    @param options
         *        <li>success: Function called on success with the response of server as argument</li>
         *        <li>error: Function called on error with the xhr object as argument</li>
         */
        sendRequest: function (geoPick, options) {
            var self = this;
            // TODO: depending on context, send the request
            // Currently only sky context is handled
            if (mizar.mode == "sky") {
                var equatorialCoordinates = [];
                context.globe.coordinateSystem.fromGeoToEquatorial(geoPick, equatorialCoordinates);

                // Format to equatorial coordinates
                equatorialCoordinates[0] = equatorialCoordinates[0].replace("h ", ":");
                equatorialCoordinates[0] = equatorialCoordinates[0].replace("m ", ":");
                equatorialCoordinates[0] = equatorialCoordinates[0].replace("s", "");

                equatorialCoordinates[1] = equatorialCoordinates[1].replace("° ", ":");
                equatorialCoordinates[1] = equatorialCoordinates[1].replace("' ", ":");
                equatorialCoordinates[1] = equatorialCoordinates[1].replace("\"", "");

                // Find max order
                var maxOrder = 3;
                context.globe.tileManager.visitTiles(function (tile) {
                    if (maxOrder < tile.order) maxOrder = tile.order
                });

                //var requestUrl = context.configuration.reverseNameResolver.baseUrl + '/EQUATORIAL/' + equatorialCoordinates[0] + " " + equatorialCoordinates[1] + ";" + maxOrder;

                //BEGINING OF SPECIFIC PROCESSING
                //DO IT WITHOUT REQUESTING SITOOLS
                /**
                 * Arsec 2 degree conversion.
                 */
                var ARCSEC_2_DEG = 1 / 3600.;
                /**
                 * MAX radius of a cone in arcsec.
                 */
                var MAX_RADIUS = 1800.;


                var nside = Math.pow(2, maxOrder);

                var pixRes = HEALPixBase.getPixRes(nside);
                var radius = (pixRes > MAX_RADIUS) ? MAX_RADIUS : pixRes / 2;
                radius *= ARCSEC_2_DEG;


                var requestUrl = "http://alasky.u-strasbg.fr/cgi/simbad-flat/simbad-quick.py?Ident={coordinates}&SR={radius}";

                requestUrl = requestUrl.replace("{coordinates}", equatorialCoordinates[0] + " " + equatorialCoordinates[1]);
                requestUrl = requestUrl.replace("{radius}", radius);

                $.ajax({
                    type: "GET",
                    url: requestUrl,
                    success: function (response) {
                        // we parse the message that is returned by the server
                        var posParenthesis = response.indexOf('(');
                        var posComma = response.indexOf(',');
                        var posSlash = response.indexOf('/');
                        var position = response.substring(0, posSlash);
                        var name = response.substring(posSlash + 1, posParenthesis);

                        var magnitude = parseFloat(response.substring(posParenthesis + 1, posComma));
                        var objectType = response.substring(posComma + 1, response.length - 2);

                        var positionElts = position.split(" ");

                        //GET HMS
                        var hours = parseFloat(positionElts[0]);
                        var min = parseFloat(positionElts[1]);
                        var sec = parseFloat(positionElts[2]);

                        var degrees = parseFloat(positionElts[3]);
                        var min2 = parseFloat(positionElts[4]);
                        var sec2 = parseFloat(positionElts[5]);

                        var ra = self.parseRa(hours, min, sec);
                        var dec = self.parseDec(degrees, min2, sec2);

                        var features = {
                            "totalResults": 1,
                            "type": "FeatureCollection",
                            "features": [{
                                "type": "Feature",
                                "geometry": {
                                    "coordinates": [ra, dec],
                                    "type": "Point"
                                },
                                "properties": {
                                    "crs": {
                                        "type": "name",
                                        "properties": {
                                            "name": "equatorial.ICRS"
                                        }
                                    },
                                    "title": name,
                                    "magnitude": magnitude,
                                    "credits": "CDS",
                                    "seeAlso": "http://simbad.u-strasbg.fr/simbad/sim-id?Ident=" + name,
                                    "type": objectType,
                                    "identifier": name
                                }
                            }]
                        };

                        if (options && options.success)
                            options.success(features);
                        //END OF SPECIFIC PROCESSING

                        //if (options && options.success)
                        //    options.success(response);
                    },
                    error: function (xhr, ajaxOptions, thrownError) {
                        debugger;
                        if (options && options.error)
                            options.error(xhr);
                    }
                });
            }
            else {
                console.error("Not implemented yet");
                if (options && options.error)
                    options.error();
            }
        },

        /**************************************************************************************************************/

        /**
         *    Set new context
         */
        setContext: function (ctx) {
            context = ctx;
        },

        parseRa: function (hours, min, sec) {
            var intHours = parseInt(hours);
            var val = (sec / 60.0 + min) / 60.0;

            if (hours < 0.0 || parseFloat(hours) === -0.0) {
                val = hours - val;
                intHours = -intHours;
            } else {
                val = intHours + val;
            }
            return val * HOUR_TO_DEG;
        },

        parseDec: function (degrees, min, sec) {
            var intDegrees = parseInt(degrees);

            var val = (sec / 60.0 + min) / 60.0;

            if (degrees < 0.0 || parseFloat(degrees) === -0.0) {
                val = degrees - val;
                intDegrees = -intDegrees;
            } else {
                val = intDegrees + val;
            }
            return val;
        }
    };

});
