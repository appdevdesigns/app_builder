/*
 * countfooter
 *
 * Add the count footer to the webix's datatable.
 *
 */

module.exports = class ABCountFooter {
   get key() {
      return "countfooter";
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
      webix.ui.datafilter.countColumn = webix.extend(
         {
            refresh: function(datatable, node, info) {
               var result = 0;

               var rowData = datatable.find({}) || [];
               rowData.forEach((row) => {
                  if (row == null) return;

                  var data =
                     row[info.columnId] || row[info.columnId + "__relation"];

                  // array
                  if (data && Array.isArray(data)) {
                     result += data.length;
                  } else if (
                     data != null &&
                     data != "" &&
                     data != false &&
                     data != "false" &&
                     data != "0"
                  ) {
                     result += 1;
                  }
               });

               node.innerHTML = result;
            }
         },
         webix.ui.datafilter.summColumn
      );
   }
};
