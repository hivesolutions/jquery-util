// Hive Colony Framework
// Copyright (c) 2008-2017 Hive Solutions Lda.
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
// __copyright__ = Copyright (c) 2008-2017 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0

(function(jQuery) {

    var types = ["DOMMouseScroll", "mousewheel"];

    jQuery.event.special.mousewheel = {
        setup: function() {
            if (this.addEventListener)
                for (var i = types.length; i;)
                    this.addEventListener(types[--i], handler, false);
            else
                this.onmousewheel = handler;
        },

        teardown: function() {
            if (this.removeEventListener)
                for (var i = types.length; i;)
                    this.removeEventListener(types[--i], handler, false);
            else
                this.onmousewheel = null;
        }
    };

    jQuery.fn.extend({
        mousewheel: function(fn) {
            return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
        },

        unmousewheel: function(fn) {
            return this.unbind("mousewheel", fn);
        }
    });

    function handler(event) {
        var args = [].slice.call(arguments, 1),
            delta = 0,
            returnValue = true;

        event = jQuery.event.fix(event || window.event);
        event.type = "mousewheel";

        if (event.wheelDelta)
            delta = event.wheelDelta / 120;
        if (event.detail)
            delta = -event.detail / 3;

        args.unshift(event, delta);

        return jQuery.event.handle.apply(this, args);
    }

})(jQuery);
