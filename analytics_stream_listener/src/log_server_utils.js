var fs = require('fs');
var path = require('path');

var user_utils = require('./user_utils.js');

var storage_folder;
var logged_data_folder; 
var logged_data_file;

//This is SYNCHRONOUS method.
function initialize_storage_folder(storage_folder_path){
    var mode = 0777;
    
    storage_folder = storage_folder_path;    
    if( !path.existsSync(storage_folder_path) ){
        fs.mkdirSync(storage_folder_path, mode);
    }
    
    logged_data_folder = storage_folder + '/logged_data/';
    if( !path.existsSync(logged_data_folder) ){
        fs.mkdirSync(logged_data_folder, mode);
    }
    logged_data_file = logged_data_folder + 'logged_lines.txt';
    
}

//Write the log lines to local storage which will be processed later
function write_to_logged_data(log_lines) {
    //user_utils.write_to_log("Received log line:" + log_lines);
    var stream = fs.createWriteStream(logged_data_file, { 
        flags: 'a'
    });
    stream.once('open',
    function(fd) {
        stream.end(log_lines, 'utf8');
    });
}

setInterval(function(){ user_utils.write_to_log("I am alive!");}, 30000);
exports.write_to_logged_data = write_to_logged_data;
exports.initialize_storage_folder = initialize_storage_folder; 