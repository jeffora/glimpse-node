var useragent = require('useragent');

module.exports = {
    getData: function(context, callback) {
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
  
        var ua = useragent.parse(req.headers['user-agent']);

    	var result = {
                useragent: ua,
                requestData: reqData,
                responseData: resData
            };

        callback(null, result);
    },
    getKey: function(context, callback) {
        callback(null, 'ReqRes');
    },
    getName: function(context, callback) {
        callback(null, 'Req/Res');
    }
}
