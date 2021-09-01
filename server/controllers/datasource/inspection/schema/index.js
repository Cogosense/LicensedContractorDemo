// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('lc:inspection');

// Data model
var mongoose = require('mongoose');

// =======================================
// Specify view engine for this controller
// =======================================
exports.engine = 'jade';

// =============================================
// Pass initialization options to the controller
// used to pass options including the passport
// object required for basic authentication
// =============================================
var passport;
exports.init = function(options) {
     passport = options.passport;
};

// =======================================
// Guard executed before each route
// check user is authenticated, or if API
// endpoint perform basic authentication
// =======================================
exports.before = function(req, res, next) {
    return next();
};

// =======================================
// create a new resource
// =======================================
//exports.create = function(req, res, next) {
//};

// =======================================
// list all resources
// =======================================
//exports.list = function(req, res, next) {
//};

// =======================================
// update the specified resource
// =======================================
//exports.update = function(req, res, next) {
//};

// =======================================
// delete the specified resource
// =======================================
//exports.remove = function(req, res, next) {
//};

// =======================================
// query the specified resource
// usually display resource details
// =======================================
exports.show = function(req, res, next) {
    var schema = {
        row                         : "Number",
        INSPECTIONDATE              : "String",
        INSPECTIONNUMBER            : "String",
        INSPECTIONTYPE              : "String",
        INSPECTIONSTATUS            : "String",
        PERMITNUMBER                : "String",
        PERMITTYPE                  : "String",
        BUILDINGOCCUPANCYTYPE       : "String",
        INSPECTIONNONCOMPLIANCEID   : "String",
        NONCOMPLIANCENAME           : "String",
        NONCOMPLIANCEDESCRIPTION    : "String"
    };

    if (!mongoose.model('Inspection')) {
        module.exports = mongoose.model('Inspection', mongoose.Schema(schema));
    }
    debug(schema);
    res.status(200).json(schema);
};

// =======================================
// edit the specified resource
// usually populate a form for editing
// =======================================
// exports.edit = function(req, res, next) {
//}
