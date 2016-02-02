({
	baseUrl: "../src/mizar_gui/js",
	name: "../../../build/almond",
	include: ['MizarWidget'],
	out: "../src/mizar_gui/MizarWidget.min.js",
	wrap: {
 	    start: "(function (root, factory) {\
		    if (typeof define === 'function' && define.amd) {\
			define(['jquery', 'underscore-min'], factory);\
		    } else {\
			root.MizarWidget = factory(root.$, root._);\
		    }\
		}(this, function ($, _) {",
	    end: "return require('MizarWidget');}));"
	},
	optimize: "uglify",
	paths: {
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
        "selectize": "../../mizar_lite/externals/selectizejs/dist/js/standalone/selectize.min",
        "flot": "../../mizar_lite/externals/flot/jquery.flot.min",
        "flot.tooltip": "../../mizar_lite/externals/flot/jquery.flot.tooltip.min",
        "flot.axislabels": "../../mizar_lite/externals/flot/jquery.flot.axislabels",
        "loadmask" : "../../mizar_lite/externals/loadmask/jquery.loadmask",

        // requirements Mizar_Lite
        "context" : "../../mizar_lite/js/context",
        "layer" : "../../mizar_lite/js/layer",
        "provider" : "../../mizar_lite/js/provider",
        "service" : "../../mizar_lite/js/service",
        "gui_core" : "../../mizar_lite/js/gui",
        "name_resolver" : "../../mizar_lite/js/name_resolver",
        "reverse_name_resolver" : "../../mizar_lite/js/reverse_name_resolver",
        "uws" : "../../mizar_lite/js/uws",
        "mizar_lite" : "../../mizar_lite",
        "service_gui" : "./service_gui",
        "uws_gui" : "./uws",
        "templates" : "../templates",
        "data" : "../data",
        "data_core" : "../../mizar_lite/data"
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
		'underscore-min': {
			deps: ['jquery'],
			exports: '_'
		},
		'jquery.nicescroll.min': {
			deps: ['jquery'],
			exports: ''
		},
		'jquery.ui.timepicker': {
			deps: ['jquery.ui'],
			exports: 'jQuery'
		}
	},
  	uglify: {
        //Example of a specialized config. If you are fine
        //with the default options, no need to specify
        //any of these properties.
        output: {
            beautify: false
        },
        compress: {
 	    	unsafe: true
        },
        warnings: true,
        mangle: true
    }
})
