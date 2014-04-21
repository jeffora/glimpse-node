var async = require('async');

module.exports = {
    execute: function (context, callback) {
        var result = {};

        async.each(configuration.tabs, function (elem, cb) {
            async.parallel({
                data: function (cb) {
                    elem.getData(context, cb); 
                },
                key: function (cb) {
                    elem.getKey(context, cb); 
                },
                name: function (cb) {
                    if (elem.getName) {
                        elem.getName(context, cb);
                    } else {
                        cb();
                    }
                }
            }, function (err, data) {
                if (err) {
                    // todo
                }

                result[data.key] = {
                    data: data.data,
                    name: data.name || data.key
                };

                cb()
            });
        }, function (err) {
            if (err) {
                // todo
            }

            callback(null, result);
        });
    }
}
