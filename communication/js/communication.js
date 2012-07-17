// Hive Colony Framework
// Copyright (c) 2008-2012 Hive Solutions Lda.
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

// __author__    = João Magalhães <joamag@hive.pt> & Luís Martinho <lmartinho@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2012 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3

(function(jQuery) {
    jQuery.fn.communication = function(method, options) {
        // the connected status
        var CONNECTED_STATUS = "connected";

        // the disconnected status
        var DISCONNECTED_STATUS = "disconnected";

        // the error status
        var ERROR_STATUS = "error";

        // the default values for the menu
        var defaults = {
            timeout : 1000,
            pollTimeout : 50
        };

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
        };

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // retrieves the url from the options
            var url = options["url"];

            // retrieves the timeout from the options
            var timeout = options["timeout"];

            // retrieves the poll timeout from the options
            var pollTimeout = options["pollTimeout"];

            // retrieves the data callback functions from the options
            var dataCallbackFunctions = options["dataCallbackFunctions"];

            // sets the status data
            matchedObject.data("status", DISCONNECTED_STATUS);

            // sets the matched object url data
            matchedObject.data("url", url);

            // sets the matched object timeout data
            matchedObject.data("timeout", timeout);

            // sets the matched object poll timeout data
            matchedObject.data("poll_timeout", pollTimeout);

            // sets the matched object data callback functions data
            matchedObject.data("data_callback_functions", dataCallbackFunctions);

            // updates the connect
            __updateConnect(matchedObject, options);
        };

        var __update = function(matchedObject, options) {
            // retrieves the url data
            var url = matchedObject.data("url");

            // retrieves the connection data
            var connectionId = matchedObject.data("id");

            jQuery.ajax({
                        type : "post",
                        url : url,
                        data : {
                            id : connectionId,
                            command : "update"
                        },
                        complete : function(request, textStatus) {
                            __onUpdateComplete(matchedObject, options, request,
                                    textStatus);
                        },
                        success : function(data) {
                            __onUpdateSuccess(matchedObject, options, data);
                        },
                        error : function(request, textStatus, errorThrown) {
                            __onUpdateError(matchedObject, options, request,
                                    textStatus, errorThrown);
                        }
                    });
        };

        var __updateConnect = function(matchedObject, options) {
            // retrieves the url data
            var url = matchedObject.data("url");

            jQuery.ajax({
                        type : "post",
                        url : url,
                        data : {
                            command : "connect"
                        },
                        success : function(data) {
                            __onConnectSuccess(matchedObject, options, data);
                        },
                        error : function(request, textStatus, errorThrown) {
                            __onConnectError(matchedObject, options, request,
                                    textStatus, errorThrown);
                        }
                    });
        };

        var __onConnectSuccess = function(matchedObject, options, data) {
            // in case no valid data is received
            if (!data) {
                // runs the on update error (problem in connection)
                __onConnectError(matchedObject, options, data);

                // returns immediately
                return;
            }

            // parses the data generating the json data
            var jsonData = jQuery.parseJSON(data);

            // retrieves the result message
            var resultMessage = jsonData["result"];

            // in case there was success
            if (resultMessage == "success") {
                // retrieves the connection id
                var connectionId = jsonData["id"];

                // sets the connection id in the matched object
                matchedObject.data("id", connectionId);

                // calls the initial update request
                __update(matchedObject, options);
            }

            // updates the current status to connected
            __updateStatus(matchedObject, CONNECTED_STATUS, []);
        };

        var __onConnectError = function(matchedObject, options, request, textStatus, errorThrown) {
            // retrieves the timeout data
            var timeout = matchedObject.data("timeout");

            // sets the timeout for connection, and
            // retrieves the timeout handler
            var timeoutHandler = setTimeout(function() {
                        __updateConnect(matchedObject, options);
                    }, timeout);

            // sets the matched object timeout handler
            matchedObject.data("timeoutHandler", timeoutHandler);

            // updates the current status to disconnected
            __updateStatus(matchedObject, DISCONNECTED_STATUS, []);
        };

        var __onUpdateComplete = function(matchedObject, options, request, textStatus) {
            // retrieves the status data
            var status = matchedObject.data("status");

            // retrieves the timeout data
            var timeout = matchedObject.data("timeout");

            // retrieves the poll timeout data
            var poolTimeout = matchedObject.data("poll_timeout");

            // in case the status is disconnected
            // tries to re-connect
            if (status == DISCONNECTED_STATUS) {
                // sets the timeout for connection, and
                // retrieves the timeout handler
                var timeoutHandler = setTimeout(function() {
                            __updateConnect(matchedObject, options);
                        }, timeout);

                // sets the matched object timeout handler
                matchedObject.data("timeoutHandler", timeoutHandler);
            }
            // otherwise it's a normal request
            else {
                // sets the (poll) timeout for contents retrieval, and
                // retrieves the timeout handler
                var timeoutHandler = setTimeout(function() {
                            __update(matchedObject, options);
                        }, poolTimeout);

                // sets the matched object timeout handler
                matchedObject.data("timeoutHandler", timeoutHandler);
            }
        };

        var __onUpdateSuccess = function(matchedObject, options, data) {
            // in case no valid data is received
            if (!data) {
                // runs the on update error (problem in connection)
                __onUpdateError(matchedObject, options, data);

                // returns immediately
                return;
            }

            try {
                // parses the data generating the json data
                var jsonData = jQuery.parseJSON(data);
            } catch (exception) {
                // sets the default json data
                var jsonData = {};
            }

            // retrieves the result message
            var resultMessage = jsonData["result"];

            // retrieves the result message element
            var resultMessageElement = jQuery(resultMessage);

            // iterates over each of the result message elements
            // to call the call data callbacks
            resultMessageElement.each(function(index, element) {
                        // calls the data callbacks
                        __callDataCallbacks(matchedObject, options, element);
                    });

            // updates the current status to connected
            __updateStatus(matchedObject, CONNECTED_STATUS, []);
        };

        var __onUpdateError = function(matchedObject, options, request, textStatus, errorThrown) {
            try {
                // parses the text status generating the json data
                var jsonData = textStatus ? jQuery.parseJSON(textStatus) : {};
            } catch (exception) {
                // sets the default json data
                var jsonData = {};
            }

            // retrieves the result message
            var resultMessage = jsonData["result"];

            // in case the result message is available
            if (resultMessage) {
                // updates the current status to error
                __updateStatus(matchedObject, ERROR_STATUS, []);
            }
            // otherwise it's an unknown error, assumes disconnection
            else {
                // updates the current status to disconnected
                __updateStatus(matchedObject, DISCONNECTED_STATUS, []);
            }
        };

        var __callDataCallbacks = function(matchedObject, options, data) {
            // retrieves the data callback functions data
            var dataCallbackFunctions = matchedObject.data("data_callback_functions");

            // sets the default data callback functions
            dataCallbackFunctions = dataCallbackFunctions
                    ? dataCallbackFunctions
                    : [];

            // iterates over all the data callback functions
            jQuery(dataCallbackFunctions).each(function(index, element) {
                        // calls the callback function
                        element(data);
                    });
        };

        var __updateStatus = function(matchedObject, status, parameters) {
            // retrieves the status data
            var currentStatus = matchedObject.data("status");

            // in case the "new" status is the same
            // as the current status
            if (currentStatus == status) {
                // returns immediately
                return;
            }

            // switches over the status
            switch (status) {
                case CONNECTED_STATUS :
                    // triggers the communication connected event
                    matchedObject.trigger("communication_connected", parameters);

                    // breaks the switch
                    break;
                case DISCONNECTED_STATUS :
                    // triggers the communication disconnected event
                    matchedObject.trigger("communication_disconnected",
                            parameters);

                    // breaks the switch
                    break;
                case ERROR_STATUS :
                    // triggers the communication error event
                    matchedObject.trigger("communication_error", parameters);

                    // breaks the switch
                    break;
            }

            // sets the status in the data
            matchedObject.data("status", status);
        };

        // switches over the method
        switch (method) {
            case "disconnect" :
                _disconnect(matchedObject, options);
                break;

            case "data" :
                _data(matchedObject, options);
                break;

            case "default" :
                // initializes the plugin
                initialize();
                break;
        }

        // returns the object
        return this;
    };
})(jQuery);
