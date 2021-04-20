/**
 * @module ABModelConvertDataCollectionCondition
 *
 * @description :: Policy
 *              :: Scan any provided conditions to see if we have a 'in_data_collection'
 *                 or 'not_in_data_collection' clause.  If we do, convert it to an IN or NOT IN
 *                 clause. The assumption is that the current object is in this data collection.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require("url");
var AD = require("ad-utils");
var _ = require("lodash");
var path = require("path");

// var ABGraphDataview = require(path.join("..", "graphModels", "ABDataview"));
var SystemObject = require(path.join("..", "services", "ABSystemObject"));

module.exports = function(req, res, next) {
   // our QB Conditions look like:
   // {
   //   "glue": "and",
   //   "rules": [{
   //     "key": "name_first",
   //     "rule": "begins_with",
   //     "value": "a"
   //   }, {
   //     "key": "name_family",
   //     "rule": "begins_with",
   //     "value": "a"
   //   }, {
   //     "glue": "or",
   //     "rules": [{
   //       "glue": "and",
   //       "rules": [{
   //         "key": "name_first",
   //         "rule": "not_begins_with",
   //         "value": "Apple"
   //       }, {
   //         "key": "name_family",
   //         "rule": "not_contains",
   //         "value": "Pie"
   //       }]
   //     }, {
   //       "glue": "and",
   //       "rules": [{
   //         "key": "name_first",
   //         "rule": "ends_with",
   //         "value": "Crumble"
   //       }, {
   //         "key": "name_family",
   //         "rule": "equal",
   //         "value": "Goodness"
   //       }]
   //     }]
   //   }]
   // }
   //
   //

   // move along if no or empty where clause
   if (_.isEmpty(req.options._where)) {
      next();
      return;
   }

   parseQueryCondition(req.options._where, null, req, res, (err) => {
      next(err);
   });
};

function findDcEntry(_where) {
   if (_where.rules) {
      var entry = null;
      for (var i = 0; i < _where.rules.length; i++) {
         entry = findDcEntry(_where.rules[i]);
         if (entry) {
            return entry;
            break;
         }
      }
      return entry;
   } else {
      if (
         _where.rule == "in_data_collection" ||
         _where.rule == "not_in_data_collection"
      ) {
         return _where;
      } else {
         return null;
      }
   }
}

function parseQueryCondition(_where, object, req, res, cb) {
   var cond = findDcEntry(_where);
   if (!cond) {
      cb();
   } else {
      // the first time we find a cond to process, we then
      // lookup the object for this route:
      if (!object) {
         AppBuilder.routes
            .verifyAndReturnObject(req, res)
            .then(function(obj) {
               object = obj;

               // try again with an object now:
               parseQueryCondition(_where, object, req, res, cb);
            })
            .catch((err) => {
               ADCore.error.log(
                  "AppBuilder:Policy:ABModelConvertDataCollectionCondition:error finding object for this route:",
                  { error: err }
               );

               // exit with error:
               cb(err);
            });
      } else {
         // make sure we find our Data collection
         // var dv;
         // object.application.pages().forEach(p => {
         //     if (dv == null)
         //         dv = p.application.datacollections(dColl => dColl.id == cond.value)[0];
         // });
         var Application = SystemObject.getApplication();

         // NOTE: on the server, Application.datacollection*() methods do not return
         // datacollections.  (for now).  So we need to pull the definition of the dv
         // here:
         // var dv = Application.datacollectionByID(cond.value);
         var defDC = Application.definitionForID(cond.value);

         Promise.resolve()
            // Get data view

            .then(() => {
               if (!defDC) {
                  ADCore.error.log(
                     "AppBuilder:Policy:ABModelConvertDataCollectionCondition:Could not find specified data collection:",
                     { dcId: cond.value, condition: cond }
                  );

                  var err = new Error(
                     "Unknown Data collection ID in condition."
                  );
                  err.condition = cond;
                  cb(err);
                  return;
               }

               // var sourceObject = object.application.objects(obj => obj.id == dc.settings.object)[0];
               var sourceObject = ABObjectCache.get(
                  defDC.settings.datasourceID
               );
               if (!sourceObject) {
                  ADCore.error.log(
                     "AppBuilder:Policy:ABModelConvertDataCollectionCondition:Source object not exists:",
                     { field: field, sourceObject: sourceObject, dc: defDC }
                  );
                  var err = new Error("Source object not exists.");
                  cb(err);
                  return;
               }

               var objectColumn;
               // {string} this is the 'tablename'.'colname' of the data to return

               var newKey = cond.key;
               // {string} this is the colName of the condition statement we want to pass
               // on.  So for instance, if the condition we received was the 'this_object',
               // filter, then we want the final condition to be:  id IN [],  and the
               // QB condition would be:  { key:'id', rule:'in', value:[] }.  So newKey == 'id'

               var parseColumn = cond.key;
               // {string} this is the column we want our reference query to return so we can
               // pull out the data for this filter condition.  So for example, the current query
               // is returning userid and subaccount.id.  However our filter is filtering on
               // subaccount.accountNum.  So we need to pull our 'accountNum' from the query.

               // if this is our special 'this_object' 'in_data_collection'  queryID  filter:
               if (cond.key == "this_object") {
                  objectColumn =
                     (cond.alias ? cond.alias : object.dbTableName(true)) +
                     "." +
                     object.PK();
                  newKey = object.PK(); // 'id';  // the final filter needs to be 'id IN []', so 'id'
                  parseColumn = object.PK(); // 'id';  // make sure we pull our 'id' values from the query

                  continueSingle(newKey, parseColumn, objectColumn);
               } else {
                  // this is a linkField IN QUERY filter:

                  // find field by it's name
                  var field = object.fields((f) => {
                     return f.columnName == cond.key;
                  })[0];
                  if (!field) {
                     // ok, maybe we passed in a field.id:
                     field = object.fields((f) => {
                        return f.id == cond.key;
                     })[0];
                     if (!field) {
                        ADCore.error.log(
                           "AppBuilder:Policy:ABModelConvertDataCollectionCondition:Unable to resolve condition field.:",
                           { field: cond.key, condition: cond }
                        );
                        var err = new Error(
                           "Unable to resolve condition field."
                        );
                        err.condition = cond;
                        cb(err);
                        return;
                     }
                  }

                  // get the linked field:
                  var linkedField = field.fieldLink;

                  // based upon the type of link:
                  var linkCase = field.linkType() + ":" + field.linkViaType();
                  switch (linkCase.toLowerCase()) {
                     case "one:one":
                     case "one:many":
                        // this field is used in final filter condition
                        newKey = field.columnName;

                        // I need to pull out the PK from the filter Query:
                        parseColumn = sourceObject.PK(); // 'id';

                        // custom index
                        if (field.indexField) {
                           parseColumn = field.indexField.columnName;
                        }

                        // make this the queryColumn:
                        objectColumn =
                           sourceObject.dbTableName(true) + "." + parseColumn;
                        continueSingle(newKey, parseColumn, objectColumn);
                        break;

                     case "many:one":
                        // they contain my .PK

                        // my .PK is what is used on our filter
                        newKey = object.PK(); // 'id';

                        // custom index
                        if (field.indexField) {
                           newKey = field.indexField.columnName;
                        }

                        // I need to pull out the linkedField's columnName
                        parseColumn = linkedField.columnName;

                        // make this the queryColumn:
                        objectColumn =
                           sourceObject.dbTableName(true) + "." + parseColumn;
                        continueSingle(newKey, parseColumn, objectColumn);
                        break;

                     case "many:many":
                        // we need the .PK of our linked column out of the given query
                        parseColumn = sourceObject.PK(); // 'id';

                        // custom index
                        if (
                           field.indexField &&
                           field.indexField.object.id == sourceObject.id
                        ) {
                           parseColumn = field.indexField.columnName;
                        } else if (
                           field.indexField2 &&
                           field.indexField2.object.id == sourceObject.id
                        ) {
                           parseColumn = field.indexField2.columnName;
                        }

                        objectColumn =
                           sourceObject.dbTableName(true) + "." + parseColumn;

                        processQueryValues(
                           parseColumn,
                           objectColumn,
                           (err, ids) => {
                              if (err) {
                                 cb(err);
                                 return;
                              }

                              // then we need to get which of our PK is stored in the linkTable for those linked entries
                              var linkTableQuery = ABMigration.connection().queryBuilder();
                              var joinTableName = field.joinTableName(true);

                              var parseName = object.name;

                              linkTableQuery
                                 .select(parseName)
                                 .from(joinTableName)
                                 .where(sourceObject.name, "IN", ids)
                                 .then((data) => {
                                    var myIds = data
                                       .map((d) => {
                                          return d[parseName];
                                       })
                                       .filter((d) => d != null);
                                    myIds = _.uniq(myIds);

                                    var myPK = object.PK(); // 'id';

                                    // custom index
                                    if (
                                       field.indexField &&
                                       field.indexField.object.id == object.id
                                    ) {
                                       myPK = field.indexField.columnName;
                                    } else if (
                                       field.indexField2 &&
                                       field.indexField2.object.id == object.id
                                    ) {
                                       myPK = field.indexField2.columnName;
                                    }

                                    buildCondition(myPK, myIds);
                                 })
                                 .catch((err) => {
                                    cb(err);
                                 });
                           }
                        );
                        break;
                  }
               }

               // buildCondition
               // final step of recreating the condition into the
               // proper Field IN []  format;
               function buildCondition(newKey, ids) {
                  // convert cond into an IN or NOT IN
                  cond.key = newKey;
                  var convert = {
                     in_data_collection: "in",
                     not_in_data_collection: "not_in"
                  };
                  cond.rule = convert[cond.rule];
                  cond.value = ids;

                  sails.log.info(".... new Condition:", cond);

                  // final step, so parse another condition:
                  parseQueryCondition(_where, object, req, res, cb);
               }

               // processQueryValues
               // this step runs the specified Query and pulls out an array of
               // ids that can be used for filtering.
               // @param {string} parseColumn  the name of the column of data to pull from the Query
               // @param {string} objectColumn  [table].[column] format of the data to pull from Query
               // @param {fn} done  a callback routine  done(err, data);
               function processQueryValues(parseColumn, objectColumn, done) {
                  var query = sourceObject.queryFind(
                     {
                        columnNames: [objectColumn],
                        where: defDC.settings.objectWorkspace.filterConditions,
                        sort: defDC.settings.objectWorkspace.sortFields || []
                     },
                     req.user.data
                  );
                  // query.clearSelect().column(objectColumn);

                  // sails.log.info();
                  // sails.log.info('converted query sql:', query.toSQL());

                  query
                     .then((data) => {
                        sails.log.info(".... query data : ", data);
                        var ids = data
                           .map((d) => {
                              return d[parseColumn];
                           })
                           .filter((d) => d != null);
                        ids = _.uniq(ids);

                        done(null, ids);
                        // buildCondition(newKey, ids);
                     })
                     .catch((err) => {
                        ADCore.error.log(
                           "AppBuilder:Policy:ABModelConvertDataCollectionCondition:Error running query:",
                           { error: err }
                        );
                        done(err);
                     });
               }

               // continueSingle
               // in 3 of our 4 cases we only need to run a single Query to
               // finish our conversion.
               function continueSingle(newKey, parseColumn, queryColumn) {
                  processQueryValues(parseColumn, queryColumn, (err, ids) => {
                     if (err) {
                        cb(err);
                     } else {
                        buildCondition(newKey, ids);
                     }
                  });
               }
            });
      } // if !object
   } // if !cond
}
