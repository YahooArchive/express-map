var express    = require('express'),
    exphbs     = require('express3-handlebars'),
    expmap     = require('../..'),

    app = express(),
    hbs = exphbs.create({defaultLayout: 'main', helpers: {}}),
    pathTo;

// -- Configure App --

expmap.extend(app);

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// -- Routes --

// Utility functions to route pages and add their annotations
function routePage(path, name, section) {
    app.get(path, function (req, res) {
        res.render('menu');
    });

    app.map(path, name);

    if (section) {
        app.annotate(path, {section: section});
    }
}

routePage('/', 'home');

routePage('/news/', 'news', 'stories');
routePage('/local/', 'local', 'stories');
routePage('/finance/', 'finance', 'stories');

routePage('/games/', 'games', 'entertainment');
routePage('/movies/', 'movies', 'entertainment');
routePage('/music/', 'music', 'entertainment');
routePage('/screen/', 'screen', 'entertainment');

// -- Handlebars Helpers --

// Capitalization helper
hbs.helpers.capitalize = function (name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

// Create a helper out of the `pathTo` function
pathTo = expmap.pathTo(app.getRouteMap());
hbs.helpers.pathTo = function (name, options) {
    return pathTo(name, options.hash);
};

// Create 'nav' local with all routes and sections
app.locals.nav = app.findAll('section').get.reduce(function (sections, route) {
    var annotations = app.annotations[route.path],
        section = annotations.section;

    sections[section] = (sections[section] || []);

    sections[section].push({
        name : annotations.name
    });

    return sections;
}, {});

// Start app
app.listen(3000);
console.log('App listening on http://localhost:3000');
