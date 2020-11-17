/**
 * ABMigration
 *
 * Manage the SQL table updates for the object builder.
 *
 */

// const fs = require('fs');
const path = require("path");
// const AD = require('ad-utils');
// const _ = require('lodash');

const ABObjectExternal = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "ABObjectExternal"
));

const knexConns = {};

module.exports = {
   connection: function(name = "appBuilder") {
      if (!knexConns[name]) {
         if (!sails.config.connections[name]) {
            throw new Error(`Connection '${name}' not found`);
         } else if (!sails.config.connections[name].database) {
            throw new Error(`Connection '${name}' is not supported`);
         }

         knexConns[name] = require("knex")({
            client: "mysql",
            connection: {
               host: sails.config.connections[name].host, // ||  '127.0.0.1',
               user: sails.config.connections[name].user, // ||  'your_database_user',
               port: sails.config.connections[name].port,
               password: sails.config.connections[name].password, // ||  'your_database_password',
               database: sails.config.connections[name].database, // ||  'appbuilder'
               timezone: "UTC"
            },
            // FIX : ER_CON_COUNT_ERROR: Too many connections
            // https://github.com/tgriesser/knex/issues/1027
            pool: {
               min: 2,
               max: 20
            }
         });
      }

      return knexConns[name];
   },

   createObject: function(object) {
      var knex = ABMigration.connection(object.connName);
      return object.migrateCreate(knex);
   },

   dropObject: function(object) {
      var knex = ABMigration.connection(object.connName);
      return object.migrateDrop(knex);
   },

   /**
    * @method refreshObject
    * delete a model in knex, then it will be initialized
    *
    * @param {ABObject} object
    *
    */
   refreshObject: function(object) {
      var knex = ABMigration.connection(object.connName);
      var tableName = object.dbTableName(true);

      if (knex.$$objection && knex.$$objection.boundModels) {
         // delete knex.$$objection.boundModels[tableName];

         // FIX : Knex Objection v.1.1.8
         knex.$$objection.boundModels.delete(
            tableName + "_" + object.modelName()
         );
      }
   },

   createQuery: function(query) {
      var knex = ABMigration.connection(query.connName);
      return query.migrateCreate(knex);
   },

   dropQuery: function(query) {
      var knex = ABMigration.connection(query.connName);
      return query.migrateDrop(knex);
   },

   createField: function(field) {
      // disallow to create a new column in the external table
      if (field.object instanceof ABObjectExternal) return Promise.resolve();

      var knex = ABMigration.connection(field.object.connName);
      return field.migrateCreate(knex);
   },

   updateField: function(field) {
      if (field.object instanceof ABObjectExternal) return Promise.resolve();

      var knex = ABMigration.connection(field.object.connName);
      return field.migrateUpdate(knex);
   },

   dropField: function(field) {
      // disallow to drop a column in the external table
      if (field.object instanceof ABObjectExternal) return Promise.resolve();

      var knex = ABMigration.connection(field.object.connName);
      return field.migrateDrop(knex);
   },

   createIndex: function(index) {
      var knex = ABMigration.connection(index.object.connName);
      return index.migrateCreate(knex);
   },

   dropIndex: function(index) {
      var knex = ABMigration.connection(index.object.connName);
      return index.migrateDrop(knex);
   },

   /**
    * @method createTransaction
    * create Knex.Transaction
    * @param {function} - callback
    *
    * @return {Promise} - resolve(Knex.Transaction)
    */
   createTransaction: function(callback) {
      let knex = ABMigration.connection();
      return knex.transaction(callback);
   }
};
