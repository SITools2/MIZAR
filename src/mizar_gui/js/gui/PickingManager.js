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
 * PickingManager module
 */
define(["jquery", "underscore-min", "gui_core/PickingManagerCore", "./FeaturePopup", "./ImageManager", "./CutOutViewFactory", "Utils"],
    function ($, _, PickingManagerCore, FeaturePopup, ImageManager, CutOutViewFactory, Utils) {

        var mizarCore;
        var context;
        var sky; // TODO: refactor it to use always the context
        var self;
        var pickingManagerCore;

        var selection = [];

        var mouseXStart;
        var mouseYStart;
        var timeStart;

        var isMobile;

        /**************************************************************************************************************/

        /**
         *    Event handler for mouse down
         */
        function _handleMouseDown(event) {
            if (isMobile && event.type.search("touch") >= 0) {
                event.layerX = event.changedTouches[0].clientX;
                event.layerY = event.changedTouches[0].clientY;
            }

            timeStart = new Date();
            mouseXStart = event.layerX;
            mouseYStart = event.layerY;
            pickingManagerCore.clearSelection();
        }

        /**************************************************************************************************************/

        /**
         * Event handler for mouse up
         */
        function _handleMouseUp(event) {
            var timeEnd = new Date();
            var epsilon = 5;
            var diff = timeEnd - timeStart;

            if (isMobile && event.type.search("touch") >= 0) {
                event.layerX = event.changedTouches[0].clientX;
                event.layerY = event.changedTouches[0].clientY;
            }

            var globe = mizarCore.activatedContext.globe;
            // If not pan and not reverse name resolver call
            if (diff < 500 && Math.abs(mouseXStart - event.layerX) < epsilon && Math.abs(mouseYStart - event.layerY) < epsilon) {
                var pickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);

                // Remove selected style for previous selection
                pickingManagerCore.clearSelection();

                var newSelection = pickingManagerCore.computePickSelection(pickPoint);

                if (!_.isEmpty(newSelection) && newSelection.length > 0) {
                    var navigation = context.navigation;
                    // Hide previous popup if any
                    FeaturePopup.hide(function () {
                        // View on center
                        if (navigation.inertia) {
                            navigation.inertia.stop();
                        }

                        var showPopup = function () {
                            var select = pickingManagerCore.setSelection(newSelection);

                            // Add selected style for new selection
                            pickingManagerCore.focusSelection(select);
                            FeaturePopup.createFeatureList(select);
                            if (select.length > 1) {
                                // Create dialogue for the first selection call
                                FeaturePopup.createHelp();
                                pickingManagerCore.stackSelectionIndex = -1;
                            }
                            else {
                                // only one layer, no pile needed, create feature dialogue
                                pickingManagerCore.focusFeatureByIndex(0, {isExclusive: true});
                                $('#featureList div:eq(0)').addClass('selected');
                                FeaturePopup.showFeatureInformation(select[pickingManagerCore.stackSelectionIndex].layer, select[pickingManagerCore.stackSelectionIndex].feature)
                            }
                            var offset = $(globe.renderContext.canvas).offset();
                            FeaturePopup.show(offset.left + globe.renderContext.canvas.width / 2, offset.top + globe.renderContext.canvas.height / 2);
                        };

                        // TODO: harmonize astro&globe navigations
                        if (navigation.moveTo) {
                            // Astro
                            navigation.moveTo(pickPoint, 800, showPopup);
                        }
                        else {
                            var currentDistance = navigation.distance / navigation.globe.coordinateSystem.heightScale;
                            var distance = (currentDistance < 1800000) ? currentDistance : 1800000;
                            navigation.zoomTo(pickPoint, distance, 3000, null, showPopup);
                        }
                    });
                } else {
                    FeaturePopup.hide();
                }
                globe.refresh();
            }
        }

        /**************************************************************************************************************/

        /**
         *    Activate picking
         */
        function activate() {
            context.globe.renderContext.canvas.addEventListener("mousedown", _handleMouseDown);
            context.globe.renderContext.canvas.addEventListener("mouseup", _handleMouseUp);

            if (isMobile) {
                context.globe.renderContext.canvas.addEventListener("touchstart", _handleMouseDown);
                context.globe.renderContext.canvas.addEventListener("touchend", _handleMouseUp);
            }

            // Hide popup and blur selection when pan/zoom or animation
            context.navigation.subscribe("modified", function () {
                pickingManagerCore.clearSelection();
                FeaturePopup.hide();
            });
        }

        /**************************************************************************************************************/

        /**
         *    Deactivate picking
         */
        function deactivate() {
            context.globe.renderContext.canvas.removeEventListener("mousedown", _handleMouseDown);
            context.globe.renderContext.canvas.removeEventListener("mouseup", _handleMouseUp);

            if (isMobile) {
                context.globe.renderContext.canvas.removeEventListener("touchstart", _handleMouseDown);
                context.globe.renderContext.canvas.removeEventListener("touchend", _handleMouseUp);
            }

            // Hide popup and blur selection when pan/zoom or animation
            context.navigation.unsubscribe("modified", function () {
                pickingManagerCore.clearSelection();
                FeaturePopup.hide();
            });
        }

        /**************************************************************************************************************/

        return {
            /**
             *    Init picking manager
             */
            init: function (m, configuration) {
                mizarCore = m;
                // Store the sky in the global module variable
                sky = mizarCore.scene;
                self = this;
                isMobile = configuration.isMobile;
                pickingManagerCore = mizarCore.getLayerManager().getPickingManagerCore();

                this.updateContext();
                activate();

                mizarCore.subscribe("mizarMode:toggle", this.updateContext);

                // Initialize the fits manager
                ImageManager.init(mizarCore, configuration);

                if (configuration.cutOut) {
                    // CutOutView factory ... TODO : move it/refactor it/do something with it...
                    CutOutViewFactory.init(sky, context.navigation, this);
                }
                FeaturePopup.init(mizarCore, this, ImageManager, sky, configuration);
            },

            /**************************************************************************************************************/

            /**
             *    Update picking context
             */
            updateContext: function () {
                if (context)
                    deactivate();
                context = mizarCore.activatedContext;
                activate();
            },

            /**************************************************************************************************************/

            /**
             *    Add pickable layer
             */
            addPickableLayer: function (layer) {
                pickingManagerCore.addPickableLayer(layer);
            },

            /**************************************************************************************************************/

            /**
             *    Remove pickable layers
             */
            removePickableLayer: function (layer) {
                pickingManagerCore.removePickableLayer(layer);
            },

            /**************************************************************************************************************/

            /**
             *    Apply selected style to the given feature
             */
            focusFeature: function (selectedData, options) {
                pickingManagerCore.getSelection().push(selectedData);
                this.focusFeatureByIndex(pickingManagerCore.getSelection().length - 1, options);
            },

            /**************************************************************************************************************/

            getSelectedData: function () {
                return pickingManagerCore.getSelection()[pickingManagerCore.stackSelectionIndex];
            },

            /**************************************************************************************************************/

            getSelection: function () {
                return pickingManagerCore.getSelection();
            },

            /**************************************************************************************************************/

            blurSelectedFeature: function () {
                pickingManagerCore.blurSelectedFeature();
            },

            /**************************************************************************************************************/

            focusFeatureByIndex: function (index, options) {
                pickingManagerCore.focusFeatureByIndex(index, options);
            },

            /**************************************************************************************************************/

            computePickSelection: function (pickPoint) {
                pickingManagerCore.computePickSelection(pickPoint);
            },

            /**************************************************************************************************************/

            blurSelection: function () {
                pickingManagerCore.blurSelection();
            },

            /**************************************************************************************************************/

            activate: activate,
            deactivate: deactivate
        };

    });
