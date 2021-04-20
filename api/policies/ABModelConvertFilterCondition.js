/**
 * @module ABModelConvertFilterCondition
 *
 * @description :: Policy
 *              :: Convert any provided Filter condition is in our QueryBuilder like
 *                 condition format.
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */

var url = require("url");
var AD = require("ad-utils");
var _ = require("lodash");

/**
 * RuleHash
 * A quick conversion lookup between the Filter operations, and QB Rules:
 */
var RuleHash = {
   // filter version   :  QueryBuilder version
   in_query: "in_query", // our special QUERY conditions.
   not_in_query: "not_in_query",

   contains: "contains",
   "doesn't contain": "not_contains",
   "is not": "not_equals",
   "is before": "less",
   "is after": "greater",
   "is on or before": "less_or_equal",
   "is on or after": "greater_or_equal",
   ":": "equals",
   "≠": "not_equals",
   "<": "less",
   "≤": "less_or_equal",
   ">": "greater",
   "≥": "greater_or_equal",
   equals: "equals",
   "does not equal": "not_equal",
   "is checked": "equals", // == 1
   "is not checked": "equals", // == 0
   "is null": "is_null",
   "is not null": "is_not_null",
   "is current user": "is_current_user",
   "is not current user": "is_not_current_user",
   "contains current user": "contain_current_user",
   "doesn't contain current user": "not_contain_current_user"
};

/**
 * parseCondition
 * when given the filter object, return the QB rule object.
 * @param {obj} rule   the filter condition operation
 * @return {obj}  a Query Builder version of the same condition
 */
function parseCondition(rule) {
   //    fieldName: '',
   //    operator: '',
   //    inputValue: '',

   result = {
      key: rule.fieldName,
      rule: RuleHash[rule.operator],
      value: rule.inputValue
   };

   return result;
}

/**
 * processCondition
 * this is a recursive fn() designed to evaluate an given sails condition object
 * and break it down into QueryBuilder format.
 * @param {obj} sailsCond
 * @return {obj} QB object condition.
 */
function processCondition(filterCond) {
   var newCond = null;

   // enforce array format:
   if (!Array.isArray(filterCond)) filterCond = [filterCond];

   var firstCondition = filterCond[0];
   if (firstCondition) {
      var glue = firstCondition.combineCondition || "and";
      newCond = {
         glue: glue.toLowerCase(),
         rules: []
      };

      filterCond.forEach((r) => {
         newCond.rules.push(parseCondition(r));
      });
   }

   return newCond;
}

module.exports = function(req, res, next) {
   // We need to check a given .where value and determine if it is in our old
   // filter compatible format, and if so convert it to our QueryBuilder format.
   //
   // the Filter compatible format would look like:
   // [
   //  {
   //    combineCondition: 'And',  // 'Or'
   //    fieldName: '',
   //    operator: '',
   //    inputValue: '',
   //  }
   // ]
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

   // move along if no or empty where clause
   if (_.isEmpty(req.options._where)) {
      next();
      return;
   }

   // skip QB conditions:
   if (!_.isUndefined(req.options._where.glue)) {
      next();
      return;
   }

   // if this is not a filter format => skip
   var firstOption = req.options._where;
   if (Array.isArray(req.options._where)) {
      firstOption = req.options._where[0];
   }
   // if (typeof firstOption.combineCondition == 'undefined') {
   if (
      _.isUndefined(firstOption.fieldName) &&
      _.isUndefined(firstOption.operator)
   ) {
      next();
      return;
   }

   // Must be a Filter compatible condition:
   req.options._where = processCondition(req.options._where);
   next();
};
