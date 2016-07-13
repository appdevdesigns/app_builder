/**
 * ABPageController
 *
 * @description :: Server-side logic for managing Abpages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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

    }

};

