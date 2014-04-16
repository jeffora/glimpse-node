var uuid = require('node-uuid');
var useragent = require('useragent');

module.exports = interceptExpress;

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
    req._glimpseId = uuid.v4();

    console.log('Binding glimpse request for ', req.path);
    // TODO: gotta be a better way to do this
    res.end = bindResponseEnd(req, res);
    res.render = bindResponseRender(req, res);

    next();
}

function bindResponseRender (req, res) {
    var resRender = res.render;
    function glimpseResRender (view, extraData) {
        extraData = extraData || {};
        extraData.getGlimpseData = function () {
            var resData = {};
            for (var k in res) {
                resData[k] = (res[k] || '[NULL]').toString();
            }
            var reqData = {};
            for (var k in req) {
                reqData[k] = (req[k] || '[NULL]').toString();
            }
            var ua = useragent.parse(req.headers['user-agent']);
            var data = {
                "method" : req.method,  
                "browser": req.headers["user-agent"],
                "clientId" : ua.family + ' ' + ua.major + '.' + ua.minor + '.' + ua.patch,
                "dateTime" : new Date(),
                "requestId" : req._glimpseId,
                "isAjax" : !!req.xhr,
                "uri" : req.url,  
                "data" : {
                    "ReqRes": { 
                        "name" : "Req/Res", 
                        "data" : {
                            useragent: ua,
                            requestData: reqData,
                            responseData: resData
                        }
                    }
                }
            };

            return 'var initData = ' + JSON.stringify(data) + ';';
        };

        var args = Array.prototype.slice.call(arguments, 2);
        args.unshift(extraData);
        args.unshift(view);

        return resRender.apply(this, args);
    };

    return glimpseResRender;
}

function bindResponseEnd (req, res) {
    var resEnd = res.end;
    function glimpseResEnd () {
        console.log('Glimpse end request for ', req.path);

        return resEnd.apply(this, arguments);
    }

    return glimpseResEnd;
}