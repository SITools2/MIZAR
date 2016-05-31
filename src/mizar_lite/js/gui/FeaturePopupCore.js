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
 * FeaturePopup module
 */
define(["jquery", "underscore-min", "../service/SampCore", "./ImageProcessingCore", "gw/Parser/JsonProcessor", "Utils", "gw/Renderer/FeatureStyle", "gw/Layer/VectorLayer", "text!../../templates/featureList.html", "text!../../templates/featureDescription.html", "text!../../templates/descriptionTable.html"],
    function ($, _, SampCore, ImageProcessingCore, JsonProcessor, Utils, FeatureStyle, VectorLayer, featureListHTMLTemplate, featureDescriptionHTMLTemplate, descriptionTableHTMLTemplate) {

        var featureListHTML = '';
        var pickingManager = null;
        var imageManager = null;
        var globe = null;
        var configuration;
        var $selectedFeatureDiv;
        var $leftDiv;
        var $rightDiv;
        var isMobile;

        // Template generating the list of selected features
        var featureListTemplate = _.template(featureListHTMLTemplate);

        // Template generating the detailed description of choosen feature
        var featureDescriptionTemplate = _.template(featureDescriptionHTMLTemplate);

        // Template generating the table of properties of choosen feature
        var descriptionTableTemplate = _.template(descriptionTableHTMLTemplate);


        /**********************************************************************************************/

        /**
         *    Insert HTML code of choosen feature
         */
        function createHTMLSelectedFeatureDiv(layer, feature) {
            if (!layer.hasOwnProperty('dictionary')) {
                createDictionary(layer, feature.properties);
            }

            var output = featureDescriptionTemplate({
                dictionary: layer.dictionary,
                services: feature.services,
                properties: buildProperties(feature.properties, layer.displayProperties),
                descriptionTableTemplate: descriptionTableTemplate,
                isMobile: isMobile
            });

            $rightDiv.html(output);

            // Stay in canvas
            $rightDiv.find('.featureProperties').css('max-height', computeHeight());

            $selectedFeatureDiv.find('.featureProperties').niceScroll({
                autohidemode: false
            }).hide();
        };

        /**********************************************************************************************/

        /**
         *    Insert HTML code of selected features
         *
         *    @param {<GlobWeb.Feature>[]} selection Array of features
         */
        function createFeatureList(selection) {
            featureListHTML = featureListTemplate({selection: selection});
            $leftDiv.html(featureListHTML);

            if (selection[0].layer.name === "Planets" && selection[0].feature.properties.name === "Mars") {
                var button = $('#goToMarsBtn');

                button.button().once().click(function () {
                    var marsLayer = mizar.getLayer("Mars");
                    if (marsLayer != undefined) {
                        mizar.toggleContext(marsLayer);
                        $('#selectedFeatureDiv').hide();
                    }
                });
            }
        };

        /**********************************************************************************************/

        /**
         *    Selected feature div position calculations
         *
         *    @param clientX event.clientX
         *    @param clientY event.clientY
         */
        function computeDivPosition(clientX, clientY) {

            var mousex = clientX; //Get X coodrinates
            var mousey = clientY; //Get Y coordinates

            mousex += 20;
            mousey -= 100;

            // Positionning
            $('#selectedFeatureDiv').css({
                position: 'absolute',
                left: mousex + 'px',
                top: mousey + 'px'
            });
        };

        /**********************************************************************************************/

        /**
         *    Compute optimal height of current viewport
         */
        function computeHeight() {
            return 2 * $('#' + globe.renderContext.canvas.id).height() / 5;
        }

        /**********************************************************************************************/

        /**
         *    Appropriate layout of properties depending on displayProperties
         *
         *    @param properties Feature properties to modify
         *    @param {String[]} displayProperties Array containing properties which must be displayed at first
         *
         *    @return Properties matching displayProperties
         */
        function buildProperties(properties, displayProperties) {
            if (displayProperties) {
                var handledProperties = {};

                handledProperties.identifier = properties.identifier;
                handledProperties.title = properties.title ? properties.title : "";
                handledProperties.style = properties.style;

                // Fill handledProperties in order
                for (var j = 0; j < displayProperties.length; j++) {
                    var key = displayProperties[j];
                    if (properties[key]) {
                        handledProperties[key] = properties[key];
                    }
                }

                handledProperties.others = {};
                // Handle the rest into sub-section "others"
                for (var key in properties) {
                    if (!handledProperties[key]) {
                        handledProperties.others[key] = properties[key];
                    }
                }

                return handledProperties;
            }
            else {
                return properties;
            }
        }

        /**********************************************************************************************/

        /**
         *    Add property description to the dictionary
         *
         *    @param describeUrl Open Search describe document url
         *    @param property Property
         *    @param dictionary Dictionary to complete
         */
        function addPropertyDescription(describeUrl, property, dictionary) {
            $.ajax({
                type: "GET",
                url: describeUrl + property,
                dataType: 'text',
                success: function (response) {
                    dictionary[property] = response;
                    $('#' + property).attr("title", response);
                },
                error: function (xhr) {
                    console.error(xhr);
                }
            });
        }

        /**********************************************************************************************/

        /**
         *    Create dictionary
         *
         *    @param {Layer} layer
         *    @param properties Feature properties
         */
        function createDictionary(layer, properties) {
            layer.dictionary = {};
            // Get dictionary template from open search description document
            $.ajax({
                type: "GET",
                url: layer.serviceUrl,
                dataType: "xml",
                success: function (xml) {
                    var dicodesc = $(xml).find('Url[rel="dicodesc"]');
                    var describeUrl = $(dicodesc).attr("template");

                    if (describeUrl) {
                        // Cut unused part
                        var splitIndex = describeUrl.indexOf("{");
                        if (splitIndex !== -1) {
                            describeUrl = describeUrl.substring(0, splitIndex);
                        }
                        for (var key in properties) {
                            addPropertyDescription(describeUrl, key, layer.dictionary);
                        }
                    }
                    //else
                    //{
                    // No dico found
                    //}
                },
                error: function (xhr) {
                    // No dico found
                    //console.error(xhr);
                }
            });
        }

        /**********************************************************************************************/

        /**
         * Show or Hide a quicklook
         */
        function showOrHideQuicklook() {
            var selectedData = pickingManager.getSelectedData();

            var otherQuicklookOn = selectedData.feature.properties.style.fill && !selectedData.feature.properties.style.fillTextureUrl;
            if (otherQuicklookOn) {
                // Remove fits quicklook
                imageManager.removeImage(selectedData);
            }

            selectedData.isFits = false;
            if (selectedData.feature.properties.style.fill === true) {
                imageManager.removeImage(selectedData);
            }
            else {
                imageManager.addImage(selectedData);
            }
        };

        /**********************************************************************************************/

        /**
         * Show or Hide a quicklook fits
         */
        function showOrHideQuicklookFits() {
            var selectedData = pickingManager.getSelectedData();

            var otherQuicklookOn = selectedData.feature.properties.style.fill && selectedData.feature.properties.style.fillTextureUrl;
            if (otherQuicklookOn) {
                // Remove quicklook
                imageManager.removeImage(selectedData);
            }

            selectedData.isFits = true;
            if (selectedData.feature.properties.style.fill === true) {
                imageManager.removeImage(selectedData);
            }
            else {
                imageManager.addImage(selectedData);
            }
        };

        /**********************************************************************************************/

        /**
         * Send image by Samp
         */
        function sendImageBySamp() {
            var selectedData = pickingManager.getSelectedData();
            var message = SampCore.sendImage(selectedData.feature.services.download.url);
            $('#serviceStatus').html(message).slideDown().delay(1500).slideUp();
        };

        /**********************************************************************************************/

        /**
         * Show or Hide HEALPix Service
         * @param {Event} event
         */
        function showOrHideHEALPixService(event) {
            var selectedData = pickingManager.getSelectedData();
            var healpixLayer = selectedData.feature.services.healpix.layer;

            if ($('#healpix').is('.selected')) {
                $('#healpix').removeClass('selected');
                healpixLayer.visible(false);
            }
            else {
                $('#healpix').addClass('selected');
                healpixLayer.visible(true);
            }
        };

        /**********************************************************************************************/

        /**
         * Show or Hide Solar Object Service
         */
        function showOrHideSolarObjectService() {
            var selectedData = pickingManager.getSelectedData();
            var selection = pickingManager.getSelection();

            var solarObjectsLayer;
            var layer = selectedData.layer;

            if (selectedData.feature.services.solarObjects) {
                solarObjectsLayer = selectedData.feature.services.solarObjects.layer;
            }
            else {
                // Create solar object layer
                var defaultVectorStyle = new FeatureStyle({
                    iconUrl: configuration.mizarBaseUrl + "css/images/star.png",
                    zIndex: 2
                });

                var options = {
                    name: "SolarObjectsSublayer",
                    style: defaultVectorStyle
                };

                solarObjectsLayer = new VectorLayer(options);
                globe.addLayer(solarObjectsLayer);
                pickingManager.addPickableLayer(solarObjectsLayer);

                var url = configuration.solarObjects.baseUrl;
                if (globe.baseImagery.tiling.coordSystem === "EQ") {
                    url += "EQUATORIAL";
                }
                else {
                    url += "GALACTIC";
                }

                $('#solarObjectsSpinner').show();
                $.ajax({
                    type: "GET",
                    url: url,
                    data: {
                        order: selection.selectedTile.order,
                        healpix: selection.selectedTile.pixelIndex,
                        EPOCH: selectedData.feature.properties['date-obs']
                        // coordSystem: (globe.tileManager.imageryProvider.tiling.coordSystem == "EQ" ? "EQUATORIAL" : "GALACTIC")
                    },
                    success: function (response) {
                        JsonProcessor.handleFeatureCollection(solarObjectsLayer, response);
                        $('#serviceStatus').html(response.totalResults + ' objects found').slideDown().delay(400).slideUp();
                        solarObjectsLayer.addFeatureCollection(response);
                    },
                    complete: function () {
                        $('#solarObjectsSpinner').hide();
                    },
                    error: function () {
                        $('#serviceStatus').html('No data found').slideDown().delay(400).slideUp();
                    }
                });

                if (!layer.subLayers) {
                    layer.subLayers = [];
                }
                selectedData.feature.services.solarObjects = {
                    layer: solarObjectsLayer
                };
                layer.subLayers.push(solarObjectsLayer);
            }

            if ($('#solarObjects').is('.selected')) {
                $('#solarObjects').removeClass('selected');
                solarObjectsLayer.visible(false);
            }
            else {
                $('#solarObjects').addClass('selected');
                solarObjectsLayer.visible(true);
            }
        };

        /**********************************************************************************************/

        function showOrHideDynamicImageService() {
            $(this).toggleClass('selected');
            var selectedData = pickingManager.getSelectedData();
            ImageProcessingCore.setData(selectedData);
        }

        /**********************************************************************************************/

        /**
         *    Hide popup
         *
         *    @param callback Callback
         */
        function hide(callback) {
            if ($selectedFeatureDiv.css('display') !== 'none') {
                $selectedFeatureDiv.find('.featureProperties').getNiceScroll().hide();

                $selectedFeatureDiv.fadeOut(300, function () {
                    $selectedFeatureDiv.find('.featureProperties').getNiceScroll().remove();

                    if (callback) {
                        callback();
                    }
                });
            }
            else if (callback) {
                callback();
            }
        };

        /**********************************************************************************************/

        /**
         *    Show popup
         *
         *    @param x X in window coordinate system
         *    @param y Y in window coordinate system
         *    @param callback Callback
         */
        function show(x, y, callback) {
            computeDivPosition(x, y);
            $selectedFeatureDiv.fadeIn(500, function () {
                $selectedFeatureDiv.find('.featureProperties').getNiceScroll().resize();
                if (callback) {
                    callback();
                }
            });
            var maxHeight = computeHeight();
            var popupMaxHeight = maxHeight - 60;
            $('#featureListDiv').css('max-height', popupMaxHeight);
            if ($leftDiv.find('#featureList').height() > popupMaxHeight) {
                $leftDiv.find('.scroll-arrow-up, .scroll-arrow-down').css('display', 'block');
            }
        };

        /**********************************************************************************************/

        /**
         * Choose a feature by clicking on its title
         */
        function selectFeatureOnTitle() {
            pickingManager.blurSelectedFeature();
            $('#featureList div.selected').removeClass('selected');

            var featureIndexToFocus = $(this).index();
            pickingManager.focusFeatureByIndex(featureIndexToFocus, {isExclusive: true});
            var selectedData = pickingManager.getSelectedData();

            $('#featureList div:eq(' + featureIndexToFocus + ')').addClass('selected');
            showFeatureInformation(selectedData.layer, selectedData.feature);

            globe.renderContext.requestFrame();

            // TODO highlight is not fully implemented
            // Samp.highlightFeature(selectedData.layer, selectedData.feature);
        };

        /**********************************************************************************************/

        /**
         * Show feature information
         * @param {Layer} layer
         * @param {Feature} feature
         */
        function showFeatureInformation(layer, feature) {
            $rightDiv.find('.featureProperties').getNiceScroll().hide();
            $rightDiv.fadeOut(300, function () {
                $rightDiv.find('.featureProperties').getNiceScroll().remove();
                createHTMLSelectedFeatureDiv(layer, feature);
                $(this).fadeIn(300, function () {
                    $selectedFeatureDiv.find('.featureProperties').getNiceScroll().resize();
                    $selectedFeatureDiv.find('.featureProperties').getNiceScroll().show();
                });
            });
        };

        /**********************************************************************************************/

        /**
         * Generate feature meta data for the given feature
         * @param {Layer} layer
         * @param {Feature} feature
         */
        function generateFeatureMetadata(layer, feature) {
            return featureDescriptionTemplate({
                dictionary: layer.hasOwnProperty('dictionary') ? layer.dictionary : createDictionary(layer, feature.properties),
                services: false,
                properties: buildProperties(feature.properties, layer.displayProperties),
                descriptionTableTemplate: descriptionTableTemplate
            });
        };

        /**********************************************************************************************/

        return {
            init: function (selectFeatDiv, pm, im, gl, conf) {
                pickingManager = pm;
                imageManager = im;
                globe = gl;
                configuration = conf;
                isMobile = conf.isMobile;

                $selectedFeatureDiv = selectFeatDiv;
                $leftDiv = $('#leftDiv');
                $rightDiv = $('#rightDiv');
            },
            createFeatureList: createFeatureList,
            createDictionary: createDictionary,
            computeDivPosition: computeDivPosition,
            computeHeight: computeHeight,
            buildProperties: buildProperties,
            showOrHideQuicklook: showOrHideQuicklook,
            showOrHideQuicklookFits: showOrHideQuicklookFits,
            sendImageBySamp: sendImageBySamp,
            showOrHideHEALPixService: showOrHideHEALPixService,
            showOrHideSolarObjectService: showOrHideSolarObjectService,
            showOrHideDynamicImageService: showOrHideDynamicImageService,
            showFeatureInformation: showFeatureInformation,
            selectFeatureOnTitle: selectFeatureOnTitle,
            hide: hide,
            show: show
        }
    });
