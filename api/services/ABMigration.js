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

var knexConn = null;


module.exports = {


    connection:function() {

        if (!knexConn) {

            knexConn = require('knex')({
                client: 'mysql',
                connection: {
                    host : sails.config.connections.appBuilder.host, // ||  '127.0.0.1',
                    user : sails.config.connections.appBuilder.user, // ||  'your_database_user',
                    port : sails.config.connections.appBuilder.port, 
                    password : sails.config.connections.appBuilder.password, // ||  'your_database_password',
                    database : sails.config.connections.appBuilder.database, // ||  'appbuilder'
                },
                // FIX : ER_CON_COUNT_ERROR: Too many connections
                // https://github.com/tgriesser/knex/issues/1027
                pool: {
                    min: 2,
                    max: 20
                }
            });
        }

        return knexConn;
    },


    createObject:function(object) {

        var knex = ABMigration.connection();
        return object.migrateCreate(knex);

    },


    dropObject:function(object) {

        var knex = ABMigration.connection();
        return object.migrateDrop(knex);

    },


    createField:function(field) {

        var knex = ABMigration.connection();
        return field.migrateCreate(knex);

    },


    dropField:function(field) {

        var knex = ABMigration.connection();
        return field.migrateDrop(knex);

    }

};