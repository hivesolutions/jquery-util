// Hive Colony Framework
// Copyright (c) 2008-2015 Hive Solutions Lda.
//
// This file is part of Hive Colony Framework.
//
// Hive Colony Framework is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Hive Colony Framework is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Hive Colony Framework. If not, see <http://www.gnu.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2015 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3
// __credits__   = Ariel Flesler <aflesler@gmail.com>

(function(jQuery) {
    jQuery.fn.selection = function(method, options) {
        // the default values for the menu
        var defaults = {};

        // sets the default method value
        var method = method ? method : "default";

        // sets the default options value
        var options = options ? options : {};

        // constructs the options
        var options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        /**
         * Initializer of the plugin, runs the necessary functions to initialize
         * the structures.
         */
        var initialize = function() {
            _appendHtml();
            _registerHandlers();
        };

        /**
         * Creates the necessary html for the component.
         */
        var _appendHtml = function() {
            // iterates over each of the matched objects
            matchedObject.each(function() {
                        // retrieves the element
                        var element = jQuery(this);

                        // retrieves the selection value
                        var selection = element.attr("selection");

                        // creates the selection id
                        var selectionId = "#" + selection;

                        // retrieves the selection item
                        var selectionItem = jQuery(selectionId, matchedObject);

                        // shows the selection item
                        _show(selectionItem, options);
                    });
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
        };

        var _toggle = function(matchedObject, options) {
            // in case the matched object is active
            if (matchedObject.is(".active")) {
                // hides the overlay
                _hide(matchedObject, options);
            } else {
                // shows the overlay
                _show(matchedObject, options);
            }
        };

        var _show = function(matchedObject, options) {
            // triggers the show event
            matchedObject.trigger("show");

            // adds the active class to the matched object
            matchedObject.addClass("active");
        };

        var _hide = function(matchedObject, options) {
            // triggers the hide event
            matchedObject.trigger("hide");

            // removes the active class from the matched object
            matchedObject.removeClass("active");
        };

        var _hideAll = function(matchedObject, options) {
            // retrieves the matched object children
            var matchedObjectChildren = matchedObject.children();

            // removes the active class from all the
            // matched object children
            matchedObjectChildren.removeClass("active");
        };

        // switches over the method
        switch (method) {
            case "toggle" :
                _toggle(matchedObject, options);
                break;

            case "show" :
                _show(matchedObject, options);
                break;

            case "hide" :
                _hide(matchedObject, options);
                break;

            case "hideAll" :
                _hideAll(matchedObject, options);
                break;

            case "default" :
                // initializes the plugin
                initialize();
                break;
        }

        // initializes the plugin
        initialize();

        // returns the object
        return this;
    };
})(jQuery);
