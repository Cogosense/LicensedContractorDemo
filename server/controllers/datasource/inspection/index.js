// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('lc:inspection');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var Inspection = mongoose.model('Inspection');

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
    debug('creating inspection');
    var newInspection = new Inspection(req.body);
    newInspection.save(function(err, inspection) {
        if(err) {
            return next(err);
        }
        debug('created inspection: ' + JSON.stringify(inspection));
        res.status(200).json(inspection);
    });
};

// =======================================
// list all resources
// =======================================
exports.list = function(req, res, next) {
    debug('listing all inspections with filer: ' + JSON.stringify(req.query));

    /*
     * Sorting, filtering, pagination and selection are supported using query parameters
     *
     * __sort   is a list of field names seperated by commas. The highest priority isort
     *          first is first. A descending sort is used if the first character in the
     *          field name is '-'.
     *          e.g. ?__sort='field1,-field2'
     * __skip   is used for pagination. It is an integer used to skip records at the
     *          start of the returned matching set.
     *          e.g. ?__skip=100
     * __limit  is used for pagination. It is an integer that is used to limit the size
     *          of the returned record set.
     *          e.g. ?__limit=25
     *
     *          A query of __skip=0&__limit=25 returns the first page of 25 records
     *          A query of __skip=25__limit=25 returns the second page of 25 records
     *          etc.
     *
     * __select is a list of field names seperated by commas. These are the fields that
     *          will be populated into the returned records. An empty select parameter
     *          will cause an array of empty objects (only _id will be present) to be
     *          returned.
     *          e.g. ?__select=fiel1,field2
     * ...      a list of field names and regular expressions as parameters.
     *          The named fields are matched against the reqular expression.
     *          e.g ?field1=foo,&ield2=^604
     *
     * The following headers must be returned for pagination control:
     *
     * X-total-count                 the number of matching records based on the supplied
     *                               filter, ignoring the skip and limit parameters.
     * Access-Control-Expose-Headers set to 'X-total-count' to ensure the 'X-total-count'
     *                               header is visible in a CORS environment.
     */
    var sort = {};
    var filter = {};
    var skip = 0;
    var limit = 0;
    var select = 'xxx';

    for (var prop in req.query) {
        switch(prop){
            case '__sort': {
                var criteria = req.query.__sort.split(',');
                for(var i = 0; i < criteria.length ; ++i) {
                    var c = criteria[i];
                    if(c.length > 0){
                        if(c.charAt(0) === '-'){
                            c = c.substring(1);
                            sort[c] = 'descending';
                        } else {
                            sort[c] = 'ascending';
                        }
                    }
                }
            }
            break;
            case '__skip': {
                skip = req.query.__skip | 0;
            }
            break;
            case '__limit': {
                limit = req.query.__limit | 0;
            }
            break;
            case '__select': {
                var s = [];
                s = req.query.__select.split(',');
                select = s.join(' ');
            }
            break;
            default: {
                if(req.query.hasOwnProperty(prop)){
                    filter[prop] = new RegExp(req.query[prop]);
                }
            }
        }
    }

    console.log('sort: ' + JSON.stringify(sort));
    console.log('filter: ' + JSON.stringify(filter));
    console.log('paginate skip: ' + skip + ' limit: ' + limit);
    console.log('select: ' + JSON.stringify(select));

    Inspection
    .find(filter)
    .sort(sort)
    .select(select)
    .exec(function(err, permissions){
        if(err) {
            return next(err);
        }
        var count = permissions.length;
        var p = permissions;
        if(limit > 0) {
            p = permissions.slice(skip, skip + limit);
        }
        debug("count: " + count + " skip: " + skip + " limit: " + limit + " p length = " + p.length);
        res.header({
            'Access-Control-Expose-Headers': 'X-total-count',
            'X-total-count': count
        });
        res.status(200).json(p);
    });
};

// =======================================
// update the specified resource
// =======================================
exports.update = function(req, res, next) {
    debug('updating inspection');
    Inspection.findById(req.params.inspection_id, function(err, inspection) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!inspection) {
            res.status(404).send("Not Found");
        } else {
            inspection.update(req.body, function(err, inspection){
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
    debug('deleting inspection');
    Inspection.findById(req.params.inspection_id, function(err, inspection) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!inspection) {
            res.status(404).send("Not Found");
        } else {
            inspection.remove(function(){
                res.status(204).send("No Content");
            });
        }
    });
};

// =======================================
// query the specified resource
// usually display resource details
// =======================================
exports.show = function(req, res, next) {
    var key = '_id';
    if(req.query.__key) {
        key = req.query.__key;
    }
    var criteria = {};
    criteria[key] = req.params.inspection_id;

    Inspection.findOne(criteria, function(err, inspection) {
        // handle any errors
        if(err) {
            return next(err);
        }
        if(!inspection) {
            res.status(404).send("Not Found");
        } else {
            res.status(200).send(inspection);
        }
    });
};

// =======================================
// edit the specified resource
// usually populate a form for editing
// =======================================
// exports.edit = function(req, res, next) {
//}
