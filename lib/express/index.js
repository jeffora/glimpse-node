var useragent = require('useragent');
var runtime = require('../runtime.js');

module.exports = interceptExpress;


// TODO: Need to do this better 
var config = require('../configuration.js');
var reqResTab = require('./tabs/requestResponse.js');
config.tabs.push(reqResTab);


// TODO: move this into a separate module
function interceptExpress (express) {
    var expressWrapper = function () {
        var app = express.apply(this, arguments);

        app.use(glimpseMiddleware);

        return app;
    };
    for (var k in express) {
        expressWrapper[k] = express[k];
    }
    return expressWrapper;
}

function glimpseMiddleware (req, res, next) {
    console.log('EXPRESS - Begin Request - ' + req.path);

    // TODO: gotta be a better way to do this
    res.end = bindResponseEnd(req, res);

    runtime.beginRequest({
        request: req,
        response: res
    }, function (err) {
        if (err) {
            // TODO, hopefully this doesn't break
            // but we should still call next if it does
        }
        next();
    });
}

function bindResponseEnd (req, res) {
    var resEnd = res.end;
    function glimpseResEnd (data, encoding) {
        console.log('EXPRESS - End Request');

        var that = this;
        var endArgs = Array.prototype.slice.call(arguments, 2);
 
        runtime.endRequest({
            request: req,
            response: res
        }, function (err) {
            if (err) {
                // TODO, hopefully this doesn't break
                // but we should still call next if it does
            }

            // TODO, switch endRequest and injectScript over to use
            // async.series() or similar
            runtime.injectScript({
                request: req,
                response: res,
                data: data,
                encoding: encoding
            }, function (err, result) {
                if (err) {
                    // TODO, hopefully this doesn't break
                    // but we should still call next if it does
                }

                result = result || {};

                endArgs.unshift(result.encoding || encoding);
                endArgs.unshift(result.data || data);

                resEnd.apply(that, endArgs);
            }); 

 
        }); 
    }

    return glimpseResEnd;
}
