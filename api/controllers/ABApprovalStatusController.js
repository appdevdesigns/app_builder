/**
 * ABApprovalStatusController
 *
 * @description :: Server-side logic for managing Abapprovalstatuses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
    _unitTestAccessActions: function(req, res) {
        res.AD.success();
    }
	
};

