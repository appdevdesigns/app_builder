const ABComponent = require("./ABComponent");
const ABViewForm = require("../platform/views/ABViewForm");

module.exports = class RowUpdater extends ABComponent {
   constructor(App, idBase) {
      super(App, idBase);

      // make sure App is a valid value:
      if (!App) {
         App = this.App;
      }

      let L = this.Label;

      let labels = {
         common: (App || {}).labels,
         component: {
            addNew: L("ab.component.form.addNew", "*Add field to edit"),

            set: L("ab.component.form.set", "*Set"),
            to: L("ab.component.form.to", "*To")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      let ids = {
         form: this.unique(idBase + "_rowUpdaterForm"),
         addNew: this.unique(idBase + "_rowUpdaterAddNew"),

         field: this.unique(idBase + "_rowUpdaterField")
      };

      let _Object;
      let _mockFormWidget;

      // setting up UI
      this.init = (options) => {
         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }
      };

      // internal business logic
      let _logic = (this._logic = {
         callbacks: {
            /**
             * @function onChange
             * called when we have made changes to the hidden field settings
             * of our Current Object.
             *
             * this is meant to alert our parent component to respond to the
             * change.
             */
            onChange: function() {}
         },

         /**
          * @method objectLoad
          * set object
          *
          * @param object {Object}
          */
         objectLoad: function(object) {
            _Object = object;

            _mockFormWidget = new ABViewForm(
               {
                  settings: {
                     showLabel: false,
                     labelWidth: 0
                  }
               },
               _Object ? _Object.application : null
            );
            _mockFormWidget.objectLoad(object);

            _logic.setValue(null); // clear
         },

         getFieldList: function(excludeSelected) {
            let options = (_Object.fields() || []).map((f) => {
               return {
                  id: f.id,
                  value: f.label
               };
            });

            if (excludeSelected) {
               let $form = $$(ids.form);

               $form.getChildViews().forEach(($viewCond) => {
                  // Ignore "Add new" button
                  if (!$viewCond || !$viewCond.$$) return;

                  let $fieldElem = $viewCond.$$(ids.field);
                  if (!$fieldElem) return;

                  let fieldId = $fieldElem.getValue();
                  if (!fieldId) return;

                  options = options.filter((opt) => opt.id != fieldId);
               });
            }
            return options;
         },

         getItemUI: function() {
            return {
               view: "layout",
               isolate: true,
               cols: [
                  {
                     // Label
                     view: "label",
                     width: 40,
                     label: labels.component.set
                  },
                  {
                     // Field list
                     view: "combo",
                     id: ids.field,
                     options: _logic.getFieldList(true),
                     on: {
                        onChange: function(columnId) {
                           let $viewCond = this.getParentView();
                           _logic.selectField(columnId, $viewCond);
                        }
                     }
                  },
                  {
                     // Label
                     view: "label",
                     width: 40,
                     label: labels.component.to
                  },
                  // Field value
                  {},
                  {
                     // "Remove" button
                     view: "button",
                     css: "webix_danger",
                     icon: "fa fa-trash",
                     type: "icon",
                     autowidth: true,

                     click: function() {
                        let $viewCond = this.getParentView();

                        _logic.removeItem($viewCond);
                     }
                  }
               ]
            };
         },

         getAddButtonUI: function() {
            return {
               view: "button",
               id: ids.addNew,
               css: "webix_primary",
               icon: "fa fa-plus",
               type: "iconButton",
               label: labels.component.addNew,
               click: function() {
                  _logic.addItem();
               }
            };
         },

         addItem: function(index) {
            let $form = $$(ids.form);

            let remainFields = _logic.getFieldList(true);
            if (remainFields.length < 1) return;

            let ui = _logic.getItemUI();

            let viewId = $form.addView(ui, index);

            _logic.toggleForm();

            return viewId;
         },

         removeItem: function($viewCond) {
            let $form = $$(ids.form);

            $form.removeView($viewCond);

            _logic.toggleForm();
         },

         selectField: function(columnId, $viewCond) {
            let field = _Object.fields((col) => col.id == columnId)[0];
            if (!field) {
               console.error(
                  "RowUpdater.selectField() could not find a field for [" +
                     columnId +
                     "]"
               );
               return;
            }
            let fieldComponent = field.formComponent(),
               formFieldWidget = fieldComponent.newInstance(
                  field.object.application,
                  _mockFormWidget
               ),
               formFieldComponent = formFieldWidget.component(App, idBase),
               inputView = formFieldComponent.ui;

            // WORKAROUND: add '[Current User]' option to the user data field
            switch (field.key) {
               case "user":
                  inputView.options = inputView.options || [];
                  inputView.options.unshift({
                     id: "ab-current-user",
                     value: "*[Current User]"
                  });
                  break;
               case "date":
               case "datetime":
                  inputView = {
                     view: "layout",
                     rows: [
                        {
                           view: "checkbox",
                           labelWidth: 0,
                           labelRight: "*Current Date/Time",
                           on: {
                              onChange: function(newVal) {
                                 let layout = this.getParentView();
                                 if (!layout) return;

                                 let datePicker = layout.getChildViews()[1];
                                 if (!datePicker) return;

                                 newVal ? datePicker.hide() : datePicker.show();
                              }
                           }
                        },
                        inputView
                     ]
                  };
                  break;
            }

            // Change component to display value
            $viewCond.removeView($viewCond.getChildViews()[3]);
            $viewCond.addView(inputView, 3);

            formFieldComponent.init();

            // Show custom display of data field
            if (field.customDisplay)
               field.customDisplay({}, App, $viewCond.getChildViews()[3].$view);

            // _logic.refreshFieldList();
            // $$(this).adjust();
            $$($viewCond).adjust();
            $viewCond.getFormView().adjust();
         },

         toggleForm: () => {
            let $form = $$(ids.form);
            if ($form) {
               let childViews = $form.getChildViews();
               if (childViews && childViews.length) {
                  $form.show();
               } else {
                  $form.hide();
               }
            }
         },

         /**
          * @method getValue
          * @return {Array} - [
          * 						{
          * 							fieldId: {UUID}
          * 							value: {Object}
          * 						}, ...
          * 					]
          */
         getValue: function() {
            let result = [];

            let $form = $$(ids.form);
            if ($form) {
               $form.getChildViews().forEach(($viewCond) => {
                  // Ignore "Add new" button
                  if (!$viewCond || !$viewCond.$$) return;

                  let $fieldElem = $viewCond.$$(ids.field);
                  if (!$fieldElem) return;

                  let fieldId = $fieldElem.getValue();
                  if (!fieldId) return;

                  let $valueElem = $viewCond.getChildViews()[3];
                  if (!$valueElem) return;

                  let fieldInfo = _Object.fields((f) => f.id == fieldId)[0];

                  let val;
                  if (fieldInfo.key == "date" || fieldInfo.key == "datetime") {
                     let currDateCheckbox = $valueElem.getChildViews()[0];
                     if (currDateCheckbox.getValue() == true) {
                        val = "ab-current-date";
                     } else {
                        let datePicker = $valueElem.getChildViews()[1];
                        val = fieldInfo.getValue(datePicker);
                     }
                  } else {
                     // Get value from data field manager
                     val = fieldInfo.getValue($valueElem);
                  }

                  // Add to output
                  result.push({
                     fieldId: fieldId,
                     value: val
                  });
               });
            }

            return result;
         },

         /**
          * @method setValue
          * @param settings {Array} - [
          * 								{
          * 									fieldId: {UUID}
          * 									value: {Object}
          * 								}, ...
          * 							]
          */
         setValue: function(settings) {
            let $form = $$(ids.form);
            if (!$form) return;

            // Redraw form with no elements
            webix.ui([], $form);

            settings = settings || [];
            if (settings.length < 1) return;

            settings.forEach((item) => {
               let $viewItem = $$(_logic.addItem());

               $viewItem.$$(ids.field).setValue(item.fieldId);

               let $valueElem = $viewItem.getChildViews()[3];
               if (!$valueElem) return;

               let fieldInfo = _Object.fields((f) => f.id == item.fieldId)[0];
               if (!fieldInfo) return;

               // Set value
               let rowData = {};
               rowData[fieldInfo.columnName] = item.value;
               fieldInfo.setValue($valueElem, rowData);
            });

            _logic.toggleForm();
         }
      });

      // webix UI definition:
      this.ui = {
         rows: [
            {
               view: "form",
               id: ids.form,
               hidden: true,
               borderless: true,
               elements: []
            },
            _logic.getAddButtonUI()
         ]
      };

      // Interface methods for parent component:
      this.objectLoad = _logic.objectLoad;
      this.addItem = _logic.addItem;
      this.getValue = _logic.getValue;
      this.setValue = _logic.setValue;
   }
};
