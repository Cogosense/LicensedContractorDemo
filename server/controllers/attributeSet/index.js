// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('lc:attributeSet');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var AttributeSet = mongoose.model('AttributeSet');

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
exports.create = function(req, res, next) {
    debug('creating attribute set: ' + JSON.stringify(req.body));
    AttributeSet.findOne({ recordName: req.body.recordName, ownerId: req.body.ownerId }, function(err, attributeSet) {
        // handle any errors
        if(err) {
            return next(err);
        }

        if(attributeSet) {
            res.status(409).send("Conflict");
        } else {
            var newAttributeSet = new AttributeSet(req.body);
            newAttributeSet.save(function(err, attributeSet) {
                if(err) {
                    return next(err);
                }
                debug('created attribute set: ' + JSON.stringify(attributeSet));
                res.status(200).json(attributeSet);
            });
        }
    });
};

// =======================================
// list all resources
// =======================================
exports.list = function(req, res, next) {
    debug('listing all attribute sets');

    AttributeSet
    .find({})
    .sort({ 'recordName': 'ascending' })
    .exec(function(err, attributeSets){
        if(err) {
            return next(err);
        }
        res.status(200).json(attributeSets);
    });
};

// =======================================
// update the specified resource
// =======================================
exports.update = function(req, res, next) {
    debug('updating attribute set: ' + req.params.attributeSet_id + " to: " + JSON.stringify(req.body));
    AttributeSet.findById(req.params.attributeSet_id, function(err, attributeSet) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!attributeSet) {
            res.status(404).send("Not Found");
        } else {
            attributeSet.update(req.body, function(err, attributeSet){
                if(err) {
                    return next(err);
                }
                res.status(200).send();
            });
        }
    });
};

// =======================================
// delete the specified resource
// =======================================
exports.remove = function(req, res, next) {
    debug('deleting attribute set: ' + req.params.attributeSet_id);
    AttributeSet.findById(req.params.attributeSet_id, function(err, attributeSet) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!attributeSet) {
            res.status(404).send("Not Found");
        } else {
            attributeSet.remove(function(){
                res.status(204).send("No Content");
            });
        }
    });
};

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
