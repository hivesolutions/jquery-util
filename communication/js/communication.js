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
    jQuery.fn.message = function(options) {
        // creates the "final" options map by extending the
        // provided options with the default ones
        options = jQuery.extend({
            delay: 1000
        }, options);

        // creates the default callback function to be used when
        // no callback is provided, this is an empty callback
        var callback = function() {};

        // defaults the various callback methods so that they may
        // be called safely without any runtime error in case their
        // not defined
        options.complete = options.complete || callback;
        options.success = options.success || callback;
        options.error = options.error || callback;

        // runs the remote call to the server side to provide
        // the correct abstraction for the message process
        jQuery.ajax({
            type: options.type || "get",
            url: options.url,
            data: options.data || {},
            complete: function(request, textStatus) {
                options.complete();
            },
            success: function(data) {
                try {
                    // in case no valid data is received notifies the client
                    // about the error and returns the control immediately
                    if (!data) {
                        throw Error("Empty message received");
                    }

                    try {
                        // tries to parse the received data as json information
                        // in case it fails raises a message indicating that the
                        // unpacking operation did not succeed
                        data = typeof data === "object" ? data : jQuery.parseJSON(data);
                    } catch (exception) {
                        throw Error("No valid JSON data received");
                    }

                    // retrieves the result string value from the (json) data
                    // and notifies the success handler in case the result
                    // was success
                    var result = data["result"];
                    if (result === "success") {
                        options.success(data);
                    }
                    // in case the result value from the message is not succes
                    // notifies the rror handler of the received data
                    else {
                        options.error(data);
                    }
                } catch (message) {
                    options.error({
                        result: "error",
                        message: message
                    });
                }
            },
            error: function(request, textStatus, errorThrown) {
                // sets the default data value as invalid, this is
                // going to be set latter
                var data = null;

                try {
                    // tries to parse the text status as json information
                    // in case it fails or no data is received an invalid
                    // data structure is used instead
                    data = textStatus ? jQuery.parseJSON(textStatus) : null;
                } catch (exception) {
                    data = null;
                }

                // in case a valid data is going to be used the error is
                // considered "complete" and the notification process is immediate
                if (data) {
                    options.error(data);
                }
                // otherwise creates a timeout for the notification of the error
                // handler about the error, this avoids excessive error reporting
                // (provides flood controll)
                else {
                    setTimeout(function() {
                        options.error({});
                    }, options.delay);
                }
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
            timeout: 1000,
            pollTimeout: 50
        };

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
        var _appendHtml = function() {};

        /**
         * Registers the event handlers for the created objects.
         */
        var _registerHandlers = function() {
            // in case the matched object is not defined
            // or in case it's an empty list must return
            // immediatly initialization is not meant to
            // be run (corruption may occur)
            if (!matchedObject || matchedObject.length === 0) {
                return;
            }

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

            // verifies if the current communication object is valid,
            // must be present in the current dom, in case it does not
            // returns immediately (not possible to perform request)
            // note that this validation is conditional on existence
            // of the uxf library and may create problems
            var isValid = matchedObject.uxindom ? matchedObject.uxindom() : true;
            if (!isValid) {
                return;
            }

            // creates the channels string by joining the various
            // channel names using the comma separator
            var channelsS = channels.join(",");

            // runs the remote call to the server side to provide
            // the connect operation expected behavior
            matchedObject.message({
                type: "post",
                url: url,
                data: {
                    command: "connect",
                    channels: channelsS
                },
                success: function(data) {
                    // retrieves the connection id and updates the matched
                    // object data with the id (for latter usage)
                    var connectionId = data["id"];
                    matchedObject.data("id", connectionId);

                    // calls the initial update request and updates
                    // the status of the current connection to connected
                    _update(matchedObject, options);
                    _status(matchedObject, CONNECTED_STATUS);
                },
                error: function(data) {
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
                    _status(matchedObject, DISCONNECTED_STATUS);
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
                type: "post",
                url: url,
                data: {
                    id: connectionId,
                    command: "disconnect"
                },
                success: function(data) {
                    // updates the current connection status to disconnected
                    // because the operation did complete with success
                    _status(matchedObject, DISCONNECTED_STATUS);
                },
                error: function(data) {
                    // there must have been a serious low level error in the
                    // current connection so the error status is set in it
                    _status(matchedObject, ERROR_STATUS);
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
                type: "post",
                url: url,
                data: {
                    id: connectionId,
                    command: "data",
                    data: data
                },
                complete: function() {
                    options.complete && options.complete();
                },
                success: function(data) {
                    options.success && options.complete(data);
                },
                error: function(data) {
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
                type: "post",
                url: url,
                data: {
                    id: connectionId,
                    command: "channel",
                    channel: channel
                },
                complete: function() {
                    options.complete && options.complete(channel);
                },
                success: function(data) {
                    options.success && options.success(channel);
                },
                error: function(data) {
                    options.error && options.error(channel);
                }
            });
        };

        var _update = function(matchedObject, options) {
            // retrieves the url data and the current connection
            // identifier to be used in the remote call
            var url = matchedObject.data("url");
            var connectionId = matchedObject.data("id");

            // verifies if the current communication object is valid,
            // must be present in the current dom, in case it does not
            // returns immediately (not possible to perform request)
            // note that this validation is conditional on existence
            // of the uxf library and may create problems
            var isValid = matchedObject.uxindom ? matchedObject.uxindom() : true;
            if (!isValid) {
                return;
            }

            // runs the remote call to the server side to provide
            // the update operation expected behavior
            matchedObject.message({
                type: "post",
                url: url,
                data: {
                    id: connectionId,
                    command: "update"
                },
                complete: function() {
                    // retrieves a series of configuration options from
                    // the matched object to be used in the handling
                    var status = matchedObject.data("status");
                    var timeout = matchedObject.data("timeout");

                    // retrieves the proper schedule method to be executed
                    // according to the current status, in case the connection
                    // is currently disconnected tries to connect it again
                    // otherwise runs the "normal" update command to obtain new
                    // data for the service source
                    var method = status === DISCONNECTED_STATUS ? _connect : _update;

                    // sets the timeout for connection, and
                    // retrieves the timeout handler
                    var timeoutHandler = setTimeout(function() {
                        method(matchedObject, options);
                    }, timeout);

                    // sets the timeout handler in the matched object
                    // so that it may be retrieved (and used) latter
                    matchedObject.data("timeout_handler",
                        timeoutHandler);
                },
                success: function(data) {
                    // retrieves the result message
                    var _data = data["data"];
                    var dataElement = jQuery(_data);

                    // iterates over each of the data elements received
                    // and for each of them calls the appropriate callbacks
                    dataElement.each(function(index, element) {
                        _callbacks(matchedObject, options,
                            element);
                    });

                    // updates the current status to connected, an update
                    // was successfull so the connection is consired
                    // to be online
                    _status(matchedObject, CONNECTED_STATUS);
                },
                error: function(data) {
                    // updates the current connection status to disconnected
                    // as there was an error in the update operation
                    _status(matchedObject, DISCONNECTED_STATUS);
                }
            });
        };

        var _callbacks = function(matchedObject, options, data) {
            // retrieves the various callbacks registered for data
            // handling in the current matched object
            var callbacks = matchedObject.data("callbacks");

            // sets the default data callback functions, defaulting
            // to an empty list in case their not provided
            callbacks = callbacks || [];

            // iterates over all the data callback functions and calls
            // each of them with the received data
            jQuery(callbacks).each(function(index, element) {
                // calls the callback function
                element(data);
            });
        };

        var _status = function(matchedObject, status, parameters) {
            // retrieves the status data
            var currentStatus = matchedObject.data("status");

            // in case the "new" status is the same
            // as the current status
            if (currentStatus === status) {
                // returns immediately
                return;
            }

            // switches over the status of the connection to handle
            // the change correctly
            switch (status) {
                case CONNECTED_STATUS:
                    // triggers the stream connected event to notify
                    // the client about the new connection
                    matchedObject.triggerHandler("stream_connected", parameters);

                    // breaks the switch
                    break;
                case DISCONNECTED_STATUS:
                    // triggers the stream disconnected event to notify
                    // the client about the closing of the connection
                    matchedObject.triggerHandler("stream_disconnected",
                        parameters);

                    // breaks the switch
                    break;
                case ERROR_STATUS:
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
            case "disconnect":
                _disconnect(matchedObject, options);
                break;

            case "data":
                _data(matchedObject, options);
                break;

            case "channel":
                _channel(matchedObject, options);
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
