var mongoose = require('mongoose');

// define the schema for the record schemas
var attributeSchema = mongoose.Schema({
    recordName      : String,
    attributes      : [{
        label       : String,
        name        : String,
        type        : String,
        available   : Boolean,
        renderable  : Boolean
    }]
});

// create the model for schema and expose it to our app
module.exports = mongoose.model('Attribute', attributeSchema);
