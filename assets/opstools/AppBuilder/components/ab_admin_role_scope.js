const ABComponent = require("../classes/platform/ABComponent");

const ABScopeForm = require("./ab_admin_role_scope_form");
const ABScopeImport = require("./ab_admin_role_scope_import");

module.exports = class AB_Work_Admin_Role_Role extends ABComponent {
   constructor(App) {
      super(App, "ab_admin_role_scope");

      let L = this.Label;
      let labels = {
         common: App.labels,
         component: {
            confirmDeleteScopeTitle: L(
               "ab.scope.deleteRow.title",
               "*Remove this scope"
            ),
            confirmDeleteScopeMessage: L(
               "ab.scope.deleteRow.message",
               "*Do you want to remove this scope ?"
            )
         }
      };

      let ScopeForm = new ABScopeForm(App);
      let ScopeImport = new ABScopeImport(App);

      this._scopeDC = new webix.DataCollection();

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         component: this.unique("component"),
         datatable: this.unique("datatable"),
         importScope: this.unique("importScope"),
         createScope: this.unique("createScope")
      };

      // Our webix UI definition:
      this.ui = {
         id: ids.component,
         view: "layout",
         rows: [
            {
               id: ids.datatable,
               view: "datatable",
               columns: [
                  {
                     id: "name",
                     header: '<span class="fa fa-street-view"></span> Scope',
                     // width: 120,
                     fillspace: true
                  },
                  // {
                  //     header:
                  //         '<span class="fa fa-database"></span> Objects',
                  //     fillspace: true,
                  //     template: (scope, common, value) => {
                  //         if (scope && scope.objects()) {
                  //             return (scope.objects() || [])
                  //                 .map((o) => o.label)
                  //                 .join(", ");
                  //         } else {
                  //             return "";
                  //         }
                  //     }
                  // },
                  {
                     id: "edit",
                     header: "",
                     width: 40,
                     template: (obj, common, value) => {
                        return '<div class="edit"><span class="webix_icon fa fa-edit"></span></div>';
                     },
                     css: { "text-align": "center" }
                  },
                  {
                     id: "exclude",
                     header: "",
                     width: 40,
                     template: (obj, common, value) => {
                        return '<div class="exclude"><span class="webix_icon fa fa-reply"></span></div>';
                     },
                     css: { "text-align": "center" }
                  },
                  {
                     id: "remove",
                     header: "",
                     template: "<div class='remove'>{common.trashIcon()}</div>",
                     css: { "text-align": "center" },
                     width: 40
                  }
               ],
               onClick: {
                  edit: (event, data, target) => {
                     _logic.editScope(data.row);
                  },
                  exclude: (event, data, target) => {
                     _logic.excludeScope(data.row);
                  },
                  remove: (event, data, target) => {
                     _logic.removeScope(data.row);
                  }
               }
            },
            {
               cols: [
                  {
                     id: ids.importScope,
                     view: "button",
                     type: "icon",
                     icon: "fa fa-download",
                     label: "Include scope",
                     click: () => {
                        ScopeImport.show();
                     }
                  },
                  {
                     id: ids.createScope,
                     view: "button",
                     css: "webix_primary",
                     type: "icon",
                     icon: "fa fa-plus",
                     label: "Create new scope",
                     click: () => {
                        ScopeForm.show();
                     }
                  }
               ]
            }
         ]
      };

      // Our init() function for setting up our UI
      this.init = (roleDC) => {
         if ($$(ids.datatable)) {
            $$(ids.datatable).data.sync(this._scopeDC);

            webix.extend($$(ids.datatable), webix.ProgressBar);
         }

         this._roleDC = roleDC;
         if (this._roleDC) {
            this._roleDC.attachEvent("onAfterCursorChange", (roleId) => {
               _logic.onShow();
            });
         }

         ScopeForm.init(this._roleDC, this._scopeDC);
         ScopeImport.init(this._roleDC, this._scopeDC);
      };

      let _logic = {
         // applicationLoad: (application) => {
         // 	CurrentApplication = application;

         // 	this._scopeDC.setCursor(null);
         // 	this._scopeDC.clearAll();

         // 	ScopeForm.applicationLoad(application);
         // 	ScopeImport.applicationLoad(application);
         // },

         busy: () => {
            if ($$(ids.datatable) && $$(ids.datatable).showProgress)
               $$(ids.datatable).showProgress({ type: "icon" });
         },

         ready: () => {
            if ($$(ids.datatable) && $$(ids.datatable).hideProgress)
               $$(ids.datatable).hideProgress();
         },

         getRole: () => {
            if (!this._roleDC) return null;

            let roldId = this._roleDC.getCursor();
            if (!roldId) return null;

            return this._roleDC.getItem(roldId);
         },

         editScope: (scopeId) => {
            ScopeForm.show().then(() => {
               this._scopeDC.setCursor(scopeId);
            });
         },

         excludeScope: (scopeId) => {
            _logic.busy();

            let role = _logic.getRole();

            role
               .scopeExclude(scopeId)
               .catch((err) => {
                  console.error(err);
                  _logic.ready();
               })
               .then(() => {
                  this._scopeDC.remove(scopeId);
                  this._scopeDC.setCursor(null);

                  let role = _logic.getRole();
                  if (role) role._scopes = role.scopes((s) => s.id != scopeId);

                  _logic.ready();
               });
         },

         removeScope: (scopeId) => {
            OP.Dialog.Confirm({
               title: labels.component.confirmDeleteScopeTitle,
               text: labels.component.confirmDeleteScopeMessage,
               callback: (isOK) => {
                  if (isOK) {
                     let scope = this._scopeDC.getItem(scopeId);
                     if (!scope) return;

                     _logic.busy();

                     scope
                        .destroy()
                        .catch((err) => {
                           console.error(err);
                           _logic.ready();
                        })
                        .then(() => {
                           this._scopeDC.remove(scopeId);
                           this._scopeDC.setCursor(null);
                           _logic.ready();
                        });
                  }
               }
            });
         },

         onShow: () => {
            this._scopeDC.clearAll();

            if (this._roleDC == null) return;

            let role = _logic.getRole();
            if (!role) {
               $$(ids.importScope).disable();
               $$(ids.createScope).disable();
               return;
            } else {
               $$(ids.importScope).enable();
               $$(ids.createScope).enable();
            }

            _logic.busy();

            this._scopeDC.parse(role.scopes() || []);

            _logic.ready();
         }
      };

      this._logic = _logic;

      //
      // Define our external interface methods:
      //
      // this.applicationLoad = _logic.applicationLoad;
      this.onShow = _logic.onShow;
   }
};
