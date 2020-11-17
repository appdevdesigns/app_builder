/*
 * ab_work_object_list_newObject_import
 *
 * Display the form for importing an sails model into the application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABExternal = require("../classes/platform/ABExternal.js");
const ABField = require("../classes/platform/dataFields/ABField.js");
// const ABObject = require('../classes/ABObject.js');
const ABFieldManager = require("../classes/core/ABFieldManager.js");

const ABDefinition = require("../classes/platform/ABDefinition.js");

module.exports = class AB_Work_Object_List_NewObject_External extends ABComponent {
   constructor(App) {
      super(App, "ab_work_object_list_newObject_external");
      var L = this.Label;
      var currentApp = null;

      var labels = {
         common: App.labels,
         component: {
            external: L("ab.object.external.title", "*External"),
            connections: L("ab.object.external.connections", "*Connections"),
            columns: L("ab.object.external.columns", "*Columns")
         }
      };

      // internal list of Webix IDs to reference UI components.
      var ids = {
         component: this.unique("component"),
         form: this.unique("import"),

         connectionList: this.unique("connectionList"),
         filter: this.unique("filter"),
         externalList: this.unique("externalList"),
         columnList: this.unique("columnList"),

         buttonSave: this.unique("save"),
         buttonCancel: this.unique("cancel")
      };

      /**
       * @param {object} options
       * @param {function} options.onBusyStart
       * @param {function} options.onBusyEnd
       * @param {function} options.onDone
       * @param {function} options.onCancel
       */
      this.init = (options) => {
         // webix.extend($$(ids.form), webix.ProgressBar);

         // load callbacks.
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      // internal business logic
      var _logic = (this._logic = {
         callbacks: {
            onCancel: function() {
               console.warn("NO onCancel()!");
            },
            //onSave  : function(values, cb) { console.warn('NO onSave()!') },
            onBusyStart: null,
            onBusyEnd: null,
            onDone: null
         },

         onShow: (app) => {
            currentApp = app;

            this.abExternal = new ABExternal(currentApp);

            this.abExternal
               .connectionFind()
               .then((conns) => {
                  var list = $$(ids.connectionList)
                     .getPopup()
                     .getList();
                  list.clearAll();
                  list.parse(conns);

                  _logic.busyEnd();

                  var oldConnName = $$(ids.connectionList).getValue();

                  // clear old value
                  $$(ids.connectionList).setValue(null);

                  // refresh list by select same value
                  if (oldConnName) $$(ids.connectionList).setValue(oldConnName);
                  // select a first item by default
                  else if (conns[0]) $$(ids.connectionList).setValue(conns[0]);
               })
               .catch((err) => {
                  _logic.busyEnd();
               });
         },

         busyStart: function() {
            if (_logic.callbacks.onBusyStart) {
               _logic.callbacks.onBusyStart();
            }
         },

         busyEnd: function() {
            if (_logic.callbacks.onBusyEnd) {
               _logic.callbacks.onBusyEnd();
            }
         },

         getTypeOptions: function() {
            // [
            //     {
            //         id: fieldName,
            //         name: label,
            //         icon: "envelope"
            //     }
            // ]
            return ABFieldManager.allFields().map((f) => {
               var fieldInfo = f.defaults();

               return {
                  id: fieldInfo.key,
                  name: fieldInfo.menuName,
                  icon: fieldInfo.icon
               };
            });
         },

         connectionSelect: (connName) => {
            _logic.formClear();
            _logic.busyStart();

            this.abExternal
               .tableFind(connName)
               .then((list) => {
                  $$(ids.externalList).parse(list, "json");

                  _logic.filter();

                  _logic.busyEnd();
               })
               .catch((err) => {
                  console.error(err);
                  _logic.busyEnd();
               });
         },

         filter: function() {
            // `this` should be from the Webix event
            var filterText = $$(ids.filter)
               .getValue()
               .toLowerCase();
            $$(ids.externalList).filter(
               (externalModel) =>
                  externalModel.name.toLowerCase().indexOf(filterText) > -1
            );
         },

         externalSelect: () => {
            $$(ids.columnList).clearAll();

            var selectedExternal = $$(ids.externalList).getSelectedItem(false);
            if (selectedExternal) {
               _logic.busyStart();

               var tableName = selectedExternal.name || selectedExternal.id;
               var connName = selectedExternal.connection || null;
               var colNames = [];

               // Parse results and update column list
               this.abExternal.tableColumns(tableName, connName).then(
                  (attrs) => {
                     Object.keys(attrs).forEach((attrName) => {
                        // filter reserve columns
                        if (ABField.reservedNames.indexOf(attrName) > -1)
                           return;

                        var att = attrs[attrName];

                        colNames.push({
                           id: attrName,
                           label: attrName.replace(/_/g, " "),
                           isvisible: true,
                           fieldKey: att.fieldKey,

                           disabled: !att.supported
                        });
                     });

                     $$(ids.columnList).parse(colNames);

                     _logic.busyEnd();
                  },
                  // error
                  () => {
                     _logic.busyEnd();
                  }
               );
            }
         },

         cancel: function() {
            _logic.formClear();
            _logic.callbacks.onCancel();
         },

         formClear: function() {
            // Filter section
            $$(ids.form).clearValidation();
            $$(ids.form).clear();
            // Lists
            $$(ids.externalList).clearAll();
            $$(ids.columnList).clearAll();
         },

         /**
          * @function hide()
          *
          * hide this component.
          */
         hide: function() {
            $$(ids.component).hide();
         },

         /**
          * @function save
          *
          * Send model import request to the server
          */
         save: () => {
            var selectedExternal = $$(ids.externalList).getSelectedItem();
            if (!selectedExternal) return false;

            var saveButton = $$(ids.buttonSave);
            saveButton.disable();
            _logic.busyStart();

            var columns = $$(ids.columnList)
               .data.find({ disabled: false })
               .map((col) => {
                  return {
                     name: col.id,
                     label: col.label,
                     fieldKey: col.fieldKey,
                     isHidden: !col.isvisible
                  };
               });

            var tableName = selectedExternal.name || selectedExternal.id;
            var connName = selectedExternal.connection || null;

            this.abExternal
               .tableImport(tableName, columns, connName)
               .then((definitionList) => {
                  // insert the new definitions into our live system.
                  (definitionList || []).forEach((def) => {
                     ABDefinition.insert(def);
                  });

                  saveButton.enable();
                  _logic.busyEnd();

                  var updateObj = null;
                  var objDef = definitionList.find((d) => d.type == "object");
                  if (objDef) {
                     var def = ABDefinition.definition(objDef.id);
                     if (def) {
                        updateObj = currentApp.objectNew(def);
                     }
                  }

                  currentApp.objectInsert(updateObj).then(() => {
                     _logic.callbacks.onDone(updateObj);
                  });
               })
               .catch((err) => {
                  console.log("ERROR:", err);
                  webix.alert({
                     title: "Error Importing External Object",
                     ok: "fix it",
                     text: err.toString(),
                     type: "alert-error"
                  });
                  saveButton.enable();
                  _logic.busyEnd();
               });
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            if ($$(ids.component)) $$(ids.component).show();
         }
      });

      // webix UI definition
      // (it references _logic functions defined above)
      this.ui = {
         id: ids.component,
         header: labels.component.external,
         body: {
            view: "form",
            id: ids.form,
            width: 400,
            elements: [
               // Connections
               {
                  view: "combo",
                  id: ids.connectionList,
                  label: labels.component.connections,
                  labelWidth: 120,
                  options: [],
                  on: {
                     onChange: function(newVal, oldVal) {
                        _logic.connectionSelect(newVal);
                     }
                  }
               },

               // Filter
               {
                  cols: [
                     {
                        view: "icon",
                        icon: "fa fa-filter",
                        align: "left"
                     },
                     {
                        view: "text",
                        id: ids.filter,
                        on: {
                           onTimedKeyPress: _logic.filter
                        }
                     }
                  ]
               },

               // Model list
               {
                  view: "list",
                  id: ids.externalList,
                  select: true,
                  height: 200,
                  minHeight: 250,
                  maxHeight: 250,
                  data: [],
                  template: "#name#",
                  on: {
                     onSelectChange: _logic.externalSelect
                  }
               },

               // Columns list
               {
                  view: "label",
                  label: `<b>${labels.component.columns}</b>`,
                  height: 20
               },
               {
                  view: App.custom.activelist.view,
                  id: ids.columnList,
                  datatype: "json",
                  multiselect: false,
                  select: false,
                  height: 200,
                  minHeight: 200,
                  maxHeight: 200,
                  type: {
                     height: 40
                  },
                  // activeContent: {
                  //    isvisible: {
                  //       view: "checkbox",
                  //       width: 30
                  //    },
                  //    fieldKey: {
                  //       view: "combo",
                  //       width: 120,
                  //       options: {
                  //          body: {
                  //             template:
                  //                '<span class="webix_icon fa fa-#icon#" style="float: left; line-height: 30px;"></span>' +
                  //                '<span style="float: left; width: 40px;">#name#</span>',
                  //             data: _logic.getTypeOptions()
                  //          }
                  //       }
                  //    },
                  //    label: {
                  //       view: "text",
                  //       width: 170
                  //    }
                  // },
                  template: (obj, common) => {
                     // For disabled columns, display strikethrough text
                     if (obj.disabled) {
                        obj.isvisible = false;
                        return `
                                        <span style="float:left; margin:8px 15px 7px 4px;">
                                            <span class="glyphicon glyphicon-remove">
                                            </span>
                                        </span>
                                        <span style="float:left; pading-left:1em; text-decoration:line-through;">
                                            ${obj.label}
                                        </span>
                                    `;
                     }
                     // For normal columns, display checkbox and text
                     else {
                        // NOTE: webix v7 removes ActiveContent
                        // so refactor this:
                        // return `
                        //                 <span style="float: left;">${common.isvisible(
                        //                    obj,
                        //                    common
                        //                 )}</span>
                        //                 <span style="float: left;">${common.fieldKey(
                        //                    obj,
                        //                    common
                        //                 )}</span>
                        //                 <span style="float: left;">${common.label(
                        //                    obj,
                        //                    common
                        //                 )}</span>
                        //                 `;
                        return `${obj.label}`;
                     }
                  }
               },

               // Import & Cancel buttons
               {
                  margin: 5,
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        id: ids.buttonCancel,
                        value: labels.common.cancel,
                        css: "ab-cancel-button",
                        autowidth: true,
                        click: _logic.cancel
                     },
                     {
                        view: "button",
                        id: ids.buttonSave,
                        css: "webix_primary",
                        value: labels.common.import,
                        autowidth: true,
                        type: "form",
                        click: _logic.save
                     }
                  ]
               }
            ]
         }
      };

      // Expose any globally accessible Actions:
      this.actions({});

      //
      // Define external interface methods:
      //
      this.onShow = _logic.onShow;
   }
};
