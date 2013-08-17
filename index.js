'use strict';

var annotations = require('express-annotations'),
    state       = require('express-state');

exports.extend = extendApp;

function extendApp(app) {
    if (app['@map']) { return app; }

    // Add Express Annotations and Express State support to the `app`.
    annotations.extend(app);
    state.extend(app);

    // Brand
    Object.defineProperty(app, '@map', {value: true});

    app.map                   = mapRoute;
    app.getRouteMap           = getRouteMap;
    app.exposeRoutes          = exposeRoutes;
    app.response.exposeRoutes = exposeRoutes;

    // Sets up registry for simple param handlers that are either regular
    // expressions or basic, non-middleware functions. These param handlers are
    // exposed along with the exposed routes.
    app.params = {};
    app.param(registerParam.bind(app));

    return app;
}

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

    // Creates a mapping of name -> route configuration object used for
    // serialization. The route objects are shallow copies of a route's primary
    // data.
    return routes.map(function (route) {
        return {
            path       : route.path,
            keys       : route.keys,
            regexp     : route.regexp,
            annotations: route.annotations
        };
    }).reduce(function (map, route) {
        var name = route.annotations.name;
        if (name) { map[name] = route; }
        return map;
    }, {});
}

function exposeRoutes(routeMap, options) {
    /* jshint validthis:true */
    var app = this.app || this,
        namespace, local;

    if (!Array.isArray(routeMap)) {
        options  = routeMap;
        routeMap = null;
    }

    // If no `routeMap` was specificed, use all mapped routes by default.
    routeMap || (routeMap = app.getRouteMap());
    options || (options = {});

    // Defaults to Express State's settings values for this app.
    namespace = options.namespace || app.get('state namespace'),
    local     = options.local || app.get('state local');

    return this.expose({
        routes: routeMap,
        params: getRouteParams(routeMap, this.params)
    }, namespace, local);
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

// -- Helper Functions ---------------------------------------------------------

function getRouteParams(routeMap, params) {
    var paramsMap = {};

    if (!params || !Object.keys(params).length) {
        return paramsMap;
    }

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
