# Example: Simple Nested Menu

When building a website, you might reference a single URL multiple times, but
in different contexts. You could be creating a link to a specific section of
your site in a navigation menu, or referencing that same section, but inline in
a sentence in your content.

Once your site gets larger, it becomes a difficult process if you ever have to
change even one URL. You would need to go through all of your different HTML
templates, and change the link that was hardcoded into them.

Express Map solves this problem for you by letting you create *named routes*,
and letting you reference a single URL by a unique name, like you would with
any other variable.

Instead of having to update your URLs in your templates, whenever you change
the URL path in your Express routes, your template URLs will also be updated.

We'll take a look at how this works, by building a simple menu, with sections
and subsections.

### Setting up the routes

We'll start off by creating a simple utility function that lets us take
advantage of Express Map and Express Annotations. 

```js
// Utility function to route pages and add their annotations
function routePage(path, name, section) {
    app.get(path, function (req, res) {
        res.render('menu');
    });

    app.map(path, name);

    if (section) {
        app.annotate(path, {section: section});
    }
}
```

This is a sugar method on top of Express Map and Express Annotations, to
perform a common task that we need to do for all of the routes. 

We don't provide this functionality directly inside Express Map and Express Annotations, so that you have more flexibility when building your application.

What it does is simply set up the route to render the `menu` template for
every route, but also to give the route a specific name for the URL, and
annotate it with a `section`, if available.

We'll use this function in the following way:
```js
routePage('/', 'home');

routePage('/news/', 'news', 'stories');
routePage('/local/', 'local', 'stories');
routePage('/finance/', 'finance', 'stories');

routePage('/games/', 'games', 'entertainment');
routePage('/movies/', 'movies', 'entertainment');
routePage('/music/', 'music', 'entertainment');
routePage('/screen/', 'screen', 'entertainment');

```

We've now created several routes, and linked all of them to a name that we
can reference them by later on. For some of them, we've also added an
additional annotation, which is the section that they should fall under in our
menu.

### Setting up the template helper

Express Map provides a function, `pathTo`, which given the name of the route,
returns the URL that we provided as the path. We can create a template helper
out of `pathTo`, so that we can use it in our templates and reference routes
by their names.

We're using Handlebars, but this can be adapted to any templating system that
allows you to make custom helpers.
```js
pathTo = expmap.pathTo(app.getRouteMap());
hbs.helpers.pathTo = function (name, options) {
    return pathTo(name, options.hash);
};
```

Now, to use it in our templates, it'll look something like this:
```html
<a href="{{ pathTo "games" }}">Games</a>
```

And it'll render into this:
```html
<a href="/games/">Games</a>
```

And the benefit of this is so if you ever need to change the `/games/` URL,
say, to `/gaming/`, you don't need to go through every template to change it.
You would only need to change it once inside the route in your actual 
application.

### Rendering the data

Now that we've set up our routes, we'll look up the data for our routes using
Express Map's `findAll` function. This lets us look up and filter our routes
by their annotations.

In our case, we'll be looking up our routes by the `section` annotation, and
sorting them by section. We'll make it available on `app.locals.nav`, so it'll
be accessible by any route.
```js
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
```

For the routes we have right now, `app.locals.nav` will create an object that
looks like this:
```js
{
    stories: [
        { name: 'news' },
        { name: 'local' },
        { name: 'finance' }
    ],
    entertainment: [
        { name: 'games' },
        { name: 'movies' },
        { name: 'music' },
        { name: 'screen' }
    ]
}
```

And finally, we'll render this object out into our menu with this template:
```html
<div class="pure-menu pure-menu-open">
    <ul>
    {{#each nav}}
       <li class="pure-menu-heading">{{@key}}</li>
       {{#each this}}
           <li>
               <a href="{{ pathTo name }}">{{ capitalize name }}</a>
           </li>
       {{/each}}
    {{/each}}
    </ul>
</div>
```

Since we're using `pathTo`, from now on, as we add more routes or even remove
any routes, the navigation menu will update automatically, without us having
to touch the template ourselves.

Similarly, we can now always use the `{{ pathTo name }}` helper inside our
templates, and whenever we update our routes, the helper will also update our
URLs for us as well.
