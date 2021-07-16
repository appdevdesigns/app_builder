/*
 * totalfooter
 *
 * Add the contents of records to show in footer of the webix's datatable.
 *
 */

module.exports = class ABTotalFooter {
   get key() {
      return "totalfooter";
   }

   constructor(App, key) {
      // App 	{obj}	our application instance object.
      // key {string}	the destination key in App.custom[componentKey] for the instance of this component:

      // super(App, key);

      var L = App.Label;

      var labels = {};

      // internal list of Webix IDs to reference our UI components.
      var ids = {};

      // Our webix UI definition:
      var _ui = {};
      this.view = this.key;

      // our internal business logic
      var _logic = {};
      this._logic = _logic;

      // Tell Webix :
      webix.ui.datafilter.totalColumn = webix.extend(
         {
            refresh: function(datatable, node, info) {
               var result = 0;

               datatable.eachRow(function(row) {
                  var record = datatable.getItem(row);

                  var data = info.field.format(record);

                  // array
                  if (data) {
                     // remove string format
                     let num = data.toString().replace(/[^\d.-]/g, "");
                     result += parseFloat(num); // we need to use parseFloat because numbers could be decimals
                  }
               });

               let resultData = {};
               resultData[info.field.columnName] = result;
               node.innerHTML = info.field.format(resultData);
            }
         },
         webix.ui.datafilter.summColumn
      );
   }
};

