var Module = require('module');
var util = require('util');
var useragent = require('useragent');
var uuid = require('node-uuid');

_oldRequire = Module.prototype.require

Module.prototype.require = function(id) {
  // console.log('Glimpse proxy require for ', id); 
  return proxyModule.call(this, id);
}

function proxyModule(id) {
    var res = _oldRequire.call(this, id);
    if (id === 'express') {
        console.log('proxying express');
        var expr = function () {
            var app = res.apply(null, arguments);
            var appListen = app.listen;
            app.listen = function runGlimpseEnabled () {
                app.get('/glimpse', glimpseHandler);
                return appListen.apply(this, arguments);
            };
            // console.log(app);

            // var appUse = app.use;
            // app.use = function (mw) {
            //     var wrappedMw = function () {
            //         console.log('Middleware called ', mw.toString().slice(0, 30));
            //         return mw.apply(this, arguments);
            //     };
            //     return appUse.call(this, wrappedMw);
            // };
            app.use(glimpseMiddleware);
            return app;
        };
        for (var k in res) {
            expr[k] = res[k];
        }
        return expr;
    } 
    return res;
}

var express = require('express');
var glimpseHandler = require('./lib/handler.js');

function bindResponseEnd (req, res) {
    var resEnd = res.end;
    function glimpseResEnd () {
        console.log('Glmipse end request for ', req.path);
        // console.log(this);
        return resEnd.apply(this, arguments);
    }
    
    return glimpseResEnd;
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

function glimpseMiddleware (req, res, next) {
    console.log('Binding glimpse request for ', req.path);
    req._glimpseId = uuid.v4();
    // console.log(this);
    res.end = bindResponseEnd(req, res);
    res.render = bindResponseRender(req, res);
    var resWrite = res.write;
    res.write = function (data) {
        console.log('Proxy write: ', data);
        return resWrite.apply(this, arguments);
    };

    next();
}
