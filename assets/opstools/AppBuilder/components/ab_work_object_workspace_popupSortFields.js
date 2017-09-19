
/*
 * ab_work_object_workspace_popupSortFields
 *
 * Manage the Sort Fields popup.
 *
 */


export default class AB_Work_Object_Workspace_PopupSortFields extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App, idBase) {
        super(App, idBase || 'ab_work_object_workspace_popupSortFields');
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {

				addNewSort: 	L('ab.sort_fields.addNewSort', 	"*Add new sort"),
				selectField:	L('ab.sort_fields.selectField', "*Please select field"),
				textAsc:		L('ab.sort_fields.textAsc', 	"*A -> Z"),
				textDesc: 		L('ab.sort_fields.textDesc', 	"*Z -> A"),
				dateAsc: 		L('ab.sort_fields.dateAsc', 	"*Before -> After"),
				dateDesc: 		L('ab.sort_fields.dateDesc', 	"*After -> Before"),
				numberAsc: 		L('ab.sort_fields.numberAsc', 	"*1 -> 9"),
				numberDesc: 	L('ab.sort_fields.numberDesc', 	"*9 -> 1"),
				booleanAsc: 	L('ab.sort_fields.booleanAsc', 	"*Checked -> Unchecked"),
				booleanDesc: 	L('ab.sort_fields.booleanDesc', "*Unchecked -> Checked")

			}
		}


		// internal list of Webix IDs to reference our UI components
		var ids = {
			component: this.unique('component'),
			list: this.unique('list'),
			form: this.unique("form"),
		}


		// Our webix UI definition:
		this.ui = {
			view:"popup",
			id: ids.component,
			// autoheight:true,
			width: 500,
			body: {
				view: "form",
				id: ids.form,
				// autoheight: true,
				borderless: true,
				elements: [
					{
						view: "button", 
						value: labels.component.addNewSort, 
						on: {
							onItemClick: function(id, e, node) {
								_logic.clickAddNewSort();
							}
						}
					}
				]
			},
			on: {
				onShow: function () {
					_logic.onShow();
				}
			}
	    }



		// Our init() function for setting up our UI
		this.init = (options) => {
			// register our callbacks:
			for(var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);
		}


		var CurrentObject = null;
		var CurrentView = null;

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

			/**
			 * @function clickAddNewSort
			 * the user clicked the add new sort buttton. I don't know what it does...will update later
			 */
			clickAddNewSort: function(by, dir, isMulti, id) {
				// Prevent duplicate fields
				var sort_popup = $$(ids.component),
					sort_form = $$(ids.form);

				var viewIndex = sort_form.getChildViews().length - 1;
				var listFields = _logic.getFieldList(true);
				sort_form.addView({
					id: 'sort' + webix.uid(),
					cols: [
						{
							view: "combo",
							width: 220,
							options: listFields,
							on: {
								onChange: function (columnId) {
									var el = this;
									_logic.onChangeCombo(columnId, el);
								}
							}
						},
						{
							view: "segmented", 
							width: 200, 
							options: [{ id: '', value: labels.component.selectField }],
							on: {
								onChange: function (newv, oldv) { // 'asc' or 'desc' values
									_logic.saveSorts();
								}
							}
						},
						{
							view: "text", 
							width: 20, 
							hidden: true, 
							value: ""
						},
						{
							view: "button", 
							icon: "trash", 
							type: "icon", 
							width: 30,
							on: {
								onItemClick: function() {
									sort_form.removeView(this.getParentView());
									_logic.refreshFieldList(true);
									_logic.saveSorts();									
								}
							} 
						}
					]
				}, viewIndex);

				// Select field
				if (by) {
					var fieldsCombo = sort_form.getChildViews()[viewIndex].getChildViews()[0];
					fieldsCombo.setValue(by);
				}
				if (dir) {
					var segmentButton = sort_form.getChildViews()[viewIndex].getChildViews()[1];
					segmentButton.setValue(dir);
				}
				if (isMulti) {
					var isMultilingualField = sort_form.getChildViews()[viewIndex].getChildViews()[2];
					isMultilingualField.setValue(isMulti);
				}
				_logic.callbacks.onChange();
			},

			/**
			 * @function getFieldList
			 * return field list so we can present a custom UI for view
			 */
			getFieldList: function (excludeSelected) {
				var sort_popup = $$(ids.component),
					sort_form = $$(ids.form),
					listFields = [];

				if (!CurrentObject.fields())
					return listFields;

				// Get all fields include hidden fields
				var allFields = CurrentObject.fields();
				allFields.forEach((f) => {
					if (f.fieldIsSortable()) {
						listFields.push({
							id: f.columnName,
							label: f.label
						});
					}
				})

				// Remove selected field
				if (excludeSelected) {
					var childViews = sort_form.getChildViews();
					if (childViews.length > 1) { // Ignore 'Add new sort' button
						childViews.forEach(function (cView, index) {
							if (childViews.length - 1 <= index)
								return false;

							var selectedValue = cView.getChildViews()[0].getValue();
							if (selectedValue) {
								var removeIndex = null;
								var removeItem = listFields.filter(function (f, index) {
									if (f.id == selectedValue) {
										removeIndex = index;
										return true;
									}
									else {
										return false;
									}
								});
								// var removeItem = $.grep(listFields, function (f, index) {
								// 	if (f.id == selectedValue) {
								// 		removeIndex = index;
								// 		return true;
								// 	}
								// 	else {
								// 		return false;
								// 	}
								// });
								listFields.splice(removeIndex, 1);
							}
						});
					}
				}
				return listFields;
			},


			/**
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 * @param {ABObject} currView  the custom settings for a view if editing in interface builder
             */
            objectLoad: function(object, currView) {
                CurrentObject = object;
                if (currView != null) CurrentView = currView;
			},
			
			onChangeCombo: function(columnId, el) {
				var allFields = CurrentObject.fields();
				var columnConfig = "",
					sortDir = el.getParentView().getChildViews()[1],
					isMultiLingual = el.getParentView().getChildViews()[2],
					isMulti = 0,
					options = null;

				allFields.forEach((f) => {
					if (f.columnName == columnId) {
						columnConfig = f
					}
				});

				if (!columnConfig)
					return;

				switch (columnConfig.key) {
					case "string":
						options = [
							{ id: 'asc', value: labels.component.textAsc },
							{ id: 'desc', value: labels.component.textDesc }];
						break;
					case "date":
						options = [
							{ id: 'asc', value: labels.component.dateAsc },
							{ id: 'desc', value: labels.component.dateDesc }];
						break;
					case "number":
						options = [
							{ id: 'asc', value: labels.component.numberAsc },
							{ id: 'desc', value: labels.component.numberDesc }];
						break;
					default:
						options = [
							{ id: 'asc', value: labels.component.textAsc },
							{ id: 'desc', value: labels.component.textDesc }];
						break;
				}

				sortDir.define('options', options);
				sortDir.refresh();

				if (columnConfig.settings.supportMultilingual)
					isMulti = columnConfig.settings.supportMultilingual;
					
				isMultiLingual.setValue(isMulti);

				_logic.refreshFieldList();

				_logic.saveSorts();
			},

			/**
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 */
			onShow: function() {
				var sort_popup = $$(ids.component),
					sort_form = $$(ids.form);

				var childViews = sort_form.getChildViews();
				if (childViews.length == 1) {
					var sorts = CurrentObject.workspaceSortFields;
					if (sorts && sorts.forEach) {
						sorts.forEach((s) => {
							_logic.clickAddNewSort(s.by, s.dir, s.isMulti);
						});
					}

					if (sorts == null || sorts.length == 0) {
						_logic.clickAddNewSort();
					}
				}
			},

			/**
			 * @function refreshFieldList
			 * return an updated field list so you cannot duplicate a sort
			 */
			refreshFieldList: function (ignoreRemoveViews) {
				var sort_popup = $$(ids.component),
					sort_form = $$(ids.form),
					listFields = _logic.getFieldList(false),
					selectedFields = [],
					removeChildViews = [];

				var childViews = sort_form.getChildViews();
				if (childViews.length > 1) { // Ignore 'Add new sort' button
					childViews.forEach(function (cView, index) {
						if (childViews.length - 1 <= index)
							return false;

						var fieldId = cView.getChildViews()[0].getValue(),
							// fieldObj = $.grep(listFields, function (f) { return f.id == fieldId });
							fieldObj = listFields.filter(function (f) { return f.id == fieldId });

						if (fieldObj.length > 0) {
							// Add selected field to list
							selectedFields.push(fieldObj[0]);
						}
						else {
							// Add condition to remove
							removeChildViews.push(cView);
						}
					});
				}

				// Remove filter conditions when column is deleted
				if (!ignoreRemoveViews) {
					removeChildViews.forEach(function (cView, index) {
						sort_form.removeView(cView);
					});
				}

				// Field list should not duplicate field items
				childViews = sort_form.getChildViews();
				if (childViews.length > 1) { // Ignore 'Add new sort' button
					childViews.forEach(function (cView, index) {
						if (childViews.length - 1 <= index)
							return false;

						var fieldId = cView.getChildViews()[0].getValue(),
							// fieldObj = $.grep(listFields, function (f) { return f.id == fieldId }),
							fieldObj = listFields.filter(function (f) { return f.id == fieldId });
							
						// var selectedFieldsExcludeCurField = $(selectedFields).not(fieldObj);
						var selectedFieldsExcludeCurField = selectedFields.filter(function(x){
							if(Array.isArray(fieldObj) && fieldObj.indexOf(x) !== -1){
								return false;
							}
							return true;
						});

						// var enableFields = $(listFields).not(selectedFieldsExcludeCurField).get();						
						var enableFields = listFields.filter(function(x){
							if(Array.isArray(selectedFieldsExcludeCurField) && selectedFieldsExcludeCurField.indexOf(x) !== -1){
								return false;
							}
							return true;
						});
						
						// Update field list
						cView.getChildViews()[0].define('options', enableFields);
						cView.getChildViews()[0].refresh();
					});
				}
			},


			/**
			 * @function saveSorts
			 * This parses the sort form to build in order the sorts then saves to the application object workspace
			 */
			saveSorts: function() {
				// Prevent duplicate fields
				var sort_popup = $$(ids.component),
					sort_form = $$(ids.form),
					sortFields = [];

				var childViews = sort_form.getChildViews();
				if (childViews.length > 1) { // Ignore 'Add new sort' button
					childViews.forEach(function (cView, index) {
						if (childViews.length - 1 <= index)
							return false;

						var by = cView.getChildViews()[0].getValue();
						var dir = cView.getChildViews()[1].getValue();
						var isMultiLingual = cView.getChildViews()[2].getValue();
						sortFields.push({"by":by, "dir":dir, "isMulti":isMultiLingual})
					});
				}

				if (CurrentView != null) {
					CurrentView.settings.objectWorkspace.sortFields = sortFields;
					_logic.callbacks.onChange(CurrentView.settings.objectWorkspace);
				} else {
					CurrentObject.workspaceSortFields = sortFields;
					CurrentObject.save()
					.then(function(){
						_logic.callbacks.onChange();
					})
					.catch(function(err){
						OP.Error.log('Error trying to save workspaceSortFields', {error:err, fields:sortFields });
					});
				}
			},


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
				if (columnName) {
					_logic.clickAddNewSort(columnName);
				}
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
