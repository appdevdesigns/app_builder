const ABComponent = require("../classes/platform/ABComponent");
const ABRole = require("../classes/platform/ABRole");

const ABAdminRoleImport = require("./ab_admin_role_import");
const ABAdminRoleExport = require("./ab_admin_role_export");

module.exports = class AB_Work_Admin_Role_List extends ABComponent {
   constructor(App) {
      super(App, "ab_admin_role_list");

      let L = this.Label;
      let labels = {
         common: App.labels,
         component: {
            confirmDeleteTitle: L("ab.role.delete.title", "*Delete role"),
            confirmDeleteMessage: L(
               "ab.role.delete.message",
               "*Do you want to remove this role ?"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         component: this.unique("component"),
         datatable: this.unique("datatable"),
         search: this.unique("search")
      };

      let RoleImport = new ABAdminRoleImport(App);
      let RoleExport = new ABAdminRoleExport(App);

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         // type: "space",
         // borderless: true,
         rows: [
            {
               view: "toolbar",
               id: "myToolbarABadminRoleList",
               css: "webix_dark",
               cols: [
                  {
                     view: "label",
                     label: `&nbsp;&nbsp;<span class='fa fa-user-md'></span> ${L(
                        "ab.role.title",
                        "*Roles"
                     )}`,
                     align: "left"
                  },
                  { fillspace: true },
                  {
                     id: ids.search,
                     view: "search",
                     on: {
                        onChange: (searchText) => {
                           _logic.filterRoles(searchText);
                        }
                     }
                  }
               ]
            },
            {
               id: ids.datatable,
               view: "datatable",
               select: "row",
               columns: [
                  { id: "name", header: "Name", width: 200 },
                  {
                     id: "description",
                     header: "Description",
                     fillspace: true
                  },
                  // {
                  // 	id: "exclude", header: "", width: 40,
                  // 	template: (obj, common, value) => {
                  // 		return '<div class="exclude"><span class="webix_icon fa fa-reply"></span></div>';
                  // 	},
                  // 	css: { 'text-align': 'center' }
                  // },
                  {
                     id: "export",
                     header: "",
                     width: 40,
                     template:
                        "<div class='export'><span class='webix_icon fa fa-upload'></span></div>",
                     css: { "text-align": "center" }
                  },
                  {
                     id: "remove",
                     header: "",
                     width: 40,
                     template: "<div class='remove'>{common.trashIcon()}</div>",
                     css: { "text-align": "center" }
                  }
               ],
               data: [],
               on: {
                  onAfterSelect: (selection, preserve) => {
                     _logic.selectRole(selection ? selection.id : null);
                  }
               },
               onClick: {
                  // "exclude": (event, data, target) => {
                  // 	_logic.exclude(data.row);
                  // },
                  export: (event, data, target) => {
                     _logic.showExportPopup(data.row);
                  },
                  remove: (event, data, target) => {
                     _logic.remove(data.row);
                  }
               }
            },
            {
               cols: [
                  {
                     view: "button",
                     type: "icon",
                     icon: "fa fa-download",
                     label: L(
                        "ab.application.form.importRoleButton",
                        "*Import role"
                     ),
                     click: () => {
                        _logic.showImportPopup();
                     }
                  },
                  {
                     view: "button",
                     css: "webix_primary",
                     type: "icon",
                     icon: "fa fa-plus",
                     label: L(
                        "ab.application.form.createNewRoleButton",
                        "*Create new role"
                     ),
                     click: () => {
                        _logic.createNewRole();
                     }
                  }
               ]
            }
         ]
      };

      // Our init() function for setting up our UI
      this.init = (roleDC) => {
         if ($$(ids.datatable))
            webix.extend($$(ids.datatable), webix.ProgressBar);

         RoleImport.init(roleDC);
         RoleExport.init();

         this._roleDC = roleDC;
         if (this._roleDC) {
            // Bind to the data collection
            $$(ids.datatable).data.sync(this._roleDC);

            this._roleDC.attachEvent("onAfterCursorChange", (roleId) => {
               $$(ids.datatable).blockEvent();

               if (roleId) $$(ids.datatable).select(roleId);
               else $$(ids.datatable).unselect();

               $$(ids.datatable).unblockEvent();
            });
         } else {
            $$(ids.datatable).data.unsync();
         }
      };

      // our internal business logic
      let _logic = {
         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();

            _logic.loadRoleData();

            // Set select item of datatable
            if (this._roleDC) {
               let roleId = this._roleDC.getCursor();
               if (roleId) $$(ids.datatable).select(roleId);
               else $$(ids.datatable).unselect();
            }
         },

         loadRoleData: () => {
            if (this._isLoaded) return Promise.resolve();

            this._isLoaded = true;

            _logic.busy();

            ABRole.find()
               .catch((err) => {
                  console.error(err);
                  _logic.ready();
               })
               .then((roles) => {
                  // Parse to the data collection
                  if (this._roleDC) {
                     this._roleDC.setCursor(null);
                     this._roleDC.clearAll();
                     this._roleDC.parse(roles || []);
                  }

                  _logic.ready();
               });
         },

         filterRoles: (searchText = "") => {
            if (!this._roleDC) return;

            searchText = searchText.toLowerCase();

            this._roleDC.setCursor(null);
            this._roleDC.filter(
               (s) =>
                  (s.name || "").toLowerCase().indexOf(searchText) > -1 ||
                  (s.description || "").toLowerCase().indexOf(searchText) > -1
            );
         },

         selectRole: (roleId) => {
            if (!this._roleDC) return;

            if (roleId) this._roleDC.setCursor(roleId);
            else this._roleDC.setCursor(null);
         },

         createNewRole: () => {
            if (!this._roleDC) return;

            _logic.busy();

            this._roleDC.setCursor(null);

            // save new role
            App.actions
               .roleSave({
                  name: "NEW ROLE"
               })
               .catch((err) => {
                  console.error(err);
                  _logic.ready();
               })
               .then(() => {
                  // switch to role info tab and focus name textbox
                  App.actions.roleSwitchTab("info");

                  _logic.ready();
               });
         },

         // exclude: (roleId) => {

         // 	_logic.busy();

         // 	CurrentApplication.roleExclude(roleId)
         // 		.catch(err => {
         // 			console.error(err);
         // 			_logic.ready();
         // 		})
         // 		.then(() => {
         // 			this._roleDC.remove(roleId);
         // 			_logic.ready();
         // 		})

         // },

         showImportPopup: () => {
            RoleImport.show();
         },

         showExportPopup: (roleId) => {
            let role = this._roleDC.getItem(roleId);
            if (!role) return;

            RoleExport.show(role);
         },

         remove: (roleId) => {
            let role = this._roleDC.getItem(roleId);
            if (!role) return;

            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteTitle,
               message: labels.component.confirmDeleteMessage,
               callback: (isOK) => {
                  if (isOK) {
                     _logic.busy();

                     role
                        .destroy()
                        .catch((err) => {
                           console.error(err);
                           _logic.ready();
                        })
                        .then(() => {
                           this._roleDC.remove(roleId);
                           _logic.ready();
                        });
                  }
               }
            });
         },

         busy: () => {
            if ($$(ids.datatable) && $$(ids.datatable).showProgress)
               $$(ids.datatable).showProgress({ type: "icon" });
         },

         ready: () => {
            if ($$(ids.datatable) && $$(ids.datatable).hideProgress)
               $$(ids.datatable).hideProgress();
         }
      };
      this._logic = _logic;

      //
      // Define our external interface methods:
      //
      this.show = _logic.show;
   }
};
