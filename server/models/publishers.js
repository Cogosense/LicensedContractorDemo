var mongoose = require('mongoose');

// define the schema for the record schemas
var publisherSchema = mongoose.Schema({
    publisherName      : String,
});

// create the model for schema and expose it to our app
module.exports = mongoose.model('Publisher', publisherSchema);
