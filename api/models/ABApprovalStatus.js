/**
 * ABApprovalStatus.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName:'appbuilder_approval_status',

  connection:'appdev_default',



  attributes: {

    object: { 
      model: 'ABObject',
      required: true
   },

    rowId: {
      type: 'number'
    },

    status : { type: 'string',
      in:[
        'pending',      // waiting for an admin to approve the request
        'requesting',   // requesting more information (comments)
        'approved',     // Admin has approved the request
        'rejected'      // Admin has rejected the request
      ] 
    }

  }
};

