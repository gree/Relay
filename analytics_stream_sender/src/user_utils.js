var fs = require('fs');

function write_to_log(line) {
    var line = new Date() + " | " + line;
    console.log(line);
}

exports.write_to_log = write_to_log;