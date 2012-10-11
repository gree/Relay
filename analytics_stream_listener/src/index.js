var log_server = require('./log_server.js');
var http_server = require('./http_server.js');
var user_utils = require('./user_utils.js');

var http_port;
var log_server_port;
var storage_folder;

for (var i = 0; i < process.argv.length; i++) {
    var arg = process.argv[i];
    
    if (arg == '-http_port') {
        http_port = parseInt(process.argv[i + 1]);
    } else if (arg == '-log_server_port') {
        log_server_port = parseInt(process.argv[i + 1]);
    } else if (arg == '-storage_folder') {
        storage_folder = process.argv[i + 1];
    }
    
    
}

log_server.initialize_storage_folder(storage_folder);

log_server.start(log_server_port);
http_server.start(http_port);

process.on('SIGINT', function () {
  user_utils.write_to_log("***Kill Signal received. Exiting in 2 seconds.***");
  log_server.stop();
  setTimeout(function(){  
      user_utils.write_to_log("***Exiting Process.***");
      process.exit(code=0);
  }, 2000);
});