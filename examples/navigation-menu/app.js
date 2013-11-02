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

routePage('/sports/', 'sports-home', 'sports');
routePage('/sports/baseball/', 'baseball', 'sports');
routePage('/sports/football/', 'football', 'sports');
routePage('/sports/basketball/', 'basketball', 'sports');

routePage('/finance/', 'finance-home', 'finance');
routePage('/finance/portfolio/', 'portfolio', 'finance');
routePage('/finance/markets/', 'markets', 'finance');
routePage('/finance/personal-finance/', 'personal-finance', 'finance');

// -- Handlebars Helpers --


// Deslugify helper: 'personal-finance' => 'Personal Finance'
hbs.helpers.deslugify = function (name, options) {
    var words    = name.split('-'),
        capWords = words.map(function (word) {
            return word.charAt(0).toUpperCase() + word.slice(1);
        });

    return capWords.join(' ');
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

app.listen(3000);
