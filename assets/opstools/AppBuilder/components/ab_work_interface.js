/*
 * ab_work_interface
 *
 * Display the Interface for designing Pages and Views in the App Builder.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const AB_Work_Interface_List = require("./ab_work_interface_list");
const AB_Work_Interface_Workspace = require("./ab_work_interface_workspace");

module.exports = class AB_Work_Interface extends ABComponent {
   constructor(App) {
      super(App, "ab_work_interface");

      var L = this.Label;

      var labels = {
         common: App.labels,

         component: {
            // formHeader: L('ab.application.form.header', "*Application Info"),
         }
      };

      var ViewList = new AB_Work_Interface_List(App);
      var ViewWorkspace = new AB_Work_Interface_Workspace(App);

      var CurrentApplication;

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component")
      };

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         type: "space",
         cols: [ViewList.ui, { view: "resizer", width: 11 }, ViewWorkspace.ui]
      };

      // Our init() function for setting up our UI
      this.init = function() {
         webix.extend($$(ids.component), webix.ProgressBar);

         ViewList.init();
         ViewWorkspace.init();
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

            App.actions.clearInterfaceWorkspace();
            ViewList.applicationLoad(application);
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();

            // if (
            //    CurrentApplication &&
            //    !CurrentApplication.loadedDatacollection
            // ) {
            //    _logic.busy();

            //    CurrentApplication.datacollectionLoad().then(() => {
            //       _logic.ready();
            //    });
            // }
         },

         busy: () => {
            if ($$(ids.component) && $$(ids.component).showProgress)
               $$(ids.component).showProgress({ type: "icon" });
         },

         ready: () => {
            if ($$(ids.component) && $$(ids.component).hideProgress)
               $$(ids.component).hideProgress();
         }
      };
      this._logic = _logic;

      this.actions({});

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.show = _logic.show;
   }
};
