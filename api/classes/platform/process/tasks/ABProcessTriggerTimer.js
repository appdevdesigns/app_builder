const ABProcessTriggerTimerCore = require("../../../core/process/tasks/ABProcessTriggerTimerCore");

module.exports = class ABProcessTriggerTimer extends ABProcessTriggerTimerCore {
   /**
    * @method save()
    * persist this instance of ABObject with it's parent ABApplication
    * @return {Promise}
    */
   save() {
      return (
         Promise.resolve()
            .then(() => super.save())
            // Restart the timer
            .then(() => ABProcessTimer.start(this))
      );
   }
};
