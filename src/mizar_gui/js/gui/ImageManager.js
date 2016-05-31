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
 * Image manager
 */
define(["jquery", "gui_core/ImageManagerCore", "./ImageProcessing"],
    function ($, ImageManagerCore, ImageProcessing) {

        var sky = null;

        /**********************************************************************************************/

        /**
         *    Handle fits data on the given feature
         */
        function handleFits(fitsData, featureData) {

            var image = ImageManagerCore.handleFits(fitsData, featureData);

            // Set image on image processing popup
            ImageProcessing.setImage(image);
        }

        /**********************************************************************************************/

        /**
         *    Parse fits file
         *
         *    @param response XHR response containing fits
         *
         *    @return Parsed data
         */
        function parseFits(response) {
            ImageManagerCore.parseFits
        };

        /**********************************************************************************************/

        return {

            /**
             *    Initialize
             */
            init: function (mizar, configuration) {
                sky = mizar.sky;

                ImageManagerCore.init(mizar, configuration);

                // Enable float texture extension to have higher luminance range
                var ext = sky.renderContext.gl.getExtension("OES_texture_float");
            },

            /**********************************************************************************************/

            /**
             *    Hide image
             */
            hideImage: ImageManagerCore.hideImage,

            /**********************************************************************************************/

            /**
             *    Show image
             */
            showImage: ImageManagerCore.showImage,

            /**********************************************************************************************/

            /**
             *    Remove image from renderer
             */
            removeImage: ImageManagerCore.removeImage,

            /**********************************************************************************************/

            /**
             *    Start download of texture
             */
            addImage: ImageManagerCore.addImage,

            computeFits: ImageManagerCore.computeFits,
            handleFits: handleFits
        };

        /**********************************************************************************************/

    });
