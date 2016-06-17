({
    baseUrl: "../src/mizar_lite/js",
    name: "../../../build/almond",
    include: ['MizarGlobal'],
    out: "../src/mizar_lite/MizarWidget.min.js",
    wrap: {
        start: "(function (root, factory) {\
		    if (typeof define === 'function' && define.amd) {\
			define(['jquery', 'underscore-min'], factory);\
		    } else {\
			root.MizarGlobal = factory(root.$, root._);\
		    }\
		}(this, function ($, _) {",
        end: "return require('MizarGlobal');}));"
    },
    optimize: "uglify",
    paths: {
        // Externals requirements
        "jquery": "../externals/jquery/dist/jquery.min",
        "jquery.ui": "../externals/jquery-ui/jquery-ui.min",
        "underscore-min": "../externals/underscore/underscore",
        "jszip": "../externals/jszip/jszip.min",
        "saveAs": "../externals/fileSaver/FileSaver.min",
        "jquery.nicescroll.min": "../externals/jquery.nicescroll/dist/jquery.nicescroll.min",
        "string": "../externals/string/dist/string.min",
        "fits": "../externals/fits",
        "samp": "../externals/samp",
        "gzip": "../externals/gzip",
        "crc32": "../externals/crc32",
        "deflate-js": "../externals/deflate",
        "inflate-js": "../externals/inflate",
        "wcs": "../externals/wcs",
        "jquery.ui.timepicker": "../externals/jquery.ui.timepicker/jquery.ui.timepicker",
        "gw": "../externals/GlobWeb/src",
        "jquery.once": "../externals/jquery-once/jquery.once.min",
        "selectize": "../externals/selectizejs/selectize",
        "sifter": "../externals/selectizejs/sifter",
        "microplugin": "../externals/selectizejs/microplugin",
        "flot": "../externals/flot/jquery.flot.min",
        "flot.tooltip": "../externals/flot/jquery.flot.tooltip.min",
        "flot.axislabels": "../externals/flot/jquery.flot.axislabels",
        "loadmask": "../externals/loadmask/jquery.loadmask",

        // Mizar_Gui requirements
        "mizar_gui": "../../mizar_gui/js",
        "uws": "../../mizar_gui/js/uws",
        "gui": "../../mizar_gui/js/gui",
        "service_gui": "../../mizar_gui/js/service_gui",
        "service_gui2": "../../mizar_gui/js/service",
        "MizarWidgetGui": "../../mizar_gui/js/MizarWidgetGui",

        //"service_gui" : "service_gui",

        // Mizar_Lite requirements
        "context": "context",
        "layer": "layer",
        "provider": "provider",
        "service": "service",
        "gui_core": "gui",
        "tracker" : "../../mizar_lite/js/gui/tracker",
        "name_resolver": "name_resolver",
        "reverse_name_resolver": "reverse_name_resolver",
        "uws_core": "uws",
        "templates": "../templates",
        "data": "../data",
        "Utils" : "./Utils",
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
    //uglify: {
    //    //Example of a specialized config. If you are fine
    //    //with the default options, no need to specify
    //    //any of these properties.
    //    output: {
    //        beautify: false
    //    },
    //    compress: {
    //        unsafe: true
    //    },
    //    warnings: true,
    //    mangle: true
    //}
})
