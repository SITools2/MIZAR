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

        // Externals requirements
        "jquery": "../../mizar_lite/externals/jquery/dist/jquery.min",
        "jquery.ui": "../../mizar_lite/externals/jquery-ui/jquery-ui.min",
        "underscore-min": "../../mizar_lite/externals/underscore/underscore",
        "jszip": "../../mizar_lite/externals/jszip/jszip.min",
        "saveAs": "../../mizar_lite/externals/fileSaver/FileSaver.min",
        "jquery.nicescroll.min": "../../mizar_lite/externals/jquery.nicescroll/dist/jquery.nicescroll.min",
        "string": "../../mizar_lite/externals/string/dist/string.min",
        "fits": "../../mizar_lite/externals/fits",
        "samp": "../../mizar_lite/externals/samp",
        "gzip": "../../mizar_lite/externals/gzip",
        "crc32": "../../mizar_lite/externals/crc32",
        "deflate-js": "../../mizar_lite/externals/deflate",
        "inflate-js": "../../mizar_lite/externals/inflate",
        "wcs": "../../mizar_lite/externals/wcs",
        "jquery.ui.timepicker": "../../mizar_lite/externals/jquery.ui.timepicker/jquery.ui.timepicker",
        "gw": "../../mizar_lite/externals/GlobWeb/src",
        "jquery.once": "../../mizar_lite/externals/jquery-once/jquery.once.min",
        "selectize": "../../mizar_lite/externals/selectizejs/selectize",
        "sifter": "../../mizar_lite/externals/selectizejs/sifter",
        "microplugin": "../../mizar_lite/externals/selectizejs/microplugin",
        "flot": "../../mizar_lite/externals/flot/jquery.flot.min",
        "flot.tooltip": "../../mizar_lite/externals/flot/jquery.flot.tooltip.min",
        "flot.axislabels": "../../mizar_lite/externals/flot/jquery.flot.axislabels",
        "loadmask": "../../mizar_lite/externals/loadmask/jquery.loadmask",

        // Mizar_Gui requirements
        "mizar_gui": "../../mizar_gui/js",
        "uws": "../../mizar_gui/js/uws",
        "gui": "../../mizar_gui/js/gui",
        "service_gui" : "../../mizar_gui/js/service_gui",
        "service_gui2": "../../mizar_gui/js/service",
        "MizarWidgetGui": "../../mizar_gui/js/MizarWidgetGui",

        // Mizar_Lite requirements
        "context": "../../mizar_lite/js/context",
        "layer": "../../mizar_lite/js/layer",
        "provider": "../../mizar_lite/js/provider",
        "service": "../../mizar_lite/js/service",
        "gui_core": "../../mizar_lite/js/gui",
        "tracker" : "../../mizar_lite/js/gui/tracker",
        "name_resolver": "../../mizar_lite/js/name_resolver",
        "reverse_name_resolver": "../../mizar_lite/js/reverse_name_resolver",
        "uws_core": "../../mizar_lite/js/uws",
        "templates": "../../mizar_lite/templates",
        "data": "../../mizar_lite/data",
        "Utils" : "../../mizar_lite/js/Utils",
        "MizarCore" : "../../mizar_lite/js/MizarCore",
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
        },
        'flot': {
            deps: ['jquery'],
            exports: '$.plot'
        },
        'flot.tooltip': {
            deps: ['flot']
        },
        'flot.axislabels': {
            deps: ['flot']
        },
        'loadmask': {
            deps: ['jquery']
        }
    },
    waitSeconds: 0
});

/**
 * Mizar widget Global main
 */
require(["./MizarGlobal"], function (MizarGlobal) {

    function initGuiAndLayers() {

        if (mizar.mode == "sky") {
            // Set different GUIs
            mizar.setAngleDistanceSkyGui(true);
            mizar.setSampGui(true);
            mizar.setShortenerUrlGui(true);
            mizar.setMollweideMapGui(true);
            mizar.setReverseNameResolverGui(true);
            mizar.setNameResolverGui(true);
            mizar.setCategoryGui(true);
            mizar.setCompassGui(true);
            mizar.setShowCredits(true);
            mizar.setImageViewerGui(true);
            mizar.setSwitchTo2D(true);
            mizar.setExportGui(true);

        } else {
            // Set different GUIs
            mizar.setAngleDistanceSkyGui(false);
            mizar.setSampGui(false);
            mizar.setShortenerUrlGui(false);
            mizar.setMollweideMapGui(false);
            mizar.setReverseNameResolverGui(true);
            mizar.setNameResolverGui(true);
            mizar.setCategoryGui(true);
            mizar.setCompassGui(false);
            mizar.setShowCredits(false);
            mizar.setImageViewerGui(true);
            mizar.setSwitchTo2D(true);
            mizar.setExportGui(false);
        }

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
            "visible": true
        };

        var marsLayer = mizar.getLayer("Mars");
        mizar.addLayer(atmosMarsLayer, marsLayer);
        mizar.addLayer(coordLayer, marsLayer);
    }

    mizar = new MizarGlobal('#mizarWidget-div', {
        guiActivated: true,
        mode: "sky",
        //defaultLayer : "MOLA",
        debug: false,
        navigation: {
            "initTarget": [0, 0]
        },
        positionTracker: {
            position: "bottom"
        },
        stats: {
            visible: true
        },
        sitoolsBaseUrl: 'http://sitools.akka.eu:8080',
        hipsServiceUrl: "http://aladin.unistra.fr/hips/globalhipslist?fmt=json&dataproduct_subtype=color",
        backgroundSurveysFiles : ["data/backgroundSurveys.json"],
        additionalLayersFiles : [{
            layerName : "Mars",
            url : "data/marsLayers.json"
        }],
        nameResolver: {
            zoomFov: 2,
            jsObject: "./name_resolver/IMCCENameResolver"
        }
        //"hipsServiceUrl": "http://aladin.unistra.fr/hips/globalhipslist?fmt=json"
    });
    initGuiAndLayers();


    //
    //mizar.addLayer({
    //    "category": "Other",
    //    "type": "GeoJSON",
    //    "name": "MultiPoint",
    //    "icon": "css/images/toto.png",
    //    "data": {
    //        "type": "JSON",
    //        "url": "http://localhost/tests/simple_geometry/multipoint.json"
    //    },
    //    "visible": false,
    //    "pickable": true,
    //    "color": "rgb(237, 67, 53)",
    //    "dataType": "linestring"
    //}, marsLayer);


    //var earthLayer = mizar.getLayer("Earth");
    //mizar.addLayer({
    //    "category": "Other",
    //    "type": "GeoJSON",
    //    "name": "MultiPoint_earth",
    //    "icon": "css/images/toto.png",
    //    "data": {
    //        "type": "JSON",
    //        //"url": "http://localhost/tests/simple_geometry/multilinestring.json"
    //        "url": "http://localhost/tests/simple_geometry/polygon.json"
    //    },
    //    "visible": true,
    //    "pickable": true,
    //    "color": "rgb(237, 67, 53)",
    //    "dataType": "line"
    //}, earthLayer);


});
