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
    },
    
    // POST app_builder/column/createColumn
    // params:
    //     {string} type
    //     {json} data
    //         {string} data.name
    //         {integer} data.object
    //         {string} [data.type]
    //         {string} [data.language_code]
    //         {integer} [data.weight]
    //         {json} [data.setting]
    //
    createColumn: function (req, res) {
        var type = req.param('type');
        var data = req.param('data');
        
        ABColumn.createColumn(type, data)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function(column) {
            res.AD.success(column);
        });
    },
    
    // POST app_builder/column/createLink
    createLink: function (req, res) {
        var name = req.param('name');
        var language_code = req.param('language_code') || null;
        var sourceObjectID = req.param('sourceObjectID');
        var targetObjectID = req.param('targetObjectID');
        var sourceRelation = req.param('sourceRelation');
        var targetRelation = req.param('targetRelation');
        
        ABColumn.createLink({
            name,
            language_code,
            sourceObjectID,
            targetObjectID,
            sourceRelation,
            targetRelation
        })
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function(sourceColumn, targetColumn) {
            res.AD.success([ sourceColumn, targetColumn ]);
        });
        
        
    
    },

};

