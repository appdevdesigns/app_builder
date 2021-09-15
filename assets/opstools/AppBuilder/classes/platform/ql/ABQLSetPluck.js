/*
 * ABQLSetPluck
 *
 * An ABQLSetPluck can process a set (array) of data and puck out a specified
 * field from each row to then make an array of values that only contain that 
 * field.
 * 
 * Example: 
array = [
 {
	name: "Neo",
	email: "neo@thematrix.com",
	relationships: [ { morpheous}, {trinity} ]
 },
 {
	name: "trinity",
	email: "trinity@thematrix.com",
	relationships: [ {neo}, {morpheous} ]
 },
 {
	name: "morpheous",
	email: "morpheous@thematrix.com",
	relationships: [ {neo}, {trinity}]
 }

]

pluck("email") :
	[
		"neo@thematrix.com",
		"trinity@thematrix.com",
		"morpheous@thematrix.com"
	]

pluck("relationships"):
	[
		{neo},
		{trinity},
		{morpheous}
	]
 *
 */

const ABQLSetPluckCore = require("../../core/ql/ABQLSetPluckCore.js");

class ABQLSetPluck extends ABQLSetPluckCore {
   // constructor(attributes, prevOP, task, application) {
   //     super(attributes, [], prevOP, task, application);
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
      if (pDef.name == "field") {
         // debugger;
         this.fieldID = this.params[pDef.name];
         // v2 method:
         // this.field = this.object.fieldByID(this.fieldID);
         this.field = this.object.fields((f) => f.id == this.fieldID)[0];

         // v2 method:
         // if (this.field && this.field.isConnected) {
         if (this.field && this.field.key == "connectObject") {
            this.objectOut = this.field.datasourceLink;

            // ?? is this correct?
            // if we already have created a .next operation, and we have
            // just changed our .object, pass that information forward.
            if (this.next) {
               this.next.object = this.objectOut;
            }
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
    * NOTE: in this process our .object and .objectOut isn't as simple
    * as the other QL node types.  We'll have to interpolate our values
    * from the given fieldID in our property panel.
    *
    * @param {webixNode} row
    *        the current webix node that contains the ROW defining the
    *        operation and it's parameters.
    * @param {string} id
    *        the unique id for where the properties panel is displayed.
    */
   parseRow(row, id) {
      super.parseRow(row, id);

      this.fieldID = this.params.field;

      // we now have to build backwards from the current fieldID to set our
      // relevant .object and .objectOut
      this.application.objects((o) => {
         if (!this.field) {
            // var field = o.fieldByID(this.fieldID);
            var field = o.fields((f) => f.id == this.fieldID)[0];
            if (field) {
               this.field = field;
            }
         }
      });

      if (this.field) {
         this.object = this.field.object;
         // v2 method:
         // if (this.field.isConnected) {
         if (this.field && this.field.key == "connectObject") {
            this.objectOut = this.field.datasourceLink;
         }
      }
   }
}
ABQLSetPluck.uiIndentNext = 10;

module.exports = ABQLSetPluck;
