/**
 * ABProcessInstanceController
 *
 * @description :: Server-side logic for managing Process instances
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var path = require("path");

module.exports = {
   _config: {
      model: "abprocessinstance", // all lowercase model name
      actions: false,
      shortcuts: false,
      rest: true
   },

   // post /app_builder/abprocessinstance/reset
   // reset a given process instance
   resetInstance: (req, res) => {
      // @param.instanceID {string} the uuid of the process Instance
      // @param.taskID     {string} the diagramID of the task that had the error

      var inputs = req.allParams();
      var requiredParams = ["instanceID", "taskID"];
      var missingParams = [];
      requiredParams.forEach((param) => {
         if (!inputs[param]) {
            missingParams.push(param);
         }
      });
      if (missingParams.length > 0) {
         var error = ADCore.error.fromKey("E_MISSINGPARAM");
         error.params = missingParams;
         res.AD.error(error);
         return;
      }

      // make sure instanceID is an array
      if (!Array.isArray(inputs.instanceID)) {
         inputs.instanceID = [inputs.instanceID];
      }
      ABProcess.reset(inputs.instanceID, inputs.taskID)
         .then(() => {
            res.AD.success({ reset: true });
         })
         .catch((err) => {
            res.AD.error(err);
         });
   }
};
