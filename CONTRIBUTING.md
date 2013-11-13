Contributing Code to `express-map`
----------------------------------

This component follows the same contribution model used by [Mojito][], with
more details available at [Contributing Code to Mojito][].

Please be sure to sign our [CLA][] before you submit pull requests or otherwise contribute to `express-map`. This protects `express-map` developers, who rely on [express-map's BSD license][].

[express-map's BSD license]: https://github.com/yahoo/express-map/blob/master/LICENSE.md
[CLA]: http://developer.yahoo.com/cocktails/mojito/cla/
[Mojito]: https://github.com/yahoo/mojito
[Contributing Code to Mojito]: https://github.com/yahoo/mojito/wiki/Contributing-Code-to-Mojito

Dev mode installation
---------------------

- The main source files are located under `lib/`.
- Unit tests are located under `tests/unit/*`.
- Examples are located under `examples/`.

To install the dependencies:

    npm install

To run the unit tests (with coverage by default):

    npm test

To lint the app lib folder:

    npm run lint
    
Release checklist
-----------------

* Verify that [HISTORY.md] is updated
* Verify that [README.md] is updated
* Bump the version in [package.json]
* Commit to master
* Push to npm using `npm publish`
* Create a [new release] entry including the tag for the new version, being sure to document any deprecations

[HISTORY.md]: https://github.com/yahoo/express-map/blob/master/HISTORY.md
[README.md]: https://github.com/yahoo/express-map/blob/master/README.md
[package.json]: https://github.com/yahoo/express-map/blob/master/package.json
[new release]: https://github.com/yahoo/express-map/releases/new
