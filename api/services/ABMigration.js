/**
 * ABMigration
 *
 * Manage the SQL table updates for the object builder.
 *
 */

var fs = require('fs');
var path = require('path');
var AD = require('ad-utils');
var _ = require('lodash');

var knexConns = {};

module.exports = {


    connection: function(name='appBuilder') {
        if (!knexConns[name]) {
            
            if (!sails.config.connections[name]) {
                throw new Error(`Connection '${name}' not found`);
            }
            else if (!sails.config.connections[name].database) {
                throw new Error(`Connection '${name}' is not supported`);
            }
            
            knexConns[name] = require('knex')({
                client: 'mysql',
                connection: {
                    host : sails.config.connections[name].host, // ||  '127.0.0.1',
                    user : sails.config.connections[name].user, // ||  'your_database_user',
                    port : sails.config.connections[name].port, 
                    password : sails.config.connections[name].password, // ||  'your_database_password',
                    database : sails.config.connections[name].database, // ||  'appbuilder'
                    timezone: 'UTC'
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


    createObject:function(object) {

        var knex = ABMigration.connection();
        return object.migrateCreate(knex);

    },


    dropObject:function(object) {

        var knex = ABMigration.connection();
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

        var knex = ABMigration.connection();
        var tableName = object.dbTableName();

        if (knex.$$objection &&
            knex.$$objection.boundModels) {
                
                // delete knex.$$objection.boundModels[tableName];

                // FIX : Knex Objection v.1.1.8
                knex.$$objection.boundModels.delete(tableName + '_MyModel');
                
        }

    },

    createField:function(field) {

        // disallow to create a new column in the external table
        if (field.object.isExternal)
            return Promise.resolve();

        var knex = ABMigration.connection();
        return field.migrateCreate(knex);

    },

    updateField:function(field) {
        
        var knex = ABMigration.connection();
        return field.migrateUpdate(knex);

    },

    dropField:function(field) {

        // disallow to drop a column in the external table
        if (field.object.isExternal)
            return Promise.resolve();

        var knex = ABMigration.connection();
        return field.migrateDrop(knex);

    }

};