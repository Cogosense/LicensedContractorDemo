var mongoose = require('mongoose');
mongoose.plugin(require('mongoose-write-stream'));

// define the schema for our contractor model
var inspectionSchema = mongoose.Schema({
    row                         : Number,
    INSPECTIONDATE              : String,
    INSPECTIONNUMBER            : String,
    INSPECTIONTYPE              : String,
    INSPECTIONSTATUS            : String,
    PERMITNUMBER                : String,
    PERMITTYPE                  : String,
    BUILDINGOCCUPANCYTYPE       : String,
    NONCOMPLIANCENAME           : String,
    NONCOMPLIANCEDESCRIPTION    : String
});

// create the model for contractors and expose it to our app
module.exports = mongoose.model('Inspection', inspectionSchema);
