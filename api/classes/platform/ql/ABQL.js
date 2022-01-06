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
   exportIDs(ids) {
      if (this.next) {
         this.next.exportIDs(ids);
      }

      if (this.objectID) {
         if (!this.object) {
            this.object = this.objectLookup(this.objectID);
         }
         if (this.object) {
            this.object.exportIDs(ids);
         } else {
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
