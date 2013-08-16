'use strict';

var annotates = require('express-annotations'),
    state     = require('express-state');

exports.extend = extendApp;

function extendApp(app) {
    if (app['@map']) { return app; }

    // Add annotation and expose support.
    annotates.extend(app);
    state.extend(app);

    // Brand
    Object.defineProperty(app, '@map', {value: true});

    app.nameRoute             = annotateName;
    app.getNamedRoutes        = getNamedRoutes;
    app.getParams             = getParams;
    app.getRouteMap           = getRouteMap;
    app.exposeRoutes          = exposeRoutes;
    app.response.exposeRoutes = exposeRoutes;

    app.params = {};
    app.param(registerParam.bind(app));

    return app;
}

function annotateName(name, routePath) {
    /* jshint validthis:true */
    var routes;

    if (typeof name === 'string') {
        return this.annotate(routePath, {name: name});
    }

    routes = name;
    Object.keys(routes).forEach(function (name) {
        this.annotate(routes[name], {name: name});
    }, this);
}

function getNamedRoutes() {
    /* jshint validthis:true */
    return this.findAll('name');
}

function getParams(routes) {
    /* jshint validthis:true */
    var params    = this.params,
        paramsMap = {};

    if (!params || !Object.keys(params).length) {
        return paramsMap;
    }

    return routes.reduce(function (map, route) {
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

function getRouteMap(routes) {
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

function exposeRoutes(routes, options) {
    /* jshint validthis:true */
    var app = this.app || this,
        namespace, local;

    if (!Array.isArray(routes)) {
        options = routes;
        routes  = null;
    }

    routes || (routes = app.getNamedRoutes());
    options || (options = {});

    namespace = options.namespace || app.get('state namespace'),
    local     = options.local || app.get('state local');

    this.expose({
        routes: app.getRouteMap(routes),
        params: app.getParams(routes)
    }, namespace, local);
}

function registerParam(name, handler) {
    /*jshint validthis:true */
    if ((handler instanceof RegExp) || handler.length < 3) {
        this.params[name] = handler;
    }
}
