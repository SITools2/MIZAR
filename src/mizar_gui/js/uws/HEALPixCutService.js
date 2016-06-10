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
 * Moc display & Moc xMatch services
 */
define(["jquery", "uws_core/UWSManager", "service_gui2/Samp", "gui_core/dialog/ErrorDialog", "Utils", "underscore-min", "text!templates/healpixCutService.html", "text!templates/cutResultItem.html", "jquery.ui"],
    function ($, UWSManager, Samp, ErrorDialog, Utils, _, healpixCutServiceHTMLTemplate, healpixCutServiceItemHTMLTemplate) {

        var globe;
        var navigation;
        var results = [];

// Template generating the healpixCut service content
        var healpixCutServiceTemplate = _.template(healpixCutServiceHTMLTemplate);

// Template generating the result of healpix cut
        var healpixCutServiceItemTemplate = _.template(healpixCutServiceItemHTMLTemplate);

        return {
            init: function (gl, nav) {
                globe = gl;
                navigation = nav;
            },

            addService: function (tabs, context) {
                // Append headers
                $('<li style="display: none;"><a href="#HEALPixCut">HEALPixCut</a></li>')
                    .appendTo(tabs.children(".ui-tabs-nav"))
                    .fadeIn(300);

                // Append content
                var healpixCutServiceContent = healpixCutServiceTemplate({
                    itemTemplate: healpixCutServiceItemTemplate,
                    results: results
                });
                tabs.append(healpixCutServiceContent)
                    .find('li').fadeIn();


                tabs.find('input').on('focus', function () {
                    $(this).removeClass('inputError');
                });

                $('#HEALPixCut').on('click', '.sampExport', function (event) {
                    if (Samp.isConnected()) {
                        Samp.sendImage($(this).data('url'));
                    }
                    else {
                        ErrorDialog.open('You must be connected to SAMP Hub');
                    }
                });

                $('#HEALPixCut').on('click', '.deleteResult', function (event) {
                    var $job = $(this).parent();
                    var jobId = $job.data('jobid');
                    UWSManager.delete('healpixcut', jobId, {
                        successCallback: function () {
                            $job.fadeOut(function () {
                                $(this).remove();
                            });
                        },
                        failCallback: function (thrownError) {
                            console.error(thrownError);
                            // Fade out anyway
                            $job.fadeOut(function () {
                                $(this).remove();
                            });
                        }
                    });
                });

                $('#HEALPixCutBtn').button().click(function (event) {

                    var astro = Utils.getAstroCoordinatesFromCursorLocation(globe, navigation);

                    var parameters = Utils.getHEALPixCutCoordinates(event, globe, navigation);

                    $('#HEALPixCut').find('.status').html('Healpix cut is in progress, be patient, it may take some time.').fadeIn().css('display: inline-block');

                    UWSManager.post('healpixcut', parameters, {
                        successCallback: function (response, jobId) {
                            var name = 'Viewport ( ' + astro[0] + ' x ' + astro[1] + ' )';
                            var result = {
                                name: name,
                                url: response.results.result[0]['@xlink:href'],
                                downloadName: name.replace('"', '&quot;') + '.fits',
                                jobId: jobId
                            };
                            results.push(result);

                            $('#HEALPixCut').find('.status').hide();
                            var healpixCutItem = healpixCutServiceItemTemplate({result: result});
                            $(healpixCutItem)
                                .appendTo($('#HEALPixCut').find('.HEALPixCutResults ul')).fadeIn();
                        },
                        failCallback: function (message) {
                            $('#HEALPixCut').find('.status').hide();
                            ErrorDialog.open(message);
                        },
                        onloadCallback: function () {
                            $('#HEALPixCut').find('.status').animate({opacity: 0.}, 400, function () {
                                $(this).animate({opacity: 1.}, 400);
                            });
                        }
                    });

                });
            },

            removeService: function (tabs) {
                tabs.find('.ui-tabs-nav li[aria-controls="HEALPixCut"]').css("opacity", 0.);
                var index = $(this).index();
                tabs.tabs("remove", index);
            }
        };

    });
