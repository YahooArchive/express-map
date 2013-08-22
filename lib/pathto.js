// The `pathTo()` function is written in ES3 so it's serializable and able to
// run in all JavaScript environments.

module.exports = function pathTo(routeMap) {
    return function (routeName, context) {
        var route = routeMap[routeName],
            path, keys, i, len, key, param, regex;

        if (!route) { return ''; }

        path = route.path;
        keys = route.keys;

        if (context && (len = keys.length)) {
            for (i = 0; i < len; i += 1) {
                key   = keys[i];
                param = key.name || key;
                regex = new RegExp('[:*]' + param + '\\b');
                path  = path.replace(regex, context[param]);
            }
        }

        // Replace missing params with empty strings.
        return path.replace(/([:*])([\w\-]+)?/g, '');
    };
};
