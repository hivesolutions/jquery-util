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

// __author__    = João Magalhães <joamag@hive.pt>
// __version__   = 1.0.0
// __revision__  = $LastChangedRevision$
// __date__      = $LastChangedDate$
// __copyright__ = Copyright (c) 2008-2012 Hive Solutions Lda.
// __license__   = GNU General Public License (GPL), Version 3
// __credits__   = Mike Alsup

(function(jQuery) {
    /**
     * Provides a mechanism for immediately submitting an html form using ajax.
     */
    jQuery.fn.ajaxSubmit = function(options) {
        // fast fail if nothing selected (http://dev.jquery.com/ticket/2752)
        if (!this.length) {
            // returns the object
            return this;
        }

        // in case the type of options is
        // a function
        if (typeof options == "function") {
            // creates the options map
            options = {
                success : options
            };
        }

        // retrieves the action
        var action = this.attr("action");

        // retrieves the url from the action value
        var url = jQuery.trim(action);

        // in case the url is defined
        if (url) {
            // cleans the url (don't include hash vaue)
            url = (url.match(/^([^#]+)/) || [])[1];
        }

        // in case no url is defined the current location
        // is sets as the url
        url = url || window.location.href || "";

        // extends the options map with the processed values
        options = jQuery.extend({
                    url : url,
                    type : this.attr("method") || "GET",
                    iframeSrc : /^https/i.test(window.location.href || "")
                            ? "javascript:false"
                            : "about:blank"
                }, options || {});

        // hook for manipulating the form data before it is extracted;
        // convenient for use with rich editors like tinyMCE or FCKEditor
        var veto = {};

        // triggers the form pre serialize event
        this.trigger("form_pre_serialize", [this, options, veto]);

        // in case the veto flag is set (handler aborted operations)
        if (veto.veto) {
            // returns the object
            return this;
        }

        // provide opportunity to alter form data before it is serialized
        if (options.beforeSerialize
                && options.beforeSerialize(this, options) === false) {
            // returns the object
            return this;
        }

        // converts the form to array, retrieving the array value
        var arrayValue = this.formToArray(options.semantic, options);

        // in case the data is defined in the options
        if (options.data) {
            // sets the data in the extra data
            options.extraData = options.data;

            // iterates over all the options data
            for (var n in options.data) {
                if (options.data[n] instanceof Array) {
                    for (var k in options.data[n]) {
                        arrayValue.push({
                                    name : n,
                                    value : options.data[n][k]
                                });
                    }
                } else
                    arrayValue.push({
                                name : n,
                                value : options.data[n]
                            });
            }
        }

        // gives pre-submit callback an opportunity to abort the submit
        if (options.beforeSubmit
                && options.beforeSubmit(arrayValue, this, options) === false) {

            // returns the object
            return this;
        }

        // fires vetoable "validate" event
        this.trigger("form_submit_validate", [arrayValue, this, options, veto]);
        if (veto.veto) {
            // returns the object
            return this;
        }

        var q = jQuery.param(arrayValue);

        if (options.type.toUpperCase() == "GET") {
            options.url += (options.url.indexOf("?") >= 0 ? "&" : "?") + q;

            // data is null for get
            options.data = null;
        } else {
            // data is the query string for post
            options.data = q;
        }

        // retrieves the for reference
        var _form = this;

        // creates the callbacks list
        var callbacks = [];

        // in case the reset form option
        // is set
        if (options.resetForm) {
            callbacks.push(function() {
                        // resets the form
                        _form.resetForm();
                    });
        }

        // in case the clear form option
        // is set
        if (options.clearForm) {
            callbacks.push(function() {
                        // clears the form
                        _form.clearForm();
                    });
        }

        // perform a load on the target only if dataType is not provided
        if (!options.dataType && options.target) {
            var oldSuccess = options.success || function() {
            };

            callbacks.push(function(data) {
                        var fn = options.replaceTarget ? "replaceWith" : "html";
                        jQuery(options.target)[fn](data).each(oldSuccess,
                                arguments);
                    });
        } else if (options.success)
            callbacks.push(options.success);

        options.success = function(data, status, xhr) {
            for (var i = 0, max = callbacks.length; i < max; i++) {
                callbacks[i].apply(options, [data, status, xhr || _form, _form]);
            }
        };

        // in case there are files to upload
        var files = jQuery("input:file", this).fieldValue();

        // unsets the found flag
        var found = false;

        // iterates over all the files
        for (var j = 0; j < files.length; j++) {
            // retrieves the current file
            var file = files[j];

            // in case the file is valid
            if (file) {
                // sets the found flag
                found = true;
            }
        }

        var multipart = false;

        // options.iframe allows user to force iframe mode
        // 06-NOV-09: now defaulting to iframe mode if file input is detected
        if ((files.length && options.iframe !== false) || options.iframe
                || found || multipart) {
            // hack to fix Safari hang (thanks to Tim Molendijk for this)
            // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
            if (options.closeKeepAlive) {
                jQuery.get(options.closeKeepAlive, fileUpload);
            } else {
                fileUpload();
            }
        } else {
            jQuery.ajax(options);
        }

        // fires notify event
        this.trigger("form_submit_notify", [this, options]);
        return this;

        // private function for handling file uploads (hat tip to YAHOO!)
        function fileUpload() {
            // retrieves the form
            var form = _form[0];

            if (jQuery(":input[name=submit]", form).length) {
                // throws an exception
                throw "Error: Form elements must not be named \"submit\".";
            }

            var opts = jQuery.extend({}, jQuery.ajaxSettings, options);
            var s = jQuery.extend(true, {}, jQuery.extend(true, {},
                            jQuery.ajaxSettings), opts);

            var id = "jqFormIO" + (new Date().getTime());

            var _io = jQuery("<iframe id=\""
                    + id
                    + "\" name=\""
                    + id
                    + "\" src=\""
                    + opts.iframeSrc
                    + "\" onload=\"(jQuery(this).data('form_plugin_onload'))()\" />");
            var io = _io[0];

            _io.css({
                        position : "absolute",
                        top : "-1000px",
                        left : "-1000px"
                    });

            var xhr = { // mock object
                aborted : 0,
                responseText : null,
                responseXML : null,
                status : 0,
                statusText : "n/a",
                getAllResponseHeaders : function() {
                },
                getResponseHeader : function() {
                },
                setRequestHeader : function() {
                },
                abort : function() {
                    this.aborted = 1;
                    _io.attr("src", opts.iframeSrc); // abort op in progress
                }
            };

            var g = opts.global;
            // trigger ajax global events so that activity/block indicators work like normal
            if (g && !jQuery.active++)
                jQuery.event.trigger("ajaxStart");
            if (g)
                jQuery.event.trigger("ajaxSend", [xhr, opts]);

            if (s.beforeSend && s.beforeSend(xhr, s) === false) {
                s.global && jQuery.active--;
                return;
            }
            if (xhr.aborted)
                return;

            var cbInvoked = false;
            var timedOut = 0;

            // add submitting element to data if we know it
            var sub = form.clk;
            if (sub) {
                var n = sub.name;
                if (n && !sub.disabled) {
                    opts.extraData = opts.extraData || {};
                    opts.extraData[n] = sub.value;
                    if (sub.type == "image") {
                        opts.extraData[n + ".x"] = form.clk_x;
                        opts.extraData[n + ".y"] = form.clk_y;
                    }
                }
            }

            // take a breath so that pending repaints get some cpu time before the upload starts
            function doSubmit() {
                // make sure form attrs are set
                var t = _form.attr("target"), arrayValue = _form.attr("action");

                // update form attrs in IE friendly way
                form.setAttribute("target", id);
                if (form.getAttribute("method") != "POST")
                    form.setAttribute("method", "POST");
                if (form.getAttribute("action") != opts.url)
                    form.setAttribute("action", opts.url);

                // ie borks in some cases when setting encoding
                if (!opts.skipEncodingOverride) {
                    _form.attr({
                                encoding : "multipart/form-data",
                                enctype : "multipart/form-data"
                            });
                }

                // support timout
                if (opts.timeout) {
                    setTimeout(function() {
                                timedOut = true;
                                cb();
                            }, opts.timeout);
                }

                // add "extra" data to form if provided in options
                var extraInputs = [];
                try {
                    if (opts.extraData)
                        for (var n in opts.extraData)
                            extraInputs.push(jQuery("<input type=\"hidden\" name=\""
                                    + n
                                    + "\" value=\""
                                    + opts.extraData[n]
                                    + "\" />").appendTo(form)[0]);

                    // add iframe to doc and submit the form
                    _io.appendTo("body");
                    _io.data("form_plugin_onload", cb);
                    form.submit();
                } finally {
                    // reset attrs and remove "extra" input elements
                    form.setAttribute("action", arrayValue);
                    t
                            ? form.setAttribute("target", t)
                            : _form.removeAttr("target");
                    jQuery(extraInputs).remove();
                }
            }

            if (opts.forceSync)
                doSubmit();
            else
                setTimeout(doSubmit, 10); // this lets dom updates render

            var domCheckCount = 100;

            function cb() {
                if (cbInvoked)
                    return;

                var ok = true;
                try {
                    if (timedOut)
                        throw "timeout";
                    // extract the server response from the iframe
                    var data, doc;

                    doc = io.contentWindow
                            ? io.contentWindow.document
                            : io.contentDocument
                                    ? io.contentDocument
                                    : io.document;

                    var isXml = opts.dataType == "xml" || doc.XMLDocument
                            || jQuery.isXMLDoc(doc);

                    if (!isXml
                            && (doc.body == null || doc.body.innerHTML == "")) {
                        if (--domCheckCount) {
                            setTimeout(cb, 250);

                            return;
                        }

                        return;
                    }

                    cbInvoked = true;
                    xhr.responseText = doc.body ? doc.body.innerHTML : null;
                    xhr.responseXML = doc.XMLDocument ? doc.XMLDocument : doc;
                    xhr.getResponseHeader = function(header) {
                        var headers = {
                            "content-type" : opts.dataType
                        };
                        return headers[header];
                    };

                    if (opts.dataType == "json" || opts.dataType == "script") {
                        // see if user embedded response in textarea
                        var ta = doc.getElementsByTagName("textarea")[0];
                        if (ta)
                            xhr.responseText = ta.value;
                        else {
                            // account for browsers injecting pre around json response
                            var pre = doc.getElementsByTagName("pre")[0];
                            if (pre)
                                xhr.responseText = pre.innerHTML;
                        }
                    } else if (opts.dataType == "xml" && !xhr.responseXML
                            && xhr.responseText != null) {
                        xhr.responseXML = toXml(xhr.responseText);
                    }
                    data = jQuery.httpData(xhr, opts.dataType);
                } catch (e) {
                    ok = false;
                    xhr.error = e;
                    jQuery.handleError(opts, xhr, "error", e);
                }

                // ordering of these callbacks/triggers is odd, but that's how jQuery.ajax does it
                if (ok) {
                    opts.success(data, "success");
                    if (g)
                        jQuery.event.trigger("ajaxSuccess", [xhr, opts]);
                }
                if (g) {
                    jQuery.event.trigger("ajaxComplete", [xhr, opts]);
                }

                if (g && !--jQuery.active) {
                    jQuery.event.trigger("ajaxStop");
                }

                if (opts.complete) {
                    opts.complete(xhr, ok ? "success" : "error");
                }

                // clean up
                setTimeout(function() {
                            _io.removeData("form_plugin_onload");
                            _io.remove();
                            xhr.responseXML = null;
                        }, 100);
            }

            function toXml(s, doc) {
                if (window.ActiveXObject) {
                    doc = new ActiveXObject("Microsoft.XMLDOM");
                    doc.async = "false";
                    doc.loadXML(s);
                } else
                    doc = (new DOMParser()).parseFromString(s, "text/xml");
                return (doc && doc.documentElement && doc.documentElement.tagName != "parsererror")
                        ? doc
                        : null;
            }
        }
    };

    /**
     * ajaxForm() provides a mechanism for fully automating form submission.
     *
     * The advantages of using this method instead of ajaxSubmit() are:
     *
     * 1: This method will include coordinates for <input type="image" />
     * elements (if the element is used to submit the form). 2. This method will
     * include the submit element's name/value data (for the element that was
     * used to submit the form). 3. This method binds the submit() method to the
     * form for you.
     *
     * The options argument for ajaxForm works exactly as it does for
     * ajaxSubmit. ajaxForm merely passes the options argument along after
     * properly binding events for submit elements and the form itself.
     */
    jQuery.fn.ajaxForm = function(options) {
        return this.ajaxFormUnbind().bind("submit.form_plugin", function(e) {
                    e.preventDefault();
                    jQuery(this).ajaxSubmit(options);
                }).bind("click.form_plugin", function(e) {
                    var target = e.target;
                    var _element = jQuery(target);
                    if (!(_element.is(":submit,input:image"))) {
                        // is this a child element of the submit element?  (ex: a span within a button)
                        var t = _element.closest(":submit");
                        if (t.length == 0)
                            return;
                        target = t[0];
                    }
                    var form = this;
                    form.clk = target;
                    if (target.type == "image") {
                        if (e.offsetX != undefined) {
                            form.clk_x = e.offsetX;
                            form.clk_y = e.offsetY;
                        } else if (typeof jQuery.fn.offset == "function") { // try to use dimensions plugin
                            var offset = _element.offset();
                            form.clk_x = e.pageX - offset.left;
                            form.clk_y = e.pageY - offset.top;
                        } else {
                            form.clk_x = e.pageX - target.offsetLeft;
                            form.clk_y = e.pageY - target.offsetTop;
                        }
                    }
                    // clear form vars
                    setTimeout(function() {
                                form.clk = form.clk_x = form.clk_y = null;
                            }, 100);
                });
    };

    // ajaxFormUnbind unbinds the event handlers that were bound by ajaxForm
    jQuery.fn.ajaxFormUnbind = function() {
        return this.unbind("submit.form_plugin click.form_plugin");
    };

    /**
     * Gathers form element data into an array of objects that can be passed to
     * any of the following ajax functions: jQuery.get, jQuery.post, or load.
     * Each object in the array has both a name and value property. An example
     * of an array for a simple login form might be: [ { name: "username",
     * value: "jresig" }, { name: "password", value: "secret" } ] It is this
     * array that is passed to pre-submit callback functions provided to the
     * ajaxSubmit() and ajaxForm() methods.
     */
    jQuery.fn.formToArray = function(semantic, options) {
        // sets the default options value
        options = options ? options : {};

        // creates the array value
        var arrayValue = [];

        // in case the length is zero
        if (this.length == 0) {
            // returns the array immediately
            return arrayValue;
        }

        // retrieves the form
        var form = this[0];

        // retrieves the elements from the semantic list
        // or from the element itself
        var elements = semantic
                ? form.getElementsByTagName("*")
                : form.elements;

        // in case no elements are defined
        if (!elements) {
            // returns the array value
            return arrayValue;
        }

        // retrieves the empty valid value
        var emptyValid = options.emptyValid ? options.emptyValid : false;

        // iterates over all the elements
        for (var i = 0, max = elements.length; i < max; i++) {
            // retrieves the current element
            var element = elements[i];

            // retrieves the current element name
            var elementName = element.name;

            // in case no element name is defined
            if (!elementName) {
                // continues the loop
                continue;
            }

            if (semantic && form.clk && element.type == "image") {
                // handle image inputs on the fly when semantic == true
                if (!element.disabled && form.clk == element) {
                    arrayValue.push({
                                name : elementName,
                                value : jQuery(element).val()
                            });

                    arrayValue.push({
                                name : elementName + ".x",
                                value : form.clk_x
                            }, {
                                name : elementName + ".y",
                                value : form.clk_y
                            });
                }

                // continues the loop
                continue;
            }

            var elementValue = jQuery.fieldValue(element, true);

            if (elementValue && elementValue.constructor == Array) {
                for (var j = 0, jmax = elementValue.length; j < jmax; j++) {
                    // retrieves the array value
                    var arrayValue = elementValue[j];

                    // in case the array value is not null or undefined
                    // and even not empty
                    if (arrayValue !== null && typeof arrayValue != "undefined"
                            && (emptyValid || arrayValue != "")) {
                        arrayValue.push({
                                    name : elementName,
                                    value : arrayValue
                                });
                    }
                }
            }
            // in case the value is not null or undefined
            // and even not empty
            else if (elementValue !== null
                    && typeof elementValue != "undefined"
                    && (emptyValid || elementValue != "")) {
                arrayValue.push({
                            name : elementName,
                            value : elementValue
                        });
            }
        }

        if (!semantic && form.clk) {
            // input type=="image" are not found in elements array! handle it here
            var jQueryinput = jQuery(form.clk), input = jQueryinput[0], elementName = input.name;
            if (elementName && !input.disabled && input.type == "image") {
                arrayValue.push({
                            name : elementName,
                            value : jQueryinput.val()
                        });
                arrayValue.push({
                            name : elementName + ".x",
                            value : form.clk_x
                        }, {
                            name : elementName + ".y",
                            value : form.clk_y
                        });
            }
        }

        // returns the array value
        return arrayValue;
    };

    /**
     * Serializes form data into a "submittable" string. This method will return
     * a string in the format: name1=value1&amp;name2=value2
     */
    jQuery.fn.formSerialize = function(semantic) {
        //hand off to jQuery.param for proper encoding
        return jQuery.param(this.formToArray(semantic));
    };

    /**
     * Serializes all field elements in the jQuery object into a query string.
     * This method will return a string in the format:
     * name1=value1&amp;name2=value2
     */
    jQuery.fn.fieldSerialize = function(successful) {
        var arrayValue = [];
        this.each(function() {
                    var n = this.name;
                    if (!n)
                        return;
                    var v = jQuery.fieldValue(this, successful);
                    if (v && v.constructor == Array) {
                        for (var i = 0, max = v.length; i < max; i++)
                            arrayValue.push({
                                        name : n,
                                        value : v[i]
                                    });
                    } else if (v !== null && typeof v != "undefined")
                        arrayValue.push({
                                    name : this.name,
                                    value : v
                                });
                });

        // hands off to jQuery.param for proper encoding
        return jQuery.param(arrayValue);
    };

    /**
     * Returns the value(s) of the element in the matched set. For example,
     * consider the following form:
     *
     * <form><fieldset> <input name="A" type="text" /> <input name="A"
     * type="text" /> <input name="B" type="checkbox" value="B1" /> <input
     * name="B" type="checkbox" value="B2"/> <input name="C" type="radio"
     * value="C1" /> <input name="C" type="radio" value="C2" /> </fieldset></form>
     *
     * var v = jQuery(":text").fieldValue(); // if no values are entered into
     * the text inputs v == ["",""] // if values entered into the text inputs
     * are "foo" and "bar" v == ["foo", "bar"]
     *
     * var v = jQuery(":checkbox").fieldValue(); // if neither checkbox is
     * checked v === undefined // if both checkboxes are checked v == ["B1",
     * "B2"]
     *
     * var v = jQuery(":radio").fieldValue(); // if neither radio is checked v
     * === undefined // if first radio is checked v == ["C1"]
     *
     * The successful argument controls whether or not the field element must be
     * "successful" (per
     * http://www.w3.org/TR/html4/interact/forms.html#successful-controls). The
     * default value of the successful argument is true. If this value is false
     * the value(s) for each element is returned.
     *
     * Note: This method *always* returns an array. If no valid value can be
     * determined the array will be empty, otherwise it will contain one or more
     * values.
     */
    jQuery.fn.fieldValue = function(successful) {
        for (var val = [], i = 0, max = this.length; i < max; i++) {
            var element = this[i];
            var v = jQuery.fieldValue(element, successful);
            if (v === null || typeof v == "undefined"
                    || (v.constructor == Array && !v.length))
                continue;
            v.constructor == Array ? jQuery.merge(val, v) : val.push(v);
        }
        return val;
    };

    /**
     * Returns the value of the field element.
     */
    jQuery.fieldValue = function(element, successful) {
        var n = element.name, t = element.type, tag = element.tagName.toLowerCase();

        if (typeof successful == "undefined")
            successful = true;

        if (successful
                && (!n || element.disabled || t == "reset" || t == "button"
                        || (t == "checkbox" || t == "radio")
                        && !element.checked || (t == "submit" || t == "image")
                        && element.form && element.form.clk != element || tag == "select"
                        && element.selectedIndex == -1))
            return null;

        if (tag == "select") {
            var index = element.selectedIndex;
            if (index < 0)
                return null;
            var arrayValue = [], ops = element.options;
            var one = (t == "select-one");
            var max = (one ? index + 1 : ops.length);
            for (var i = (one ? index : 0); i < max; i++) {
                var op = ops[i];
                if (op.selected) {
                    var v = op.value;
                    if (!v) // extra pain for IE...
                        v = (op.attributes && op.attributes["value"] && !(op.attributes["value"].specified))
                                ? op.text
                                : op.value;
                    if (one)
                        return v;
                    arrayValue.push(v);
                }
            }

            // returns the array value
            return arrayValue;
        }

        // retrieves the element value
        var elementValue = element.value;

        // returns the element value
        return elementValue;
    };

    /**
     * Clears the form data. Takes the following actions on the form's input
     * fields: - input text fields will have their value property set to the
     * empty string - select elements will have their selected index property
     * set to -1 - checkbox and radio inputs will have their checked property
     * set to false - inputs of type submit, button, reset, and hidden will
     * *not* be effected - button elements will *not* be effected
     */
    jQuery.fn.clearForm = function() {
        return this.each(function() {
                    jQuery("input, select, textarea", this).clearFields();
                });
    };

    /**
     * Clears the selected form elements.
     */
    jQuery.fn.clearFields = jQuery.fn.clearInputs = function() {
        return this.each(function() {
                    var t = this.type, tag = this.tagName.toLowerCase();
                    if (t == "text" || t == "password" || tag == "textarea")
                        this.value = "";
                    else if (t == "checkbox" || t == "radio")
                        this.checked = false;
                    else if (tag == "select")
                        this.selectedIndex = -1;
                });
    };

    /**
     * Resets the form data. Causes all form elements to be reset to their
     * original value.
     */
    jQuery.fn.resetForm = function() {
        return this.each(function() {
                    // guard against an input with the name of reset
                    // note that IE reports the reset function as an object
                    if (typeof this.reset == "function"
                            || (typeof this.reset == "object" && !this.reset.nodeType))
                        this.reset();
                });
    };

    /**
     * Enables or disables any matching elements.
     */
    jQuery.fn.enable = function(b) {
        if (b == undefined)
            b = true;
        return this.each(function() {
                    this.disabled = !b;
                });
    };

    /**
     * Checks/unchecks any matching checkboxes or radio buttons and
     * selects/deselects and matching option elements.
     */
    jQuery.fn.selected = function(select) {
        if (select == undefined)
            select = true;
        return this.each(function() {
                    var t = this.type;
                    if (t == "checkbox" || t == "radio") {
                        this.checked = select;
                    } else if (this.tagName.toLowerCase() == "option") {
                        var _select = jQuery(this).parent("select");
                        if (select && _select[0]
                                && _select[0].type == "select-one") {
                            // deselect all other options
                            _select.find("option").selected(false);
                        }
                        this.selected = select;
                    }
                });
    };
})(jQuery);
