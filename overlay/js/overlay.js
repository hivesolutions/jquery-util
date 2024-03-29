// Hive Colony Framework
// Copyright (c) 2008-2024 Hive Solutions Lda.
//
// This file is part of Hive Colony Framework.
//
// Hive Colony Framework is free software: you can redistribute it and/or modify
// it under the terms of the Apache License as published by the Apache
// Foundation, either version 2.0 of the License, or (at your option) any
// later version.
//
// Hive Colony Framework is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// Apache License for more details.
//
// You should have received a copy of the Apache License along with
// Hive Colony Framework. If not, see <http://www.apache.org/licenses/>.

// __author__    = João Magalhães <joamag@hive.pt>
// __copyright__ = Copyright (c) 2008-2024 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0

(function(jQuery) {
    jQuery.fn.overlay = function(method, options) {
        // the default values for the menu
        var defaults = {};

        // sets the default method value
        method = method || "default";

        // sets the default options value
        options = options || {};

        // constructs the options
        options = jQuery.extend(defaults, options);

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
