// Hive Colony Framework
// Copyright (c) 2008-2015 Hive Solutions Lda.
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

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2015 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3

(function(jQuery) {
    jQuery.resolveurl = function(url, options) {
        // the default values for the resolve url
        var defaults = {};

        // sets the default method value
        var method = method ? method : "default";

        // sets the default options value
        var options = options ? options : {};

        // constructs the options
        var options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the base path environment variable
        var basePath = jQuery.environment("base-path");

        // re-creates the url using the base path, in case
        // there is a valid base path
        var url = basePath ? basePath + url : url;

        // returns the "resolved" url
        return url;
    };
})(jQuery);

(function(jQuery) {
    jQuery.environment = function(variableName, defaultValue, options) {
        // the default values for the environment
        var defaults = {
            environmentElement : jQuery("#environment-variables")
        };

        // sets the default method value
        var method = method ? method : "default";

        // sets the default options value
        var options = options ? options : {};

        // constructs the options
        var options = jQuery.extend(defaults, options);

        // sets the jquery matched object
        var matchedObject = this;

        // retrieves the environment element
        var environmentElement = options["environmentElement"];

        // retrieves the (environement) variable value, sets
        // the variable value with the default value in case
        // it's necessary and returns it to the caller function
        var variableValue = jQuery("#" + variableName, environmentElement).html();
        var variableValue = variableValue === null ? defaultValue : variableValue;
        return variableValue;
    };
})(jQuery);
