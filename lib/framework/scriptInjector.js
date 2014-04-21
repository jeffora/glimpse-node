var useragent = require('useragent');
var uuid = require('node-uuid');

var buildMetadata = function() {
        return 'var initMetadata = {\
            "version": "1.0.0",\
            "resources" : { \
                "glimpse_request" : "Request?requestId={requestId}&version={version}{&Callback}",\
                "glimpse_ajax" : "Ajax?parentRequestId={parentRequestId}&version={version}{&Callback}",\
                "glimpse_history" : "History?version={version}{&top}{&Callback}",\
                "glimpse_tab" : "Tab?requestId={requestId}&pluginKey={pluginKey}&version={version}{&Callback}",\
                "glimpse_paging" : "Pager?key={key}&pageIndex={pageIndex}&version={version}{&Callback}",\
                "glimpse_config" : "Config?version={version}",\
                "glimpse_logo" : "_logo.png?version={version}",\
                "glimpse_sprite" : "http://getglimpse.com/Content/_v1/app-sprite-new.png?version={version}",\
                "glimpse_popup" : "Client-Popup.html?n=glimpse_popup&version={version}&requestId={requestId}",\
                "glimpse_version_check" : "http://localhost:28785/api/release/check?callback=?&Glimpse=0.79&Glimpse.Elmah=0.9.2&stamp={stamp}"\
            },\
            "plugins": {\
                "ReqRes":{ keysHeadings: true }\
            }\
        };';
    },
    buildPayload = function(context) {
        //TODO: update to be generic
        var res = context.response,
            req = context.request;

        var resData = {};
        for (var k in res) {
            if (!res[k] || typeof res[k] !== 'function')
                resData[k] = (res[k] || '--').toString();
        }

        var reqData = {};
        for (var k in req) {
            if (!req[k] || typeof req[k] !== 'function')
                reqData[k] = (req[k] || '--').toString();
        }
 
        var glimpseId = uuid.v4();
        var ua = useragent.parse(req.headers['user-agent']);

        var data = {
            "method" : req.method,
            "browser": req.headers["user-agent"],
            "clientId" : ua.family + ' ' + ua.major + '.' + ua.minor + '.' + ua.patch,
            "dateTime" : new Date(),
            "requestId" : glimpseId,
            "isAjax" : !!req.xhr,
            "uri" : req.url,
            "data" : context.response._glimpseTabData
        };

        return 'var initData = ' + JSON.stringify(data) + ';';
    },
    buildScripts = function(context) {
        var content = '<script type="text/javascript" src="/scripts/glimpse.js"></script>';
        content += '<script type="text/javascript">' + buildPayload(context) + buildMetadata();
        content += 'glimpse.data.initMetadata(initMetadata); glimpse.data.initData(initData);</script>';

        return content;
    },
    execute = function(context) { 
        var contentType = context.response.getHeader('content-type');
        if (context.data && contentType && contentType.indexOf('text/html') > -1) { 
            var payload = buildScripts(context);

            //TODO: need to update to replace last occurance 
            context.data = context.data.replace(/<\/body>/, payload + '</body>');

            var contentLength = parseInt(context.response.getHeader('Content-Length'));
            context.response.setHeader('Content-Length', contentLength + payload.length);
        } 
    };

module.exports = {
    execute: execute
}