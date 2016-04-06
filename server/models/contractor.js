var mongoose = require('mongoose');
mongoose.plugin(require('mongoose-write-stream'));

// define the schema for our contractor model
var contractorSchema = mongoose.Schema({
    rn                          : Number,
    LICENSENUMBER               : String,
    ALTLICENSENUMBER            : String,
    LICENSETYPE                 : String,
    LICENSESTATUS               : String,
    APPLICATIONDATE             : Date,
    ISSUEDATE                   : Date,
    EXPIRYDATE                  : Date,
    LICENSEDESCRIPTION          : String,
    LICENSERESTRICTIONSCOUNT    : Number,
    RESTRICTIONINVALIDBOND      : Boolean,
    LICENSERESTRICTIONSACTIVE   : Boolean,
    LICENSERESTRICTIONSHISTORY  : Boolean,
    RESTRICTIONFULLSUSPENSION   : Boolean,
    RESTRICTIONNODECLARATIONS   : Boolean,
    RESTRICTIONNOPERMITS        : Boolean,
    LICENSEDETAILS              : String,
    BUSINESSNAME                : String,
    BUSINESSMOBILEPHONE         : String,
    BUSINESSPHONE               : String,
    BUSINESSEMAIL               : String,
});

// create the model for contractors and expose it to our app
module.exports = mongoose.model('Contractor', contractorSchema);
