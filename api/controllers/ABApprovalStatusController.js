/**
 * ABApprovalStatusController
 *
 * @description :: Server-side logic for managing Abapprovalstatuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AD = require('ad-utils');
var _ = require('lodash');
var async = require('async');

module.exports = {

    _config: {
        model: "abapprovalstatus", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true,
        create: false,
        add: false,
        populate: false,
        remove: false,
        destroy: false,
        update: false
        // find: true,
        // findOne: true,

    },

    // this method is used in unit tests to test if your 
    // actions are enabled or not.
    _unitTestAccessActions: function (req, res) {
        res.AD.success();
    },

    // POST /app_builder/object/:objectId/requestApprove
    requestApprove: function (req, res) {
        var objectId = req.param('objectId'),
            itemIds = req.param('itemIds'),
            title = req.param('title'),
            columnIds = req.param('columns') || [];

        if (objectId == null || itemIds == null) {
            res.AD.error('Bad request.');
            return;
        }

        var object,
            objectModelName,
            modelData,
            requestData = [];

        async.series([
            // prevent duplicate request approve 
            function (next) {
                ABApprovalStatus.find({
                    object: objectId,
                    rowId: itemIds
                }).then(function (result) {
                    var existsRowIds = result.map(function (item) { return item.rowId; });

                    itemIds = itemIds.filter(function (id) {
                        return existsRowIds.indexOf(parseInt(id)) < 0;
                    });

                    next();
                }, next);
            },
            // get object model name
            function (next) {
                ABObject.findOne({ id: objectId })
                    .populate('application')
                    .populate('columns')
                    .then(function (obj) {
                        if (obj == null)
                            return next(new Error('Could not found this object'));

                        object = obj;

                        var appName = AppBuilder.rules.toApplicationNameFormat(obj.application.name);
                        var objName = AppBuilder.rules.toObjectNameFormat(appName, obj.name);
                        objectModelName = objName.toLowerCase();

                        next();
                    }, next);
            },

            // get sails model
            function (next) {
                modelData = sails.models[objectModelName];

                if (modelData == null)
                    next(new Error('Could not found this model'));
                else
                    next();
            },

            // pull data to request approve
            function (next) {
                // If model object has 'translations' attribute
                if (modelData.attributes.translations != null) {
                    modelData.find({ id: itemIds })
                        .populate('translations')
                        .then(function (result) {
                            requestData = result

                            next();
                        }, next);
                }
                // If model object does not have 'translations' attribute
                else {
                    modelData.find({ id: itemIds })
                        .then(function (result) {
                            requestData = result

                            next();
                        }, next);
                }
            },

            // translate row data
            function (next) {
                var translateTasks = [];

                requestData.forEach(function (item) {
                    translateTasks.push(function (ok) {
                        if (item.translate == null)
                            return ok();

                        item.translate().then(function () {
                            ok();
                        }, ok);
                    })
                });

                async.parallel(translateTasks, function (err) {
                    next(err);

                });
            },

            // post reqeust approve to ProcessApproval tool
            function (next) {
                try {
                    var currUser = req.user,
                        allowProperties = ['id'];

                    // Pull allow column names
                    allowProperties = allowProperties.concat(object.columns
                        .filter(function (col) { return columnIds.indexOf(col.id.toString()) > -1; })
                        .sort(function (a, b) { return a.weight - b.weight; })
                        .map(function (col) { return col }));

                    requestData.forEach(function (data) {
                        var item = {};

                        allowProperties.forEach(function (prop) {
                            switch (prop.fieldName) {
                                case 'connectObject':
                                    break;
                                case 'list':
                                    // Remove empty items
                                    item[prop.name] = data[prop.name]
                                        .split(',')
                                        .filter(function (item) { return item && item.length > 0; })
                                        .map(function (item) { return item.trim(); })
                                        .join(', ');

                                    break;
                                default:
                                    item[prop.name] = data[prop.name];
                                    break;
                            }
                        });

                        AppBuilder.approval.postApproval(currUser, object, item, title);
                    });

                    next();
                }
                catch (err) {
                    next(err);
                }
            },

            // store 
            function (next) {
                var createTasks = [];

                requestData.forEach(function (item) {
                    createTasks.push(function (ok) {

                        ABApprovalStatus.create({
                            object: object.id,
                            rowId: item.id,
                            status: 'requesting'
                        }).then(function () {
                            ok();
                        }, ok);
                    });
                });

                async.parallel(createTasks, next);
            }
        ], function (err) {
            if (err)
                res.AD.error(err);
            else {
                var requestRowIds = requestData.map(function (item) {
                    return item.id;
                });

                res.send(requestRowIds);
            }
        });
    }

};

