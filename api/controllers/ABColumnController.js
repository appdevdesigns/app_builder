/**
 * ABColumnController
 *
 * @description :: Server-side logic for managing Abcolumns
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

    _config: {
        model: "abcolumn", // all lowercase model name
        actions: false,
        shortcuts: false,
        rest: true
    },

    // PUT: app_builder/column/:id/width
    saveWidth: function (req, res) {
        var columnId = req.param('id');

        if (req.body && req.body.width) {
            ABColumn.update({ id: columnId }, { width: req.body.width })
                .exec(function (err, updated) {
                    if (err) {
                        res.AD.error(err);
                        return;
                    }

                    res.AD.success(true);
                });
        }
        else {
            res.AD.error('Column width is required');
        }
    }

};

