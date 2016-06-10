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

define(["jquery", "underscore-min", "./PickingManager", "gui_core/SelectionToolCore", "./PickingManager", "./LayerServiceView", "../Utils", "gw/Tiling/HEALPixBase"],
    function ($, _, PickingManager, SelectionToolCore, PickingManager, LayerServiceView, Utils, HealpixBase) {


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

        var layerServiceOption = _.template('<div class="addLayer_<%=layerName%>" style="padding:2px;" name="<%=layerName%>">' +
            '<button class="layerServices ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only">' +
            '<span class="ui-button-icon-primary ui-icon ui-icon-wrench"></span>' +
            '<span class="ui-button-text">Available services</span>' +
            '</button>' +
            ' <label title="<%=layerDescription%>" ><%=layer.name%></label></div>');

        var self, navigation, globe, selectionTool, layers, availableLayers;

        var SearchTool = function (options) {
            // Required options
            globe = options.globe;
            navigation = options.navigation;
            layers = options.layers;

            self = this;

            this.activated = false;
            this.renderContext = globe.renderContext;
            this.coordinateSystem = globe.coordinateSystem;

            $('#searchInvoker').on('click', function () {
                self.toggle();
            }).hover(function () {
                $(this).animate({left: '-10px'}, 100);
            }, function () {
                $(this).animate({left: '-20px'}, 100);
            });

            availableLayers = self.filterServicesAvailableOnLayers();
        };


        /**
         *    Activate/desactivate the tool
         */
        SearchTool.prototype.toggle = function () {
            this.activated = !this.activated;

            if (this.activated)
                this.activate();
            else
                this.deactivate();

            $('#searchInvoker').toggleClass('selected');
        };

        /**************************************************************************************************************/

        SearchTool.prototype.activate = function () {
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


            $('#rightTopPopup').append('<p style="margin:0px;">Draw a searching area on the map</p>');
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

            selectionTool = new SelectionToolCore({
                globe: globe,
                navigation: navigation,
                activated: true,
                onselect: function (coordinates) {
                    $('.cutOutService').slideDown();
                    self.displayAvailableServices();

                    self.coordinates = coordinates;

                    // Activate picking events
                    $(self.renderContext.canvas).css('cursor', 'default');
                    $('#GlobWebCanvas').css('cursor', 'default');
                    PickingManager.activate();
                    navigation.start();

                    //selectionTool.toggle();
                }
            });
        };

        /**************************************************************************************************************/

        SearchTool.prototype.deactivate = function () {
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
            selectionTool.toggle();

        };

        /**************************************************************************************************************/

        /**
         *    Keep only layers having available searching services
         */
        SearchTool.prototype.filterServicesAvailableOnLayers = function () {
            var availablelayers = [];
            _.each(layers, function (layer) {
                if (!_.isEmpty(layer.availableServices)) {
                    availablelayers.push(layer);
                }
            });
            return availablelayers;
        };

        /**************************************************************************************************************/

        /**
         *    Display available services from layers in the middle top popup
         */
        SearchTool.prototype.displayAvailableServices = function () {

            $('#rightTopPopup').empty();
            $('#rightTopPopup').append('<p>Select a service from available layers : </p>');

            _.each(availableLayers, function (layer) {
                var layerHtml = layerServiceOption({
                    layerName : layer.name.replace(' ', ''),
                    layerDescription : layer.description,
                    layer : layer
                });
                $('#rightTopPopup').append(layerHtml);

                $('.addLayer_' + layer.name.replace(' ', '')).data("layer", layer);

                $('.addLayer_' + layer.name.replace(' ', ''))
                    .on('click', ".layerServices", self.showLayerServices);
            });
        };

        /**************************************************************************************************************/

        SearchTool.prototype.showLayerServices = function () {
            var layer = $(this.parentElement).data("layer");

            var selectedTile = mizar.navigation.globe.tileManager.getVisibleTile(self.coordinates[0][0], self.coordinates[0][1]);

            if (selectedTile != undefined) {
                var order = selectedTile.order;
            }

            var healpixRanges = HealpixBase.convertPolygonToHealpixOrder(self.coordinates, 4, order);

            layer.serviceParameters  = {
                "healpix" : healpixRanges,
                "order" : ""
            };

            LayerServiceView.show(layer);

            //self.toggle();
        }

        return SearchTool;

    });
