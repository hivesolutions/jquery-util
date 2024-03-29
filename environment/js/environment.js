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
    jQuery.resolveurl = function(url, method, options) {
        // the default values for the resolve url
        var defaults = {};

        // sets the default method value
        method = method || "default";

        // sets the default options value
        options = options || {};

        // constructs the options
        options = jQuery.extend(defaults, options);

        // retrieves the base path environment variable
        var basePath = jQuery.environment("base-path");

        // re-creates the url using the base path, in case
        // there is a valid base path
        url = basePath ? basePath + url : url;

        // returns the "resolved" url
        return url;
    };
})(jQuery);

(function(jQuery) {
    jQuery.environment = function(variableName, defaultValue, method, options) {
        // the default values for the environment
        var defaults = {
            environmentElement: jQuery("#environment-variables")
        };

        // sets the default method value
        method = method || "default";

        // sets the default options value
        options = options || {};

        // constructs the options
        options = jQuery.extend(defaults, options);

        // retrieves the environment element
        var environmentElement = options["environmentElement"];

        // retrieves the (environement) variable value, sets
        // the variable value with the default value in case
        // it's necessary and returns it to the caller function
        var variableValue = jQuery("#" + variableName, environmentElement).html();
        variableValue = variableValue === null || variableValue === undefined ? defaultValue :
            variableValue;
        return variableValue;
    };
})(jQuery);
