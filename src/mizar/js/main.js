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
 * Configuration for require.js
 */
require.config({
    paths: {
        "jquery": "../../../bower_components/jquery/dist/jquery.min",
        "jquery.ui": "../../../bower_components/jquery-ui/jquery-ui.min",
        "underscore-min": "../../../bower_components/underscore/underscore",
        "jquery.nicescroll.min": "../../../bower_components/jquery.nicescroll/dist/jquery.nicescroll.min",
        "fits": "../externals/fits",
        "samp": "../externals/samp",
        "gzip": "../externals/gzip",
        "crc32": "../externals/crc32",
        "deflate-js": "../externals/deflate",
        "inflate-js": "../externals/inflate",
        "wcs": "../externals/wcs",
        "jquery.ui.timepicker": "../../../bower_components/jquery.ui.timepicker/jquery.ui.timepicker",
        "gw": "../externals/GlobWeb/src"
    },
    shim: {
        'jquery': {
            deps: [],
            exports: 'jQuery'
        },
        'jquery.ui': {
            deps: ['jquery'],
            exports: 'jQuery'
        },
        'jquery.ui.timepicker': {
            deps: ['jquery.ui'],
            exports: 'jQuery'
        },
        'underscore-min': {
            deps: ['jquery'],
            exports: '_'
        },
        'jquery.nicescroll.min': {
            deps: ['jquery'],
            exports: ''
        }
    },
    waitSeconds: 0
});

/**
 * Mizar widget main
 */
require(["./MizarWidget"], function (MizarWidget) {

    var mizar = new MizarWidget('#mizarWidget-div', {
        debug: false,
        navigation: {
            "initTarget": [0, 0]
        },
        nameResolver: {
            "zoomFov": 2
        },
        positionTracker: {
            position: "bottom"
        },
        stats: {
            visible: true
        }
    });

    // Set different GUIs
    mizar.setAngleDistanceGui(true);
    mizar.setSampGui(true);
    mizar.setShortenerUrlGui(true);
    mizar.set2dMapGui(true);
    mizar.setReverseNameResolverGui(true);
    mizar.setNameResolverGui(true);
    mizar.setCategoryGui(true);
    mizar.setCompassGui(true);
    mizar.setShowCredits(true);
    mizar.setImageViewerGui(true);
    var atmosMarsLayer = {
        "category": "Other",
        "type": "atmosphere",
        "exposure": 1.4,
        "wavelength": [0.56, 0.66, 0.78],
        "name": "Atmosphere",
        "lightDir": [0, 1, 0],
        "visible": true
    };
    var coordLayer = {
        "category": "Other",
        "type": "tileWireframe",
        "name": "Coordinates Grid",
        "outline": true,
        "visible": false
    };

    var marsLayer = mizar.getLayer("Mars");
    mizar.addLayer(atmosMarsLayer, marsLayer);
    mizar.addLayer(coordLayer, marsLayer);


});
