// Hive Colony Framework
// Copyright (c) 2008-2018 Hive Solutions Lda.
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
// __copyright__ = Copyright (c) 2008-2018 Hive Solutions Lda.
// __license__   = Apache License, Version 2.0
// __credits__   = Tzury Bar Yochay <tzury.by@gmail.com>

(function(jQuery) {
    // keep reference to the original functions
    jQuery.fn.__bind__ = jQuery.fn.bind;
    jQuery.fn.__unbind__ = jQuery.fn.unbind;
    jQuery.fn.__find__ = jQuery.fn.find;

    var hotkeys = {
        override: /keypress|keydown|keyup/g,

        /**
         * The map of triggers.
         *
         * @type Map
         */
        triggersMap: {},

        /**
         * Map containing all the special keys.
         *
         * @type Map
         */
        specialKeys: {
            27: "esc",
            9: "tab",
            32: "space",
            13: "return",
            8: "backspace",
            145: "scroll",
            20: "capslock",
            144: "numlock",
            19: "pause",
            45: "insert",
            36: "home",
            46: "del",
            35: "end",
            33: "pageup",
            34: "pagedown",
            37: "left",
            38: "up",
            39: "right",
            40: "down",
            109: "-",
            112: "f1",
            113: "f2",
            114: "f3",
            115: "f4",
            116: "f5",
            117: "f6",
            118: "f7",
            119: "f8",
            120: "f9",
            121: "f10",
            122: "f11",
            123: "f12",
            191: "/"
        },

        shiftNums: {
            "`": "~",
            "1": "!",
            "2": "@",
            "3": "#",
            "4": "$",
            "5": "%",
            "6": "^",
            "7": "&",
            "8": "*",
            "9": "(",
            "0": ")",
            "-": "_",
            "=": "+",
            ";": ":",
            "'": "\"",
            ",": "<",
            ".": ">",
            "/": "?",
            "\\": "|"
        },

        newTrigger: function(type, combi, callback) {
            var result = {};
            result[type] = {};
            result[type][combi] = {
                cb: callback,
                disableInInput: false
            };
            return result;
        }
    };

    hotkeys.specialKeys = jQuery.extend(hotkeys.specialKeys, {
        96: "0",
        97: "1",
        98: "2",
        99: "3",
        100: "4",
        101: "5",
        102: "6",
        103: "7",
        104: "8",
        105: "9",
        106: "*",
        107: "+",
        109: "-",
        110: ".",
        111: "/"
    });

    jQuery.fn.find = function(selector) {
        this.query = selector;
        return jQuery.fn.__find__.apply(this, arguments);
    };

    jQuery.fn.unbind = function(type, combi, fn) {
        if (jQuery.isFunction(combi)) {
            fn = combi;
            combi = null;
        }

        if (combi && typeof combi === "string") {
            var selectorId = ((this.prevObject && this.prevObject.query) || (this[0].id && this[0].id) || this[
                0]).toString();

            var hkTypes = type.split(" ");

            for (var x = 0; x < hkTypes.length; x++) {
                delete hotkeys.triggersMap[selectorId][hkTypes[x]][combi];
            }
        }

        // call jquery original unbind
        return this.__unbind__(type, fn);
    };

    jQuery.fn.bind = function(type, data, fn) {
        // grab keyup,keydown,keypress
        var handle = type.match(hotkeys.override);

        if (jQuery.isFunction(data) || !handle) {
            // call jquery bind only
            return this.__bind__(type, data, fn);
        } else {
            // splits the job
            var result = null,

                // passes the rest to the original jQuery.fn.bind
                pass2jq = jQuery.trim(type.replace(hotkeys.override, ""));

            // see if there are other types, pass them to the original jQuery.fn.bind
            if (pass2jq) {
                result = this.__bind__(pass2jq, data, fn);
            }

            if (typeof data === "string") {
                data = {
                    combi: data
                };
            }
            if (data.combi) {
                for (var x = 0; x < handle.length; x++) {
                    var eventType = handle[x];
                    var combi = data.combi.toLowerCase(),
                        trigger = hotkeys.newTrigger(
                            eventType, combi, fn),
                        selectorId = ((this.prevObject && this.prevObject.query) || (this[0].id && this[0].id) ||
                            this[0]).toString();

                    trigger[eventType][combi].disableInInput = data.disableInInput;

                    // first time selector is bounded
                    if (!hotkeys.triggersMap[selectorId]) {
                        hotkeys.triggersMap[selectorId] = trigger;
                    }
                    // first time selector is bounded with this type
                    else if (!hotkeys.triggersMap[selectorId][eventType]) {
                        hotkeys.triggersMap[selectorId][eventType] = trigger[eventType];
                    }

                    // makes trigger point as array so more than one handler can be bound
                    var mapPoint = hotkeys.triggersMap[selectorId][eventType][combi];

                    if (!mapPoint) {
                        hotkeys.triggersMap[selectorId][eventType][combi] = [trigger[eventType][combi]];
                    } else if (mapPoint.constructor !== Array) {
                        hotkeys.triggersMap[selectorId][eventType][combi] = [mapPoint];
                    } else {
                        hotkeys.triggersMap[selectorId][eventType][combi][mapPoint.length] = trigger[eventType]
                            [combi];
                    }

                    // adds attribute and calls jquery event add per eached matched element
                    this.each(function() {
                        // jquery wrapper for the current element
                        var jqElem = jQuery(this);

                        // element already associated with another collection
                        if (jqElem.attr("hkId") && jqElem.attr("hkId") !== selectorId) {
                            selectorId = jqElem.attr("hkId") + ";" + selectorId;
                        }
                        jqElem.attr("hkId", selectorId);
                    });

                    result = this.__bind__(handle.join(" "), data,
                        hotkeys.handler)
                }
            }

            // returns the result
            return result;
        }
    };

    // work-around for opera and safari where (sometimes) the target is the element which was last
    // clicked with the mouse and not the document event it would make sense to get the document
    hotkeys.findElement = function(element) {
        if (!jQuery(element).attr("hkId")) {
            if (jQuery.browser.opera || jQuery.browser.safari) {
                while (!jQuery(element).attr("hkId") && element.parentNode) {
                    element = element.parentNode;
                }
            }
        }
        return element;
    };

    // the event handler (proper implementation)
    hotkeys.handler = function(event) {
        var target = hotkeys.findElement(event.currentTarget),
            jTarget = jQuery(target),
            ids = jTarget.attr("hkId");

        if (ids) {
            ids = ids.split(";");
            var code = event.which,
                type = event.type,
                special = hotkeys.specialKeys[code],
                // prevent f5 overlapping with "t" (or f4 with "s", etc.)
                character = !special && String.fromCharCode(code).toLowerCase(),
                shift = event.shiftKey,
                ctrl = event.ctrlKey,

                alt = event.altKey || event.originalEvent.altKey,
                mapPoint = null;

            for (var x = 0; x < ids.length; x++) {
                if (hotkeys.triggersMap[ids[x]][type]) {
                    mapPoint = hotkeys.triggersMap[ids[x]][type];
                    break;
                }
            }

            if (mapPoint) {
                var trigger;
                // event type is associated with the hkId
                if (!shift && !ctrl && !alt) { // No Modifiers
                    trigger = mapPoint[special] || (character && mapPoint[character]);
                } else {
                    // checks the combinations (alt | ctrl | shift+anything)
                    var modif = "";

                    if (alt) {
                        modif += "alt+";
                    }

                    if (ctrl) {
                        modif += "ctrl+";
                    }

                    if (shift) {
                        modif += "shift+";
                    }

                    trigger = mapPoint[modif + special];
                    if (!trigger) {
                        if (character) {
                            trigger = mapPoint[modif + character] || mapPoint[modif + hotkeys.shiftNums[
                                character]] || (modif === "shift+" && mapPoint[hotkeys.shiftNums[character]]);
                        }
                    }
                }
                if (trigger) {
                    var result = false;
                    for (var x = 0; x < trigger.length; x++) {
                        if (trigger[x].disableInInput) {
                            // double checks event.currentTarget and event.target
                            var element = jQuery(event.target);

                            if (jTarget.is("input") || jTarget.is("textarea") || jTarget.is("select") ||
                                element.is("input") || element.is("textarea") || element.is("select")) {
                                return true;
                            }
                        }

                        // calls the registered callback function
                        result = result || trigger[x].cb.apply(this, [event]);
                    }

                    // returns the result
                    return result;
                }
            }
        }
    };

    // places it under window so it can be extended and overridden by others
    window.hotkeys = hotkeys;
})(jQuery);
