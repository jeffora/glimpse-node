var Module = require('module');
var util = require('util');

_oldRequire = Module.prototype.require

Module.prototype.require = function(id) {
  // console.log('Glimpse proxy require for ', id); 
  return proxyModule.call(this, id);
}

// _oldLoad = Module._load;
// Module._load = function(id) {
//   console.log('Glimpse proxy _load for ', arguments); 
//   return _oldLoad.apply(this, arguments);
// }

function proxyModule(id) {
    var res = _oldRequire.call(this, id);
    if (id === './ex.js') {
        var cstr = res.prototype.constructor;
        res.prototype.constructor = function () {
            var app = cstr.apply(null, arguments);
            app.localMethod = function () { console.log('proxyLocalMethod'); };
            // console.log(app);
            // app.use(glimpseMiddleware);
            return app;
        };
    } 
    return res;
}


var example = require('./ex.js');
require('express');

console.log('Calling example');
var a = example();

console.log('Calling localMethod');
a.localMethod();

console.log('calling example extra method');
example.extraMethod();