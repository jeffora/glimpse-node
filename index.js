var interceptor = require('./lib/moduleInterceptor.js');

// TODO: module to load 'plugins'
interceptor.intercept('express', require('./lib/express/index.js'));
