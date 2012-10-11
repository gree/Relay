var net = require('net');
var log_server_utils = require('./log_server_utils.js');
var user_utils = require('./user_utils.js');
var log_server;

function initialize_storage_folder(storage_folder){
    log_server_utils.initialize_storage_folder(storage_folder);
}

function start(port) {
    
    log_server = net.createServer(function(socket) {
        var bufferedData = [];

        socket.addListener("data",
        function(data) {
            bufferedData.push(data.toString());
        });

        socket.addListener("end",
        function() {
            log_server_utils.write_to_logged_data(bufferedData.join(''));
        });
    });    
    log_server.listen(port);
    user_utils.write_to_log('Server running at port:' + port);
}

function stop(){
    log_server.close();
    user_utils.write_to_log('Log Server not accepting any incoming connections now.');
}

exports.start = start;
exports.stop = stop;
exports.initialize_storage_folder = initialize_storage_folder; 