var fs = require('fs');
var path = require('path');
var net = require('net');

var user_utils = require('./user_utils.js');

var relay_folder;
var sending_folder;
var file_suffix;
var period_interval;
var busy=0; //A monitor to indicate whether the server is busy processing a file or not. The count of busy is the number of files it is currently processing.

function start(listener_port, listener_ips, relay_folder_path, file_suffix_name, period_interval_name) {
    user_utils.write_to_log('Server sending to port:' + listener_port + ' on the ips:' + JSON.stringify(listener_ips));
    relay_folder = relay_folder_path;
    file_suffix = file_suffix_name;
    period_interval = period_interval_name;
}

function process_analytics_files(listener_port, listener_ips, processed_file) {
    //If process is busy then abort processing the next cycle.
    if (busy !== 0) {
        user_utils.write_to_log("WARN Process is still busy. Probably a previous cycle. Not processing any more new files.");
        return;
    }
    //Getting the list of files in processed_for_vertica directory
    user_utils.write_to_log("Searching " + relay_folder + " for " + file_suffix + " files");
    var files_in_relay_folder = fs.readdirSync(relay_folder);
    var i=0;
    for(var index in files_in_relay_folder) {
        var file_name = files_in_relay_folder[index];
        //Grab files containing .send_to_vertica
        if (file_name.indexOf(file_suffix) !== -1){
            //Get the timestamp of the file.
            var files_unix_time = file_name.split('.')[2];
            var last_two_intervals_unix_time = ( Math.floor((new Date().getTime())/ ( period_interval * 1000) ) * period_interval ) - ( period_interval * 2 );
            user_utils.write_to_log("Max time to copy over: " + last_two_intervals_unix_time);
            user_utils.write_to_log("File's unix time: " + files_unix_time);
            //If the file's time is older than two minutes ago time then process it.
            if (files_unix_time <= last_two_intervals_unix_time) {
                var logged_data_file = relay_folder + file_name;
                var list_of_ips = listener_ips.slice(0);
                connect_to_listener(listener_port, list_of_ips, logged_data_file, processed_file);
                //Increment the counter only if you process a file.
                i++;
            }
            //Break the loop if more than 7 files are processed.
            if (i >= 7) {
                break;
            }
        }//End if
        
    }//End for
    
}

function connect_to_listener(listener_port, list_of_ips, intermediate_file, processed_file) {
    
    if (list_of_ips.length == 0) {
        user_utils.write_to_log("ERROR No listeners responded.");
        return;
    }
    
    var index = Math.max(0, Math.floor((Math.random()*(list_of_ips.length))) );
    user_utils.write_to_log(index);
    var host = list_of_ips[index];

    user_utils.write_to_log("Connecting to " + host + " on " + listener_port);
    var connection = net.createConnection(listener_port, host);
    
    connection.setTimeout(30000, function(){
        user_utils.write_to_log("ERROR Connection timed out.");
        user_utils.write_to_log("ERROR Trying to end Connection...");
        connection.end();
        // list_of_ips.splice(index, 1); // Remove it.
        // user_utils.write_to_log("after the timeout, trying to reConnect to " + host + " on " + listener_port + " for file " + intermediate_file);
        //     connect_to_listener(listener_port, list_of_ips, intermediate_file, processed_file);
    });
    
    connection.on('timeout', function(){
        user_utils.write_to_log("ERROR TIMEOUT Connection timed out!!!!!");
    });
    
    connection.on('connect', function(){
        user_utils.write_to_log("Connected to " + host + " on " + listener_port + " for file " + intermediate_file);
        user_utils.write_to_log("Trying to send data");
        send_data (connection, intermediate_file, processed_file);
    });

    connection.on('error', function(err){
        user_utils.write_to_log("ERROR while connecting to " + host + " on " + listener_port + " for file " + intermediate_file + " " + err);
        list_of_ips.splice(index, 1); // Remove it.
        connect_to_listener(listener_port, list_of_ips, intermediate_file, processed_file);
    });
    
    connection.on('end', function() {
         user_utils.write_to_log('Connection disconnected');
    });
    
}

function send_data(connection, intermediate_file, processed_file) {
    //Read the data from the file and then send it over the established connection.
    fs.readFile(intermediate_file, function (err, data) {
        //Increment the busy monitor to indicate to not stop it.
        busy += 1;
        
        if (err) {
            user_utils.write_to_log("ERROR while reading file " + intermediate_file);
            busy -= 1;
        } else {
                connection.on('end', function() {
                    if (typeof processed_file !== 'undefined') {
                        // processed_file argument exists, write to it then delete intermediate file
                        var write_stream = fs.createWriteStream(processed_file, { flags: 'a', encoding: 'utf8', mode: 0666 });
                        write_stream.on('error', function (exception) { 
                            throw exception;
                        });
                        write_stream.end(data.toString(), 'utf8');
                        write_stream.destroySoon();
                        write_stream.on('close', function(){
                            delete_file(intermediate_file);
                            busy -= 1;
                        });
                    } else {
                        // processed_file argument does not exist, delete intermediate file immediately
                        delete_file(intermediate_file);
                        busy -= 1;                    
                    }
                });
            
            //user_utils.write_to_log("Data read" + data.toString());
            //Writing to the conneciton.
            connection.write(data.toString());            
        }
                
        connection.end();        
    });   
}

function delete_file(file) {
    user_utils.write_to_log("Trying to delete file " + file);
    var delete_err = fs.unlinkSync(file);
    //Decrement the counter to denote that the process is free to be closed down.
    if (delete_err) { 
        user_utils.write_to_log(delete_err)
    };
}

exports.start = start;
exports.process_analytics_files = process_analytics_files;
exports.busy = busy;