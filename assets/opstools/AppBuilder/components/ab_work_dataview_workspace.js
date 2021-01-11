const ABComponent = require("../classes/platform/ABComponent");
const ABDatacollectionProperty = require("./ab_work_dataview_workspace_properties");
const ABWorkspaceDatatable = require("./ab_work_object_workspace_datatable");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class AB_Work_Datacollection_Workspace extends ABComponent {
   constructor(App) {
      let idBase = "ab_work_dataview_workspace";

      super(App, idBase);

      this.labels = {
         common: App.labels,
         component: {
            selectDatacollection: L(
               "ab.datacollection.selectDatacollection",
               "*Select a data view to work with."
            ),
            addNew: L("ab.datacollection.addNew", "*Add new data view")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      this.ids = {
         multiview: this.unique("multiview"),
         noSelection: this.unique("noSelection"),
         workspace: this.unique("workspace")
      };

      this.DataTable = new ABWorkspaceDatatable(App, idBase, {
         allowDelete: 0,
         configureHeaders: false,
         detailsView: "",
         editView: "",
         isEditable: 0,
         massUpdate: 0
      });
      this.Property = new ABDatacollectionProperty(App);

      //
      // Define our external interface methods:
      //
      this.applicationLoad = this._logic.applicationLoad;
      this.populateWorkspace = this._logic.populateWorkspace;
      this.clearWorkspace = this._logic.clearWorkspace;
   }

   get ui() {
      let App = this.App,
         labels = this.labels,
         ids = this.ids;

      // Our webix UI definition:
      return {
         view: "multiview",
         id: ids.multiview,
         cells: [
            // No selection
            {
               id: ids.noSelection,
               rows: [
                  {
                     maxHeight: App.config.xxxLargeSpacer,
                     hidden: App.config.hideMobile
                  },
                  {
                     view: "label",
                     align: "center",
                     height: 200,
                     label:
                        "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-table'></div>"
                  },
                  {
                     view: "label",
                     align: "center",
                     label: labels.component.selectDatacollection
                  },
                  {
                     cols: [
                        {},
                        {
                           view: "button",
                           css: "webix_primary",
                           label: labels.component.addNew,
                           type: "form",
                           autowidth: true,
                           click: function() {
                              App.actions.addNewDatacollection();
                           }
                        },
                        {}
                     ]
                  },
                  {
                     maxHeight: App.config.xxxLargeSpacer,
                     hidden: App.config.hideMobile
                  }
               ]
            },

            // Workspace
            {
               id: ids.workspace,
               view: "layout",
               cols: [
                  // Workspace
                  this.DataTable.ui,

                  { view: "resizer", css: "bg_gray", width: 11 },

                  // Property
                  this.Property.ui
               ]
            }
         ]
      };
   }

   // Our init() function for setting up our UI
   init() {
      this.DataTable.init({});
      this.Property.init({
         onSave: this._logic.populateWorkspace
      });

      this._logic.populateWorkspace(this._datacollection);
   }

   get _logic() {
      return {
         /**
          * @function applicationLoad
          *
          * @param {ABApplication}
          */
         applicationLoad: (application) => {
            this._application = application;

            this.Property.applicationLoad(application);
         },

         /**
          * @function populateWorkspace
          *
          * @param {ABDatacollection}
          */
         populateWorkspace: (datacollection) => {
            let ids = this.ids;
            let DataTable = this.DataTable;

            this._datacollection = datacollection;

            let $datatable = $$(DataTable.ui.id);
            // unbind
            $datatable.clearAll();
            $datatable.data.unsync();
            $datatable.unbind();

            if (datacollection) {
               $$(ids.workspace).show();

               // get data collection & object
               if (datacollection && datacollection.datasource) {
                  DataTable.objectLoad(datacollection.datasource);
                  DataTable.refreshHeader();

                  // bind a data collection to the display grid
                  datacollection.unbind($datatable);
                  datacollection.bind($datatable);
                  $datatable.adjust();

                  if (
                     datacollection.datacollectionLink &&
                     datacollection.fieldLink
                  ) {
                     datacollection.bindParentDc();

                     // load data of parent DC, then our dc will trigger ."dataFeed"
                     let datacollectionLink = datacollection.datacollectionLink;

                     // when parent dc does not set fix cursor
                     if (!datacollectionLink.settings.fixSelect) {
                        datacollection.loadData();
                     } else if (
                        datacollectionLink.dataStatus ==
                        datacollectionLink.dataStatusFlag.notInitial
                     ) {
                        datacollectionLink.loadData();
                     }
                     // refresh cursor of parent DC
                     else if (
                        datacollection.dataStatus ==
                        datacollection.dataStatusFlag.notInitial
                     ) {
                        datacollectionLink.setCursor(null);
                        datacollectionLink.setStaticCursor();
                        datacollectionLink.__dataCollection.refreshCursor();
                     }
                  } else {
                     // load data
                     if (
                        datacollection.dataStatus ==
                        datacollection.dataStatusFlag.notInitial
                     )
                        datacollection.loadData();
                  }
               }
            } else {
               this._logic.clearWorkspace();
            }

            // Property
            this.Property.datacollectionLoad(datacollection);
         },

         /**
          * @function clearWorkspace()
          *
          * Clear the data view workspace.
          */
         clearWorkspace: () => {
            this._datacollection = null;

            $$(this.ids.noSelection).show();
         }
      };
   }
};


