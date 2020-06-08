/*
 * ab_work_query
 *
 * Display the Query Tab UI:
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

const AB_Work_Query_List = require("./ab_work_query_list");
const AB_Work_Query_Workspace = require("./ab_work_query_workspace");

module.exports = class AB_Work_Query extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App) {
      super(App, "ab_work_query");
      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {}
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component")
      };

      var QueryList = new AB_Work_Query_List(App);
      var QueryWorkspace = new AB_Work_Query_Workspace(App);

      let CurrentApplication;

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         type: "space",
         cols: [QueryList.ui, { view: "resizer" }, QueryWorkspace.ui]
      };

      // Our init() function for setting up our UI
      this.init = function() {
         QueryWorkspace.init();
         QueryList.init({
            onItemSelected: _logic.querySelected
         });
      };

      // our internal business logic
      var _logic = {
         /**
          * @function applicationLoad
          *
          * Initialize the Query Workspace with the given ABApplication.
          *
          * @param {ABApplication} application
          */
         applicationLoad: function(application) {
            CurrentApplication = application;

            QueryWorkspace.clearWorkspace();

            QueryList.applicationLoad(application);
            QueryWorkspace.applicationLoad(application);
         },

         querySelected: function(query) {
            QueryWorkspace.resetTabs();
            QueryWorkspace.populateQueryWorkspace(query);
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();

            QueryList.refresh();

            // if (
            //    CurrentApplication &&
            //    (!CurrentApplication.loadedQueries || QueryList.count() < 1)
            // ) {
            //    QueryList.busy();

            //    CurrentApplication.queryLoad().then(() => {
            //       QueryList.refresh();
            //       QueryList.ready();
            //    });
            // }
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
