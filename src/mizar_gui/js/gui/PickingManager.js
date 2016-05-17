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
define(["jquery", "underscore-min", "gui_core/PickingManagerLite", "./FeaturePopup", "./ImageManager", "./CutOutViewFactory", "Utils"],
    function ($, _, PickingManagerLite, FeaturePopup, ImageManager, CutOutViewFactory, Utils) {

        var mizar;
        var context;
        var sky; // TODO: refactor it to use always the context
        var self;
        var pickingManagerLite;

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
            pickingManagerLite.clearSelection();
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

            var globe = mizar.activatedContext.globe;
            // If not pan and not reverse name resolver call
            if (diff < 500 && Math.abs(mouseXStart - event.layerX) < epsilon && Math.abs(mouseYStart - event.layerY) < epsilon) {
                var pickPoint = globe.getLonLatFromPixel(event.layerX, event.layerY);

                // Remove selected style for previous selection
                pickingManagerLite.clearSelection();

                var newSelection = pickingManagerLite.computePickSelection(pickPoint);

                if (!_.isEmpty(newSelection) && newSelection.length > 0) {
                    var navigation = context.navigation;
                    // Hide previous popup if any
                    FeaturePopup.hide(function () {
                        // View on center
                        if (navigation.inertia) {
                            navigation.inertia.stop();
                        }

                        var showPopup = function () {
                            var select = pickingManagerLite.setSelection(newSelection);

                            // Add selected style for new selection
                            pickingManagerLite.focusSelection(select);
                            FeaturePopup.createFeatureList(select);
                            if (select.length > 1) {
                                // Create dialogue for the first selection call
                                FeaturePopup.createHelp();
                                pickingManagerLite.stackSelectionIndex = -1;
                            }
                            else {
                                // only one layer, no pile needed, create feature dialogue
                                pickingManagerLite.focusFeatureByIndex(0, {isExclusive: true});
                                $('#featureList div:eq(0)').addClass('selected');
                                FeaturePopup.showFeatureInformation(select[pickingManagerLite.stackSelectionIndex].layer, select[pickingManagerLite.stackSelectionIndex].feature)
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
                pickingManagerLite.clearSelection();
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
                pickingManagerLite.clearSelection();
                FeaturePopup.hide();
            });
        }

        /**************************************************************************************************************/

        return {
            /**
             *    Init picking manager
             */
            init: function (m, configuration) {
                mizar = m;
                // Store the sky in the global module variable
                sky = mizar.sky;
                self = this;
                isMobile = configuration.isMobile;
                pickingManagerLite = mizar.getLayerManager().getPickingManagerLite();

                this.updateContext();
                activate();

                mizar.subscribe("mizarMode:toggle", this.updateContext);

                // Initialize the fits manager
                ImageManager.init(mizar, this, configuration);

                if (configuration.cutOut) {
                    // CutOutView factory ... TODO : move it/refactor it/do something with it...
                    CutOutViewFactory.init(sky, context.navigation, this);
                }
                FeaturePopup.init(mizar, this, ImageManager, sky, configuration);
            },

            /**************************************************************************************************************/

            /**
             *    Update picking context
             */
            updateContext: function () {
                if (context)
                    deactivate();
                context = mizar.activatedContext;
                activate();
            },

            /**************************************************************************************************************/

            /**
             *    Add pickable layer
             */
            addPickableLayer: function (layer) {
                pickingManagerLite.addPickableLayer(layer);
            },

            /**************************************************************************************************************/

            /**
             *    Remove pickable layers
             */
            removePickableLayer: function (layer) {
                pickingManagerLite.removePickableLayer(layer);
            },

            /**************************************************************************************************************/

            /**
             *    Apply selected style to the given feature
             */
            focusFeature: function (selectedData, options) {
                pickingManagerLite.getSelection().push(selectedData);
                this.focusFeatureByIndex(pickingManagerLite.getSelection().length - 1, options);
            },

            /**************************************************************************************************************/

            getSelectedData: function () {
                return pickingManagerLite.getSelection()[pickingManagerLite.stackSelectionIndex];
            },

            /**************************************************************************************************************/

            getSelection: function () {
                return pickingManagerLite.getSelection();
            },

            /**************************************************************************************************************/

            blurSelectedFeature: function () {
                pickingManagerLite.blurSelectedFeature();
            },

            /**************************************************************************************************************/

            focusFeatureByIndex: function (index, options) {
                pickingManagerLite.focusFeatureByIndex(index, options);
            },

            /**************************************************************************************************************/

            computePickSelection: function (pickPoint) {
                pickingManagerLite.computePickSelection(pickPoint);
            },

            /**************************************************************************************************************/

            blurSelection: function () {
                pickingManagerLite.blurSelection();
            },

            /**************************************************************************************************************/

            activate: activate,
            deactivate: deactivate
        };

    });
