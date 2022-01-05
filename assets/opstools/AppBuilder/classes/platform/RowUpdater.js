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

         getItemUI: () => {
            return {
               rows: [
                  {
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
                                 let $viewItem = this.getParentView();
                                 _logic.selectField(columnId, $viewItem);
                              }
                           }
                        },
                        {
                           // Label
                           view: "label",
                           width: 40,
                           label: labels.component.to
                        },
                        {
                           view: "segmented",
                           value: "custom",
                           height: 40,
                           maxWidth: 160,
                           options: [
                              { id: "custom", value: "Custom" },
                              { id: "process", value: "Process" }
                           ],
                           hidden:
                              this._extendedOptions == null ||
                              !this._extendedOptions.length,
                           on: {
                              onChange: function(val) {
                                 let $viewItem = this.getParentView();

                                 _logic.toggleCustomProcessOption(
                                    $viewItem,
                                    val == "process"
                                 );
                              }
                           }
                        },
                        // Field value
                        {},
                        // Extended value
                        {
                           hidden: true
                        },
                        {
                           // "Remove" button
                           view: "button",
                           css: "webix_danger",
                           icon: "fa fa-trash",
                           type: "icon",
                           autowidth: true,

                           click: function() {
                              let $viewCond = this.getParentView().getParentView();

                              _logic.removeItem($viewCond);
                           }
                        }
                     ]
                  }
               ]
            };
         },

         getAddButtonUI: function() {
            return {
               view: "button",
               id: ids.addNew,
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

         selectField: (columnId, $viewItem) => {
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

            let childViews = $viewItem.getChildViews();

            // Change component to display value
            $viewItem.removeView(childViews[4]);
            $viewItem.addView(inputView, 4);

            formFieldComponent.init();

            // Show custom display of data field
            if (field.customDisplay)
               field.customDisplay({}, App, childViews[4].$view);

            // Add extended value options
            $viewItem.removeView(childViews[5]);
            if (this._extendedOptions && this._extendedOptions.length) {
               $viewItem.addView(
                  {
                     view: "richselect",
                     options: this._extendedOptions,
                     hidden: true
                  },
                  5
               );
            } else {
               $viewItem.addView(
                  {
                     hidden: true
                  },
                  5
               );
            }

            this._logic.toggleCustomProcessOption(
               $viewItem,
               childViews[3].getValue() == "process"
            );

            // _logic.refreshFieldList();
            // $$(this).adjust();
            $$($viewItem).adjust();
            $viewItem.getFormView().adjust();
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
               $form.adjust();
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
               $form.getChildViews().forEach(($viewContainer) => {
                  let $viewItem = $viewContainer.getChildViews()[0];

                  // Ignore "Add new" button
                  if (!$viewItem || !$viewItem.$$) return;

                  let $fieldElem = $viewItem.$$(ids.field);
                  if (!$fieldElem) return;

                  let fieldId = $fieldElem.getValue();
                  if (!fieldId) return;

                  let $customValueElem = $viewItem.getChildViews()[4];
                  let $processValueElem = $viewItem.getChildViews()[5];
                  if (!$customValueElem && !$processValueElem) return;

                  let fieldInfo = _Object.fields((f) => f.id == fieldId)[0];

                  let val = {
                     fieldId: fieldId
                  };

                  // Custom value
                  if ($customValueElem && $customValueElem.isVisible()) {
                     if (
                        fieldInfo.key == "date" ||
                        fieldInfo.key == "datetime"
                     ) {
                        let currDateCheckbox = $customValueElem.getChildViews()[0];
                        if (currDateCheckbox.getValue() == true) {
                           val.value = "ab-current-date";
                        } else {
                           let datePicker = $customValueElem.getChildViews()[1];
                           val.value = fieldInfo.getValue(datePicker);
                        }
                     } else {
                        // Get value from data field manager
                        val.value = fieldInfo.getValue($customValueElem);
                     }
                  }
                  // Process value
                  else if ($processValueElem && $processValueElem.isVisible()) {
                     val.isProcessValue = true;
                     val.value = $processValueElem.getValue();
                  }

                  // Add to output
                  result.push(val);
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
               let $viewContainer = $$(_logic.addItem());
               let $viewItem = $viewContainer.getChildViews()[0];

               $viewItem.$$(ids.field).setValue(item.fieldId);
               let $valueTypeButton = $viewItem.queryView(
                  { view: "segmented" },
                  "self"
               );
               $valueTypeButton.setValue(
                  item.isProcessValue ? "process" : "custom"
               );

               let $customValueElem = $viewItem.getChildViews()[4];
               let $processValueElem = $viewItem.getChildViews()[5];
               if (!$customValueElem && !$processValueElem) return;

               let fieldInfo = _Object.fields((f) => f.id == item.fieldId)[0];
               if (!fieldInfo) return;

               // Set custom value
               let rowData = {};
               rowData[fieldInfo.columnName] = item.value;
               fieldInfo.setValue($customValueElem, rowData);

               // Set process value
               $processValueElem.setValue(item.value);
            });

            _logic.toggleForm();
         },

         setExtendedOptions: (options) => {
            this._extendedOptions = options;
         },

         toggleCustomProcessOption: ($viewItem, showProcessOption) => {
            let $customOption = $viewItem.getChildViews()[4];
            let $processOption = $viewItem.getChildViews()[5];

            if (showProcessOption) {
               $customOption.hide();
               $processOption.show();
            } else {
               $customOption.show();
               $processOption.hide();
            }
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
      this.setExtendedOptions = _logic.setExtendedOptions;
   }
};
