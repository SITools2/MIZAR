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
 * Tool designed to select areas on globe
 */

define(["../jquery", "../underscore-min", "../jszip", "../saveAs", "./PickingManager", "./SelectionTool", "./PickingManager", "./LayerServiceView", "../Utils", "gw/Tiling/HEALPixBase", "loadmask"],
    function ($, _, PickingManager, JSZip, saveAs, SelectionTool, PickingManager, LayerServiceView, Utils, HealpixBase) {


        /**
         *    @constructor
         *    @param options Configuration options
         *        <ul>
         *            <li>globe: Globe</li>
         *            <li>navigation: Navigation</li>
         *            <li>onselect: On selection callback</li>
         *            <li>style: Selection tool style</li>
         *        </ul>
         */

        //var layerServiceOption = _.template('<div class="addLayer_<%=layerName%>" style="padding:2px;" name="<%=layerName%>">' +
        //    '<button class="layerServices ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only">' +
        //    '<span class="ui-button-icon-primary ui-icon ui-icon-wrench"></span>' +
        //    '<span class="ui-button-text">Available services</span>' +
        //    '</button>' +
        //    ' <label title="<%=layerDescription%>" ><%=layer.name%></label></div>');

        var layerServiceOption = _.template('<div class="addLayer_<%=layerName%>" style="padding:2px;" name="<%=layerName%>">' +
            '<input id="<%=layer.layerId%>" type="checkbox" class="ui-checkbox"/>' +
            ' <label title="<%=layerDescription%>" ><%=layer.name%></label></div>');

        var self, navigation, globe, selectionTool, layers, availableLayers;

        var ExportTool = function (options) {
            // Required options
            globe = options.globe;
            navigation = options.navigation;
            layers = options.layers;

            self = this;

            this.activated = false;
            this.renderContext = globe.renderContext;
            this.coordinateSystem = globe.coordinateSystem;

            $('#exportInvoker').on('click', function () {
                self.toggle();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });
        };

        /**
         *    Activate/deactivate the tool
         */
        ExportTool.prototype.toggle = function () {
            this.activated = !this.activated;

            if (this.activated)
                this.activate();
            else
                this.deactivate();

            $('#exportInvoker').toggleClass('selected');
        };

        /**************************************************************************************************************/

        ExportTool.prototype.activate = function () {
            $(this.renderContext.canvas).css('cursor', 'url(css/images/selectionCursor.png)');

            $('#GlobWebCanvas').css('cursor', 'crosshair');

            $('#categoryDiv').hide();
            $('#navigationDiv').hide();
            $('#2dMapContainer').hide();
            $('#shareContainer').hide();
            $('#sampContainer').hide();
            $('#measureSkyContainer').hide();
            $('#switch2DContainer').hide();
            $('#fps').hide();


            $('#rightTopPopup').append('<p class="zoneToExport">Draw a zone to export</p>');
            $('#rightTopPopup').dialog({
                draggable: false,
                resizable: false,
                width: 280,
                maxHeight: 400,
                dialogClass: 'popupService noTitlePopup',
                position: {
                    my: "right top",
                    at: "right top",
                    of: window
                }

            });

            PickingManager.deactivate();
            navigation.stop();

            selectionTool = new SelectionTool({
                globe: globe,
                navigation: navigation,
                activated: true,
                onselect: function (coordinates) {
                    $('.cutOutService').slideDown();
                    availableLayers = self.filterServicesAvailableOnLayers();
                    self.displayAvailableServices();

                    self.coordinates = coordinates;

                    // Activate picking events
                    $(self.renderContext.canvas).css('cursor', 'default');
                    $('#GlobWebCanvas').css('cursor', 'default');

                    PickingManager.activate();
                    navigation.start();
                    selectionTool.toggle();

                }
            });
        };

        /**************************************************************************************************************/

        ExportTool.prototype.deactivate = function () {
            $(this.renderContext.canvas).css('cursor', 'default');
            $('#GlobWebCanvas').css('cursor', 'default');

            $('#categoryDiv').show();
            $('#navigationDiv').show();
            $('#2dMapContainer').show();
            $('#shareContainer').show();
            $('#sampContainer').show();
            $('#measureSkyContainer').show();
            $('#switch2DContainer').show();
            $('#fps').show();

            $('#rightTopPopup').empty().dialog('close');

            PickingManager.activate();
            navigation.start();
            selectionTool.clear();
            //selectionTool.toggle();
        };

        /**************************************************************************************************************/

        /**
         *    Keep only layers having available searching services
         */
        ExportTool.prototype.filterServicesAvailableOnLayers = function () {
            availableLayers = [];
            _.each(layers, function (layer) {
                if (layer.visible() && layer.category != "Other" && layer.category != "Solar System"
                && layer.name != "SAMP" && layer.name != "Planets") {
                    layer.layerId = _.uniqueId('layer_');
                    availableLayers.push(layer);
                }
            });
            return availableLayers;
        };

        /**************************************************************************************************************/

        /**
         *    Display available services from layers in the middle top popup
         */
        ExportTool.prototype.displayAvailableServices = function () {

            $('#rightTopPopup').empty();
            $('#rightTopPopup').append('<p>Select from available layers to export images/data : </p>');


            _.each(availableLayers, function (layer) {

                var layerHtml = layerServiceOption({
                    layerName: layer.layerId,
                    layerDescription: layer.description,
                    layer: layer
                });
                $('#rightTopPopup').append(layerHtml);

                $("." + layer.layerId).data("layer", layer);

            });

            $('#rightTopPopup').append('<button id="exportToolBtn" class="ui-button ui-widget ui-state-default ui-corner-all">Export Selection</button>');
            $('#exportToolBtn').on('click', self.exportSelection);
        };

        /**************************************************************************************************************/

        ExportTool.prototype.exportSelection = function () {

            $("body").mask('Exporting data...');

            var JSZip = require("jszip");

            // creating empty archive
            var zip = new JSZip();

            // getting all visible and displayed layers
            var backgroundLayers = [];
            var dataLayers = [];
            _.each(availableLayers, function (layer) {
                if ($('#' + layer.layerId).is(':checked')) {
                    if (layer.type === "DynamicOpenSearch" || layer.type === "GeoJSON") {
                    //if (layer.type === "DynamicOpenSearch") {
                        dataLayers.push(layer);
                    } else if (layer.type === "healpix") {
                        backgroundLayers.push(layer);
                    }
                }
            });

            // Adding a middle point the bbox to be sure no data/image will be omitted
            var middlePoint = [
                (self.coordinates[0][1] + self.coordinates[1][1]) / 2,
                (self.coordinates[0][0] + self.coordinates[3][0]) / 2,
                0
            ];
            self.coordinates.push(middlePoint);

            // getting data url from layer using tile and bbox coordinates
            var urlsDataLayers = [];
            var tileLayerFeatures = [];
            _.each(dataLayers, function (dataLayer, index) {
                for (var i = 0; i < self.coordinates.length; i++) {
                    var tile = mizar.navigation.globe.tileManager.getVisibleTile(self.coordinates[i][0], self.coordinates[i][1]);

                    if (_.isEmpty(tile)) {
                        return;
                    }

                    var osData = tile.extension[dataLayer.extId];

                    if (!_.isEmpty(osData) && !_.isEmpty(osData.featureIds)) {
                        _.each(osData.featureIds, function (fId) {
                            var featureSet = dataLayer.featuresSet[fId];
                            if (!_.isEmpty(featureSet)) {
                                var feature = dataLayer.features[featureSet.index];

                                var isIncluded = true;
                                switch (feature.geometry.type) {
                                    case "Point":
                                        isIncluded = self.checkIfPointInBbox(feature.geometry.coordinates, self.coordinates);
                                        break;

                                    case "Polygon":
                                        for (var i = 0; i < feature.geometry.coordinates.length; i++) {
                                            if (!isIncluded) {
                                                return;
                                            }
                                            isIncluded = self.checkIfPointInBbox(feature.geometry.coordinates[0][i], self.coordinates);
                                        }
                                        break;
                                }
                                if (isIncluded) {
                                    // Adding layer information in order to rank data in archive
                                    feature.parentInformation = {
                                        copyright: dataLayer.copyright || "",
                                        copyrightUrl: dataLayer.copyrightUrl || "",
                                        category: dataLayer.category,
                                        name: dataLayer.name
                                    };
                                    tileLayerFeatures.push(feature);
                                }
                            }
                        });
                    }
                }
            });

            // Adding features archive
            _.each(tileLayerFeatures, function (feature) {
                var folder = zip.folder(feature.parentInformation.category + "/" + feature.parentInformation.name);

                // Adding a copyright file into each folder
                if (!_.isEmpty(feature.parentInformation.copyright) || !_.isEmpty(feature.parentInformation.copyrightUrl)) {
                    var copyright = "Copyright : " + feature.parentInformation.copyright + " - link : " + feature.parentInformation.copyrightUrl;
                    folder.file(feature.parentInformation.name + ".txt", copyright);
                }

                var featureToStringify = {
                    geometry : {
                        coordinates : feature.geometry.coordinates,
                        gid : feature.geometry.gid,
                        type : feature.geometry.type
                    },
                    id : feature.id,
                    properties : feature.properties,
                    type : feature.type
                };

                folder.file(feature.properties.identifier + ".json", JSON.stringify(featureToStringify, null, '\t'));
            });


            if (backgroundLayers.length == 0) {
                self.downloadArchive(zip);
            } else {
                var numberOfImages = 0;
                var imageNotFound = false;
                // get images url from Background layer
                _.each(backgroundLayers, function (backgroundLayer, index) {
                    backgroundLayer.urlImages = [];
                    backgroundLayer.images = [];

                    for (var i = 0; i < self.coordinates.length; i++) {

                        // Retrieve the tile according to a
                        var tile = mizar.navigation.globe.tileManager.getVisibleTile(self.coordinates[i][0], self.coordinates[i][1]);

                        if (_.isEmpty(tile)) {
                            return;
                        }

                        numberOfImages++;
                        var url = backgroundLayer.getUrl(tile);

                        var image = new Image();
                        image.aborted = false;
                        image.crossOrigin = '';
                        image.backgroundName = backgroundLayer.name;
                        image.parentFolder = backgroundLayer.category + "/" + backgroundLayer.name + "/images";
                        image.imageName = url.substring(url.lastIndexOf('/') + 1, url.length);

                        image.onload = function () {
                            self.addImageToArchive(this, zip);
                            numberOfImages--;

                            if (numberOfImages == 0) {
                                self.downloadArchive(zip);
                            }
                        };
                        image.onerror = function () {
                            imageNotFound = true;
                            console.dir('Error while retrieving image : ' + this.imageName);
                            numberOfImages--;
                            if (numberOfImages == 0) {
                                if (imageNotFound) {
                                    alert("Some images not found. Change zoom level and retry downloading");
                                }

                                self.downloadArchive(zip);
                            }
                        };
                        image.src = url;
                    }
                });
            }
        };

        /**
         *
         * @param zip
         */
        ExportTool.prototype.downloadArchive = function (zip) {
            var saveAs = require("saveAs");

            var date = new Date();
            var currentDate = $.datepicker.formatDate('yy/mm/dd ' + date.getHours() + ":" + date.getMinutes(), date);
            var readme = "Date : " + currentDate + "\n" +
                "Query :" + JSON.stringify(self.coordinates, null, '\t') + "\n" +
                "Copyright : Generated by MIZAR";

            zip.file("README.txt", readme);

            var content = zip.generate({type: "blob"});
            saveAs(content, "archive_" + currentDate + ".zip");
            $("body").unmask();
        };

        /**
         * Check if given is included into the drawn bbox
         * @param point
         * @param bbox
         * @returns {boolean}
         */
        ExportTool.prototype.checkIfPointInBbox = function (point, bbox) {
            if ((point[1] >= bbox[0][1] && point[1] <= bbox[1][1])
                && (point[0] <= bbox[0][0]
                && point[0] >= bbox[3][0])) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * Add an image into the passed archive
         * @param img
         * @param zip
         */
        ExportTool.prototype.addImageToArchive = function (img, zip) {
            var folder = zip.folder(img.parentFolder);
            folder.file(img.imageName, self.getBase64Image(img), {base64: true});
        };

        /**
         * Convert an image into base64
         * @param img
         * @returns {string}
         */
        ExportTool.prototype.getBase64Image = function (img) {
            // Create an empty canvas element
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            // Copy the image contents to the canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using "image/jpg"
            // will re-encode the image.
            var dataURL = canvas.toDataURL("image/png");

            return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
        };

        return ExportTool;

    });
