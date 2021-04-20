/**
 * @module      ABModelConvertSailsCondition
 *
 * @description :: Policy
 *              :: Convert any provided Sails condition into our QB like
 *                 condition format.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require("url");
var AD = require("ad-utils");
var _ = require("lodash");

var DebugWhere = "";

/**
 * packageBetween
 * return a properly formatted Query Builder BETWEEN rule.
 * @param {string} field  the sails fieldname
 * @param {obj} opValue  the sails condition that represents the BETWEEN
 * @return {obj} a Query Builder BETWEEN instruction
 */
function packageBetween(field, opValue) {
   return (result = {
      key: field,
      rule: "between",
      value: [opValue[">="], opValue["<="]]
   });
}

/**
 * parseCondition
 * when given the sails operation object, return the data value portion of a
 * converted qbCondition.
 * @param {string} field  the sails condition fieldName
 * @param {obj} opValue   the sails condition structure
 * @return {obj}  a Query Builder version of the same condition
 */
function parseCondition(field, opValue) {
   result = null;

   // check for a NULL value:
   if (opValue == "null" || opValue == null) {
      return {
         key: field,
         rule: "is_null",
         value: ""
      };
   }

   if (typeof opValue["!"] != "undefined") {
      // this is a NOT condition, so first get base condition, and modify it.
      result = parseCondition(field, opValue["!"]);

      // now modify the result to the 'not_' version:
      if (result.rule != "is_null" && result.rule != "is_empty") {
         // standard case
         result.rule = "not_" + result.rule;
      } else {
         // special cases:
         switch (result.rule) {
            case "is_null":
               result.rule = "is_not_null";
               break;

            case "is_empty":
               result.rule = "is_not_empty";
               break;
         }
      }

      return result;
   }

   // if this is a discrete value:
   if (typeof opValue == "string" || typeof opValue == "number") {
      // Check for an Empty value:
      if (opValue == "") {
         return {
            key: field,
            rule: "is_empty",
            value: ""
         };
      }

      // finally, this must be an equals:
      return {
         key: field,
         rule: "equals",
         value: opValue
      };
   }

   // field : [1,2,3,...]
   if (Array.isArray(opValue)) {
      return {
         key: field,
         rule: "in",
         value: opValue
      };
   }

   // now lookup the standard key value conditions:
   var ruleHash = {
      // sails version    :  QueryBuilder version
      startsWith: "begins_with",
      contains: "contains",
      endsWith: "ends_with",
      "<": "less",
      "<=": "less_or_equal",
      ">": "greater",
      ">=": "greater_or_equal",

      // NOTE: this isn't a Sails condition, it is one of our own
      // special conditions, we need to pass on:
      // { 'fieldName': { 'haveNoRelation':XX } }  // the value XX isn't important.
      haveNoRelation: "have_no_relation"
   };

   for (var r in ruleHash) {
      if (typeof opValue[r] != "undefined") {
         // special case:  BETWEEN:
         // if  r is '<='  then see if '>=' is ALSO included:
         if (r == "<=") {
            if (typeof opValue[">="] != "undefined") {
               result = packageBetween(field, opValue);
            }
         } else if (r == ">=") {
            if (typeof opValue["<="] != "undefined") {
               result = packageBetween(field, opValue);
            }
         }

         // if we get here without result set, result is a normal conversion:
         if (!result) {
            result = {
               key: field,
               rule: ruleHash[r],
               value: opValue[r]
            };
         }
      }
   }

   // if any of the previous cases generated a result, return that
   if (result) {
      return result;
   }

   ADCore.error.log(
      "app_builder:policy:ABModelConvertSailsCondition(): parseCondition() resulted in a NULL condition.",
      {
         field: field,
         opValue: opValue,
         debugWhere: DebugWhere
      }
   );
   return null;
}

/**
 * processCondition
 * this is a recursive fn() designed to evaluate an given sails condition object
 * and break it down into QueryBuilder format.
 * @param {obj} sailsCond
 * @return {obj} QB object condition.
 */
function processCondition(sailsCond) {
   var newCond = null;

   // step through the base sailsCond and see if there are implied AND key:value pairs
   var rules = [];
   for (var c in sailsCond) {
      var lcField = c.toLowerCase();
      if (lcField != "and" && lcField != "or") {
         rules.push(parseCondition(c, sailsCond[c]));
      }
   }

   // if there were, then create a base AND group, and add them.
   // or, if there is a { and : [] }  condition, create a base AND group:
   if (rules.length > 0 || sailsCond.and) {
      newCond = {
         glue: "and",
         rules: rules
      };
   }

   // if an AND condition was included
   if (sailsCond.and) {
      // in either case, we add to the
      sailsCond.and.forEach((r) => {
         newCond.rules.push(processCondition(r));
      });
   }

   // if an OR condition was included
   if (sailsCond.or) {
      var insertRules = null;

      // if there are no current rules, then our base is an OR clause
      if (rules.length == 0) {
         // this should be a base OR operation
         newCond = {
            glue: "or",
            rules: []
         };

         insertRules = newCond.rules;
      } else {
         // we already have an existing AND clause, so add this to the end:
         var orCond = {
            glue: "or",
            rules: []
         };
         newCond.rules.push(orCond);

         insertRules = orCond.rules;
      }

      // for each OR statement, insert into our current rules.
      sailsCond.or.forEach((r) => {
         insertRules.push(processCondition(r));
      });
   }

   return newCond;
}

module.exports = function(req, res, next) {
   // We need to check a given .where value and determine if it is in our Sails
   // compatible format, and if so convert it to our QueryBuilder format.
   //
   // the Sails like format would look like:
   // {
   //   name_first: { startsWith: 'a' },
   //   name_family: { startsWith: 'a' },
   //   or : [
   //     {
   //       name_first : { "!": { startsWith: 'Apple'}},
   //       name_family: { "!": { contains: 'Pie'}}
   //     },
   //     {
   //       name_first : { endsWith: 'Crumble' },
   //       name_family: 'Goodness'
   //     }
   //   ]
   // }
   //
   // QB Conditions look like:
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

   // NOTE: our depreciated filter conditions look like:
   // [
   //     {
   //         combineCondition: 'and',
   //         fieldName: 'name_family',
   //         operator: '',
   //         inputValue: ''
   //     },
   //     {
   //         combineCondition: 'and',
   //         fieldName: 'name_family',
   //         operator: '',
   //         inputValue: ''
   //     },
   //      ...
   // ]

   // move along if no or empty where clause
   if (_.isEmpty(req.options._where)) {
      next();
      return;
   }

   // if this is a sails compatible format:
   // this is done by process of elimination:
   // QB conditions contain: .glue
   // filter conditions contain: .combineCondition

   // skip filter conditions:
   var firstOption = req.options._where;
   if (Array.isArray(req.options._where)) {
      firstOption = req.options._where[0];
   }
   if (
      firstOption.combineCondition ||
      (firstOption.fieldName && firstOption.operator)
   ) {
      next();
      return;
   }

   // skip QB conditions:
   if (!_.isUndefined(req.options._where.glue)) {
      next();
      return;
   }

   DebugWhere = JSON.stringify(req.options._where);

   // Must be a Sails compatibal condition:
   req.options._where = processCondition(req.options._where);
   next();
};
