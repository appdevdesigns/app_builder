const CalculateTaskCore = require("../../../core/process/tasks/ABProcessTaskServiceCalculateCore.js");

module.exports = class CalculateTask extends CalculateTaskCore {
   /**
    * @method do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance, trx) {
      this.stateCompleted(instance);
      return Promise.resolve(true);
   }

   /**
    * @method processData()
    * return the current value requested for the given data key.
    * @param {obj} instance
    * @return {mixed} | null
    */
   processData(instance, key) {
      if (key) {
         const parts = (key || "").split(".");
         if (parts[0] != this.id) return null;
      }

      let formula = this.formulaText || "";

      (this.process.processDataFields(this) || []).forEach((item) => {
         if (formula.indexOf(item.label) < 0) return;

         let processedData = this.process.processData(this, [
            instance,
            item.key
         ]);

         formula = formula.replace(
            new RegExp(`{${item.label}}`, "g"),
            processedData == null || processedData == "" ? 0 : processedData
         );
      });

      // Allow only Number, Operators (+ - * / |)
      formula = formula.replace(/[^\d+\-*/|().]*/g, "");

      let result;
      try {
         result = eval(formula);
      } catch (err) {
         const error = new Error(
            `${formula} : Formula is invalid: ${err.toString()}`
         );
         this.onError(instance, error);
      }
      return result;
   }
};
