const ABProcessEndCore = require("../../../core/process/tasks/ABProcessEndCore.js");

module.exports = class ABProcessEnd extends ABProcessEndCore {
   /**
    * do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   // do(instance) {
   //     return new Promise((resolve, reject) => {
   //         // An End Event doesn't perform any other actions
   //         // than to signal it has successfully completed.
   //         // But it provides no Additional Tasks to work on.
   //         // for testing:
   //         this.stateCompleted(instance);
   //         this.log(instance, "End Event Reached");
   //         resolve(true);
   //     });
   // }
};
