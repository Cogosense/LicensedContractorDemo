// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('lc:api');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var AttributeSet = mongoose.model('AttributeSet');
var Publisher = mongoose.model('Publisher');

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
    debug('owner: ' + req.params.publisher_id);
    debug('publisher: ' + req.query.publisher_id);
    debug('querying API metadata: ' + req.params.attributes_id);

    var owner = req.params.publisher_id;
    var publisher = req.query.publisher_id;

    AttributeSet.findOne({recordName: req.params.attributes_id, ownerId: req.params.publisher_id})
        .populate('ownerId attributes.typeRef adornments adornments.ownerId')
        .exec(function(err, attributeSet) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!attributeSet) {
            res.status(404).send("Not Found");
        } else {
            attributeSet = attributeSet.toObject();
            attributeSet.readOnly = false;
            if(owner !== publisher){
                var filteredAttrs = [];
                for(var i = 0; i < attributeSet.attributes.length; ++i) {
                    var attr = attributeSet.attributes[i];
                    if(!attr.restrict){
                        filteredAttrs.push(attr);
                    }
                }
                attributeSet.attributes = filteredAttrs;
                if(!attributeSet.worldWritable)
                    attributeSet.readOnly = true;
            }
            for(var j = 0; j < attributeSet.adornments.length; ++j) {
                var adornment = attributeSet.adornments[j];
                adornment.readOnly = false;
                if(adornment.ownerId.toString() !== publisher){
                    var filteredAdornmentAttrs = [];
                    for(var k = 0; k < adornment.attributes.length; ++k) {
                        var adornmentAttr = adornment.attributes[k];
                        if(!adornmentAttr.restrict){
                            filteredAdornmentAttrs.push(adornmentAttr);
                        }
                    }
                    adornment.attributes = filteredAdornmentAttrs;
                    if(!adornment.worldWritable)
                        adornment.readOnly = true;
                }
            }
            Publisher.populate(attributeSet, 'adornments.ownerId', function(err, result){
                if(err) {
                    return next(err);
                } else {
                    AttributeSet.populate(attributeSet, 'adornments.attributes.typeRef', function(err, result){
                        if(err) {
                            return next(err);
                        } else {
                            console.log(JSON.stringify(result, null, 2));
                            res.status(200).json(result);
                        }
                    });
                }
            });
        }
    });
};

// =======================================
// edit the specified resource
// usually populate a form for editing
// =======================================
// exports.edit = function(req, res, next) {
//};
