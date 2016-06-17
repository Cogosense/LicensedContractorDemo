var mongoose = require('mongoose');

var Note = new mongoose.Schema({
    AuthorOrganization  : String,
    AuthorName          : String,
    NoteDate            : { type: Date, default: Date.now },
    NoteText            : String
});

// define the schema for the record schemas
var notesSchema = mongoose.Schema({
    License_id          : {type: String, unique: true},
    Bingo_id            : {type: String, unique: true},
    notes               : [{type: mongoose.Schema.Types.ObjectId, ref: 'Note'}]
});

// create the model for schema and expose it to our app
module.exports = mongoose.model('Notes', notesSchema);
