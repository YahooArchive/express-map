Express Map
===========

[![Build Status](https://travis-ci.org/yahoo/express-map.png?branch=master)](https://travis-ci.org/yahoo/express-map)
[![Dependency Status](https://gemnasium.com/yahoo/express-map.png)](https://gemnasium.com/yahoo/express-map)
[![npm Version](https://badge.fury.io/js/express-map.png)](https://npmjs.org/package/express-map)

Named routes and path lookups for Express that can be used on the server, in the 
browser, and inside your templates. Never hard-code any URL paths in your code
ever again, or even share your routes between the browser and server!

Overview
--------

### Goals

While building a website, it's common to reference URL paths in multiple places,
whether it be inside a template, inside some redirection code, or even inside
a client-side router.

If you ever have to change a URL though, it can be difficult to go through
all of your code, and manually change all of the URLs that you hard-coded into
your templates, server-side code, and client-side code.

Express Map solves this problem, and has even more advanced use cases, if you're
considering building an single-page application that shares client-side routes 
(using a client-side JavaScript framework like Backbone, the YUI App Framework, 
or any other library that provides a client-side router) and server-side routes 
together for progressive enhancement.

### How It Works

Express Map takes advantage of the route annotation system provided by
[Express Annotations](https://github.com/yahoo/express-annotations) to add
additional metadata to your routes.

Installation
------------

Install using npm:
```
$ npm install express-map
```

Usage
-----

### Extending an Express App

To use Express Map with an Express app, the app must first be extended. Use the
`extend()` method that Express Map exports:

```js
var express = require('express'),
    expmap  = require('express-map'),

    app = express();

expmap.extend(app);
```

**Note:** It's prefectly fine for the same Express app to be extended more than
once; after the first time the app is extended, the subsequent `extend()` calls
will be noops.

Once extended, the `app` object will contain three new methods:

## Methods

### `app.map(path, name)`

This function links together a particular URL path with a name that you provide,
that you'll use to reference that route everywhere else, so you don't need to
hard-code the URL path everywhere. An example:

```js
// Map our paths using Express Map
app.map('/blog/', 'blog');
app.map('/blog/:post', 'blog-post');

// Annotate our paths using Express Annotations
app.annotate('/blog/', {section: 'blog'});
app.annotate('/blog/:post', {section: 'blog'});


// Set up our actual routes
app.get('/blog/', function (req, res) {
    // Render the template for '/blog/' here
});

app.get('/blog/:post', function (req, res) {
    // Render the template for '/blog/:post' here
});
```

A common technique to use is to create a sugar method that combines the actual
`app.VERB()` route with `app.map()`, though we kept this separate for more
flexibility in how you use Express Map. The above is functionally equivalent to:

```js
function routePage(path, name, annotations, callback) {
    app.map(path, name);
    app.annotate(path, annotations);
    app.get(path, callback);
}

routePage('/blog/', 'blog', {section: 'blog'}, function (req, res) {
    // ...
});

routePage('/blog/:post', 'blog-post', {section: 'blog'}, function (req, res) {
    // ...
});
```

This sets up the mapped route for you, which you'll use in the next functions.

**Note:** You can map the same route more than once with different names, or 
provide an array as the `name` in `app.map`. This creates **aliases**, where
you can reference the path by either of the names later on, and it'll return
the same URL path. However, as we'll see later, each route only has one
canonical `name`, that you can access as part of the route object.

### `app.getRouteMap([annotations])`

This function returns the route map object, which contains the route metadata
serialized into an object that can be used anywhere. If we took the above routes,
the serialized object would look like this:

```js
{
    'blog': {
        path   : '/blog/',
        keys   : [],
        regexp : /^\/blog\/\/?$/i,
        annotations : {
            name    : 'blog',
            aliases : ['blog'],
            section : 'blog'
        }
    },

    'blog-post': {
        path   : '/blog/:post',
        keys   : [{ name: 'post', optional: false }],
        regexp : /^\/blog\/(?:([^\/]+?))\/?$/i,
        annotations : {
            name    : 'blog-post',
            aliases : ['blog-post'],
            section : 'blog'
        }
    }
}
```

If no `annotations` are passed in to `getRouteMap`, then all routes are
returned. Otherwise, the returned route map will be filtered by the annotations
passed in. For instance:

```js
var routeMap = app.getRouteMap({name: 'blog-post'});

// routeMap => Will contain only the `blog-post` route
```

Take a look at the test examples to see what other ways the route map can be
filtered by annotations.

### `app.getRouteParams([routeMap])`

This function returns a mapping of route parameter names to the functions used
in those route parameters created through the `app.param()` API. 

It takes in an optional parameter, `routeMap`, which is the filtered route map
object used to search for the specific route parameter logic. If not provided,
the full route map object (with no annotation filters) will be used.

It can be used in the following way:

```js
app.param('user', function (req, res, next, id) {
    User.find(id, function (err, user) {
        // ...
    });
});

app.param('post', function (req, res, next, id) {
    Post.find(id, function (err, post) {
        // ...
    });
});

var paramMap = app.getRouteParams();

/*
    paramMap => {
        'user': function (req, res, next, id) {
            User.find...
        },
        'post': function (req, res, next, id) {
            Post.find...
        }
    }
*/
```

## Static Methods

### `expmap.pathTo(routeMap)`

This static function on the Express Map instance (commonly `expmap`) takes in
a route map object, and returns a function with the following signature:

```js
function (routeName, [context])
```

This returned function is meant to take in a route name, and an optional context,
and return the contextualized URL path of that route.

For example, using our routes from before:

```js
var routeMap = app.getRouteMap(),
    pathTo   = expmap.pathTo(routeMap);

pathTo('blog-post', {post: 'hello-world'});
// => '/blog/hello-world'
```

You can take this function, and use it anywhere. A common use case is to turn
it into a helper function in a template, which you can see in [one of our
examples](https://github.com/yahoo/express-map/tree/master/examples/path-to-routes-in-templates).

Advanced Use Cases
------------------

Beyond the simple use case of being able to reference a route by name, and
not having to hard code the URL into your application, there are more advanced
uses of Express Map.

Creating a single-page application today, using a framework like Backbone or
the YUI App Framework, often comes with a few limitations. Rendering HTML on
the server is much faster than sending JSON to the client, and rendering it
there, which is commonly done in today's single page apps. 

There can be a noticeable performance problem when rendering data on slower 
devices, such as tablets and smartphones, as well as a loss in SEO, since search
engines will have a tougher time crawling your site. What we want to do is 
server-side rendering on the first page load, and then client-side rendering 
afterwards for the smooth UI with no page refreshes.

What Express Map can help you solve is to share routes between the browser and
the server, so you don't need to write these routes twice, since they're the
same.

We've provided examples for both Backbone and the YUI App Framework, so you
can see how a simple application that does this might work:

* [Backbone Shared Routes Example][]
* [YUI App Framework Shared Routes Example][]

License
-------

This software is free to use under the Yahoo! Inc. BSD license.
See the [LICENSE file][] for license text and copyright information.

[LICENSE file]: https://github.com/yahoo/express-map/blob/master/LICENSE.md

Contribute
----------

See the [CONTRIBUTING file][] for information on contributing back to Express
Map.

[CONTRIBUTING file]: https://github.com/yahoo/express-map/blob/master/CONTRIBUTING.md
