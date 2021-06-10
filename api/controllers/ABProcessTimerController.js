/**
 * ABProcessController
 *
 * @description :: Server-side logic for managing our process apis
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
const ABProcessTriggerTimer = require("../classes/platform/process/tasks/ABProcessTriggerTimer");

module.exports = {
   // PUT /process/timer/:elementId/start
   start: (req, res) => {
      let id = req.param("elementId");

      ABDefinitionModel.find({ type: "trigger", id: id }).then((defTimers) => {
         let GeneralApp = ABSystemObject.getApplication();

         defTimers.forEach((def) => {
            ABProcessTimer.start(
               new ABProcessTriggerTimer(def.json, GeneralApp)
            );
         });

         if (defTimers && defTimers.length) {
            res.AD.success(true);
         } else {
            res.AD.success(false);
         }
      });
   },

   // PUT /process/timer/:elementId/stop
   stop: (req, res) => {
      let id = req.param("elementId");
      ABProcessTimer.stop(id);
      res.AD.success(true);
   },

   // GET /process/timer/:elementId
   getStatus: (req, res) => {
      let id = req.param("elementId");
      res.AD.success({
         isRunning: ABProcessTimer.isRunning(id)
      });
   }
};
