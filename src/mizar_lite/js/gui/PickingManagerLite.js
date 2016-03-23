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
define([],
    function () {

        var pickableLayers = [];
        var selection = [];

        return {

            /**
             *    Add pickable layer
             */
            addPickableLayer: function (layer) {
                if (pickableLayers.indexOf(layer) == -1) {
                    pickableLayers.push(layer);
                }
                else {
                    console.log("WARN:" + layer.name + " has been already added");
                }
            },

            /**************************************************************************************************************/

            /**
             *    Remove pickable layers
             */
            removePickableLayer: function (layer) {
                for (var i = 0; i < pickableLayers.length; i++) {
                    if (layer.id == pickableLayers[i].id)
                        pickableLayers.splice(i, 1);
                }
            },

            /**************************************************************************************************************/

            /**
             * Get the list of pickable layers
             * @returns {Array}
             */
            getPickableLayers: function () {
                return pickableLayers;
            },

            /**************************************************************************************************************/

            /**
             * Get the current selection
             * @returns {Array}
             */
            getSelection: function () {
                return selection;
            },

            /**************************************************************************************************************/

            /**
             * Set selection list with passed selection
             * @param sel
             */
            setSelection: function (sel) {
                selection = sel;
                return selection;
            }
        };
    });
