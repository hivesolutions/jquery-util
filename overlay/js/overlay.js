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

(function(jQuery) {
    jQuery.fn.overlay = function(method, options) {
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
            // adds the overlay class to the matched object
            matchedObject.addClass("overlay");
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            matchedObject.bind("toggle", function(event, timeout) {
                var element = jQuery(this);
                _toggle(element, options, timeout);
            });

            matchedObject.bind("show", function(event, timeout) {
                var element = jQuery(this);
                _show(element, options, timeout);
            });

            matchedObject.bind("hide", function(event, timeout) {
                var element = jQuery(this);
                _hide(element, options, timeout);
            });

            matchedObject.bind("resize", function() {
                var element = jQuery(this);
                _hide(element, options);
            });

            jQuery(window).resize(function(event) {
                // resizes the matched object
                _resize(matchedObject, options);
            });
        };

        var _toggle = function(matchedObject, options, timeout) {
            // in case the matched object is not visible
            if (matchedObject.is(":visible")) {
                // hides the overlay
                _hide(matchedObject, options, timeout);
            } else {
                // shows the overlay
                _show(matchedObject, options, timeout);
            }
        };

        var _show = function(matchedObject, options, timeout) {
            // shows the matched object and then runs
            // the show operation for the overlay element
            _resize(matchedObject, options);
            matchedObject.fadeIn(timeout || 250);
        };

        var _hide = function(matchedObject, options, timeout) {
            // hides the matched object, using the default
            // strategy for such operation (as expected)
            matchedObject.fadeOut(timeout || 100);
        };

        var _resize = function(matchedObject, options) {
            // retrieves the document
            var _document = jQuery(document);

            // resets the size of the matched object
            // to avoid problems in the document size
            matchedObject.width(0);
            matchedObject.height(0);

            // retrieves the document dimensions
            var documentWidth = _document.width();
            var documentHeight = _document.height();

            // sets the matched object dimensions
            matchedObject.width(documentWidth);
            matchedObject.height(documentHeight);
        };

        // switches over the method
        switch (method) {
            case "toggle":
                _toggle(matchedObject, options);
                break;

            case "show":
                _show(matchedObject, options);
                break;

            case "hide":
                _hide(matchedObject, options);
                break;

            case "default":
                // initializes the plugin
                initialize();
                break;
        }

        // returns the object
        return this;
    };
})(jQuery);
