/*
 * ab_work_object_workspace_popupMassUpdate
 *
 * Manage the Mass Update popup.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const RowUpdater = require("../classes/platform/RowUpdater");

module.exports = class AB_Work_Object_Workspace_PopupMassUpdate extends ABComponent {
   //.extend(idBase, function(App) {

   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace_popupMassUpdate";

      super(App, idBase);
      let L = this.Label;

      let labels = {
         common: App.labels
      };

      // internal list of Webix IDs to reference our UI components
      let ids = {
         component: this.unique(idBase + "_popupMassUpdate"),
         submit: this.unique(idBase + "_submitMassUpdate")
      };

      let rowUpdater = new RowUpdater(App, idBase);

      // Our webix UI definition:
      this.ui = {
         view: "popup",
         id: ids.component,
         // modal: true,
         body: {
            width: 500,
            rows: [
               // Update panel
               rowUpdater.ui,
               { height: 15 },
               {
                  cols: [
                     {},
                     {
                        view: "button",
                        value: L("ab.common.cancel", "*Cancel"),
                        width: 100,
                        click: () => {
                           _logic.hide();
                        }
                     },
                     {
                        id: ids.submit,
                        css: "webix_primary",
                        view: "button",
                        label: L("ab.common.update", "*Update"),
                        type: "form",
                        width: 120,
                        click: () => {
                           _logic.submit();
                        }
                     }
                  ]
               }
            ]
         },
         on: {
            onShow: function() {
               _logic.onShow();
            }
         }
      };

      // Our init() function for setting up our UI
      this.init = (options) => {
         // register our callbacks:
         for (let c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui(this.ui);
      };

      let CurrentObject = null;
      let DataTable;

      // our internal business logic
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

         // addNewField: function () {
         // 	let update_records_popup = $$(ids.component),
         // 		update_panel = update_records_popup.getChildViews()[0].getChildViews()[0],
         // 		viewIndex = update_panel.getChildViews().length,
         // 		options = _logic.getFieldList(true);

         // 	if (!options || options.length < 1) return;

         // 	update_panel.addView({
         // 		cols: [
         // 			{
         // 				view: "richselect",
         // 				label: L("ab.component.form.set", "*Set"),
         // 				labelWidth: 40,
         // 				width: 200,
         // 				options: options,
         // 				on: {
         // 					"onChange": function (columnId) {
         // 						let update_item = this.getParentView(),
         // 							columnData = CurrentObject.fields().filter(function (col) { return col.columnName == columnId; })[0],
         // 							fieldComponent = columnData.formComponent(),
         // 							abView = fieldComponent.newInstance(CurrentObject.application),
         // 							viewComponent = abView.component(App),
         // 							inputView = viewComponent.ui;

         // 						// Change component to display value
         // 						update_item.removeView(update_item.getChildViews()[2]);
         // 						update_item.addView(inputView, 2);

         // 						// Show custom display of data field
         // 						viewComponent.init();

         // 						_logic.refreshFieldList();
         // 						$$(this).adjust();
         // 						$$(update_item).adjust();
         // 					}
         // 				}
         // 			},
         // 			{ view: 'label', label: ` ${L("ab.component.form.to", "*To")} `, width: 30 },
         // 			{},
         // 			{
         // 				view: 'button', icon: "fa fa-trash", type: "icon", width: 30, click: function () {
         // 					let update_item = this.getParentView(),
         // 						update_panel = update_item.getParentView();

         // 					update_panel.removeView(update_item);

         // 					_logic.refreshFieldList();
         // 				}
         // 			}
         // 		]
         // 	}, viewIndex);

         // 	// Select first option
         // 	update_panel.getChildViews()[viewIndex].getChildViews()[0].setValue(options[0].id);
         // },

         // /**
         //  * @function getFieldList
         //  * return field list so we can present a custom UI for view
         //  */
         // getFieldList: function (excludeSelected) {
         // 	//  console.log(CurrentObject.fields());
         // 	//  console.log("field up");
         // 	let update_records_popup = $$(ids.component),
         // 		update_panel = update_records_popup.getChildViews()[0].getChildViews()[0],
         // 		options = CurrentObject.fields().filter(function (col) {
         // 			// If this field have model link type, then it should not be allowed to mass update
         // 			if (col.setting && (col.setting.linkType == 'model' || col.setting.linkViaType == 'model'))
         // 				return false;
         // 			else
         // 				return true;
         // 		});

         // 	// console.log(options);
         // 	// Remove selected columns
         // 	if (excludeSelected) {
         // 		let update_items = update_panel.getChildViews();
         // 		update_items.forEach(function (item, index) {
         // 			let selectedValue = item.getChildViews()[0].getValue();
         // 			if (selectedValue) {
         // 				let removeIndex = null,
         // 					removeItem = options.filter(function (f, index) {
         // 						if (f.name == selectedValue) {
         // 							removeIndex = index;
         // 							return true;
         // 						}
         // 						else {
         // 							return false;
         // 						}
         // 					});

         // 				options.splice(removeIndex, 1);
         // 			}
         // 		});
         // 	}

         // 	return (options || []).map(function (opt) { return { id: opt.columnName, value: opt.label } });
         // },

         // refreshFieldList: function (ignoreRemoveViews) {
         // 	let update_records_popup = $$(ids.component),
         // 		update_panel = update_records_popup.getChildViews()[0].getChildViews()[0],
         // 		fieldList = _logic.getFieldList(false),
         // 		selectedFields = [];
         // 	let removeChildViews = [];

         // 	let update_items = update_panel.getChildViews();
         // 	update_items.forEach(function (item, index) {
         // 		let fieldName = item.getChildViews()[0].getValue(),
         // 			fieldObj = fieldList.filter(function (f) { return f.id == fieldName });

         // 		if (fieldObj.length > 0) {
         // 			// Add selected field to list
         // 			selectedFields.push(fieldObj[0]);
         // 		}
         // 	});

         // 	// Field list should not duplicate field items
         // 	update_items = update_panel.getChildViews();
         // 	update_items.forEach(function (item, index) {
         // 		let fieldName = item.getChildViews()[0].getValue(),
         // 			fieldObj = fieldList.filter(function (f) { return f.id == fieldName });

         // 		// Remove selected duplicate items
         // 		let selectedFieldsExcludeCurField = $(selectedFields).not(fieldObj);
         // 		let enableFields = $(fieldList).not(selectedFieldsExcludeCurField).get();

         // 		// Update field list
         // 		item.getChildViews()[0].define('options', enableFields);
         // 		item.getChildViews()[0].refresh();
         // 	});
         // },

         /**
          * @function objectLoad
          * Ready the Popup according to the current object
          * @param {ABObject} object  the currently selected object.
          * @param {ABObject} dataTable  the dataTable we need to run the mass update on...trust me this will be good
          */
         objectLoad: function(object, dataTable) {
            CurrentObject = object;
            rowUpdater.objectLoad(object);

            DataTable = dataTable;
         },

         /**
          * @function objectLoad
          * Ready the Popup according to the current object
          * @param {ABObject} object  the currently selected object.
          */
         onShow: function() {},

         /**
          * @function show()
          *
          * Show this component.
          * @param {obj} $view  the webix.$view to hover the popup around.
          * @param {string} columnName the columnName we want to prefill the sort with
          */
         show: function($view, columnName, options) {
            if (options != null) {
               $$(ids.component).show($view, options);
            } else {
               $$(ids.component).show($view);
            }
         },

         hide: () => {
            $$(ids.component).hide();
         },

         submit: () => {
            // Update values to records
            let update_button = $$(ids.submit),
               update_items = rowUpdater.getValue() || [];

            update_button.disable();

            if (!DataTable) {
               // TODO : Message
               // console.log("no data collection to update");
               update_button.enable();
               return;
            } else if (update_items.length < 1) {
               // TODO : Message
               update_button.enable();
               return;
            }

            // Show loading cursor
            // $$(ids.component).showProgress({ type: "icon" });

            let $datatable = $$(DataTable.ui.id);
            // let updateTasks = [];
            let updatedRowIds = [];
            $datatable.data.each(function(row) {
               if (
                  row &&
                  row.hasOwnProperty("appbuilder_select_item") &&
                  row.appbuilder_select_item == 1
               ) {
                  updatedRowIds.push(row.id);
                  // let rowData = $datatable.getItem(obj.id);

                  // update_items.forEach((item) => {
                  //    let fieldInfo = CurrentObject.fields(
                  //       (f) => f.id == item.fieldId
                  //    )[0];
                  //    if (!fieldInfo) return;

                  //    rowData[fieldInfo.columnName] = item.value;
                  // });

                  // updateTasks.push(function(next) {
                  //    CurrentObject.model()
                  //       .update(rowData.id, rowData)
                  //       .then(() => {
                  //          // DataTable.refresh(); // We need this in the object builder
                  //          // We use DataCollection instead
                  //          next();
                  //       }, next);
                  // });
               }
            });

            let vals = {};
            update_items.forEach((item) => {
               let fieldInfo = CurrentObject.fields(
                  (f) => f.id == item.fieldId
               )[0];
               if (!fieldInfo) return;

               vals[fieldInfo.columnName] = item.value;
            });

            if (updatedRowIds.length > 0) {
               OP.Dialog.Confirm({
                  title: "Updating Multiple Records",
                  text: "Are you sure you want to update the selected records?",
                  callback: function(result) {
                     if (result) {
                        if ($datatable && $datatable.showProgress)
                           $datatable.showProgress({ type: "icon" });

                        let objModel = CurrentObject.model();
                        objModel
                           .batchUpdate({
                              rowIds: updatedRowIds,
                              values: vals
                           })
                           .then(() => {
                              // Anything we need to do after we are done.
                              update_button.enable();
                              _logic.hide();

                              if ($datatable && $datatable.hideProgress)
                                 $datatable.hideProgress();
                           })
                           .catch((err) => {
                              // TODO
                              console.error(err);
                           });

                        // async.parallel(updateTasks, function(err) {
                        //    if (err) {
                        //       // TODO : Error message
                        //    } else {
                        //       // Anything we need to do after we are done.
                        //       update_button.enable();
                        //       _logic.hide();
                        //    }

                        //    if ($datatable && $datatable.hideProgress)
                        //       $datatable.hideProgress();
                        // });
                     }
                  }
               });
            } else {
               OP.Dialog.Alert({
                  title: "No Records Selected",
                  text:
                     "You need to select at least one record...did you drink your coffee today?"
               });
               update_button.enable();
               _logic.hide();
            }
         }
      });

      // Expose any globally accessible Actions:
      this.actions({});

      //
      // Define our external interface methods:
      //
      this.objectLoad = _logic.objectLoad;
      this.show = _logic.show;
   }
};
