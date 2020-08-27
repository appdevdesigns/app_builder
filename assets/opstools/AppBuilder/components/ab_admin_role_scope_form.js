const ABComponent = require("../classes/platform/ABComponent");

const ABApplication = require("../classes/platform/ABApplication");
const ABScope = require("../classes/platform/ABScope");

const RowFilter = require("../classes/platform/RowFilter");

module.exports = class AB_Work_Admin_Role_Scope_Form extends ABComponent {
   constructor(App) {
      let idBase = "ab_admin_role_scope_form";

      super(App, idBase);

      let L = this.Label;
      let labels = {
         common: App.labels,
         component: {
            newScope: L("ab.scope.new.title", "*Add new scope")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         popup: this.unique("popup"),
         form: this.unique("form"),
         object: this.unique("object"),
         buttonSave: this.unique("buttonSave")
      };

      this._rowFilter = new RowFilter(App, idBase);

      // Our webix UI definition:
      this.ui = {
         id: ids.popup,
         view: "window",
         head: labels.component.newScope,
         hidden: true,
         resize: true,
         minWidth: 800,
         modal: true,
         position: "center",
         body: {
            id: ids.form,
            view: "form",
            // padding: 24,
            elementsConfig: { labelAlign: "right", labelWidth: 85 },
            rows: [
               {
                  view: "text",
                  name: "name",
                  label: "Name",
                  placeholder: "Enter Name"
               },
               {
                  view: "text",
                  name: "description",
                  label: "Description",
                  placeholder: "Enter Description"
               },
               {
                  view: "checkbox",
                  name: "allowAll",
                  label: "Allow All"
               },
               {
                  id: ids.object,
                  view: "multicombo",
                  name: "objectIds",
                  label: "Objects",
                  options: [],
                  on: {
                     onChange: (oldVal, newVal) => {
                        let scope = _logic.getScope();
                        // let objects = CurrentApplication.objects(o => ($$(ids.object).getValue() || "").indexOf(o.id) > -1);
                        let objects = this._objects.filter(
                           (o) =>
                              ($$(ids.object).getValue() || "").indexOf(o.id) >
                              -1
                        );
                        _logic.refreshFilterData(scope, objects);
                     }
                  }
               },
               {
                  view: "forminput",
                  paddingY: 0,
                  paddingX: 0,
                  label: "Filter",
                  css: "ab-custom-field",
                  body: this._rowFilter.ui
               },
               {
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        autowidth: true,
                        value: L("ab.common.cancel", "*Cancel"),
                        click: () => {
                           _logic.cancel();
                        }
                     },
                     {
                        view: "button",
                        css: "webix_primary",
                        type: "form",
                        id: ids.buttonSave,
                        autowidth: true,
                        value: L("ab.common.save", "*Save"),
                        click: () => {
                           _logic.save();
                        }
                     }
                  ]
               },
               {
                  fillspace: true
               }
            ]
         }
      };

      // Our init() function for setting up our UI
      this.init = function(roleDC, scopeDC) {
         webix.ui(this.ui);

         this._roleDC = roleDC;
         this._scopeDC = scopeDC;
         if (this._scopeDC) {
            // if ($$(ids.form))
            // 	$$(ids.form).bind(this._scopeDC);

            // Update RowFilter
            this._scopeDC.attachEvent("onAfterCursorChange", (currId) => {
               _logic.refreshData();
            });
         }

         if ($$(ids.form)) webix.extend($$(ids.form), webix.ProgressBar);

         this._rowFilter.init({
            showObjectName: true
         });
      };
      // our internal business logic
      let _logic = {
         // /**
         //  * @function applicationLoad
         //  *
         //  * Initialize the Object Workspace with the given ABApplication.
         //  *
         //  * @param {ABApplication} application
         //  */
         // applicationLoad: function (application) {

         // 	CurrentApplication = application;
         // 	this._rowFilter.applicationLoad(application);

         // },

         getScope: () => {
            let currScopeId = this._scopeDC.getCursor();
            let currScope = this._scopeDC.getItem(currScopeId);
            return currScope;
         },

         refreshData: () => {
            $$(ids.form).clear();

            let currScope = _logic.getScope();
            if (currScope) {
               $$(ids.form).setValues({
                  name: currScope.name,
                  description: currScope.description,
                  allowAll: currScope.allowAll,
                  objectIds: currScope.objectIds
               });
            } else {
               $$(ids.form).setValues({});
            }

            // Pull objects of this page (has mock ABApplication)
            let objects = this._objects.filter(
               (obj) =>
                  (currScope ? currScope.objectIds || [] : []).filter(
                     (objId) => objId == obj.id
                  ).length > 0
            );
            _logic.refreshFilterData(currScope, objects);
         },

         refreshFilterData: (scope, objects = []) => {
            this._rowFilter.queriesLoad(this._queries);

            if (objects && objects.length) {
               let fieldList = [];
               (objects || []).forEach((obj) => {
                  fieldList = fieldList.concat(obj.fields(null, true));
               });

               this._rowFilter.fieldsLoad(fieldList);
            } else {
               this._rowFilter.fieldsLoad([], null);
            }

            if (scope && scope.filter) this._rowFilter.setValue(scope.filter);
            else this._rowFilter.setValue(null);
         },

         save: () => {
            if (!this._scopeDC) return;

            _logic.busy();

            let roleId;
            if (this._roleDC) roleId = this._roleDC.getCursor();

            let role = this._roleDC.getItem(roleId);

            let vals = $$(ids.form).getValues() || {};

            let currScope = _logic.getScope();

            // Add new
            let isAdded = false;
            if (!currScope) {
               vals.createdBy = OP.User.username();
               currScope = new ABScope(vals);
               isAdded = true;
            }
            // Update
            else {
               for (let key in vals) {
                  if (vals[key] != undefined) currScope[key] = vals[key];
               }
               isAdded = false;
            }

            // Set objects to scope
            // currScope._objects = CurrentApplication.objects(o => (vals['objectIds'] || "").indexOf(o.id) > -1);
            currScope._objects = this._objects.filter(
               (o) => (vals["objectIds"] || "").indexOf(o.id) > -1
            );

            // set .filter
            currScope.filter = this._rowFilter.getValue();

            currScope
               .save(role)
               .catch((err) => {
                  console.error(err);
                  _logic.ready();
               })
               .then((data) => {
                  if (isAdded) {
                     currScope.id = data.id;
                     this._scopeDC.add(currScope);
                  }

                  this._scopeDC.updateItem(data.id, data);

                  if (!role.scopes((s) => s.id == data.id)[0])
                     role._scopes.push(currScope);

                  _logic.ready();
                  _logic.hide();
               });
         },

         getScope: () => {
            if (!this._scopeDC) return null;

            let currScopeId = this._scopeDC.getCursor();
            if (!currScopeId) return null;

            return this._scopeDC.getItem(currScopeId);
         },

         cancel: () => {
            if (this._scopeDC) {
               this._scopeDC.setCursor(null);
            }

            _logic.hide();
         },

         show: () => {
            if ($$(ids.popup)) $$(ids.popup).show();

            _logic.busy();

            let mockApp = new ABApplication({});
            this._objects = mockApp.objects();
            this._queries = mockApp.queries();

            let objOptions = this._objects.map((o) => {
               return {
                  id: o.id,
                  value: o.label
               };
            });

            $$(ids.object).define("options", objOptions);
            $$(ids.object).refresh();

            _logic.refreshData();
            _logic.ready();

            // this method no longer has any async operations:
            return Promise.resolve();
         },

         hide: () => {
            if ($$(ids.popup)) $$(ids.popup).hide();
         },

         busy: () => {
            if ($$(ids.form) && $$(ids.form).showProgress)
               $$(ids.form).showProgress({ type: "icon" });

            $$(ids.buttonSave).disable();
         },

         ready: () => {
            if ($$(ids.form) && $$(ids.form).hideProgress)
               $$(ids.form).hideProgress();

            $$(ids.buttonSave).enable();
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
