var mongoose = require('mongoose');

// define the schema for the record schemas
var burnabyPermitSchema = mongoose.Schema({
    Bingo_id          : String,
    permitNumber      : String,
    inspectorName     : String
});

// create the model for schema and expose it to our app
module.exports = mongoose.model('BurnabyPermit', burnabyPermitSchema);
