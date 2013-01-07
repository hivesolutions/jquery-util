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
    jQuery.fn.message = function(options) {
        // creates the default callback function to be used when
        // no callback is provided, this is an empty callback
        var callback = function() {
        };

        // defaults the various callback methods so that they may
        // be called safely without any runtime error in case their
        // not defined
        options.complete = options.complete || callback;
        options.success = options.success || callback;
        options.error = options.error || callback;

        // runs the remote call to the server side to provide
        // the correct abstraction for the message process
        jQuery.ajax({
                    type : options.type || "get",
                    url : options.url,
                    data : options.data || {},
                    complete : function(request, textStatus) {
                        options.complete();
                    },
                    success : function(data) {
                        try {
                            // in case no valid data is received notifies the client
                            // about the error and returns the control immediately
                            if (!data) {
                                throw "Empty message received";
                            }

                            try {
                                // tries to parse the received data as json information
                                // in case it fails raises a message indicating that the
                                // unpacking operation did not succeed
                                var jsonData = jQuery.parseJSON(data);
                            } catch (exception) {
                                throw "No valid json data received";
                            }

                            // retrieves the result string value from the json data
                            // and notifies the success handler in case the result
                            // was success
                            var result = jsonData["result"];
                            if (result == "success") {
                                options.success(jsonData);
                            }
                            // in case the result value from the message is not succes
                            // notifies the rror handler of the received data
                            else {
                                options.error(jsonData);
                            }
                        } catch (message) {
                            options.error({
                                        result : "error",
                                        message : message
                                    });
                            return;
                        }
                    },
                    error : function(request, textStatus, errorThrown) {
                        try {
                            var jsonData = textStatus
                                    ? jQuery.parseJSON(textStatus)
                                    : {};
                        } catch (exception) {
                            var jsonData = {};
                        }
                        options.error(jsonData);
                    }
                });
    };
})(jQuery);

