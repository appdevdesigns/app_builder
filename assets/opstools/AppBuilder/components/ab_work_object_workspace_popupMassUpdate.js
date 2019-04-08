
/*
 * ab_work_object_workspace_popupMassUpdate
 *
 * Manage the Mass Update popup.
 *
 */
 
export default class AB_Work_Object_Workspace_PopupMassUpdate extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App, idBase) {
		idBase = idBase || 'ab_work_object_workspace_popupMassUpdate';

		super(App, idBase);
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {

				addFieldEdit: 	L('ab.massUpdate.addFieldEdit', "*Add field to edit"),

			}
		}


		// internal list of Webix IDs to reference our UI components
		var ids = {
			component: this.unique(idBase + '_popupMassUpdate'),
			list: this.unique(idBase + '_popupMassUpdate_list'),
			form: this.unique(idBase + "_popupMassUpdate_form"),
		}


		// Our webix UI definition:
		this.ui = {
			view:"popup",
			id: ids.component,
			// modal: true,
			body: {
				width: 500,
				rows: [
					// Update panel
					{ rows: [] },
					{ height: 10 },
					{
						view: 'button',
                        type: 'form',
						label: labels.component.addFieldEdit,
						click: function () {
							// var update_records_popup = this.getTopParentView();
							_logic.addNewField();
							// update_records_popup.addNewField();
						}
					},
					{ height: 15 },
					{
						cols: [
                            {},
                            {
                                view: "button", value: L("ab.common.cancel", "*Cancel"), width: 100, click: function () {
                                    this.getTopParentView().hide();
                                }
                            },
							{
								view: "button", label: L("ab.common.update", "*Update"), type: "form", width: 120,
								click: function () {
									// Update values to records
									// alert("hello");
									var update_button = this,
										update_records_popup = this.getTopParentView(),
										update_panel = $$(ids.component).getChildViews()[0].getChildViews()[0],
										update_items = update_panel.getChildViews();

									update_button.disable();

									if (!DataTable) {
										// TODO : Message
										// console.log("no data collection to update");
										update_button.enable();
										return;
									}
									else if (update_items.length < 1) {
										// TODO : Message
										update_button.enable();
										return;
									}

									// Show loading cursor
									// $$(ids.component).showProgress({ type: "icon" });

									var updateTasks = [];
					                $$(DataTable.ui.id).data.each(function(obj){
					                    if (typeof(obj) != "undefined" && obj.hasOwnProperty("appbuilder_select_item") && obj.appbuilder_select_item == 1) {
											
											var rowData = $$(DataTable.ui.id).getItem(obj.id);
											
											update_items.forEach(function (item) {
												var colSelector = item.getChildViews()[0],
													valEditor = item.getChildViews()[2],
													columnData = CurrentObject.fields().filter(function (col) { return col.columnName == colSelector.getValue(); })[0];

												// Get value from data field manager
												// var val = null;
												var val = columnData.getValue(valEditor, rowData);

												// Get value from webix components
												// if (val == null && valEditor.getValue)
												// 	val = valEditor.getValue();
												
												rowData[columnData.columnName] = val;										
												// console.log(object);
												// modelData.attr(colSelector.getValue(), val);
											});


					                        updateTasks.push(function (next) {
								                CurrentObject.model()
								                .update(rowData.id, rowData)
								                .then(()=>{
													// DataTable.refresh(); // We need this in the object builder
													// We use DataCollection instead
													next();
								                }, next);
											
					                        });
					                    }
					                });

					                if (updateTasks.length > 0) {
					                    OP.Dialog.Confirm({
					                        title: "Updating Multiple Records",
					                        text:  "Are you sure you want to update the selected records?",
					                        callback: function (result) {
					                            if (result) {
					                                async.parallel(updateTasks, function (err) {
					                                    if (err) {
					                                        // TODO : Error message
					                                    } else {
					                                        // Anything we need to do after we are done.
															update_button.enable();
															update_records_popup.hide();
					                                    }
					                                });
					                            }
					                        }
					                    });                    
					                } else {
					                    OP.Dialog.Alert({
											title: 'No Records Selected',
											text: 'You need to select at least one record...did you drink your coffee today?'
										});
					                }









									// var updateTasks = [];
									// 
									// DataTable.getCheckedItems().forEach(function (rowId) {
									// 	alert("you selected me: " + rowId);
									// 	var modelData = DataTable.AD.getModel(rowId);
									// 
									// 	update_items.forEach(function (item) {
									// 		var colSelector = item.getChildViews()[0],
									// 			valEditor = item.getChildViews()[2],
									// 			columnData = update_records_popup.columns.filter(function (col) { return col.name == colSelector.getValue(); })[0];
									// 	
									// 		// Get value from data field manager
									// 		var val = dataFieldsManager.getValue(update_records_popup.application, update_records_popup.objectModel, columnData, valEditor.$view);
									// 	
									// 		// Get value from webix components
									// 		if (val == null && valEditor.getValue)
									// 			val = valEditor.getValue();
									// 	
									// 		modelData.attr(colSelector.getValue(), val);
									// 	});
									// 	
									// 	updateTasks.push(function (next) {
									// 		modelData.save().then(function () {
									// 			next();
									// 		}, next);
									// 	});
									// });

									// async.parallel(updateTasks, function (err) {
									// 	// Hide loading cursor
									// 	update_records_popup.hideProgress({ type: "icon" });
									// 
									// 	update_button.enable();
									// 
									// 	if (err) {
									// 		// TODO : Error message
									// 	}
									// 	else {
									// 		update_records_popup.hide();
									// 	}
									// });
								}
							}
						]
					}
				]
			},
			on: {
				onShow: function () {
					_logic.onShow();
				}

				// onShow: function () {
				// 	var update_records_popup = this,
				// 		update_records_form = update_records_popup.getChildViews()[0],
				// 		update_records_panel = update_records_form.getChildViews()[3];
				// 
				// 	// Initial selectivity
				// 	selectivityHelper.renderSelectivity(update_records_form.$view, 'ab-update-records-checked-items', true);
				// 
				// 	// Show checked items in selectivity
				// 	var checkedItems = [];
				// 	update_records_popup.dataCollection.getCheckedItems().forEach(function (rowId) {
				// 		var rowData = update_records_popup.dataTable.getItem(rowId);
				// 
				// 		checkedItems.push({
				// 			id: rowId,
				// 			text: update_records_popup.objectModel.getDataLabel(rowData)
				// 		});
				// 	});
				// 	selectivityHelper.setData($(update_records_form.$view).find('.ab-update-records-checked-items'), checkedItems);
				// 
				// 	// Clear children views in update panel
				// 	var remove_items = [],
				// 		update_items = update_records_panel.getChildViews();
				// 	for (var i = 0; i < update_items.length; i++) {
				// 		remove_items.push(update_items[i]);
				// 	}
				// 	remove_items.forEach(function (v) {
				// 		update_records_panel.removeView(v);
				// 	});
				// 
				// 	// Add a update field
				// 	update_records_popup.addNewField();
				// }
			}
		}
		
		
		// {
		// 	view:"popup",
		// 	id: ids.component,
		// 	// autoheight:true,
		// 	width: 500,
		// 	body: {
		// 		view: "form",
		// 		id: ids.form,
		// 		// autoheight: true,
		// 		borderless: true,
		// 		elements: [
		// 			{
		// 				view: "button", 
		// 				value: labels.component.addNewSort, 
		// 				on: {
		// 					onItemClick: function(id, e, node) {
		// 						_logic.clickAddNewSort();
		// 					}
		// 				}
		// 			}
		// 		]
		// 	},
		// 	on: {
		// 		onShow: function () {
		// 			_logic.onShow();
		// 		}
		// 	}
	    // }



		// Our init() function for setting up our UI
		this.init = (options) => {
			// register our callbacks:
			for(var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);
		}


		var CurrentObject = null;
		var DataTable = null;

		// our internal business logic
		var _logic = this._logic = {

			callbacks:{

				/**
				 * @function onChange
				 * called when we have made changes to the hidden field settings
				 * of our Current Object.
				 *
				 * this is meant to alert our parent component to respond to the
				 * change.
				 */
				onChange:function(){}
			},
			
			addNewField: function () {
				var update_records_popup = $$(ids.component),
					update_panel = update_records_popup.getChildViews()[0].getChildViews()[0],
					viewIndex = update_panel.getChildViews().length,
					options = _logic.getFieldList(true);

				if (!options || options.length < 1) return;

				update_panel.addView({
					cols: [
						{
							view: "richselect",
							label: L("ab.component.form.set", "*Set"),
							labelWidth: 40,
							width: 200,
							options: options,
							on: {
								"onChange": function (columnId) {
									var update_item = this.getParentView(),
										columnData = CurrentObject.fields().filter(function (col) { return col.columnName == columnId; })[0],
										fieldComponent = columnData.formComponent(),
										abView = fieldComponent.newInstance(CurrentObject.application),
										viewComponent = abView.component(App),
										inputView = viewComponent.ui;

									// Change component to display value
									update_item.removeView(update_item.getChildViews()[2]);
									update_item.addView(inputView, 2);

									// Show custom display of data field
									viewComponent.init();

									_logic.refreshFieldList();
									$$(this).adjust();
									$$(update_item).adjust();
								}
							}
						},
						{ view: 'label', label: ` ${L("ab.component.form.to", "*To")} `, width: 30 },
						{},
						{
							view: 'button', icon: "fa fa-trash", type: "icon", width: 30, click: function () {
								var update_item = this.getParentView(),
									update_panel = update_item.getParentView();

								update_panel.removeView(update_item);

								_logic.refreshFieldList();
							}
						}
					]
				}, viewIndex);

				// Select first option
				update_panel.getChildViews()[viewIndex].getChildViews()[0].setValue(options[0].id);
			},

			// /**
			//  * @function clickAddNewSort
			//  * the user clicked the add new sort buttton. I don't know what it does...will update later
			//  */
			// clickAddNewSort: function(by, dir, isMulti, id) {
			// 	// Prevent duplicate fields
			// 	var sort_popup = $$(ids.component),
			// 		sort_form = $$(ids.form);
			// 
			// 	var viewIndex = sort_form.getChildViews().length - 1;
			// 	var listFields = _logic.getFieldList(true);
			// 	sort_form.addView({
			// 		id: 'sort' + webix.uid(),
			// 		cols: [
			// 			{
			// 				view: "combo",
			// 				width: 220,
			// 				options: listFields,
			// 				on: {
			// 					onChange: function (columnId) {
			// 						var el = this;
			// 						_logic.onChangeCombo(columnId, el);
			// 					}
			// 				}
			// 			},
			// 			{
			// 				view: "segmented", 
			// 				width: 200, 
			// 				options: [{ id: '', value: labels.component.selectField }],
			// 				on: {
			// 					onChange: function (newv, oldv) { // 'asc' or 'desc' values
			// 						_logic.saveSorts();
			// 					}
			// 				}
			// 			},
			// 			{
			// 				view: "text", 
			// 				width: 20, 
			// 				hidden: true, 
			// 				value: ""
			// 			},
			// 			{
			// 				view: "button", 
			// 				icon: "trash", 
			// 				type: "icon", 
			// 				width: 30,
			// 				on: {
			// 					onItemClick: function() {
			// 						sort_form.removeView(this.getParentView());
			// 						_logic.refreshFieldList(true);
			// 						_logic.saveSorts();									
			// 					}
			// 				} 
			// 			}
			// 		]
			// 	}, viewIndex);
			// 
			// 	// Select field
			// 	if (by) {
			// 		var fieldsCombo = sort_form.getChildViews()[viewIndex].getChildViews()[0];
			// 		fieldsCombo.setValue(by);
			// 	}
			// 	if (dir) {
			// 		var segmentButton = sort_form.getChildViews()[viewIndex].getChildViews()[1];
			// 		segmentButton.setValue(dir);
			// 	}
			// 	if (isMulti) {
			// 		var isMultilingualField = sort_form.getChildViews()[viewIndex].getChildViews()[2];
			// 		isMultilingualField.setValue(isMulti);
			// 	}
			// 	_logic.callbacks.onChange();
			// },

			/**
			 * @function getFieldList
			 * return field list so we can present a custom UI for view
			 */
			 getFieldList: function (excludeSelected) {
				//  console.log(CurrentObject.fields());
				//  console.log("field up");
				 var update_records_popup = $$(ids.component),
					 update_panel = update_records_popup.getChildViews()[0].getChildViews()[0],
					 options = CurrentObject.fields().filter(function (col) {
						 // If this field have model link type, then it should not be allowed to mass update
						 if (col.setting && (col.setting.linkType == 'model' || col.setting.linkViaType == 'model'))
							 return false;
						 else
							 return true;
					 });

				// console.log(options);
				 // Remove selected columns
				 if (excludeSelected) {
					 var update_items = update_panel.getChildViews();
					 update_items.forEach(function (item, index) {
						 var selectedValue = item.getChildViews()[0].getValue();
						 if (selectedValue) {
							 var removeIndex = null,
								 removeItem = $.grep(options, function (f, index) {
									 if (f.name == selectedValue) {
										 removeIndex = index;
										 return true;
									 }
									 else {
										 return false;
									 }
								 });

							 options.splice(removeIndex, 1);
						 }
					 });
				 }

				 return $.map(options, function (opt) { return { id: opt.columnName, value: opt.label } });
			 },


			 refreshFieldList: function (ignoreRemoveViews) {
 				var update_records_popup = $$(ids.component),
 					update_panel = update_records_popup.getChildViews()[0].getChildViews()[0],
 					fieldList = _logic.getFieldList(false),
 					selectedFields = [];
 				var removeChildViews = [];

 				var update_items = update_panel.getChildViews();
 				update_items.forEach(function (item, index) {
 					var fieldName = item.getChildViews()[0].getValue(),
 						fieldObj = $.grep(fieldList, function (f) { return f.id == fieldName });

 					if (fieldObj.length > 0) {
 						// Add selected field to list
 						selectedFields.push(fieldObj[0]);
 					}
 				});

 				// Field list should not duplicate field items
 				update_items = update_panel.getChildViews();
 				update_items.forEach(function (item, index) {
 					var fieldName = item.getChildViews()[0].getValue(),
 						fieldObj = $.grep(fieldList, function (f) { return f.id == fieldName });

 					// Remove selected duplicate items
 					var selectedFieldsExcludeCurField = $(selectedFields).not(fieldObj);
 					var enableFields = $(fieldList).not(selectedFieldsExcludeCurField).get();

 					// Update field list
 					item.getChildViews()[0].define('options', enableFields);
 					item.getChildViews()[0].refresh();
 				});
 			},



			/**
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 * @param {ABObject} dataTable  the dataTable we need to run the mass update on...trust me this will be good
             */
            objectLoad: function(object, dataTable) {
                CurrentObject = object;
                if (dataTable != null) DataTable = dataTable;
			},
			
			// onChangeCombo: function(columnId, el) {
			// 	var allFields = CurrentObject.fields();
			// 	var columnConfig = "",
			// 		sortDir = el.getParentView().getChildViews()[1],
			// 		isMultiLingual = el.getParentView().getChildViews()[2],
			// 		isMulti = 0,
			// 		options = null;
			// 
			// 	allFields.forEach((f) => {
			// 		if (f.columnName == columnId) {
			// 			columnConfig = f
			// 		}
			// 	});
			// 
			// 	if (!columnConfig)
			// 		return;
			// 
			// 	switch (columnConfig.key) {
			// 		case "string":
			// 			options = [
			// 				{ id: 'asc', value: labels.component.textAsc },
			// 				{ id: 'desc', value: labels.component.textDesc }];
			// 			break;
			// 		case "date":
			// 			options = [
			// 				{ id: 'asc', value: labels.component.dateAsc },
			// 				{ id: 'desc', value: labels.component.dateDesc }];
			// 			break;
			// 		case "number":
			// 			options = [
			// 				{ id: 'asc', value: labels.component.numberAsc },
			// 				{ id: 'desc', value: labels.component.numberDesc }];
			// 			break;
			// 		default:
			// 			options = [
			// 				{ id: 'asc', value: labels.component.textAsc },
			// 				{ id: 'desc', value: labels.component.textDesc }];
			// 			break;
			// 	}
			// 
			// 	sortDir.define('options', options);
			// 	sortDir.refresh();
			// 
			// 	if (columnConfig.settings.supportMultilingual)
			// 		isMulti = columnConfig.settings.supportMultilingual;
			// 		
			// 	isMultiLingual.setValue(isMulti);
			// 
			// 	_logic.refreshFieldList();
			// 
			// 	_logic.saveSorts();
			// },

			/**
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 */
			onShow: function() {
				// var sort_popup = $$(ids.component),
				// 	sort_form = $$(ids.form);

				// var childViews = sort_form.getChildViews();
				// if (childViews.length == 1) {
				// 	var sorts = CurrentObject.workspaceSortFields;
				// 	sorts.forEach((s) => {
				// 		_logic.clickAddNewSort(s.by, s.dir, s.isMulti);
				// 	});
				// 
				// 	if (sorts.length == 0) {
				// 		_logic.clickAddNewSort();
				// 	}
				// }
			},

			/**
			 * @function refreshFieldList
			 * return an updated field list so you cannot duplicate a sort
			 */
			// refreshFieldList: function (ignoreRemoveViews) {
			// 	var sort_popup = $$(ids.component),
			// 		sort_form = $$(ids.form),
			// 		listFields = _logic.getFieldList(false),
			// 		selectedFields = [],
			// 		removeChildViews = [];
			// 
			// 	var childViews = sort_form.getChildViews();
			// 	if (childViews.length > 1) { // Ignore 'Add new sort' button
			// 		childViews.forEach(function (cView, index) {
			// 			if (childViews.length - 1 <= index)
			// 				return false;
			// 
			// 			var fieldId = cView.getChildViews()[0].getValue(),
			// 				// fieldObj = $.grep(listFields, function (f) { return f.id == fieldId });
			// 				fieldObj = listFields.filter(function (f) { return f.id == fieldId });
			// 
			// 			if (fieldObj.length > 0) {
			// 				// Add selected field to list
			// 				selectedFields.push(fieldObj[0]);
			// 			}
			// 			else {
			// 				// Add condition to remove
			// 				removeChildViews.push(cView);
			// 			}
			// 		});
			// 	}
			// 
			// 	// Remove filter conditions when column is deleted
			// 	if (!ignoreRemoveViews) {
			// 		removeChildViews.forEach(function (cView, index) {
			// 			sort_form.removeView(cView);
			// 		});
			// 	}
			// 
			// 	// Field list should not duplicate field items
			// 	childViews = sort_form.getChildViews();
			// 	if (childViews.length > 1) { // Ignore 'Add new sort' button
			// 		childViews.forEach(function (cView, index) {
			// 			if (childViews.length - 1 <= index)
			// 				return false;
			// 
			// 			var fieldId = cView.getChildViews()[0].getValue(),
			// 				// fieldObj = $.grep(listFields, function (f) { return f.id == fieldId }),
			// 				fieldObj = listFields.filter(function (f) { return f.id == fieldId });
			// 				
			// 			// var selectedFieldsExcludeCurField = $(selectedFields).not(fieldObj);
			// 			var selectedFieldsExcludeCurField = selectedFields.filter(function(x){
			// 				if(Array.isArray(fieldObj) && fieldObj.indexOf(x) !== -1){
			// 					return false;
			// 				}
			// 				return true;
			// 			});
			// 
			// 			// var enableFields = $(listFields).not(selectedFieldsExcludeCurField).get();						
			// 			var enableFields = listFields.filter(function(x){
			// 				if(Array.isArray(selectedFieldsExcludeCurField) && selectedFieldsExcludeCurField.indexOf(x) !== -1){
			// 					return false;
			// 				}
			// 				return true;
			// 			});
			// 			
			// 			// Update field list
			// 			cView.getChildViews()[0].define('options', enableFields);
			// 			cView.getChildViews()[0].refresh();
			// 		});
			// 	}
			// },


			/**
			 * @function saveSorts
			 * This parses the sort form to build in order the sorts then saves to the application object workspace
			 */
			// saveSorts: function() {
			// 	// Prevent duplicate fields
			// 	var sort_popup = $$(ids.component),
			// 		sort_form = $$(ids.form),
			// 		sortFields = [];
			// 
			// 	var childViews = sort_form.getChildViews();
			// 	if (childViews.length > 1) { // Ignore 'Add new sort' button
			// 		childViews.forEach(function (cView, index) {
			// 			if (childViews.length - 1 <= index)
			// 				return false;
			// 
			// 			var by = cView.getChildViews()[0].getValue();
			// 			var dir = cView.getChildViews()[1].getValue();
			// 			var isMultiLingual = cView.getChildViews()[2].getValue();
			// 			sortFields.push({"by":by, "dir":dir, "isMulti":isMultiLingual})
			// 		});
			// 	}
			// 
			// 	if (CurrentView != null) {
			// 		CurrentView.settings.objectWorkspace.sortFields = sortFields;
			// 		_logic.callbacks.onChange(CurrentView.settings.objectWorkspace);
			// 	} else {
			// 		CurrentObject.workspaceSortFields = sortFields;
			// 		CurrentObject.save()
			// 		.then(function(){
			// 			_logic.callbacks.onChange();
			// 		})
			// 		.catch(function(err){
			// 			OP.Error.log('Error trying to save workspaceSortFields', {error:err, fields:sortFields });
			// 		});
			// 	}
			// },


            /**
             * @function show()
             *
             * Show this component.
             * @param {obj} $view  the webix.$view to hover the popup around.
			 * @param {string} columnName the columnName we want to prefill the sort with
             */
            show:function($view, columnName, options) {
                if (options != null) {
                    $$(ids.component).show($view, options);
                } else {
                    $$(ids.component).show($view);
                }
				// if (columnName) {
				// 	_logic.clickAddNewSort(columnName);
				// }
			}


		}



		// Expose any globally accessible Actions:
		this.actions({


		})


		// 
		// Define our external interface methods:
		// 
		this.objectLoad = _logic.objectLoad;
		this.show = _logic.show;

	}

}
