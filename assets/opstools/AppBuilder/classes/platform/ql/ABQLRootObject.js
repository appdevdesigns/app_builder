/*
 * ABQLRootObject
 *
 * An ABQL defines a Query Language Operation. A QL Operation
 * is intended to be evaluated at run time and return a value that can be
 * assigned to form value or an object.
 *
 *
 */

const ABQLRootObjectCore = require("../../core/ql/ABQLRootObjectCore.js");

class ABQLObject extends ABQLRootObjectCore {
   // constructor(attributes, task, application) {
   //     // NOTE: keep this so we can insert the prevOp == null
   //     super(attributes, ParameterDefinitions, null, task, application);
   // }

   ///
   /// Instance Methods
   ///

   /*
    * @method paramChanged()
    * respond to an update to the given parameter.
    * NOTE: the value will ALREADY be saved in this.params[pDef.name].
    * @param {obj} pDef
    *        the this.parameterDefinition entry of the parameter that was
    *        changed.
    */
   paramChanged(pDef) {
      if (pDef.name == "name") {
         this.objectID = this.params[pDef.name];
         this.object = this.objectLookup(this.objectID);

         // ?? is this correct?
         // if we already have created a .next operation, and we have
         // just changed our .object, pass that information forward.
         if (this.next) {
            this.next.object = this.object;
         }
      }
   }

   /**
    * @method parseRow()
    * When it is time to pull the information from the properties panel,
    * use this fn to get the current Row of data.
    *
    * This fn() will populate the this.params with the values for each
    * of our .parameterDefinitions.
    *
    * @param {webixNode} row
    *        the current webix node that contains the ROW defining the
    *        operation and it's parameters.
    * @param {string} id
    *        the unique id for where the properties panel is displayed.
    */
   parseRow(row, id) {
      super.parseRow(row, id);

      // for an Object operation, we need to set our .objectID after
      // the values are parsed.

      if (this.params.name) {
         this.objectID = this.params.name;
         this.object = this.objectLookup(this.params.name);
      }
   }
}
ABQLObject.uiIndentNext = 10;

module.exports = ABQLObject;
