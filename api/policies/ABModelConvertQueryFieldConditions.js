/**
 *
 * @module      ABModelConvertQueryFieldConditions
 * @description :: Policy
 *              :: Scan any provided conditions to see if we have a 'in_query_field'
 *                 or 'not_in_query_field' clause.  If we do, convert it to an IN or NOT IN
 *                 clause. This will filter by the selected field.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

const path = require("path");
const ABFieldDate = require(path.join(
   __dirname,
   "..",
   "classes",
   "platform",
   "dataFields",
   "ABFieldDate.js"
));
const ABFieldUser = require("../classes/platform/dataFields/ABFieldUser");

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
      if (
         _where.rule == "in_query_field" ||
         _where.rule == "not_in_query_field"
      ) {
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
         // make sure our value can be divided into query and field ids by a ":"
         var values = cond.value.split(":");
         if (values.length < 2) {
            ADCore.error.log(
               "AppBuilder:Policy:ABModelConvertQueryFieldConditions:Values format is not correct:",
               { value: cond.value, condition: cond }
            );

            var err = new Error("Value was not properly formated.");
            err.condition = cond;
            cb(err);
            return;
         }
         var queryID = values[0];
         var queryFieldID = values[1];
         if (!queryID || !queryFieldID) {
            ADCore.error.log(
               "AppBuilder:Policy:ABModelConvertQueryFieldConditions:Values format is not correct:",
               { queryID: queryID, queryFieldID: queryFieldID }
            );

            var err = new Error("Value was not properly formated.");
            err.condition = cond;
            cb(err);
            return;
         }

         // make sure we find our QueryObject
         // var QueryObj = object.application.queries((q)=>{ return q.id == queryID; })[0];
         var QueryObj = ABObjectCache.get(queryID);
         if (!QueryObj) {
            ADCore.error.log(
               "AppBuilder:Policy:ABModelConvertQueryFieldConditions:Could not find specified query object:",
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
               queryColumn = object.dbTableName(true) + "." + object.PK();
               newKey = object.PK(); // 'id';  // the final filter needs to be 'id IN []', so 'id'
               parseColumn = object.PK(); // 'id';  // make sure we pull our 'id' values from the query

               continueSingle(newKey, parseColumn, queryColumn);
            } else {
               // this is a linkField IN QUERY filter:

               // find field by it's name
               var field = object.fields(
                  (f) => f.columnName == cond.key || f.id == cond.key
               )[0];
               if (!field) {
                  ADCore.error.log(
                     "AppBuilder:Policy:ABModelConvertQueryFieldConditions:Unable to resolve condition field.:",
                     { field: cond.key, condition: cond }
                  );
                  var err = new Error("Unable to resolve condition field.");
                  err.condition = cond;
                  cb(err);
                  return;
               }

               // get the Query Field we want to pull out
               var queryField = QueryObj.fields(
                  (f) => (f.field ? f.field.id : f.id) == queryFieldID
               )[0];
               if (!queryField) {
                  ADCore.error.log(
                     "AppBuilder:Policy:ABModelConvertQueryFieldConditions:Unable to resolve query field.:",
                     { fieldID: queryFieldID, condition: cond }
                  );
                  var err = new Error("Unable to resolve query field.");
                  err.condition = cond;
                  cb(err);
                  return;
               }

               // get the query field's object and column name
               let columnName =
                  queryField.dbPrefix().replace(/`/g, "") +
                  "." +
                  queryField.columnName;

               // run the Query, and parse out that data
               // var query = null;
               QueryObj.queryFind(
                  {
                     columnNames: [columnName],
                     ignoreIncludeId: true // we want real id
                  },
                  req.user.data
               ).then((data) => {
                  // query.clearSelect().columns(columnName);

                  // sails.log.info();
                  // sails.log.info('converted query sql:', query.toSQL());

                  // query
                  // .then((data)=>{

                  sails.log.info(".... query data : ", data);
                  var values = data
                     .map((d) => {
                        // let result = d[queryField.columnName];
                        let result = d[columnName];
                        if (!result) return null;

                        // Convert SQL data time format
                        if (queryField instanceof ABFieldDate) {
                           return queryField.toSQLFormat(result);
                        } else {
                           return result;
                        }
                     })
                     .filter((val) => val);

                  // modify the condition to be the IN condition
                  // convert cond into an IN or NOT IN
                  cond.key = "{prefix}.`{columnName}`"
                     .replace("{prefix}", field.dbPrefix())
                     .replace("{columnName}", field.columnName);
                  var convert = {
                     in_query_field: "in",
                     not_in_query_field: "not_in",
                     in: "in",
                     not_in: "not_in"
                  };
                  cond.rule = convert[cond.rule];

                  // Multiple users, then return id of user array
                  if (
                     queryField instanceof ABFieldUser &&
                     queryField.settings.isMultiple
                  ) {
                     let users = [];

                     (values || []).forEach((u) => {
                        if (typeof u == "string") {
                           try {
                              u = JSON.parse(u);
                           } catch (e) {}
                        }

                        (u || [])
                           .map((u) => u.id || u)
                           .forEach((username) => users.push(username));
                     });

                     values = users;
                  }

                  cond.value = _.uniq(values); // use _.uniq() to only return unique values (no duplicates)

                  sails.log.info(".... new Condition:", cond);

                  // final step, so parse another condition:
                  parseQueryCondition(_where, object, req, res, cb);

                  // })
                  // .catch((err)=>{
                  //     ADCore.error.log('AppBuilder:Policy:ABModelConvertQueryFieldConditions:Error running query:', { error:err });
                  //     cb(err);
                  // })
               });
            }
         } // if !QueryObj
      } // if !object
   } // if !cond
}
