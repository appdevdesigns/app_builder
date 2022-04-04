/*
 * ABQL
 *
 * An ABQL defines the base class for our AB Query Language Objects.
 * These classes share a common way to
 *   - parse input strings for commands
 *
 *
 */
const ABQLCore = require("../../core/ql/ABQLCore.js");

class ABQL extends ABQLCore {
   // constructor(attributes, parameterDefinitions, prevOP, task, application) {
   //     super(attributes, parameterDefinitions, prevOP, task, application);
   // }
   ///
   /// Instance Methods
   ///
   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *         the array of ids to insert your ids into.
    */
   // exportIDs(ids) {
   //    if (this.next) {
   //       this.next.exportIDs(ids);
   //    }

   //    if (this.objectID) {
   //       if (!this.object) {
   //          this.object = this.objectLookup(this.objectID);
   //       }
   //       if (this.object) {
   //          this.object.exportIDs(ids);
   //       } else {
   //          var id = "";
   //          if (this.task) {
   //             if (this.task.process) {
   //                id = `Process[${this.task.process.id}][${this.task.process.label}]->`;
   //             }
   //             id = `${id}Task[${this.task.id}][${this.task.label}]->`;
   //          }
   //          id = `${id}ABQL[${this.constructor.key}]`;
   //          console.error(
   //             `!!! ${id}:exportIDs(): could not find object for id[${this.objectID}]`
   //          );
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
      if (this.next) {
         this.next.exportData(data);
      }

      if (this.objectID) {
         if (!this.object) {
            this.object = this.objectLookup(this.objectID);
         }
         if (this.object) {
            this.object.exportData(data);
         } else {
            // display an Error message:
            var id = "";
            if (this.task) {
               if (this.task.process) {
                  id = `Process[${this.task.process.id}][${this.task.process.label}]->`;
               }
               id = `${id}Task[${this.task.id}][${this.task.label}]->`;
            }
            id = `${id}ABQL[${this.constructor.key}]`;
            console.error(
               `!!! ${id}:exportIDs(): could not find object for id[${this.objectID}]`
            );
         }
      }
   }
}

module.exports = ABQL;
