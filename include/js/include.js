// Hive Colony Framework
// Copyright (c) 2008-2016 Hive Solutions Lda.
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
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2016 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0
// __credits__   = Tobiasz Cudnik <tobiasz.cudnik@gmail.com>

// overload jquery on dom ready event
if (jQuery.browser.mozilla || jQuery.browser.opera) {
    document.removeEventListener("DOMContentLoaded", jQuery.ready, false);
    document.addEventListener("DOMContentLoaded", function() {
        jQuery.ready();
    }, false);
}

// removes the load event handler
jQuery.event.remove(window, "load", jQuery.ready);

// adds a new load event handler
jQuery.event.add(window, "load", function() {
    jQuery.ready();
});

jQuery.extend({

    /**
     * The map associating the url values with the state of loading. If the
     * state is true the url is loaded successfully.
     *
     * @type Map
     */
    includeStates: {},

    /**
     * Includes the javascript in the given url calling the callback at the end.
     * The dependency list is the list of javascript resource to be included
     * before the resource is included.
     *
     * @param {String}
     *            url The url the javascript resource to be included (loaded).
     * @param {Function}
     *            callback The callback function to be called at the end of the
     *            inclusion.
     * @param {String/List}
     *            dependency The dependency(s) to be included (loaded) before
     *            the resource.
     * @return {Function} Function to test the loading of the url.
     */
    include: function(url, callback, dependency) {
        // in case no callback is sent and dependency is defined
        if (typeof callback != "function" && !dependency) {
            // sets the dependency as the callback (second argument)
            // and invalidates the callback
            dependency = callback;
            callback = null;
        }

        // removes possible newlines in the url
        url = url.replace("\n", "");

        jQuery.includeStates[url] = false;

        // creates a new script element
        var script = document.createElement("script");
        script.type = "text/javascript";

        // sets the on load callback in the script element
        script.onload = function() {
            jQuery.includeStates[url] = true;

            // in case there is a callback defined
            if (callback) {
                // calls the callback with the element
                callback.call(script);
            }
        };

        // sets the on ready state chante callback in the script element
        script.onreadystatechange = function() {
            // in case the ready state is not valid
            if (this.readyState != "complete" && this.readyState != "loaded") {
                // returns immediately
                return;
            }

            // sets the included states for the given url as true
            // (url is loaded)
            jQuery.includeStates[url] = true;

            // in case there ias callback defined
            if (callback) {
                // calls the callback with the element
                callback.call(script);
            }
        };

        // sets the source value in the script element
        script.src = url;

        // in case there is a dependency defined
        if (dependency) {
            // in case the dependency is not defined as a list
            if (dependency.constructor != Array) {
                // creates a list of one element for the dependency
                dependency = [dependency];
            }

            setTimeout(function() {
                // sets the valid flag
                var valid = true;

                // iterates over all the dependencies
                jQuery.each(dependency, function(index, element) {
                    // in the inclusion of the dependency is not successful
                    if (!element()) {
                        // sets valid as false
                        valid = false;

                        // returns false (breaks iteration)
                        return false;
                    }
                });

                // in case the valid flag is set (all dependencies included with success)
                if (valid) {
                    // adds the script element to the head of the document
                    document.getElementsByTagName("head")[0].appendChild(script);
                } else {
                    // tries again in timeout
                    setTimeout(arguments.callee, 10);
                }
            }, 10);
        } else {
            document.getElementsByTagName("head")[0].appendChild(script);
        }

        // returns a function that returns the state of loading
        // for the url
        return function() {
            // returns the state of loading for the url
            return jQuery.includeStates[url];
        }
    },

    /**
     * The old ready function, saved for usage.
     *
     * @type Function
     */
    readyOld: jQuery.ready,

    /**
     * New jquery ready function to be called.
     */
    ready: function() {
        // in case the is ready flag is set
        if (jQuery.isReady) {
            // returns immediately
            return;
        }

        // starts the ready flag
        var ready = true;

        // iterates over all the include states to check
        // if they are all already loaded
        jQuery.each(jQuery.includeStates, function(url, state) {
            if (!state) {
                // unsests the ready flag (state is invalid) not yet ready
                ready = false;

                // returns false (breaks iteration)
                return false;
            }
        });

        // in case all the states are ready
        if (ready) {
            // calls the old ready handler
            jQuery.readyOld.apply(jQuery, arguments);
        } else {
            // sets timeout to check for ready
            setTimeout(arguments.callee, 10);
        }
    }
});
