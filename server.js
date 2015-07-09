
/**
 * Module dependencies
 */
var express = require('express');
// var passport = require('passport');
var _ = require('lodash');
var app = express();
var server = require('http').Server(app);


// var cluster = require('cluster');
// var cpuCount = Math.max(1, require('os').cpus().length);

var port = process.env.PORT || 3000;

// if(cluster.isMaster) {
//     for( var i = 0; i < cpuCount; i++ ) {
//       cluster.fork();
//     }

//     cluster.on('listening', function(worker) {
//         console.log('Worker ' + worker.process.pid + ' listening');
//     });

//     cluster.on('exit', function( worker ) {
//       console.log( 'Worker ' + worker.process.pid + ' died.' );
//       cluster.fork();
//     });

//     console.log('Initializing server with ' + cpuCount + ' threads');
//     return;
// }   

// // Bootstrap passport config
// require('./config/passport')(passport, config);

// Bootstrap application settings
require('./config/express')(app);

// Bootstrap routes
require('./routes')(app);

server.listen(port);
console.log('Express app started on port ' + port);
