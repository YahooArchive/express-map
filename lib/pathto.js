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

    var inModuleSystem = false;

    if (typeof define === 'function' && define.amd) {
        define(factory);
        inModuleSystem = true;
    }

    if (typeof exports === 'object') {
        module.exports = factory();
        inModuleSystem = true;
    }

    if (typeof YUI !== 'undefined' && YUI.add) {
        YUI.add('pathto', factory, '0.1.0', {es: true});
        inModuleSystem = true;
    }

    // Only assign to the root/gobal object when this code is not be executed in
    // an that's using a module system.
    if (!inModuleSystem && root) {
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
