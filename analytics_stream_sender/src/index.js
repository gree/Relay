var log_server = require('./log_server.js');
var http_server = require('./http_server.js');
var user_utils = require('./user_utils.js');

var http_port;
var listener_port;
var analytics_file;
var processed_file;
var listener_ips;
var period_interval;
var file_suffix;

for (var i = 0; i < process.argv.length; i++) {
    var arg = process.argv[i];
    
    if (arg == '-http_port') {
        http_port = parseInt(process.argv[i + 1]);
    } else if (arg == '-listener_port') {
        listener_port = parseInt(process.argv[i + 1]);
    } else if (arg == '-listener_ips') {
        listener_ips = process.argv[i + 1].split(',');
        user_utils.write_to_log(JSON.stringify(listener_ips));
    } else if (arg == '-relay_folder') {
        relay_folder = process.argv[i + 1];
    } else if (arg == '-processed_file') {
        processed_file = process.argv[i + 1];
    } else if (arg == '-file_suffix') {
        file_suffix = process.argv[i + 1];
    } else if (arg == '-period_interval') {
        period_interval = parseInt(process.argv[i + 1]);
    }
}

//Generate a random number between 5 and max period
process_interval = Math.max( Math.floor((Math.random()*period_interval*2)) , 5);
user_utils.write_to_log("Interval taken to check for new files: " + process_interval);
log_server.start(listener_port, listener_ips, relay_folder, file_suffix, period_interval);
setInterval(function(){ log_server.process_analytics_files(listener_port, listener_ips, processed_file); }, (process_interval * 1000));

http_server.start(http_port);

process.on('SIGINT', function () {
  user_utils.write_to_log("***Kill Signal received. Trying to shut down in two seconds.***");
  setInterval(function(){  
      if (log_server.busy == 0) {
          user_utils.write_to_log("***Exiting Process.***");
          process.exit(code=0);
      }
      else {
          user_utils.write_to_log("***Still busy. Waiting for the log server to finish processing files. Polling in 2 second intervals.***");
      }
  }, 2000);
});