var log_server = require('./log_server.js');

var http = require('http');

function start(port) {
    http_server = http.createServer(function(req, res) {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        res.end('Service is running');
    });
    http_server.listen(port);
    console.log('Health Check Http Server running at port:' + port);
}
exports.start = start;
