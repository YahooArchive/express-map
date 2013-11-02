'use strict';

var express = require('express'),
    exphbs  = require('express3-handlebars'),
    expmap  = require('../../'), // express-map

    app = express();

// Extend `app` with express-map's and express-annotations' features. This will
// add the following properties and methods to the `app`:
//
// Properties: annotations, params
// Methods: annotate, findAll, map, getRouteMap, getRouteParams
expmap.extend(app);

// Sugar function that adds a basic `GET` route, maps it to a logical name, and
// annotates the route with the `label` for use in the primary navigation. This
// allows for a more declarative way to add the app's basic "page" routes.
function routePage(path, name, label) {
    app.get(path, function (req, res) {
        res.render(name, {pageTitle: label});
    });

    app.map(path, name);
    app.annotate(path, {label: label});
}

routePage('/',              'home',    'Home');
routePage('/about/',        'about',   'About');
routePage('/about/contact', 'contact', 'Contact Us');

// Creates a dynamic route which uses an `id` param, and maps it to the logical
// name: "post".
app.map('/posts/:id', 'post');
app.get('/posts/:id', function (req, res) {
    res.render('post', {id: req.params.id});
});

// Adds `pathTo()` method to the app which is bound to the app's route map which
// is a mapping of logical name -> route for all routes which have been assigned
// a name through the `app.map()` method. The `pathTo()` method makes it easy to
// generate a URL to the route by using its local name and an optional context.
app.pathTo = expmap.pathTo(app.getRouteMap());

// Creates the app's primary navigation data structure by finding all routes
// which have both a name and label annotation. `findAll()` returns a data
// structure which has the same "shape" as `app.routes`, so in this case only
// the routes for http GETs are used to build the primary nav.
app.locals.nav = app.findAll('name', 'label').get.map(function (route) {
    // Route annotations are stored on `app.annotations` by the route's `path`.
    var annotations = app.annotations[route.path];

    // Data used in side an `{{#each}}` Handlebars block.
    return {
        path : route.path,
        name : annotations.name,
        label: annotations.label
    };
});

// The Handlebars view engine is setup with a special `pathTo()` helper which
// delegates to the app's `pathTo()` method created above.
app.engine('hbs', exphbs({
    defaultLayout: 'main',
    extname      : '.hbs',

    helpers: {
        pathTo: function (name, options) {
            return app.pathTo(name, options.hash);
        }
    }
}));

app.set('view engine', 'hbs');

app.listen(3000, function () {
    console.log('Express Map Example App listening on port: 3000');
});
