// ABObjectWorkspaceViewGrid.js
//
// Manages the settings for a Data Grid View in the AppBuilder Object Workspace

const ABObjectWorkspaceView = require("./ABObjectWorkspaceView");

var defaultValues = {
   name: "Default Grid",
   sortFields: [], // array of columns with their sort configurations
   filterConditions: [], // array of filters to apply to the data table
   frozenColumnID: "", // id of column you want to stop freezing
   hiddenFields: [] // array of [ids] to add hidden:true to
};

module.exports = class ABObjectWorkspaceViewGrid extends ABObjectWorkspaceView {
   constructor(attributes, object) {
      super(attributes, object, "grid");

      /*
	{
		id:uuid(),
		type:'grid',  
		sortFields:[],
		filterConditions:[],
		frozenColumnID:"",
		hiddenFields:[],
	}

*/
   }

   /**
    * unique key describing this View.
    * @return {string}
    */
   static type() {
      return "grid";
   }

   /**
    * @return {string}
    */
   static icon() {
      return "fa fa-table";
   }

   /**
    * @method fromObj
    * take our persisted data, and properly load it
    * into this object instance.
    * @param {json} data  the persisted data
    */
   fromObj(data) {
      super.fromObj(data);

      for (var v in defaultValues) {
         this[v] = data[v] || defaultValues[v];
      }

      this.type = ABObjectWorkspaceViewGrid.type();
   }

   /**
    * @method toObj()
    * compile our current state into a {json} object
    * that can be persisted.
    */
   toObj() {
      var obj = super.toObj();

      for (var v in defaultValues) {
         obj[v] = this[v];
      }

      obj.type = "grid";
      return obj;
   }
};
