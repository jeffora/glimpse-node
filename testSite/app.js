require('../index.js');
var express = require('express');
var app = express();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.session({ secret: 'glimpse-test-site' }));
app.use(express.static(__dirname + '/static'));
app.engine('jade', require('jade').__express);

app.set('view engine', 'jade');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.render('index');
});

app.listen(4000);