// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessTriggerLifecycleCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTriggerLifecycleCore.js"
));

module.exports = class ABProcessTaskTriggerLifecycle extends ABProcessTriggerLifecycleCore {
   // trigger(data) {
   //     // call my process.newInstance with
   //     if (!this.process) {
   //         return;
   //     }
   //     var context = this.process.context(data);
   //     this.initState(context, { triggered: true, status: "completed" });
   //     context.startTaskID = this.diagramID;
   //     // modify data in any appropriate way then:
   //     this.process.instanceNew(context);
   // }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @return {array}
    *         any relevalt ABDefinition IDs
    */
   exportIDs() {
      var myIDs = super.exportIDs();

      if (this.objectID && this.objectID != "objID.??") {
         var object = this.application.objects((o) => o.id == this.objectID)[0];
         if (object) {
            myIDs = myIDs.concat(object.exportIDs());
         }
      }

      return myIDs;
   }
};
