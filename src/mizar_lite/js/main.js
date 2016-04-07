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
        "loadmask" : "../../mizar_lite/externals/loadmask/jquery.loadmask",

        // Mizar_Gui requirements
        "mizar_gui" : "../../mizar_gui/js",
        "uws_gui" : "../../mizar_gui/js/uws", // TODO what to do with this ?

        //"service_gui" : "service_gui",

        // Mizar_Lite requirements
        "context" : "../../mizar_lite/js/context",
        "layer" : "../../mizar_lite/js/layer",
        "provider" : "../../mizar_lite/js/provider",
        "service" : "../../mizar_lite/js/service",
        "gui_core" : "../../mizar_lite/js/gui",
        "name_resolver" : "../../mizar_lite/js/name_resolver",
        "reverse_name_resolver" : "../../mizar_lite/js/reverse_name_resolver",
        "uws" : "../../mizar_lite/js/uws",
        //"mizar_lite" : "./js",
        "templates" : "../../mizar_lite/templates",
        "data" : "../data",
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
require(["./MizarWidgetGlobal"], function (MizarWidgetGlobal) {

    function initGuiAndLayers() {
        // Set different GUIs
        mizar.setAngleDistanceSkyGui(true);
        mizar.setSampGui(true);
        mizar.setShortenerUrlGui(true);
        mizar.setMollweideMapGui(false);
        mizar.setReverseNameResolverGui(true);
        mizar.setNameResolverGui(true);
        mizar.setCategoryGui(true);
        mizar.setCompassGui(true);
        mizar.setShowCredits(true);
        mizar.setImageViewerGui(true);
        mizar.setSwitchTo2D(true);
        mizar.setExportGui(true);

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

        var marsLayer = mizar.getLayer("Mars");
        var cratersCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Crater catalog",
            "description": "Crater catalog",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/min/costard_craters_min_3.json"
            },
            "visible": false,
            "pickable" : true,
            "color": "red"
        };
        mizar.addLayer(cratersCatalog, marsLayer);

        var peakIsidisHellasCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Central peaks hydrated phases between Isidis and Hellas",
            "description": "Hydrated phases detected in the exhumed material by impact crater from CRISM targeted observations between Isidis and Hellas basin",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/jsonPlis/detections_crateres_benjamin_bultel_icarus.json"
            },
            "visible": false,
            "pickable" : true,
//                        "color": ""
        };
        mizar.addLayer(peakIsidisHellasCatalog, marsLayer);

        var landingCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Landing sites",
            "description": "landing site of previous rover",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/landing_sites.json"
            },
            "visible": false,
            "pickable" : true,
            //"icon": "http://psup.ias.u-psud.fr:8283/sitools/upload/marker_green.png"
        };
        mizar.addLayer(landingCatalog, marsLayer);

        var crocusCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "crocus",
            "description": "crocus description",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/min/crocus_ls150-200_min.json"
            },
            "visible": false,
            "pickable" : true,
            "color": "blue"
        };
        mizar.addLayer(crocusCatalog ,marsLayer)

        var scallopedCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Scalloped depression",
            "description": "Outline of scalloped depressions from 80°E to 110°E and 40°N to 50°N using Context Camera/MRO (NASA) of 6 m/pixel and MOC/MGS (NASA) images",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/min/Scalloped_Depression_min.json"
            },
            "visible": false,
            "color": "yellow",
            "pickable" : true
        };
        mizar.addLayer(scallopedCatalog, marsLayer);

        var hydMinCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Hydrated mineral sites",
            "description": "A global map of hydrated mineral sites at the surface of Mars detected using the reflectance data acquired by the Mars Express OMEGA hyperspectral camera and from the Mars Reconnaissance Orbiter (MRO) CRISM imaging spectrometer",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/jsonPlis/hyd_global_290615_min.json"
            },
            "visible": false,
