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
// __credits__   = Ben Alman

(function(jQuery, window, undefined) {
    // A jQuery object containing all non-window elements to which the resize
    // event is bound.
    var elems = jQuery([]);

    // Extend jQuery.resize if it already exists, otherwise create it.
    var jq_resize = jQuery.resize = jQuery.extend(jQuery.resize, {});

    var timeout_id;

    // Reused strings.
    var str_setTimeout = "setTimeout";
    var str_resize = "resize";
    var str_data = str_resize + "-special-event";
    var str_delay = "delay";
    var str_throttle = "throttleWindow";

    // Property: jQuery.resize.delay
    //
    // The numeric interval (in milliseconds) at which the resize event polling
    // loop executes. Defaults to 250.

    jq_resize[str_delay] = 250;

    // Property: jQuery.resize.throttleWindow
    //
    // Throttle the native window object resize event to fire no more than once
    // every <jQuery.resize.delay> milliseconds. Defaults to true.
    //
    // Because the window object has its own resize event, it doesn't need to be
    // provided by this plugin, and its execution can be left entirely up to the
    // browser. However, since certain browsers fire the resize event continuously
    // while others do not, enabling this will throttle the window resize event,
    // making event behavior consistent across all elements in all browsers.
    //
    // While setting this property to false will disable window object resize
    // event throttling, please note that this property must be changed before any
    // window object resize event callbacks are bound.

    jq_resize[str_throttle] = true;

    // Event: resize event
    //
    // Fired when an element's width or height changes. Because browsers only
    // provide this event for the window element, for other elements a polling
    // loop is initialized, running every <jQuery.resize.delay> milliseconds
    // to see if elements' dimensions have changed. You may bind with either
    // .resize( fn ) or .bind( "resize", fn ), and unbind with .unbind( "resize" ).
    //
    // Usage:
    //
    // > jQuery('selector').bind( 'resize', function(e) {
    // >   // element's width or height has changed!
    // >   ...
    // > });
    //
    // Additional Notes:
    //
    // * The polling loop is not created until at least one callback is actually
    //   bound to the 'resize' event, and this single polling loop is shared
    //   across all elements.
    //
    // Double firing issue in jQuery 1.3.2:
    //
    // While this plugin works in jQuery 1.3.2, if an element's event callbacks
    // are manually triggered via .trigger( 'resize' ) or .resize() those
    // callbacks may double-fire, due to limitations in the jQuery 1.3.2 special
    // events system. This is not an issue when using jQuery 1.4+.
    //
    // > // While this works in jQuery 1.4+
    // > jQuery(elem).css({ width: new_w, height: new_h }).resize();
    // >
    // > // In jQuery 1.3.2, you need to do this:
    // > var elem = jQuery(elem);
    // > elem.css({ width: new_w, height: new_h });
    // > elem.data( 'resize-special-event', { width: elem.width(), height: elem.height() } );
    // > elem.resize();

    jQuery.event.special[str_resize] = {

        // Called only when the first 'resize' event callback is bound per element.
        setup: function() {
            // Since window has its own native 'resize' event, return false so that
            // jQuery will bind the event using DOM methods. Since only 'window'
            // objects have a .setTimeout method, this should be a sufficient test.
            // Unless, of course, we're throttling the 'resize' event for window.
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false;
            }

            var elem = jQuery(this);

            // Add this element to the list of internal elements to monitor.
            elems = elems.add(elem);

            // Initialize data store on the element.
            jQuery.data(this, str_data, {
                w: elem.width(),
                h: elem.height()
            });

            // If this is the first element added, start the polling loop.
            if (elems.length === 1) {
                loopy();
            }
        },

        // Called only when the last 'resize' event callback is unbound per element.
        teardown: function() {
            // Since window has its own native 'resize' event, return false so that
            // jQuery will unbind the event using DOM methods. Since only 'window'
            // objects have a .setTimeout method, this should be a sufficient test.
            // Unless, of course, we're throttling the 'resize' event for window.
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false;
            }

            var elem = jQuery(this);

            // Remove this element from the list of internal elements to monitor.
            elems = elems.not(elem);

            // Remove any data stored on the element.
            elem.removeData(str_data);

            // If this is the last element removed, stop the polling loop.
            if (!elems.length) {
                clearTimeout(timeout_id);
            }
        },

        // Called every time a 'resize' event callback is bound per element (new in
        // jQuery 1.4).
        add: function(handleObj) {
            // Since window has its own native 'resize' event, return false so that
            // jQuery doesn't modify the event object. Unless, of course, we're
            // throttling the 'resize' event for window.
            if (!jq_resize[str_throttle] && this[str_setTimeout]) {
                return false;
            }

            var old_handler;

            // The new_handler function is executed every time the event is triggered.
            // This is used to update the internal element data store with the width
            // and height when the event is triggered manually, to avoid double-firing
            // of the event callback. See the "Double firing issue in jQuery 1.3.2"
            // comments above for more information.

            function new_handler(e, w, h) {
                var elem = jQuery(this);
                var data = jQuery.data(this, str_data);

                // If called from the polling loop, w and h will be passed in as
                // arguments. If called manually, via .trigger( 'resize' ) or .resize(),
                // those values will need to be computed.
                data.w = w !== null && w !== undefined ? w : elem.width();
                data.h = h !== null && h !== undefined ? h : elem.height();

                old_handler.apply(this, arguments);
            };

            // this may seem a little complicated, but it normalizes the special event
            // .add method between newer and older versions
            if (jQuery.isFunction(handleObj)) {
                old_handler = handleObj;
                return new_handler;
            } else {
                old_handler = handleObj.handler;
                handleObj.handler = new_handler;
            }
        }

    };

    function loopy() {
        // Start the polling loop, asynchronously.
        timeout_id = window[str_setTimeout](function() {
            // Iterate over all elements to which the 'resize' event is bound.
            elems.each(function() {
                var elem = jQuery(this);
                var width = elem.width();
                var height = elem.height();
                var data = jQuery.data(this, str_data);

                // If element size has changed since the last time, update the element
                // data store and trigger the 'resize' event.
                if (width !== data.w || height !== data.h) {
                    elem.trigger(str_resize, [data.w = width, data.h = height]);
                }
            });

            // loops around
            loopy();
        }, jq_resize[str_delay]);
    };

})(jQuery, this);
