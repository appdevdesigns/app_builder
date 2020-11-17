/*
 * ab_work_dataview
 *
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const AB_Work_Datacollection_List = require("./ab_work_dataview_list");
const AB_Work_Datacollection_Workspace = require("./ab_work_dataview_workspace");

module.exports = class AB_Work_Datacollection extends ABComponent {
   constructor(App) {
      super(App, "ab_work_dataview");

      let DatacollectionList = new AB_Work_Datacollection_List(App);
      let DatacollectionWorkspace = new AB_Work_Datacollection_Workspace(App);

      let CurrentApplication;

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         component: this.unique("component")
      };

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         type: "space",
         cols: [
            DatacollectionList.ui,
            { view: "resizer", width: 11 },
            DatacollectionWorkspace.ui
         ]
      };

      // Our init() function for setting up our UI
      this.init = function() {
         DatacollectionWorkspace.init();
         DatacollectionList.init({
            onChange: _logic.callbackSelectDatacollection
         });
      };

      // our internal business logic
      var _logic = {
         /**
          * @function applicationLoad
          *
          * Initialize the Object Workspace with the given ABApplication.
          *
          * @param {ABApplication} application
          */
         applicationLoad: function(application) {
            CurrentApplication = application;

            DatacollectionWorkspace.clearWorkspace();
            DatacollectionList.applicationLoad(application);
            DatacollectionWorkspace.applicationLoad(application);
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();

            DatacollectionList.busy();

            let tasks = [];

            if (CurrentApplication) {
               // Johnny: these should no longer be necessary with the current ABDefinition
               // approach:
               // Load objects
               // tasks.push(CurrentApplication.objectLoad());
               // Load queries
               // tasks.push(CurrentApplication.queryLoad());
               // Load data views
               // if (
               //    !CurrentApplication.loadedDatacollection ||
               //    DatacollectionList.count() < 1
               // )
               //    tasks.push(CurrentApplication.datacollectionLoad());
            }

            Promise.all(tasks).then(() => {
               DatacollectionWorkspace.applicationLoad(CurrentApplication);
               DatacollectionList.applicationLoad(CurrentApplication);
               DatacollectionList.ready();
            });
         },

         callbackSelectDatacollection: function(datacollection) {
            if (datacollection == null)
               DatacollectionWorkspace.clearWorkspace();
            else DatacollectionWorkspace.populateWorkspace(datacollection);
         }
      };
      this._logic = _logic;

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.show = _logic.show;
   }
};
