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

define(["jquery", "underscore-min", "gui_core/ExportToolCore", "./PickingManager", "gui_core/SelectionToolCore", "loadmask"],
    function ($, _, ExportToolCore, PickingManager, SelectionToolCore) {


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

            ExportToolCore.init(options);

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

        /**************************************************************************************************************/

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

            selectionTool = new SelectionToolCore({
                globe: globe,
                navigation: navigation,
                activated: true,
                onselect: function (coordinates) {
                    $('.cutOutService').slideDown();
                    availableLayers = ExportToolCore.filterServicesAvailableOnLayers();
                    self.displayAvailableServices();

                    self.coordinates = coordinates;

                    // Activate picking events
                    $(self.renderContext.canvas).css('cursor', 'default');
                    $('#GlobWebCanvas').css('cursor', 'default');
                    $('#exportToolBtn').on('click', self.coordinates, ExportToolCore.exportSelection);

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
        };

        /**************************************************************************************************************/

        return ExportTool;

    });
