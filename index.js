'use strict';

var annotations = require('express-annotations'),
    pathTo      = require('./lib/pathto');

exports.extend = extendApp;
exports.pathTo = pathTo;

function extendApp(app) {
    if (app['@map']) { return app; }

    // Add Express Annotations support to the `app`.
    annotations.extend(app);

    // Brand.
    Object.defineProperty(app, '@map', {value: true});

    app.map            = mapRoute;
    app.getRouteMap    = getRouteMap;
    app.getRouteParams = getRouteParams;

    // Sets up registry for simple param handlers that are either regular
    // expressions or basic, non-middleware functions. These param handlers are
    // exposed along with the exposed routes.
    app.params = {};
    app.param(registerParam.bind(app));

    return app;
}

// TODO: Should this accept an object of mappings? If so what should be the key,
// and what should be the value?
function mapRoute(routePath, name) {
    /* jshint validthis:true */
    return this.annotate(routePath, {name: name});
}

function getRouteMap(annotations) {
    /* jshint validthis:true */

    if (!Array.isArray(annotations)) {
        annotations = [].slice.call(arguments);
    }

    // Gather all mapped/named routes that have the specified `annotations`.
    var routes = this.findAll(annotations.concat('name'));

    // Creates a mapping of name -> route object. The route objects are shallow
    // copies of a route's data plus the set of HTTP methods to which the
    // resource will respond.
    return routes.reduce(function (map, route) {
        var name = route.annotations.name,
            entry;

        // Route must have a name to be mapped by a name.
        if (!name) { return map; }

        // Find or create the entry in the route map for the current `route`.
        entry = map[name] || (map[name] = {
            path       : route.path,
            keys       : route.keys,
            regexp     : route.regexp,
            annotations: route.annotations,
            methods    : {}
        });

        // Update the set of HTTP methods with this route's the verb in which
        // this route was registered.
        entry.methods[route.method] = true;

        return map;
    }, {});
}

function getRouteParams(routeMap) {
    /* jshint validthis:true, expr:true */
    var params    = this.params,
        paramsMap = {};

    if (!params || !Object.keys(params).length) {
        return paramsMap;
    }

    routeMap || (routeMap = this.getRouteMap());

    // Creates a param -> handler map for the params used in the specified
    // `routeMap` which have handlers.
    return Object.keys(routeMap).reduce(function (map, routeName) {
        var route = routeMap[routeName];

        route.keys.forEach(function (p) {
            var paramName = p.name,
                param     = params[paramName];

            if (param) {
                map[paramName] = param;
            }
        });

        return map;
    }, paramsMap);
}

function registerParam(name, handler) {
    /*jshint validthis:true */

    // This unobtrusive params bookkeeper stores a reference to any param
    // handlers that are regular express or basic, non-middleware functions. It
    // is assumed that the Express Params package is the next param registration
    // function to be called.
    if ((handler instanceof RegExp) || handler.length < 3) {
        this.params[name] = handler;
    }
}
