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
    jQuery.fn.parseData = function(options) {
        // the default values for the menu
        var defaults = {};

        // sets the default options value
        options = options || {};

        // constructs the options
        options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        // hides the matched object (because it's just data)
        matchedObject.hide();

        var parseObject = function(matchedObject) {
            // retrieves the matched object children (only data structure)
            var children = matchedObject.children("[data-structure=true]");

            // creates the list of parsed classes
            var parsedClasses = [];

            // creates the contents map to be used
            var contentsMap = {};

            // unsets the composite flag
            var composite = false;

            // iterates over all the children
            for (var index = 0; index < children.length; index++) {
                // retrieves the child
                var child = children[index];

                // retrieves the child element
                var childElement = jQuery(child);

                // retrieves the child class name
                var childClassName = childElement.attr("class");

                // retrieves the child element sequence
                var childDataSequence = childElement.attr("data-sequence");

                // in case the child class does not exists
                // in the parsed classes
                if (childClassName && parsedClasses.indexOf(childClassName) === -1) {
                    // adds the child class name to the parsed classes
                    parsedClasses.push(childClassName);

                    // retrieves the children for the given class (only data structure)
                    var childrenClass = matchedObject.children("." + childClassName +
                        "[data-structure=true]");

                    // retrieves the children class length
                    var childrenClassLength = childrenClass.length;

                    // in case the number of children is greater than one
                    // or the child is a sequence
                    if (childrenClassLength > 1 || childDataSequence) {
                        // starts the contents map for the child class name
                        contentsMap[childClassName] = [];

                        // iterates over all the children class
                        for (var _index = 0; _index < childrenClassLength; _index++) {
                            // retrieves the child class
                            var childClass = childrenClass[_index];

                            // retrieves the child class element
                            var childClassElement = jQuery(childClass);

                            // parses the child class element, retrieving
                            // the child map
                            var childMap = parseObject(childClassElement);

                            // adds the chidl map to the list in the
                            // the contents map
                            contentsMap[childClassName].push(childMap);

                            // sets the composite flag
                            composite = true;
                        }
                    } else {
                        // retrieves the child class
                        var childClass = childrenClass[0];

                        // retrieves the child class element
                        var childClassElement = jQuery(childClass);

                        // parses the child class element, retrieving
                        // the child map
                        var childMap = parseObject(childClassElement);

                        // sets the child map in the contents map
                        contentsMap[childClassName] = childMap;

                        // sets the composite flag
                        composite = true;
                    }
                }
            }

            // in case the current item is composite
            if (composite) {
                // returns the contents map
                return contentsMap;
            }
            // otherwise it must be a non composite item
            // and the html contents of the matched object
            // should be returned
            else {
                // returns the html contents of the matched object
                return matchedObject.html();
            }
        };

        // parses the matched object, retrieving the
        // result map
        var resultMap = parseObject(matchedObject);

        // returns the result map
        return resultMap;
    };
})(jQuery);
