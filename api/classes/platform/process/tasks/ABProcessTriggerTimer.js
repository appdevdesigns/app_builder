const ABProcessTriggerTimerCore = require("../../../core/process/tasks/ABProcessTriggerTimerCore");

module.exports = class ABProcessTriggerTimer extends ABProcessTriggerTimerCore {
   /**
    * @method save()
    *
    * persist this instance of ABObject with it's parent ABApplication
    *
    *
    * @return {Promise}
    *						.resolve( {this} )
    */
   save() {
      return Promise.resolve()
         .then(() => super.save())
         .then(() => {
            this.isEnabled
               ? ABProcessTimer.start(this)
               : ABProcessTimer.stop(this.id);

            return Promise.resolve();
         });
   }
};
