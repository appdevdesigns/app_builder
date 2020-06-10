/**
 * ABServerApp
 *
 * A Server side application object that can be used to lookup other
 * AppBuilder resources.
 *
 */
const path = require("path");
const ABClassProcess = require(path.join(
   "..",
   "classes",
   "platform",
   "ABProcess.js"
));
const ABProcessTaskManager = require(path.join(
   "..",
   "classes",
   "core",
   "process",
   "ABProcessTaskManager"
));

const ABProcessParticipant = require(path.join(
   "..",
   "classes",
   "platform",
   "process",
   "ABProcessParticipant"
));

const ABProcessLane = require(path.join(
   "..",
   "classes",
   "platform",
   "process",
   "ABProcessLane"
));

const ABApplication = require(path.join(
   "..",
   "classes",
   "platform",
   "ABApplication"
));
var GeneralApp = null;
var consoleCount = 0;
// function loadGeneralApp() {
//    if (typeof ABDefinitionModel != "undefined") {
//       GeneralApp = new ABApplication({});
//    } else {
//       if (consoleCount == 0) {
//          console.log("... ABServerApp: waiting for ABDefinitionModel to load");
//       }
//       consoleCount++;
//       if (consoleCount > 20) {
//          consoleCount = 0;
//       }
//       setTimeout(loadGeneralApp, 25);
//    }
// }
// loadGeneralApp();

var __AllDefinitions = {};

var Log = function(text) {
   console.log("ABServerApp:" + text);
};
module.exports = {
   objectNew: (def) => {
      if (!GeneralApp) {
         GeneralApp = ABSystemObject.getApplication();
      }
      return GeneralApp.objectNew(def);
   },

   processes: (fn = () => true) => {
      if (!GeneralApp) {
         GeneralApp = ABSystemObject.getApplication();
      }

      return ABDefinitionModel.find({ type: "process" }).then(
         (listDefinitions) => {
            var listProcesses = [];
            listDefinitions.forEach((def) => {
               listProcesses.push(new ABClassProcess(def.json, GeneralApp));
            });

            return listProcesses.filter(fn);
         }
      );
   },

   processElementNew: (tID, process) => {
      var taskDef = ABDefinitionModel.definitionForID(tID);
      if (taskDef) {
         switch (taskDef.type) {
            case ABProcessParticipant.defaults().type:
               return new ABProcessParticipant(taskDef, process, ABServerApp);
               break;

            case ABProcessLane.defaults().type:
               return new ABProcessLane(taskDef, process, ABServerApp);
               break;

            default:
               // default to a Task
               return ABProcessTaskManager.newTask(
                  taskDef,
                  process,
                  ABServerApp
               );
               break;
         }
      }
      return null;
   },

   queryNew: (def) => {
      if (!GeneralApp) {
         GeneralApp = ABSystemObject.getApplication();
      }
      return GeneralApp.queryNew(def);
   }
};
