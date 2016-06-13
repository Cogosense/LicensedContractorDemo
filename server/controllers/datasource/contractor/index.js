// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('lc:contractor');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var Contractor = mongoose.model('Contractor');

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
exports.list = function(req, res, next) {
    debug('listing all contractors with filer: ' + JSON.stringify(req.query));

    var filter = {};

    if(req.query.LICENSENUMBER)
        filter.LICENSENUMBER = new RegExp(req.query.LICENSENUMBER);
    if(req.query.BUSINESSNAME)
        filter.BUSINESSNAME = new RegExp(req.query.BUSINESSNAME);
    if(req.query.BUSINESSPHONE) {
        filter.BUSINESSMOBILEPHONE = new RegExp(req.query.BUSINESSPHONE);
        filter.BUSINESSPHONE = new RegExp(req.query.BUSINESSPHONE);
    }
    if(req.query.BUSINESSEMAIL)
        filter.BUSINESSEMAIL = new RegExp(req.query.BUSINESSEMAIL);

    Contractor
    .find(filter)
    .sort({ 'BUSINESSNAME': 'ascending' })
    .exec(function(err, permissions){
        if(err) {
            return next(err);
        }
        res.status(200).json(permissions);
    });
};

// =======================================
// update the specified resource
// =======================================
// exports.update = function(req, res, next) {
// };

// =======================================
// delete the specified resource
// =======================================
//exports.remove = function(req, res, next) {
//};

// =======================================
// query the specified resource
// usually display resource details
// =======================================
// exports.show = function(req, res, next) {
//}

// =======================================
// edit the specified resource
// usually populate a form for editing
// =======================================
// exports.edit = function(req, res, next) {
//}
