/*
 * ABQLFind
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */
const ABQLFindCore = require("../../core/ql/ABQLFindCore.js");

class ABQLFind extends ABQLFindCore {
   // constructor(attributes, prevOP, task, application) {
   //     super(attributes, ParameterDefinitions, prevOP, task, application);
   // }
   ///
   /// Instance Methods
   ///

   /**
    * do()
    * perform the action for this Query Language Operation.
    * @param {Promise} chain
    *         the current promise chain of actions being performed.
    * @param {obj} instance
    *        The current process instance values used by our tasks to store
    *        their state/values.
    * @return {Promise}
    */
   do(chain, instance) {
      if (!chain) {
         throw new Error("ABQLFind.do() called without a Promise chain!");
      }

      // capture the new promise from the .then() and
      // return that as the next link in the chain
      var nextLink = chain.then((context) => {
         var nextContext = {
            label: "ABQLFind",
            object: context.object,
            data: null,
            prev: context
         };

         if (!context.object) {
            // weird!  pass along our context with data == null;
            return nextContext;
         }

         // otherwise, we perform our find, save the results to our
         // nextContext and then continue on:
         return new Promise((resolve, reject) => {
            var cond = null;
            if (this.params) {
               cond = this.params.cond;
            }
            var reducedCondition = this.conditionReduce(cond, instance);
            context.object
               .modelAPI()
               .findAll(reducedCondition)
               .then((rows) => {
                  nextContext.data = rows;
                  resolve(nextContext);
               })
               .catch(reject);
         });
      });

      if (this.next) {
         return this.next.do(nextLink, instance);
      } else {
         return nextLink;
      }
   }

   /**
    * @method conditionReduce()
    * parse through our defined conditions, and resolve any "context" related
    * values.
    * @param {obj} cond
    *        The QueryBuilder condition object defined from the UI.
    * @param {obj} instance
    *        The current process instance values used by our tasks to store
    *        their state/values.
    * @return {obj}
    *        Return a NEW condition object that is resolved into useable values
    *        for the .findAll() operation.
    */
   conditionReduce(cond, instance) {
      var newCond = {};

      if (cond) {
         // if this is a group condition, then reduce each of it's rules:
         if (cond.rules) {
            newCond.glue = cond.glue;
            newCond.rules = [];
            cond.rules.forEach((r) => {
               newCond.rules.push(this.conditionReduce(r, instance));
            });
         } else {
            newCond.value = cond.value;
            newCond.key = cond.key;
            newCond.rule = cond.rule;

            // if this is one of our context values:
            if (cond.rule.indexOf("context") == 0) {
               newCond.value = this.task.process.processData(this.task, [
                  instance,
                  cond.value
               ]);
               newCond.rule = cond.rule.replace("context_", "");

               // previous format fix:
               if (["equals", "not_equal"].indexOf(newCond.rule) == -1) {
                  newCond.rule = "equals";
               }
            }
         }
      }

      return newCond;
   }
}

module.exports = ABQLFind;
