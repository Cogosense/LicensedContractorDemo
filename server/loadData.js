var debug = require('debug')('lc:io');
var async = require('async');
var mongoose = require('mongoose');
var csv = require('csv');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var chokidar = require('chokidar');

var Inspection = mongoose.model('Inspection');
var watcher = chokidar.watch(path.join(__dirname, '../assets'), {ignored: /^\./, persistent: true});
var EEXIST = new Error('EEXIST');

function collectionExists(collectionName, callback) {
    mongoose.connection.db.listCollections({name: collectionName})
    .next(function(err, collinfo) {
        debug("got collection list");
        if(err)
            callback(err);
        else if (collinfo)
            callback(EEXIST);
        else
            callback();
    });
}

function createCollection(input, collectionName, callback) {
    var outputSchemaName = collectionName.charAt(0).toUpperCase() + collectionName.slice(1, -1);
    var Schema = mongoose.model(outputSchemaName);
    var parse = csv.parse({delimiter:','});
    var columns;
    var transform = csv.transform(function(record, next){
        if(!columns) {
            columns = record;
            return next();
        }
        var json = _.object(columns, record);
        debug(JSON.stringify(json) + '\n');
        next(null, json);
    });
    //input.pipe(parse).pipe(transform).pipe(process.stdout);
    input.pipe(parse).pipe(transform).pipe(Schema.writeStream());
    input
        .on('finish', function(){
            callback();
        })
        .on('error', function(err){
            callback(err);
        });
}

function dropCollection(collectionName, callback) {
     mongoose.connection.collections[collectionName].drop(function(err) {
         callback(err);
     });
}

module.exports = {
    autoUpdate: function() {
        debug("watching directory \"../assets\" for CSV files");
        watcher
            .on('add', function(filepath) {
                debug('File', filepath, 'has been added');
                var collectionName = path.basename(filepath, '.csv');
                if(collectionName && collectionName.endsWith('s')) {
                    async.series([
                        function(callback) {
                            collectionExists(collectionName, callback);
                        },
                        function(callback) {
                            createCollection(fs.createReadStream(filepath), collectionName, callback);
                        }
                    ],
                    function(err, results) {
                         if(err === EEXIST)
                             debug('collection: ' + collectionName + ' already exists');
                         else if (err)
                             debug('error reloading collection: ' + collectionName + ' error: ' + err);
                         else
                             debug('collection reloaded: ' + collectionName);
                    });
                }
            })
            .on('change', function(filepath) {
                debug('File', filepath, 'has been changed');
                var collectionName = path.basename(filepath, '.csv');
                if(collectionName && collectionName.endsWith('s')) {
                    async.series([
                        function(callback) {
                            dropCollection(collectionName, callback);
                        },
                        function(callback) {
                            createCollection(fs.createReadStream(filepath), collectionName, callback);
                        }
                    ],
                    function(err, results) {
                         if(err)
                             debug('error reloading collection: ' + collectionName + ' error: ' + err);
                         else
                             debug('collection reloaded: ' + collectionName);
                    });
                }
            })
            .on('unlink', function(filepath) {
                debug('File', filepath, 'has been removed');
                var collectionName = path.basename(filepath, '.csv');
                if(collectionName && collectionName.endsWith('s')) {
                    async.series([
                        function(callback) {
                            dropCollection(collectionName, callback);
                        }
                    ],
                    function(err) {
                         if(err)
                             debug('error dropping collection: ' + collectionName + ' error: ' + err);
                         else
                             debug('collection dropped: ' + collectionName);
                    });
                }
            })
            .on('error', function(err) {debug('Error happened', err);});
    }
}
