/**
 * ABProcessLane
 * manages a lane in a Process Diagram.
 *
 * Lanes manage users in the system, and provide a way to lookup a SiteUser.
 */
const path = require("path");
const ABProcessLaneCore = require(path.join(
   __dirname,
   "..",
   "..",
   "core",
   "process",
   "ABProcessLaneCore.js"
));

module.exports = class ABProcessLane extends ABProcessLaneCore {
   constructor(attributes, process, application) {
      super(attributes, process, application);
   }

   ////
   //// Modeler Instance Methods
   ////
};
