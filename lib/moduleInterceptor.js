var Module = require('module');

var _moduleRequire = Module.prototype.require;
var interceptions = {};

function glimpseRequireProxy (id) {
    var res = _moduleRequire.call(this, id);

    if (interceptions[id]) {
        if (!interceptions[id].cache) {
            interceptions[id].cache = interceptions[id](res);
        }
        res = interceptions[id].cache;
    }

    return res;
}

glimpseRequireProxy._glimpseProxy = true;

if (!_moduleRequire._glimpseProxy) {
    Module.prototype.require = glimpseRequireProxy;
}

module.exports = {
    intercept: function (id, interceptFunc) {
        interceptions[id] = interceptFunc;
    }
};
