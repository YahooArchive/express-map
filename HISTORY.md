Express Map Change History
==========================

0.1.0 (2013-12-11)
------------------

* Added support for `getRouteMap(function (annotations) {...})` signature. This
  method now first delegates to express-annotations' `findAll()` method, giving
  it API parity. ([#4][])

* Added documentation to README. ([#14][] @clarle)

* Fixed test script so it runs on Windows ([#17][] @juandopazo)


[#4]: https://github.com/yahoo/express-map/issues/4
[#14]: https://github.com/yahoo/express-map/issues/14
[#17]: https://github.com/yahoo/express-map/issues/17


0.0.3 (2013-11-05)
------------------

* __[!]__ Changed `names` annotation to `aliases`. **Note:** The primiary `name`
  annotation still exists and has not been changed. ([#7][]: @clarle)

* Updated `methods` dependency to v0.1.0.

* Added unit tests. ([#5][]: @clarle, @imalberto)

* Added "modown" keyword to package.json. ([#11][])

* Added @clarle and @isao as contributors in package.json.


[#5]: https://github.com/yahoo/express-map/issues/5
[#7]: https://github.com/yahoo/express-map/issues/7
[#11]: https://github.com/yahoo/express-map/issues/11


0.0.2 (2013-09-12)
------------------

* __[!]__ Fixed issue where "canonical" `name` annotation was not being applied
  correctly. ([#2][]: @imalberto)

* Added JS Hint configuration. ([#1][]: @isao)


[#1]: https://github.com/yahoo/express-map/issues/1
[#2]: https://github.com/yahoo/express-map/issues/2


0.0.1 (2013-09-10)
------------------

* Initial release.