//                        "color": "",
            "pickable" : true
        };
        mizar.addLayer(hydMinCatalog, marsLayer);

        var vallesMarLowCalPyroCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Valles Marineris low Calcium-Pyroxene",
            "description": "Detection of low Calcium Pyroxene in the walls of Valles Marineris Canyon based on CRISM targeted observation",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/jsonPlis/lcp_flahaut_et_al.json"
            },
            "visible": false,
//                        "color": "",
            "pickable" : true
        };
        mizar.addLayer(vallesMarLowCalPyroCatalog, marsLayer);

        var centralPeakMinSouthCatalog = {
            "category": "Catalogs",
            "type": "GeoJSON",
            "name": "Central peaks mineralogy south Valles Marineris",
            "description": "Mineralogy of the central peaks of impact crater derived from CRISM targeted observation south of Valles Marineris Canyon",
            "data": {
                "type": "JSON",
                "url": "http://psup.ias.u-psud.fr/sitools/upload/geojson/jsonPlis/lcp_vmwalls.json"
            },
            "visible": false,
//                        "color": "",
            "pickable" : true
        };
        mizar.addLayer(centralPeakMinSouthCatalog, marsLayer);


        // LAYERS FOURNIS PAR UN SERVEUR WMS
        var themisDayIr100mLayer = {
            "name": "Themis Day IR 100m",
            "type": "WMS",
            "category": "Layer",
            "visible": false,
            "baseUrl": "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "themis_day_ir_100m",
            "format": "image/png",
            "attribution": "Themis Day IR 100m"
        };
        mizar.addLayer(themisDayIr100mLayer,marsLayer);

        var themisNightIr100mLayer = {
            "name": "Themis Night IR 100m",
            "type": "WMS",
            "category": "Layer",
            "visible": false,
            "baseUrl": "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "themis_night_ir_100m",
            "format": "image/png",
            "attribution": "Themis Day IR 100m"
        };
        mizar.addLayer(themisNightIr100mLayer,marsLayer);

        var molaShadedRelierColorLayer = {
            "name": "Mars Mola Shaded Relief Color",
            "type": "WMS",
            "category": "Layer",
            "visible": false,
            "baseUrl": "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "mola_shaded_relief_color",
            "format": "image/png",
            "attribution": "Mars Marc Shaded Relief Color TEST !"
        };
        mizar.addLayer(molaShadedRelierColorLayer,marsLayer);

        var molaShadedRelierLayer = {
            "name": "Mars Mola Shaded Relief",
            "type": "WMS",
            "category": "Layer",
            "visible": false,
            "baseUrl": "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "mola_shaded_relief",
            "format": "image/png",
            "attribution": "Mars Shaded Relief "
        };
        mizar.addLayer(molaShadedRelierLayer,marsLayer);

        var tes_albedo = {
            "name": "TES Albedo",
            "type": "WMS",
            "category": "Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "tes_albedo",
            "description": "TES Albedo",
            "format": "image/png"
        };
        mizar.addLayer(tes_albedo,marsLayer);

        // TEST OMEGA PNG
        var omega_albedo_layer ={
            "name": "OMEGA ALBEDO",
            "type": "WMS",
            "category": "Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_albedo_r1800",
            "description": "omega albedo",
            "format": "image/png"
        };
        mizar.addLayer(omega_albedo_layer,marsLayer);

        var omega_olivine_sp1_layer ={
            "name": "OMEGA Olivine SP1",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_olivine_sp1",
            "description": "omega olivine sp1",
            "format": "image/png"
        };
        mizar.addLayer(omega_olivine_sp1_layer,marsLayer);

        var omega_olivine_sp2_layer ={
            "name": "OMEGA Olivine SP2",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_olivine_sp2",
            "description": "omega olivine sp2",
            "format": "image/png"
        };
        mizar.addLayer(omega_olivine_sp2_layer,marsLayer);

        var omega_olivine_sp3_layer ={
            "name": "OMEGA Olivine SP3",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_olivine_sp3",
            "description": "omega olivine sp3",
            "format": "image/png"
        };
        mizar.addLayer(omega_olivine_sp3_layer,marsLayer);

        var omega_ferric_bd530_layer ={
            "name": "OMEGA Ferric Fe3+",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_ferric_bd530",
            "description": "Omega Ferric Fe3+ layer",
            "format": "image/png"
        };
        mizar.addLayer(omega_ferric_bd530_layer,marsLayer);

        var omega_ferric_nnphs_layer ={
            "name": "OMEGA Ferric Nanophase",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_ferric_nnphs",
            "description": "Omega Ferric Nanophase layer",
            "format": "image/png"
        };
        mizar.addLayer(omega_ferric_nnphs_layer,marsLayer);

        var omega_pyroxene_bd2000_layer ={
            "name": "OMEGA Pyroxene",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_pyroxene_bd2000",
            "description": "Omega Pyroxene layer",
            "format": "image/png"
        };
        mizar.addLayer(omega_pyroxene_bd2000_layer,marsLayer);

        var omega_hydration_layer ={
            "name": "OMEGA Hydrated mineral sites",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "omega_hydration",
            "description": "Omega Hydrated mineral sites layer",
            "format": "image/png"
        };
        mizar.addLayer(omega_hydration_layer,marsLayer);

        // Autres mineral Layers
        var tes_dust_cover ={
            "name": "TES Dust Cover",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "tes_dust_cover",
            "description": "TES Dust Cover",
            "format": "image/png"
        };
        mizar.addLayer(tes_dust_cover,marsLayer);

        var tes_clinopyroxene_layer ={
            "name": "TES High-Calcium Pyroxene Abundance",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "tes_High-Ca_Pyroxene",
            "description": "TES Clinopyroxene",
            "format": "image/png"
        }
        mizar.addLayer(tes_clinopyroxene_layer,marsLayer);

        var tes_plagioclase_layer ={
            "name": "TES Plagioclase",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "tes_plagioclase",
            "description": "TES Plagioclase",
            "format": "image/png"
        };
        mizar.addLayer(tes_plagioclase_layer,marsLayer);

        var tes_low_ca_Pyroxene_layer ={
            "name": "TES Low-Ca Pyroxene",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "tes_Low-Ca_Pyroxene",
            "description": "TES Low-Ca Pyroxene",
            "format": "image/png"
        };
        mizar.addLayer(tes_low_ca_Pyroxene_layer,marsLayer);

        var tes_olivine_layer ={
            "name": "TES Olivine",
            "type": "WMS",
            "category": "Mineral Layer",
            "baseUrl":  "http://idoc-wmsmars.ias.u-psud.fr/cgi-bin/mapserv?map=/home/cnes/mars/mars.map",
            "layers": "tes_olivine",
            "description": "TES Olivine",
            "format": "image/png"
        };
        mizar.addLayer(tes_olivine_layer,marsLayer);
        var mars_mex_hrsc_dtmrdr_c  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "Mars Mex hrsc dtmrdr",
            "description": "mars_mex_hrsc_dtmrdr_c",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mex_hrsc_dtmrdr_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mex_hrsc_dtmrdr_c, marsLayer);

        var mars_mex_hrsc_rdr_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "Mars Mex rdr c0a",
            "description": "mars_mex_hrsc_rdr_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mex_hrsc_rdr_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mex_hrsc_rdr_c0a, marsLayer);

        var mars_mex_omega_edr_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mex_omega_edr_c0a",
            "description": "mars_mex_omega_edr_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mex_omega_edr_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mex_omega_edr_c0a, marsLayer);

        var mars_mro_crism_trdrddrfrt07_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_crism_trdrddrfrt07_c0a",
            "description": "mars_mro_crism_trdrddrfrt07_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_crism_trdrddrfrt07_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_crism_trdrddrfrt07_c0a, marsLayer);

        var mars_mro_crism_trdrddrmsp_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_crism_trdrddrmsp_c0a",
            "description": "mars_mro_crism_trdrddrmsp_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_crism_trdrddrmsp_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_crism_trdrddrmsp_c0a, marsLayer);

        var mars_mro_ctx_edr_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_ctx_edr_c0a",
            "description": "mars_mro_ctx_edr_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_ctx_edr_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_ctx_edr_c0a, marsLayer);

        var mars_mro_ctx_stereo_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_ctx_stereo_c0a",
            "description": "mars_mro_ctx_stereo_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_ctx_stereo_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_ctx_stereo_c0a, marsLayer);

        var mars_mro_hirise_dtm_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_hirise_dtm_c0a",
            "description": "mars_mro_hirise_dtm_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_hirise_dtm_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_hirise_dtm_c0a, marsLayer);

        var mars_mro_hirise_rdrv11_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_hirise_rdrv11_c0a",
            "description": "mars_mro_hirise_rdrv11_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_hirise_rdrv11_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_hirise_rdrv11_c0a, marsLayer);

        var mars_mro_hirise_stereo_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_mro_hirise_stereo_c0a",
            "description": "mars_mro_hirise_stereo_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_mro_hirise_stereo_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_mro_hirise_stereo_c0a, marsLayer);

        var mars_ody_themis_irrdr_daylarge_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_ody_themis_irrdr_daylarge_c0a",
            "description": "mars_ody_themis_irrdr_daylarge_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_ody_themis_irrdr_daylarge_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_ody_themis_irrdr_daylarge_c0a, marsLayer);

        var mars_ody_themis_irrdr_daysmall_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_ody_themis_irrdr_daysmall_c0a",
            "description": "mars_ody_themis_irrdr_daysmall_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_ody_themis_irrdr_daysmall_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_ody_themis_irrdr_daysmall_c0a, marsLayer);

        var mars_ody_themis_irrdr_nightlarge_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_ody_themis_irrdr_nightlarge_c0a",
            "description": "mars_ody_themis_irrdr_nightlarge_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_ody_themis_irrdr_nightlarge_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_ody_themis_irrdr_nightlarge_c0a, marsLayer);

        var mars_ody_themis_irrdr_nightsmall_c0a  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "mars_ody_themis_irrdr_nightsmall_c0a",
            "description": "mars_ody_themis_irrdr_nightsmall_c0a",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:mars_ody_themis_irrdr_nightsmall_c0a&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(mars_ody_themis_irrdr_nightsmall_c0a, marsLayer);

        var emars_crism  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "emars_crism",
            "description": "emars_crism",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:emars_crism&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(emars_crism, marsLayer);

        var emars_ctx  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "emars_ctx",
            "description": "emars_ctx",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:emars_ctx&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(emars_ctx, marsLayer);

        var emars_ctx_dtm  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "emars_ctx_dtm",
            "description": "emars_ctx_dtm",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:emars_ctx_dtm&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(emars_ctx_dtm, marsLayer);

        var emars_hirise  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "emars_hirise",
            "description": "emars_hirise",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:emars_hirise&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(emars_hirise, marsLayer);

        var emars_hirise_dtm  = {
            "category": "MarsSI Data",
            "type": "GeoJSON",
            "name": "emars_hirise_dtm",
            "description": "emars_hirise_dtm",
            "data": {
                "type": "JSON",
                "url": "http://emars.univ-lyon1.fr/geoserver/EmarsGis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=EmarsGis:emars_hirise_dtm&maxFeatures=50&outputFormat=application/json"
            },
            "visible": false,
            "pickable" : true
        };
        mizar.addLayer(emars_hirise_dtm, marsLayer);
    }

    var mizar = new MizarWidgetGlobal('#mizarWidget-div', {
    mizar = new MizarWidgetGlobal('#mizarWidget-div', {
        guiActivated : true,
        mode : "sky",
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
        nameResolver : {
            zoomFov: 2,
            jsObject : "./name_resolver/IMCCENameResolver"
        }
        //"hipsServiceUrl": "http://aladin.unistra.fr/hips/globalhipslist?fmt=json"
    }, initGuiAndLayers);


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
