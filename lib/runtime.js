configuration = require('./configuration.js');
tabProvider = require('./framework/tabProvider.js');
scriptInjector = require('./framework/scriptInjector.js');

var beginRequest = function(context, callback) {
        console.log('GLIMPSE - RUNTIME - Begin Request');


        //TODO: Run `BeginRequest` policies

        callback();
    },
    endRequest = function(context, callback) {
        console.log('GLIMPSE - RUNTIME - End Request');

        //TODO: Run `EndRequest` policies

        var response = null;
        tabProvider.execute(context, function(err, data) {
            console.log('GLIMPSE - RUNTIME - End Request - Tab data - ', data);

            //TODO: Find a better way to get this to injectScript
            context.response._glimpseTabData = data;

            callback();
        });
    },
    injectScript = function(context, callback) {
        console.log('GLIMPSE - RUNTIME - Inject Script');

        scriptInjector.execute(context);

        callback(null, { data: context.data });
    };

module.exports = {
    beginRequest: beginRequest,
    endRequest: endRequest,
    injectScript: injectScript
};
