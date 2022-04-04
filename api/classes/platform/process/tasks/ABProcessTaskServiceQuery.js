const path = require("path");
const ABProcessTaskServiceQueryCore = require(path.join(
   __dirname,
   "..",
   "..",
   "..",
   "core",
   "process",
   "tasks",
   "ABProcessTaskServiceQueryCore.js"
));

const ABProcessParticipant = require(path.join(
   __dirname,
   "..",
   "ABProcessParticipant"
));

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "ABProcessTaskServiceQuery";

module.exports = class ABProcessTaskServiceQuery extends ABProcessTaskServiceQueryCore {
   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *         the array of ids to insert my relevant .ids into.
    */
   // exportIDs(ids) {
   //    super.exportIDs(ids);

   //    if (this.qlObj) {
   //       this.qlObj.exportIDs(ids);
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
      if (this.qlObj) {
         this.qlObj.exportData(data);
      }
   }

   ////
   //// Process Instance Methods
   ////

   /**
    * do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance) {
      return new Promise((resolve, reject) => {
         // var myState = this.myState(instance);

         if (!this.qlObj) {
            var msg = `ABProcessTaskServiceQuery.do(): ${this.id} : Unable to create instance of our QL operations.`;
            var qlError = new Error(msg);
            reject(qlError);
            return;
         }

         // tell our QueryLanguage Operation to .do() it's thang
         this.qlObj
            .do(instance)
            .then((result) => {
               // this resolves when all the operations are finished
               // so we are done!
               // this.stateUpdate(instance, {
               //    data: result ? result.data : null
               // });

               this.log(instance, `${this.name} completed successfully`);
               this.stateCompleted(instance);
               resolve(true);
            })
            .catch((err) => {
               this.log(
                  instance,
                  `${
                     this.name
                  } : QL Operation reported an error: ${err.toString()}`
               );
               reject(err);
            });
      });
   }

   /**
    * @method processData()
    * return the current value requested for the given data key.
    * @param {obj} instance
    * @return {mixed} | null
    */
   processData(instance, key) {
      var data = null;
      var parts = key.split(".");
      if (parts[0] && parts[0] == this.id) {
         let myState = this.myState(instance);
         if (myState) {
            data = myState[parts[1]];
         }
      }
      return data;
   }
};
