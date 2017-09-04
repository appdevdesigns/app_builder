/**
 * Convert old AB Applications into the new format.
 *
 * Example usage:
 *
 *  $ sails console --port=99999
 *  sails> ABConversion.importOldApp({ dbHost: '127.0.0.1', dbName: 'test', 
 *  ...  dbUser: 'root', dbPass: 'root', appName: 'testApp' }).then(console.log)
 *
 */

var AD = require('ad-utils');
var mysql = require('mysql');
var async = require('async');
var uuid = require('uuid');

module.exports = {
    
    /**
     * Import an old AppBuilder app into the current format and save to
     * the current Sails database.
     *
     * @param {object} options
     *     {
     *          dbHost: {string} server of DB to import from
     *          dbName: {string} name of DB to import from
     *          dbUser: {string} mysql user
     *          dbPass: {string} mysql password
     *          appName: {string} name of AB app to import
     *     }
     * @return {Promise}
     */
    importOldApp: function(options) {
        return new Promise((resolve, reject) => {
            
            var db = mysql.createConnection({
                host: options.dbHost || '127.0.0.1',
                user: options.dbUser,
                password: options.dbPass,
                database: options.dbName
            });
            
            var appID;
            var objIDs = [];
            var data = {}; // final AB Application JSON result

            async.series([
                
                // Connect to DB
                (next) => {
                    db.connect((err) => {
                        if (err) next(err);
                        else next();
                    });
                },
                
                // Find AB app
                (next) => {
                    db.query(`
                        
                        SELECT 
                            app.id,
                            app.name,
                            appTrans.label,
                            appTrans.description,
                            appTrans.language_code
                        FROM
                            appbuilder_application AS app,
                            JOIN appbuilder_application_trans AS appTrans
                                ON app.id = appTrans.abapplication
                        WHERE
                            app.name = ?
                        
                    `, [options.appName], (err, list) => {
                        if (err) next(err);
                        else if (!list || !list[0]) {
                            next(new Error('Application not found: ' + options.appName));
                        }
                        else {
                            appID = list[0].id;
                            data.translations = [];
                            list.forEach((a) => {
                                data.translations.push({
                                    language_code: a.language_code,
                                    label: a.label,
                                    description: a.description
                                });
                            });
                            next();
                        }
                    });
                },
                
                // Find AB objects
                (next) => {
                    db.query(`
                        
                        SELECT
                            obj.id,
                            obj.name,
                            obj.labelFormat,
                            objTrans.label,
                            objTrans.language_code
                        FROM 
                            appbuilder_object AS obj
                            JOIN appbuilder_object_trans AS objTrans
                                ON obj.id = objTrans.abobject
                        WHERE
                            obj.application = ?
                        
                    `, [appID], (err, list) => {
                        if (err) next(err);
                        else if (!list || !list[0]) {
                            next(new Error('Application has no objects?'));
                        }
                        else {
                            
                            // Parse objects into JSON format
                            var objectsHash = {};
                            list.forEach((o) => {
                                var objID = o.id;
                                objIDs.push(objID);
                                if (!objectsHash[objID]) {
                                    objectsHash[objID] = {
                                        id: uuid.v4(),
                                        name: o.name,
                                        labelFormat: o.labelFormat,
                                        translations: []
                                    };
                                }
                                objectsHash[objID].translations.push({
                                    language_code: o.language_code,
                                    label: o.label
                                });
                            });
                            
                            // Add to results
                            data.objects = [];
                            for (var objID in objectsHash) {
                                data.objects.push(objectsHash[objID]);
                            }
                            
                            next();
                        }
                    });
                },
                
                // Find columns
                (next) => {
                    // Handle each object's columns separately
                    async.each(objIDs, (objID, nextCol) => {
                        db.query(`
                            
                            SELECT
                                col.*,
                                colTrans.label,
                                colTrans.language_code
                            FROM
                                appbuilder_column AS col
                                JOIN appbuilder_column_trans AS colTrans
                                    ON col.id = colTrans.abcolumn
                            WHERE
                                col.object = ?
                            
                        `, [objID], (err, list) => {
                            if (err) nextCol(err);
                            else if (!list || !list[0]) {
                                nextCol(new Error('No columns?'));
                            }
                            else {
                                
                                // Parse columns...
                                
                                nextCol();
                            }
                        });
                        
                    }, (err) => {
                        if (err) next(err);
                        else next();
                    });
                },
                
                // Save results
                (next) => {
                    /*
                        ABApplication.create({...})
                        .then(() => {
                            next();
                        })
                        .catch((err) => {
                            next(err);
                        });
                    */
                    next();
                },
                
            
            ], (err) => {
                if (err) {
                    console.log(err);
                    reject(err);
                }
                else resolve('OK');
            });
        });
    },
    
    
    
};