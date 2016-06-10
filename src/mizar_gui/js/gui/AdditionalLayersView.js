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
 * AdditionalLayersView module
 */
define(["jquery", "gui_core/AdditionalLayersCore", "layer/LayerManager", "./PickingManager", "./DynamicImageView", "./LayerServiceView", "service_gui2/Samp", "gui_core/dialog/ErrorDialog", "Utils", "underscore-min", "text!../../templates/additionalLayers.html", "text!../../templates/additionalLayer.html", "jquery.nicescroll.min", "jquery.ui"],
    function ($, AdditionalLayersCore, LayerManager, PickingManager, DynamicImageView, LayerServiceView, Samp, ErrorDialog, Utils, _, additionalLayersHTML, additionalLayerHTMLTemplate) {

        var mizarCore;
        var sky;
        var navigation;
        var parentElement;
        var categories = {
            "Other": 'otherLayers',
            "Coordinate systems": 'coordinateSystems'
        };
        var isMobile = false;

// Template generating the additional layer div in sidemenu
        var additionalLayerTemplate = _.template(additionalLayerHTMLTemplate);

        /**************************************************************************************************************/

        /**
         *    Initialize nice scroll for the given category
         */
        function initNiceScroll(categoryId) {
            // Nice scrollbar initialization
            $('#' + categoryId).niceScroll({
                autohidemode: false
            });
            // Hide scroll while accordion animation
            $(parentElement).on("accordionbeforeactivate", function () {
                $('#' + categoryId).niceScroll().hide();
            });
            // Show&resize scroll on the end of accordion animation
            $(parentElement).on("accordionactivate", function () {
                $('#' + categoryId).niceScroll().show();
                updateScroll(categoryId);
            });
        }

        /**************************************************************************************************************/

        /**
         *    Update scroll event
         */
        function updateScroll(categoryId) {
            $(parentElement).find('#' + categoryId).getNiceScroll().resize();
        }

        /**************************************************************************************************************/

        /**
         *    Initialize UI of opacity slider for the given layer
         */
        function initializeSlider($layerDiv, gwLayer) {
            var shortName = Utils.formatId(gwLayer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            // Slider initialisation
            $layerDiv.find('#slider_' + shortName).slider({
                value: gwLayer.opacity() * 100,
                min: 20,
                max: 100,
                step: 20,
                slide: function (event, ui) {
                    $("#percentInput_" + shortName).val(ui.value + "%");
                    gwLayer.opacity(ui.value / 100);

                    if (gwLayer.subLayers) {
                        for (var i = 0; i < gwLayer.subLayers.length; i++) {
                            gwLayer.subLayers[i].opacity(ui.value / 100);
                        }
                    }
                }
            }).slider("option", "disabled", !gwLayer.visible());

            // Init percent input of slider
            $("#percentInput_" + shortName).val($("#slider_" + shortName).slider("value") + "%");
        }

        /**************************************************************************************************************/

        /**
         *    Update all toolbar buttons UI
         */
        function updateButtonsUI($layerDiv) {
            // Init buttons of tool bar
            $layerDiv
                .find('.deleteLayer').button({
                    text: false,
                    icons: {
                        primary: "ui-icon-trash"
                    }
                }).end()
                .find('.zoomTo').button({
                    text: false,
                    icons: {
                        primary: "ui-icon-zoomin"
                    }
                }).end()
                .find('.exportLayer').button({
                    text: false,
                    icons: {
                        primary: "ui-icon-extlink"
                    }
                }).end()
                .find('.downloadAsVO').button({
                    text: false,
                    icons: {
                        primary: "ui-icon-arrowthickstop-1-s"
                    }
                }).end()
                .find('.isFits').button().end()
                .find('.addFitsView').button({
                    text: false,
                    icons: {
                        primary: "ui-icon-image"
                    }
                }).end()
                .find('.layerServices').button({
                    text: false,
                    icons: {
                        primary: "ui-icon-wrench"
                    }
                });
        }

        /**************************************************************************************************************/

        /**
         *    Add legend for the given layer if possible
         *    Legend represents the "line" for polygon data or image from "iconUrl" for point data
         */
        function addLegend($layerDiv, gwLayer) {
            var $canvas = $layerDiv.find('.legend');
            var canvas = $canvas[0];

            if (Utils.isOpenSearchLayer(gwLayer) || Utils.isMocLayer(gwLayer) || Utils.isVectorLayer(gwLayer)) {
                if (gwLayer.dataType === "point") {
                    AdditionalLayersCore.generatePointLegend(gwLayer, canvas, gwLayer.style.iconUrl);
                }
                else if (gwLayer.dataType === "line") {
                    AdditionalLayersCore.generateLineLegend(gwLayer, canvas);
                }
                else {
                    $canvas.css("display", "none");
                }
            }
            else {
                $canvas.css("display", "none");
            }
        }

        /**************************************************************************************************************/

        /**
         *    Create dialog to modify contrast/colormap of fits layers
         */
        function createDynamicImageDialog(gwLayer) {
            var shortName = Utils.formatId(gwLayer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            // Supports fits, so create dynamic image view in dialog
            var dialogId = "addFitsViewDialog_" + shortName;
            var $dialog = $('<div id="' + dialogId + '"></div>').appendTo('body').dialog({
                title: 'Image processing',
                autoOpen: false,
                show: {
                    effect: "fade",
                    duration: 300
                },
                hide: {
                    effect: "fade",
                    duration: 300
                },
                resizable: false,
                width: 'auto',
                minHeight: 'auto',
                close: function () {
                    $('#addFitsView_' + shortName).removeAttr("checked").button("refresh");
                    $(this).dialog("close");
                }
            });

            // Dialog activator
            $('#addFitsView_' + shortName).click(function () {

                if ($dialog.dialog("isOpen")) {
                    $dialog.dialog("close");
                }
                else {
                    $dialog.dialog("open");
                }
            });

            // Add dynamic image view content to dialog
            gwLayer.div = new DynamicImageView(dialogId, {
                id: shortName,
                changeShaderCallback: function (contrast) {
                    if (contrast === "raw") {
                        gwLayer.customShader.fragmentCode = gwLayer.rawFragShader;
                    }
                    else {
                        gwLayer.customShader.fragmentCode = gwLayer.colormapFragShader;
                    }
                }
            });
        }

        /**************************************************************************************************************/

        /**
         *    Handler managing BaseLayer "visibility:changed" event
         *    TODO: create view object
         */
        function onVisibilityChange(gwLayer) {
            var isOn = gwLayer.visible();
            var shortName = Utils.formatId(gwLayer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            // Manage 'custom' checkbox
            // jQuery UI button is not sexy enough :)
            // Toggle some classes when the user clicks on the visibility checkbox
            if (gwLayer.subLayers) {
                AdditionalLayersCore.setSublayersVisibility(gwLayer, isOn);
            }

            var toolsDiv = $("#addLayer_" + shortName).find('.layerTools');
            $("#addLayer_" + shortName).find('.slider').slider(isOn ? "enable" : "disable");
            if (isOn) {
                $('.layerTools').slideUp();
                toolsDiv.slideDown();

                // Change button's state
                $('#visible_' + shortName).addClass('ui-state-active').removeClass('ui-state-default')
                    .find('span').addClass('ui-icon-check').removeClass('ui-icon-empty');
            }
            else {
                toolsDiv.slideUp();
                // Change button's state
                $('#visible_' + shortName).removeClass('ui-state-active').addClass('ui-state-default')
                    .find('span').removeClass('ui-icon-check').addClass('ui-icon-empty');
            }

            sky.refresh();
        }

        /**************************************************************************************************************/

        /**
         *    Show/hide layer tools depending on layer visibility
         *    Set visibility event handlers
         */
        function manageLayerVisibility($layerDiv, gwLayer, categoryId) {
            var shortName = Utils.formatId(gwLayer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            // Open tools div when the user clicks on the layer label
            var toolsDiv = $layerDiv.find('.layerTools');
            $layerDiv.children('label').click(function () {
                toolsDiv.slideToggle(updateScroll.bind(this, categoryId));
            });

            if (gwLayer.visible()) {
                toolsDiv.slideDown();
            }

            // Layer visibility management
            $layerDiv.find('#visible_' + shortName).click(function () {

                if (Utils.isPlanetLayer(gwLayer)) {
                    // Temporary use visiblity button to change mizarCore context to "planet"
                    // TODO: change button,
                    mizarCore.toggleContext(gwLayer);
                } else {
                    var isOn = !$(this).hasClass('ui-state-active');
                    gwLayer.visible(isOn);
                }
            });
        }

        /**************************************************************************************************************/

        /**
         *    Create the Html for addtionnal layer
         */
        function createHtmlForAdditionalLayer(gwLayer, categoryId) {
            var shortName = Utils.formatId(gwLayer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            var layerDiv = AdditionalLayersCore.createHTMLFromTemplate(additionalLayerTemplate, gwLayer, shortName, isMobile);

            var $layerDiv = $(layerDiv)
                .appendTo('#' + categoryId)
                .data("layer", gwLayer);

            // Add legend
            addLegend($layerDiv, gwLayer);

            // Create UI of opacity slider
            initializeSlider($layerDiv, gwLayer);

            manageLayerVisibility($layerDiv, gwLayer, categoryId);

            updateButtonsUI($layerDiv);

            if (Utils.isHEALPixFITSLayer(gwLayer) && !isMobile) {
                createDynamicImageDialog(gwLayer);
            }
        }

        /**************************************************************************************************************/

        /**
         *    Create HTML for the given layer
         */
        function addView(gwLayer) {
            var category = gwLayer.category;
            // Other as default
            if (!category) {
                category = 'Other';
            }

            // Create new category if doesn't exists
            var categoryId;
            if (!categories[category]) {
                categoryId = Utils.formatId(category);
                $('<div class="category"><h3>' + category + '</h3>\
			<div id="' + categoryId + '"></div></div>')
                    .insertBefore($('#otherLayers').parent());

                categories[category] = categoryId;

                // Refresh accordion
                $(parentElement).accordion("refresh");
                // Add scroll to the new category
                initNiceScroll(categoryId);
            }
            else {
                categoryId = categories[category];
                // If it's the first added layer, show the category
                if ($('#' + categoryId + " .addLayer").length === 0) {
                    $('#' + categoryId).closest(".category").show();
                }
            }

            // Add HTML
            createHtmlForAdditionalLayer(gwLayer, categoryId);

            gwLayer.subscribe("visibility:changed", onVisibilityChange);
        }

        /**************************************************************************************************************/

        /**
         *    Remove HTML view of the given layer
         *    Remove the category if the given layer is the last layer of category
         */
        function removeView(gwLayer) {
            var shortName = Utils.formatId(gwLayer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            var addLayerDiv = $(parentElement).find('#addLayer_' + shortName);
            if (addLayerDiv.parent().children().length === 1) {
                // Last child to remove -> remove the category
                addLayerDiv.closest('.category').remove();
            } else {
                addLayerDiv.remove();
            }

            if (gwLayer.div) {
                $('#addFitsView_' + gwLayer.div.id).dialog("destroy").remove();
                gwLayer.div = null;
            }

            gwLayer.unsubscribe("visibility:changed", onVisibilityChange);
        }

        /**************************************************************************************************************/

        /**
         *    Delete layer handler
         */
        function deleteLayer() {
            $(this).parent().parent().fadeOut(300, function () {
                $(this).remove();
            });

            var layer = $(this).closest(".addLayer").data("layer");
            LayerManager.removeLayer(layer);

            updateScroll('otherLayers');
        }

        /**************************************************************************************************************/

        /**
         *    Show layer services popup
         */
        function showLayerServices() {
            var layer = $(this).closest(".addLayer").data("layer");
            LayerServiceView.show(layer);
        }

        /**************************************************************************************************************/

        /**
         *    Export the given layer by SAMP
         */
        function exportLayer() {
            if (Samp.isConnected()) {
                var layer = $(this).closest(".addLayer").data("layer");
                var url = AdditionalLayersCore.buildVisibleTilesUrl(layer);
                Samp.sendVOTable(layer, url);
            }
            else {
                ErrorDialog.open("You must be connected to SAMP Hub");
            }
        }

        /**************************************************************************************************************/

        /**
         *    Download features on visible tiles of the given layer as VO table
         */
        function downloadAsVO() {
            var layer = $(this).closest(".addLayer").data("layer");
            var url = AdditionalLayersCore.buildVisibleTilesUrl(layer);
            url += "&media=votable";
            var posGeo = layer.globe.coordinateSystem.from3DToGeo(navigation.center3d);
            var astro = Utils.formatCoordinates(posGeo);
            $(this).parent().attr('href', url)
                .attr('download', layer.name + "_" + astro[0] + '_' + astro[1]);
        }

        /**************************************************************************************************************/

        /**
         *    Zoom to barycenter of all features contained by layer
         *    (available for GlobWeb.VectorLayers only)
         */
        function zoomTo() {
            var layer = $(this).closest(".addLayer").data("layer");
            AdditionalLayersCore.zoomTo(layer);
        }

        /**************************************************************************************************************/

        /**
         *    Toggle layer to fits rendering
         */
        function toggleFits() {
            var isFits = $(this).is(':checked');
            var layer = $(this).closest(".addLayer").data("layer");
            layer.format = isFits ? 'fits' : 'jpg';
            if (!isFits) {
                $(this).nextAll('.addFitsView').button('disable');
            }

            // TODO: make reset function ?
            // layer.setFormat( format );

            var prevId = layer.id;
            sky.removeLayer(layer);
            sky.addLayer(layer);

            // HACK : Layer id will be changed by remove/add so we need to change the html id
            $('#addLayer_' + prevId).attr('id', 'addLayer_' + layer.id);
        }

        /**************************************************************************************************************/

        /**
         *    Initialize toolbar events
         */
        function registerEvents() {
            sky.subscribe("startLoad", onLoadStart);
            sky.subscribe("endLoad", onLoadEnd);

            $(parentElement)
                .on("click", '.category .deleteLayer', deleteLayer)
                .on('click', ".category .layerServices", showLayerServices)
                .on('click', ".category .exportLayer", exportLayer)
                .on('click', '.category .downloadAsVO', downloadAsVO)
                .on("click", ".category .zoomTo", zoomTo)
                .on('click', '.category .isFits', toggleFits);
        }

        /**************************************************************************************************************/

        /**
         *    Show spinner on layer loading
         */
        function onLoadStart(layer) {
            var shortName = Utils.formatId(layer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            $('#addLayer_' + shortName).find('.spinner').stop(true, true).fadeIn('fast');
        }

        /**************************************************************************************************************/

        /**
         *    Hide spinner when layer is loaded
         */
        function onLoadEnd(layer) {
            var shortName = Utils.formatId(layer.name);
            shortName = shortName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
            $('#addLayer_' + shortName).find('.spinner').fadeOut(500);
        }

        /**************************************************************************************************************/

        return {
            /**
             *    Initialize additional layers view
             */
            init: function (options) {
                // Set some globals
                mizarCore = options.mizar;
                sky = options.mizar.scene;
                navigation = options.mizar.navigation;
                isMobile = options.configuration.isMobile;

                AdditionalLayersCore.init(mizarCore, sky, navigation);

                // Append content to parent element
                parentElement = options.configuration.element;
                $(parentElement).append(additionalLayersHTML);

                // Select default coordinate system event
                $('#defaultCoordSystem').selectmenu({
                    select: function () {
                        var newCoordSystem = $(this).children('option:selected').val();
                        options.mizar.setCoordinateSystem(newCoordSystem);
                    },
                    width: 100
                });

                registerEvents();
            },

            /**
             *    Unregister all event handlers
             */
            remove: function () {
                var self = this;
                $(parentElement).find(".addLayer").each(function () {
                    self.removeView($(this).data("layer"));
                });
                $(parentElement).find(".category").remove();

                sky.unsubscribe("startLoad", onLoadStart);
                sky.unsubscribe("endLoad", onLoadEnd);

                $(parentElement)
                    .off("click", '.category .deleteLayer', deleteLayer)
                    .off('click', ".category .layerServices", showLayerServices)
                    .off('click', ".category .exportLayer", exportLayer)
                    .off('click', '.category .downloadAsVO', downloadAsVO)
                    .off("click", ".category .zoomTo", zoomTo)
                    .off('click', '.category .isFits', toggleFits);

                // Remove all created dialogs
                var layers = LayerManager.getLayers("sky");
                for (var i = 0; i < layers.length; i++) {
                    var layer = layers[i];
                    if (layer.div) {
                        $('#addFitsViewDialog_' + layer.div.id).dialog("destroy").remove();
                    }
                }

                // Reinit categories
                categories = {
                    "Other": 'otherLayers',
                    "Coordinate systems": 'coordinateSystems'
                };

            },

            addView: addView,
            removeView: removeView,
            hideView: function (layer) {
                $('#addLayer_' + layer.id).hide();
            },
            showView: function (layer) {
                $('#addLayer_' + layer.id).show();
            }
        };

    });
