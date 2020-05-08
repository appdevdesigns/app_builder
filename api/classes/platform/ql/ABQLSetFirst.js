/*
 * ABQLSetFirst
 *
 * An ABQLFind depends on a BASE QL object (Object, Datacollection, Query)
 * and can perform a DB query based upon that BASE object.
 *
 */

const ABQLSetFirstCore = require("../../core/ql/ABQLSetFirstCore.js");

class ABQLSetFirst extends ABQLSetFirstCore {
   // constructor(attributes, prevOP, task, application) {
   //     super(attributes, [], prevOP, task, application);
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
         throw new Error("ABQLSetFirst.do() called without a Promise chain!");
      }

      // capture the new promise from the .then() and
      // return that as the next link in the chain
      var nextLink = chain.then((context) => {
         var nextContext = {
            label: "ABQLSetFirst",
            object: context.object,
            data: null,
            prev: context
         };

         if (!context.data) {
            // weird!  pass along our context with data == null;
            nextContext.log = "no data set! can't setFirst() of null.";
            return nextContext;
         }

         // just pull the 1st entry and return that as our working data:
         if (Array.isArray(context.data)) {
            nextContext.data = context.data[0];
         } else {
            // this shouldn't happen!
            throw new Error("ABQLSetFirst.do() called on non Array of data.");
         }

         return nextContext;
      });

      if (this.next) {
         return this.next.do(nextLink, instance);
      } else {
         return nextLink;
      }
   }
}

module.exports = ABQLSetFirst;
