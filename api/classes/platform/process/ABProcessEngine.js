const path = require("path");
const ABProcessEngineCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "process",
   "ABProcessEngineCore.js"
));

module.exports = class ABProcessEngine extends ABProcessEngineCore {
   constructor(instance, process) {
      super(instance, process);

      // listen
   }
};
