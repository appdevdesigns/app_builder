/*
 * ab_work_object
 *
 * Display the Object Tab UI:
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

const AB_Work_Object_List = require("./ab_work_object_list");
const AB_Work_Object_Workspace = require("./ab_work_object_workspace");

module.exports = class AB_Work_Object extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App) {
      super(App, "ab_work_object");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {}
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component")
      };

      var ObjectList = new AB_Work_Object_List(App);
      var ObjectWorkspace = new AB_Work_Object_Workspace(App);

      let CurrentApplication;

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         type: "space",
         margin: 10,
         cols: [ObjectList.ui, { view: "resizer" }, ObjectWorkspace.ui]
      };

      // Our init() function for setting up our UI
      this.init = function() {
         ObjectWorkspace.init();
         ObjectList.init({
            onChange: _logic.callbackSelectObject
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

            ObjectWorkspace.clearObjectWorkspace();
            ObjectList.applicationLoad(application);
            ObjectWorkspace.applicationLoad(application);
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();

            ObjectList.applicationLoad(CurrentApplication);
            ObjectList.ready();

            // let tasks = [];

            // if (CurrentApplication) {
            //    // Load queries
            //    tasks.push(CurrentApplication.queryLoad());

            //    // Load data views
            //    if (!CurrentApplication.loadedObjects || ObjectList.count() < 1)
            //       tasks.push(CurrentApplication.objectLoad());
            // }

            // Promise.all(tasks).then(() => {
            //    ObjectList.applicationLoad(CurrentApplication);
            //    ObjectList.ready();
            // });
         },

         callbackSelectObject: function(object) {
            if (object == null) ObjectWorkspace.clearObjectWorkspace();
            else ObjectWorkspace.populateObjectWorkspace(object);
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
