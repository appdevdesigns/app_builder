/*
 * ABQLRowUpdate
 *
 * An ABQLRow Update allows you to update the values on the current
 * Row of data.
 *
 */

const ABQLRowUpdateCore = require("../../core/ql/ABQLRowUpdateCore.js");
const retry = require("../UtilRetry.js");

class ABQLRowUpdate extends ABQLRowUpdateCore {
   // constructor(attributes, prevOP, task, application) {
   //     super(attributes, ParameterDefinitions, prevOP, task, application);
   //     // #Hack! : when an Operation provides the same .NextQlOps that it
   //     // was defined in, we can't require it again ==> circular dependency.
   //     // so we manually set it here from the operation that created us:
   //     this.constructor.NextQLOps = prevOP.constructor.NextQLOps;
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
         throw new Error("ABQLRowUpdate.do() called without a Promise chain!");
      }

      // capture the new promise from the .then() and
      // return that as the next link in the chain
      var nextLink = chain.then((context) => {
         var nextContext = {
            label: "ABQLRowUpdate",
            object: context.object,
            data: null,
            prev: context
         };

         if (!context.object || context.data == null) {
            // weird!  pass along our context with data == null;

            if (!context.data) {
               var current = context;
               console.error("no data provided to ABQLRowUpdate:", current);
               while (current.prev) {
                  current = current.prev;
                  console.error("prev:", current);
               }
            }

            return nextContext;
         }

         // otherwise, we perform our find, save the results to our
         // nextContext and then continue on:
         return new Promise((resolve, reject) => {
            // if there are no values to update then just continue.
            if (
               !this.params ||
               !this.params.values ||
               this.params.values.length < 1
            ) {
               resolve(nextContext);
               return;
            }

            // figure out the update values:
            var updateParams = {};
            for (var v = 0; v < this.params.values.length; v++) {
               var value = this.params.values[v];
               var field = context.object.fields((f) => {
                  return f.id == value.fieldId;
               })[0];
               if (!field) {
                  var missingFieldError = new Error(
                     `ABQLRowUpdate could not find field[${value.fieldId}] in provided object[${context.object.id}]`
                  );
                  reject(missingFieldError);
                  return;
               }

               // Set value from process data
               if (value && value.isProcessValue) {
                  // get process field
                  let processField = (
                     this.task.process.processDataFields(this.task) || []
                  ).filter(
                     (opt) =>
                        opt &&
                        (opt.key == value.value ||
                           opt.value == value.value ||
                           opt.label == value.value)
                  )[0];

                  // pull/set the process value
                  if (processField) {
                     updateParams[
                        field.columnName
                     ] = this.task.process.processData(this.task, [
                        instance,
                        processField.key
                     ]);
                  }
               }
               // Set custom value
               else {
                  updateParams[field.columnName] = value.value;
               }
            }

            // Find the ID of the current .data row
            var PK = context.object.PK();
            var id = context.data[PK];

            // call .requestParams to set default values and reformat value properly
            updateParams = context.object.requestParams(updateParams);

            // Perform the update.
            retry(() => context.object.modelAPI().update(id, updateParams))
               .then((updatedRow) => {
                  // this returns the fully populated & updated row
                  nextContext.data = updatedRow;
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
}

module.exports = ABQLRowUpdate;
