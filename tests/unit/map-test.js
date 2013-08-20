/*jslint nomen:true, node:true*/
/*global describe, beforeEach, afterEach, it*/

'use strict';

var assert = require('chai').assert,
    libmap = require('../../'),
    app;

describe('test suite name', function () {

    beforeEach(function () {
        app = {
            response: { },
            param: function () { }
        };
        libmap.extend(app);
    });

    afterEach(function () {
        app = null;
    });

    describe('libmap', function () {
        it('should extend with extra methods', function () {
            assert.isFunction(app.map);
            assert.isFunction(app.getRouteMap);
            assert.isFunction(app.getRouteParams);

            assert.isObject(app.params);
        });
    });

});
