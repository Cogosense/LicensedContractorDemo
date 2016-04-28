// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('lc:publisher');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
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
exports.create = function(req, res, next) {
    debug('creating publisher: ' + JSON.stringify(req.body));
    Publisher.findOne({ 'publisherName': req.body.publisherName }, function(err, publisher) {
        // handle any errors
        if(err) {
            return next(err);
        }

        if(publisher) {
            res.status(409).send("Conflict");
        } else {
            var newPublisher = new Publisher(req.body);
            newPublisher.save(function(err, publisher) {
                if(err) {
                    return next(err);
                }
                debug('created publisher: ' + JSON.stringify(publisher));
                res.status(200).json(publisher);
            });
        }
    });
};

// =======================================
// list all resources
// =======================================
exports.list = function(req, res, next) {
    debug('listing all publishers');

    Publisher
    .find({})
    .sort({ 'publisherName': 'ascending' })
    .exec(function(err, publishers){
        if(err) {
            return next(err);
        }
        res.status(200).json(publishers);
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
exports.remove = function(req, res, next) {
    debug('deleting publisher: ' + req.params.publisher_id);
    Publisher.findById(req.params.publisher_id, function(err, publisher) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!publisher) {
            res.status(404).send("Not Found");
        } else {
            publisher.remove(function(){
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
