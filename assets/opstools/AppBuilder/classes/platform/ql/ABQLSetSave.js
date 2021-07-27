/*
 * ABQLSetSave
 *
 * An ABQLSetSave can store the current Data set into the Process Task it is
 * in, so that this data can be made available to other Process Tasks.
 *
 */

const ABQLSetSaveCore = require("../../core/ql/ABQLSetSaveCore.js");

class ABQLSetSave extends ABQLSetSaveCore {
   // constructor(attributes, prevOP, task, application) {
   //     super(attributes, [], prevOP, task, application);
   // }
   ///
   /// Instance Methods
   ///

   /*
    * @method paramChanged()
    * respond to an update to the given parameter.
    * NOTE: the value will ALREADY be saved in this.params[pDef.name].
    * @param {obj} pDef
    *        the this.parameterDefinition entry of the parameter that was
    *        changed.
    */
   paramChanged(pDef) {
      if (pDef.name == "task_param") {
         this.taskParam = this.params[pDef.name];
      }
   }

   parseRow(row, id) {
      super.parseRow(row, id);

      if (!this.registered) {
         this.task.registerDatasource(this);
         this.registered = true;
      }
   }
}
ABQLSetSave.uiIndentNext = 10;

module.exports = ABQLSetSave;
