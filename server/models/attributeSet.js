var mongoose = require('mongoose');

var Attributes = new mongoose.Schema({
    label       : String,
    desc        : String,
    name        : String,
    type        : String,
    typeRef     : {type: mongoose.Schema.Types.ObjectId, ref: 'AttributeSet'},
    typeIsList  : Boolean,
    typeIsSet   : Boolean,
    enumValues  : [String],
    available   : Boolean,
    restrict    : Boolean,
    summary     : Boolean,
    searchable  : Boolean
});

// define the schema for the record schemas
var attributeSetSchema = mongoose.Schema({
    recordName      : String,
    ownerId         : {type: mongoose.Schema.Types.ObjectId, ref: 'Publisher', required: true},
    endPoint        : String,
    attributes      : [Attributes],
    adornments      : [{type: mongoose.Schema.Types.ObjectId, ref: 'AttributeSet'}]
});

// create the model for schema and expose it to our app
module.exports = mongoose.model('AttributeSet', attributeSetSchema);
