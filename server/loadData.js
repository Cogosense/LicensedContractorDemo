var debug = require('debug')('lc:io');
var mongoose = require('mongoose');
var csv = require('csv');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');

var Contractor = mongoose.model('Contractor');
var Inspection = mongoose.model('Inspection');

function loadData(input, outputSchema) {
    var parse = csv.parse({delimiter:','});
    var columns;
    var transform = csv.transform(function(record, callback){
        if(!columns) {
            columns = record;
            return callback();
        }
        var json = _.object(columns, record);
        debug(JSON.stringify(json) + '\n');
        callback(null, json);
    });
    //input.pipe(parse).pipe(transform).pipe(process.stdout);
    input.pipe(parse).pipe(transform).pipe(outputSchema.writeStream());
}

module.exports = {
    contractors: function() {
        debug("loading licensed contractor data from CSV");
        var input = fs.createReadStream(path.join(__dirname, '../assets/contractors.csv'));
        loadData(input, Contractor);
    },
    inspections: function() {
        debug("loading licensed contractor data from CSV");
        var input = fs.createReadStream(path.join(__dirname, '../assets/inspections.csv'));
        loadData(input, Inspection);
    }
}
