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

            var knexConn = require('knex')({
                client: 'mysql',
                connection: {
                    host : sails.config.connections.appBuilder.host, // ||  '127.0.0.1',
                    user : sails.config.connections.appBuilder.user, // ||  'your_database_user',
                    port : sails.config.connections.appBuilder.port, 
                    password : sails.config.connections.appBuilder.password, // ||  'your_database_password',
                    database : sails.config.connections.appBuilder.database, // ||  'appbuilder'
                }
            });
        }

        return knexConn;
    },

    createObject:function(object) {

        var knex = ABMigration.connection();
        return object.migrateCreateTable(knex);

    }

};