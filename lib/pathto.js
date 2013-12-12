/*
Copyright (c) 2013, Yahoo! Inc. All rights reserved.
Copyrights licensed under the New BSD License.
See the accompanying LICENSE file for terms.
*/

// The `pathTo()` function is written in ES3 so it's able to run in all
// JavaScript environments. It also uses a UMD+YUI wrapper to register itself in
// a JavaScript module system when this code is executing in one.

(function (root, factory) {
    /* global define */
    /* jshint node:true, yui:true */
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else if (typeof YUI === 'function' && YUI.add) {
        YUI.add('pathto', factory, '0.1.0');
    } else if (root) {
        root.pathTo = factory();
    }
})(typeof global !== 'undefined' ? global : this, function () {
    'use strict';

    return function pathTo(routeMap) {
        return function (routeName, context) {
            var route = routeMap[routeName],
                path, keys, i, len, key, param, regex;

            if (!route) { return ''; }

            path = route.path;
            keys = route.keys;

            if (context && (len = keys.length)) {
                for (i = 0; i < len; i += 1) {
                    key   = keys[i];
                    param = key.name || key;
                    regex = new RegExp('[:*]' + param + '\\b');
                    path  = path.replace(regex, context[param]);
                }
            }

            // Replace missing params with empty strings.
            return path.replace(/([:*])([\w\-]+)?/g, '');
        };
    };
});
