var mongoose = require('mongoose');

// define the schema for the record schemas
var surreyPermitSchema = mongoose.Schema({
    Bingo_id          : String,
    permitNumber      : String,
    inspectionResult  : String,
    inspectionNotes   : String
});

// create the model for schema and expose it to our app
module.exports = mongoose.model('SurreyPermit', surreyPermitSchema);
