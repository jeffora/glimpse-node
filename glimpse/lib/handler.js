var glimpseData = require('./glimpseData/glimpseData.json');
var glimpseMetadata = require('./glimpseData/glimpseMetadata.json');

module.exports = function glimpseHandler (req, res) {
    var json = JSON.stringify({
        data: glimpseData,
        metadata: glimpseMetadata
    });
    res.set('Content-Type', 'application/x-javascript');
    res.send('glimpseInit(' + json + ')');
}