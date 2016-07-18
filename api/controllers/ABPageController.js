/**
 * ABPageController
 *
 * @description :: Server-side logic for managing Abpages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var async = require('async');

module.exports = {

    _config: {
        model: "abpage", // all lowercase model name
        actions: true,
        shortcuts: true,
        rest: true
    },

    /**
     * Generate a given page's controller.
     *
     * POST /app_builder/preparePage/:id
     */
    prepare: function (req, res) {
        var pageID = req.param('id');
        AppBuilder.buildPage(pageID)
            .fail(function (err) {
                res.AD.error(err);
            })
            .done(function () {
                res.AD.success({});
            });

    },

    // PUT: app_builder/page/sortComponents/:id
    sortComponents: function (req, res) {
        var pageId = req.param('id'),
            updateEvents = [];

        if (req.body && req.body.components) {
            req.body.components.forEach(function (com) {
                updateEvents.push(function (next) {
                    ABPageComponent.update(
                        {
                            id: com.id,
                            page: pageId
                        },
                        {
                            weight: com.index
                        })
                        .fail(function (err) { next(err); })
                        .then(function () { next(); });
                });
            });
        }

        async.parallel(updateEvents, function (err) {
            if (err)
                res.AD.error(err);
            else
                res.AD.success(true);
        });
    }

};