(function(jQuery) {
    jQuery.fn.communication = function(method, options) {
        // the connected status string to be used for
        // refrence in a series of operations
        var CONNECTED_STATUS = "connected";

        // the disconnected status string to be used for
        // refrence in a series of operations
        var DISCONNECTED_STATUS = "disconnected";

        // the error status string to be used for
        // refrence in a series of operations
        var ERROR_STATUS = "error";

        // the default values for the communication
        // extension to be used
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
            // retrieves the various options that were provided
            // to configure the current matched object
            var url = options["url"];
            var channels = options["channels"];
            var timeout = options["timeout"];
            var pollTimeout = options["pollTimeout"];
            var callbacks = options["callbacks"];

            // updates the matched object with the options that
            // were provided in the initializer
            matchedObject.data("status", DISCONNECTED_STATUS);
            matchedObject.data("url", url);
            matchedObject.data("channels", channels);
            matchedObject.data("timeout", timeout);
            matchedObject.data("poll_timeout", pollTimeout);
            matchedObject.data("callbacks", callbacks);

            // starts the connect command, this should be ran
            // at the end of the handlers registration
            _connect(matchedObject, options);
        };

        var _connect = function(matchedObject, options) {
            // retrieves the url data and the sequence containing
            // the various channels for which the connection is
            // going to be registered
            var url = matchedObject.data("url");
            var channels = matchedObject.data("channels");

            // creates the channels string by joining the various
            // channel names using the comma separator
            var channelsS = channels.join(",")

            // runs the remote call to the server side to provide
            // the connect operation expected behavior
            matchedObject.message({
                        type : "post",
                        url : url,
                        data : {
                            command : "connect",
                            channels : channelsS
                        },
                        success : function(data) {
                            // retrieves the connection id and updates the matched
                            // object data with the id (for latter usage)
                            var connectionId = data["id"];
                            matchedObject.data("id", connectionId);

                            // calls the initial update request and updates
                            // the status of the current connection to connected
                            _update(matchedObject, options);
                            __status(matchedObject, CONNECTED_STATUS);
                        },
                        error : function(data) {
                            // retrieves the timeout data
                            var timeout = matchedObject.data("timeout");

                            // sets the timeout for connection, and
                            // retrieves the timeout handler
                            var timeoutHandler = setTimeout(function() {
                                        _connect(matchedObject, options);
                                    }, timeout);

                            // sets the timeout handler in the current matached
                            // object and updates the current status value
                            matchedObject.data("timeout_handler",
                                    timeoutHandler);
                            __status(matchedObject, DISCONNECTED_STATUS);
                        }
                    });
        };

        var _disconnect = function(matchedObject, options) {
            // retrieves the url data and the current connection
            // identifier to be used in the remote call
            var url = matchedObject.data("url");
            var connectionId = matchedObject.data("id");

            // runs the remote call to the server side to provide
            // the disconnect operation
            matchedObject.message({
                        type : "post",
                        url : url,
                        data : {
                            id : connectionId,
                            command : "disconnect"
                        },
                        success : function(data) {
                            // updates the current connection status to disconnected
                            // because the operation did complete with success
                            __status(matchedObject, DISCONNECTED_STATUS);
                        },
                        error : function(data) {
                            // there must have been a serious low level error in the
                            // current connection so the error status is set in it
                            __status(matchedObject, ERROR_STATUS);
                        }
                    });
        };

        var _data = function(matchedObject, options) {
            // retrieves the data to be send to the other
            // side of the communication (server side)
            var data = options["data"];

            // retrieves the url data and the current connection
            // identifier to be used in the remote call
            var url = matchedObject.data("url");
            var connectionId = matchedObject.data("id");

            // runs the remote call to the server side to provide
            // the disconnect operation
            matchedObject.message({
                        type : "post",
                        url : url,
                        data : {
                            id : connectionId,
                            command : "data",
                            data : data
                        },
                        complete : function() {
                            options.complete && options.complete();
                        },
                        success : function(data) {
                            options.success && options.complete(data);
                        },
                        error : function(data) {
                            options.error && options.error(data);
                        }
                    });
        };

        var _channel = function(matchedObject, options) {
            // retrieves the channel (name) that is going to be used
            // in the channel registration command
            var channel = options["channel"];

            // retrieves the url data and the current connection
            // identifier to be used in the remote call
            var url = matchedObject.data("url");
            var connectionId = matchedObject.data("id");

            // runs the remote call to the server side to provide
            // the disconnect operation
            matchedObject.message({
                        type : "post",
                        url : url,
                        data : {
                            id : connectionId,
                            command : "channel",
                            channel : channel
                        },
                        complete : function() {
                            options.complete && options.complete(channel);
                        },
                        success : function(data) {
                            options.success && options.success(channel);
                        },
                        error : function(data) {
                            options.error && options.error(channel);
                        }
                    });
        };

        var _update = function(matchedObject, options) {
            // retrieves the url data and the current connection
            // identifier to be used in the remote call
            var url = matchedObject.data("url");
            var connectionId = matchedObject.data("id");

            // runs the remote call to the server side to provide
            // the update operation expected behavior
            matchedObject.message({
                type : "post",
                url : url,
                data : {
                    id : connectionId,
                    command : "update"
                },
                complete : function() {
                    // retrieves a series of configuration options from
                    // the matched object to be used in the handling
                    var status = matchedObject.data("status");
                    var timeout = matchedObject.data("timeout");

                    // retrieves the proper schedule method to be executed
                    // according to the current status, in case the connection
                    // is currently disconnected tries to connect it again
                    // otherwise runs the "normal" update command to obtain new
                    // data fro the service source
                    var method = status == DISCONNECTED_STATUS
                            ? _connect
                            : _update;

                    // sets the timeout for connection, and
                    // retrieves the timeout handler
                    var timeoutHandler = setTimeout(function() {
                                method(matchedObject, options);
                            }, timeout);

                    // sets the timeout handler in the matched object
                    // so that it may be retrieved (and used) latter
                    matchedObject.data("timeout_handler", timeoutHandler);
                },
                success : function(data) {
                    // retrieves the result message
                    var _data = data["data"];
                    var dataElement = jQuery(_data);

                    // iterates over each of the data elements received
                    // and for each of them calls the appropriate callbacks
                    dataElement.each(function(index, element) {
                                __callCallbacks(matchedObject, options, element);
                            });

                    // updates the current status to connected, an update
                    // was successfull so the connection is consired
                    // to be online
                    __status(matchedObject, CONNECTED_STATUS);
                },
                error : function(data) {
                    // updates the current connection status to disconnected
                    // as there was an error in the update operation
                    __status(matchedObject, DISCONNECTED_STATUS);
                }
            });
        };

        var __callCallbacks = function(matchedObject, options, data) {
            // retrieves the various callbacks registered for data
            // handling in the current matched object
            var callbacks = matchedObject.data("callbacks");

            // sets the default data callback functions, defaulting
            // to an empty list in case their not provided
            callbacks = callbacks ? callbacks : [];

            // iterates over all the data callback functions and calls
            // each of them with the received data
            jQuery(callbacks).each(function(index, element) {
                        // calls the callback function
                        element(data);
                    });
        };

        var __status = function(matchedObject, status, parameters) {
            // retrieves the status data
            var currentStatus = matchedObject.data("status");

            // in case the "new" status is the same
            // as the current status
            if (currentStatus == status) {
                // returns immediately
                return;
            }

            // switches over the status of the connection to handle
            // the change correctly
            switch (status) {
                case CONNECTED_STATUS :
                    // triggers the stream connected event to notify
                    // the client about the new connection
                    matchedObject.triggerHandler("stream_connected", parameters);

                    // breaks the switch
                    break;
                case DISCONNECTED_STATUS :
                    // triggers the stream disconnected event to notify
                    // the client about the closing of the connection
                    matchedObject.triggerHandler("stream_disconnected",
                            parameters);

                    // breaks the switch
                    break;
                case ERROR_STATUS :
                    // triggers the stream error event to notify
                    // the client about error in the connection infra-structure
                    matchedObject.triggerHandler("stream_error", parameters);

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

            case "channel" :
                _channel(matchedObject, options);
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
