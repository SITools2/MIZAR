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
 *    Types of output available on services
 */
define(["../jquery", "../underscore-min"],
    function ($, _) {

        /**************************************************************************************************************/

        /**
         *   Service Output Type constructor
         */
        var ServiceOutputType = {
            GEOJSON: "GEOJSON",
            DOWNLOAD: "DOWNLOAD",
            HTML: "HTML"
        };


        return ServiceOutputType;
    });
