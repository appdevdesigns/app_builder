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
    * @param {array} ids
    *        the array of ids to store our relevant .ids into
    */
   // exportIDs(ids) {
   //    super.exportIDs(ids);

   //    if (this.objectID && this.objectID != "objID.??") {
   //       var object = this.application.objects((o) => o.id == this.objectID)[0];
   //       if (object) {
   //          object.exportIDs(ids);
   //       }
   //    }
   // }

   /**
    * @method exportData()
    * export the relevant data from this object necessary for the operation of
    * it's associated application.
    * @param {hash} data
    *        The incoming data structure to add the relevant export data.
    *        .ids {array} the ABDefinition.id of the definitions to export.
    *        .siteObjectConnections {hash} { Obj.id : [ ABField.id] }
    *                A hash of Field.ids for each System Object that need to
    *                reference these importedFields
    *        .roles {hash}  {Role.id: RoleDef }
    *                A Definition of a role related to this Application
    *        .scope {hash} {Scope.id: ScopeDef }
    *               A Definition of a scope related to this Application.
    *               (usually from one of the Roles being included)
    */
   exportData(data) {
      super.exportData(data);

      if (this.objectID && this.objectID != "objID.??") {
         var object = this.application.objects((o) => o.id == this.objectID)[0];
         if (object) {
            object.exportData(data);
         }
      }
   }
};
