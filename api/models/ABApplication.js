/**
 * ABApplication.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  tableName: 'ab_application',

  connection: 'appdev_default',

  migrate: 'alter',

  attributes: {

    name: { type: 'string' },

    description: { type: 'text' }
  }
};

