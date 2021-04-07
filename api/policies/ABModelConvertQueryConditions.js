/**
 *
 *
 * @module      ABModelConvertQueryConditions
 * @description :: Policy
 *              :: Scan any provided conditions to see if we have a 'in_query'
 *                 or 'not_in_query' clause.  If we do, convert it to an IN or NOT IN
 *                 clause. The assumption is that the current object is in this query.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require("url");
var AD = require("ad-utils");
var _ = require("lodash");

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

function findQueryEntry(_where) {
   if (_where.rules) {
      var entry = null;
      for (var i = 0; i < _where.rules.length; i++) {
         entry = findQueryEntry(_where.rules[i]);
         if (entry) {
            return entry;
            break;
         }
      }
      return entry;
   } else {
      if (_where.rule == "in_query" || _where.rule == "not_in_query") {
         return _where;
      } else {
         return null;
      }
   }
}

function parseQueryCondition(_where, object, req, res, cb) {
   var cond = findQueryEntry(_where);
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
                  "AppBuilder:Policy:ABModelConvertQueryConditions:error finding object for this route:",
                  { error: err }
               );

               // exit with error:
               cb(err);
            });
      } else {
         // make sure we find our QueryObject
         // var QueryObj = object.application.queries((q)=>{ return q.id == cond.value; })[0];
         var QueryObj = ABObjectCache.get(cond.value);
         if (!QueryObj) {
            ADCore.error.log(
               "AppBuilder:Policy:ABModelConvertQueryConditions:Could not find specified query object:",
               { qid: cond.value, condition: cond }
            );

            var err = new Error("Unknown Query ID in condition.");
            err.condition = cond;
            cb();
         } else {
            var queryColumn;
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

            // if this is our special 'this_object' 'in_query'  queryID  filter:
            if (cond.key == "this_object") {
               if (!QueryObj.canFilterObject(object)) {
                  ADCore.error.log(
                     "AppBuilder:Policy:ABModelConvertQueryConditions:object not filterable by Query:",
                     { object: object, queryObj: QueryObj }
                  );
                  var err = new Error("Object not filterable by Query.");
                  cb(err);
                  return;
               }

               let alias = QueryObj.objectAlias(object.id);

               queryColumn = alias + "." + object.PK();
               newKey = object.PK(); // 'id';  // the final filter needs to be 'id IN []', so 'id'
               parseColumn = object.PK(); // 'id';  // make sure we pull our 'id' values from the query

               continueSingle(newKey, parseColumn, queryColumn, "this_object");
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
                        "AppBuilder:Policy:ABModelConvertQueryConditions:Unable to resolve condition field.:",
                        { field: cond.key, condition: cond }
                     );
                     var err = new Error("Unable to resolve condition field.");
                     err.condition = cond;
                     cb(err);
                     return;
                  }
               }

               // if get the field's linked object and see if it can be filtered:
               var linkedObject = field.datasourceLink;
               if (!QueryObj.canFilterObject(linkedObject)) {
                  ADCore.error.log(
                     "AppBuilder:Policy:ABModelConvertQueryConditions:Linked object not filterable by Query:",
                     {
                        field: field,
                        linkedObj: linkedObject,
                        queryObj: QueryObj
                     }
                  );
                  var err = new Error("Linked object not filterable by Query.");
                  cb(err);
                  return;
               } else {
                  // based upon the type of link:
                  var linkCase = field.linkType() + ":" + field.linkViaType();
                  switch (linkCase.toLowerCase()) {
                     case "one:one":
                     case "one:many":
                        // this field is used in final filter condition
                        // let newKey = "";

                        // Johnny
                        // there are Query cases where we need to make sure the field is identified by
                        // it's dbTableName as well, to prevent 'Unknown Column' Errors.
                        // adding in the dbTableName since I think it will be safe in all situations ... maybe ..
                        if (object.objectAlias) {
                           newKey = `${object.objectAlias(field.object.id)}.${
                              field.columnName
                           }`;

                           parseColumn = field.indexField
                              ? field.indexField.columnName
                              : field.datasourceLink.PK();

                           // make this the queryColumn:
                           queryColumn = `${QueryObj.objectAlias(
                              field.datasourceLink.id
                           )}.${parseColumn}`;
                        }
                        // ABObject
                        else {
                           var dbTableName = field.object.dbTableName(true);
                           if (dbTableName) {
                              newKey = `${dbTableName}.${field.columnName}`;
                           }

                           parseColumn = field.indexField
                              ? field.indexField.columnName
                              : linkedObject.PK();

                           // make this the queryColumn:
                           queryColumn = `${QueryObj.objectAlias(
                              linkedObject.id
                           )}.${parseColumn}`;
                        }

                        continueSingle(
                           newKey,
                           parseColumn,
                           queryColumn,
                           linkCase
                        );
                        break;

                     case "many:one":
                        // ABObjectQuery
                        if (object.objectAlias) {
                           newKey = `${object.objectAlias(
                              field.object.id
                           )}.${field.relationName()}`;

                           parseColumn = field.datasourceLink.PK();

                           queryColumn = `${QueryObj.objectAlias(
                              field.datasourceLink.id
                           )}.${parseColumn}`;
                        }
                        // ABObject
                        else {
                           newKey = field.indexField
                              ? field.indexField.columnName
                              : field.object.PK();

                           let dbTableName = field.object.dbTableName(true);
                           if (dbTableName) {
                              newKey = `${dbTableName}.${newKey}`;
                           }

                           parseColumn = field.indexField
                              ? field.indexField.columnName
                              : field.object.PK();

                           queryColumn = `${QueryObj.objectAlias(
                              field.object.id
                           )}.${parseColumn}`;
                        }

                        continueSingle(
                           newKey,
                           parseColumn,
                           queryColumn,
                           linkCase
                        );
                        break;

                     // case 'many:one':
                     //     // they contain my .PK

                     //     // my .PK is what is used on our filter
                     //     newKey = object.PK(); // 'id';

                     //     if (object.objectAlias)
                     //         newKey = object.objectAlias(linkedObject.id) + '.' + newKey;

                     //     // I need to pull out the linkedField's columnName
                     //     parseColumn = linkedField.columnName;

                     //     // make this the queryColumn:
                     //     queryColumn = QueryObj.objectAlias(linkedObject.id)+'.'+linkedField.columnName;

                     //     continueSingle(newKey, parseColumn, queryColumn);
                     //     break;

                     case "many:many":
                        // ABObjectQuery
                        if (object.objectAlias) {
                           newKey = `${object.objectAlias(
                              field.object.id
                           )}.${field.object.PK()}`;

                           parseColumn = field.object.PK();

                           queryColumn = `${QueryObj.objectAlias(
                              field.object.id
                           )}.${parseColumn}`;
                        }
                        // ABObject
                        else {
                           newKey = field.object.PK();

                           let dbTableName = field.object.dbTableName(true);
                           if (dbTableName) {
                              newKey = `${dbTableName}.${newKey}`;
                           }

                           parseColumn = field.object.PK();

                           queryColumn = `${QueryObj.objectAlias(
                              field.object.id
                           )}.${parseColumn}`;
                        }

                        continueSingle(
                           newKey,
                           parseColumn,
                           queryColumn,
                           linkCase
                        );
                        break;
                     // case "many:many":
                     //    // we need the .PK of our linked column out of the given query
                     //    parseColumn = linkedObject.PK(); // 'id';
                     //    queryColumn =
                     //       QueryObj.objectAlias(linkedObject.id) +
                     //       "." +
                     //       parseColumn;

                     //    processQueryValues(
                     //       parseColumn,
                     //       queryColumn,
                     //       (err, ids) => {
                     //          if (err) {
                     //             cb(err);
                     //             return;
                     //          }

                     //          // then we need to get which of our PK is stored in the linkTable for those linked entries
                     //          var linkTableQuery = ABMigration.connection().queryBuilder();
                     //          var joinTableName = field.joinTableName(true);

                     //          // var parseName = object.name;
                     //          var parseName = field.object.name;
                     //          linkTableQuery
                     //             .select(parseName)
                     //             .distinct()
                     //             .from(joinTableName)
                     //             .where(linkedObject.name, "IN", ids)
                     //             .then((data) => {
                     //                var myIds = data
                     //                   .map((d) => {
                     //                      return d[parseName];
                     //                   })
                     //                   .filter((d) => d != null);
                     //                myIds = _.uniq(myIds);

                     //                var myPK = object.PK(); // 'id';

                     //                // if it is a query, then add alias
                     //                if (object.objectAlias)
                     //                   myPK =
                     //                      object.objectAlias(field.object.id) +
                     //                      "." +
                     //                      field.object.PK(); // 'alias'.'id';

                     //                buildCondition(myPK, myIds);
                     //             })
                     //             .catch((err) => {
                     //                cb(err);
                     //             });
                     //       }
                     //    );
                     //    break;
                  }
               }
            }

            // buildCondition
            // final step of recreating the condition into the
            // proper Field IN []  format;
            function buildCondition(newKey, ids, linkCase) {
               // convert cond into an IN or NOT IN
               cond.key = newKey;
               var convert = {
                  in_query: "in",
                  not_in_query: "not_in"
               };
               cond.rule = convert[cond.rule];
               cond.value = _.uniq(ids); // use _.uniq() to only return unique values (no duplicates)

               // M:1 - filter __relation column in MySQL view with string
               if (linkCase == "many:one") {
                  cond.rule = "contains";
                  cond.value = ids[0] || "";
               }

               sails.log.info(".... new Condition:", cond);

               // final step, so parse another condition:
               parseQueryCondition(_where, object, req, res, cb);
            }

            // processQueryValues
            // this step runs the specified Query and pulls out an array of
            // ids that can be used for filtering.
            // @param {string} parseColumn  the name of the column of data to pull from the Query
            // @param {string} queryColumn  [table].[column] format of the data to pull from Query
            // @param {fn} done  a callback routine  done(err, data);
            function processQueryValues(
               parseColumn,
               queryColumn,
               done,
               numRetries
            ) {
               var query = QueryObj.queryFind(
                  {
                     columnNames: [queryColumn],
                     ignoreIncludeId: true // we want real id
                  },
                  req.user.data
               );
               // query.clearSelect().column(queryColumn);
               var querySQL = query.toString();
               // sails.log.info();
               // sails.log.info('converted query sql:', query.toSQL());

               query
                  .then((data) => {
                     sails.log.info(".... query data : ", data);
                     // var ids = data.map((d)=>{ return d[parseColumn] });
                     var ids = data
                        .map((d) => {
                           return d[queryColumn];
                        })
                        .filter((d) => d != null);
                     ids = _.uniq(ids);

                     done(null, ids);
                     // buildCondition(newKey, ids);
                  })
                  .catch((err) => {
                     var errString = err.toString();
                     if (errString.indexOf("ETIMEDOUT") > -1) {
                        numRetries = numRetries || 1;
                        if (numRetries <= 5) {
                           processQueryValues(
                              parseColumn,
                              queryColumn,
                              done,
                              numRetries + 1
                           );
                           return;
                        }
                     }

                     var sqlString = querySQL;
                     try {
                        sqlString = JSON.stringify(querySQL);
                     } catch (e) {
                        // move along.
                     }
                     ADCore.error.log(
                        "AppBuilder:Policy:ABModelConvertQueryConditions:Error running query:",
                        { sql: sqlString, numRetries: numRetries, error: err }
                     );
                     done(err);
                  });
            }

            // continueSingle
            // in 3 of our 4 cases we only need to run a single Query to
            // finish our conversion.
            function continueSingle(
               newKey,
               parseColumn,
               queryColumn,
               linkCase
            ) {
               processQueryValues(parseColumn, queryColumn, (err, ids) => {
                  if (err) {
                     cb(err);
                  } else {
                     buildCondition(newKey, ids, linkCase);
                  }
               });
            }
         } // if !QueryObj
      } // if !object
   } // if !cond
}
