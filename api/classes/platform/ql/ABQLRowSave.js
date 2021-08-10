/*
 * ABQLRowSave
 *
 * An ABQLRowSave can store the current Data set into the Process Task it is
 * in, so that this data can be made available to other Process Tasks.
 *
 */

const ABQLRowSaveCore = require("../../core/ql/ABQLRowSaveCore.js");

class ABQLRowSave extends ABQLRowSaveCore {
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
         throw new Error("ABQLRowSave.do() called without a Promise chain!");
      }

      // capture the new promise from the .then() and
      // return that as the next link in the chain
      let nextLink = chain.then((context) => {
         let nextContext = {
            label: "ABQLRowSave",
            object: context.object,
            prev: context
         };

         if (!context.data) {
            // weird!  pass along our context with data == null;
            nextContext.log = "no data set!";
         }
         else {
            // NOTE:: If context.data is an array, then save only the first row ?
            nextContext.data = Array.isArray(context.data) && context.data.length > 0 ? context.data[0] : context.data;
         }

         // save the current context.data to our process state:
         let value = {};
         value[this.taskParam] = context.data;
         this.task.stateUpdate(instance, value);

         return nextContext;
      });

      if (this.next) {
         return this.next.do(nextLink, instance);
      } else {
         return nextLink;
      }
   }
}

module.exports = ABQLRowSave;
