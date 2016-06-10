/**
 * ABObjectController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');

module.exports = {

    _config: {
        model: "abobject", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    },


    /**
     * Generate a given object's server side model definition.
     *
     * Reloading the ORM is still needed to complete the activation.
     *
     * POST /app_builder/prepareObject/:id
     */
    prepare: function (req, res) {
        var objectID = req.param('id');
        AppBuilder.objectToModel(objectID)
            .fail(function (err) {
                res.AD.error(err);
            })
            .done(function () {
                res.AD.success({});
            });

    },

    // PUT: app_builder/object/sortColumns/:id
    sortColumns: function (req, res) {
        var objectId = req.param('id'),
            updateEvents = [];

        req.body.columns.forEach(function (col) {
            updateEvents.push(function (next) {
                ABColumn.update(
                    {
                        id: col.columnId,
                        object: objectId
                    },
                    {
                        weight: col.index
                    })
                    .fail(function (err) { next(err); })
                    .then(function () { next(); });
            });
        });

        async.parallel(updateEvents, function (err) {
            if (err)
                res.AD.error(err);
            else
                res.AD.success(true);
        });
    }

};

