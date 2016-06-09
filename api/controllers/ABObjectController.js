/**
 * ABObjectController
 *
 * @description :: Server-side logic for managing Abobjects
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
    prepare: function(req, res) {
        var objectID = req.param('id');
        AppBuilder.objectToModel(objectID)
        .fail(function(err) {
            res.AD.error(err);
        })
        .done(function() {
            res.AD.success({});
        });
        
    }
    
	
};

