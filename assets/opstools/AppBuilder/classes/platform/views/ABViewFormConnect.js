const ABViewFormConnectCore = require("../../core/views/ABViewFormConnectCore");
const RowFilter = require("../../RowFilter");

let FilterComponent = null;

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function _onShow(App, compId, instance) {

	let elem = $$(compId);
	if (!elem) return;

	let field = instance.field();
	if (!field) return;

	let rowData = {},
		node = elem.$view;

	field.customDisplay(rowData, App, node, {
		editable: true,
		formView: instance.settings.formView,
		filters: instance.settings.objectWorkspace.filterConditions,
		editable: (instance.settings.disable == 1 ? false : true)
	});

}

module.exports = class ABViewFormConnect extends ABViewFormConnectCore {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, defaultValues);

		// Set filter value
		this.__filterComponent = new RowFilter();
		this.__filterComponent.objectLoad(this.datasource);
		this.__filterComponent.viewLoad(this);

		this.__filterComponent.setValue(this.settings.objectWorkspace.filterConditions || ABViewFormConnectPropertyComponentDefaults.objectWorkspace.filterConditions);

	}


	//
	//	Editor Related
	//

	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {

		let idBase = 'ABViewFormConnectEditorComponent';
		let ids = {
			component: App.unique(idBase + '_component')
		}

		let baseComp = this.component(App);
		let templateElem = baseComp.ui;
		templateElem.id = ids.component;

		var _ui = {
			rows: [
				templateElem,
				{}
			]
		};

		return {
			ui: _ui,
			init: baseComp.init,
			logic: baseComp.logic,
			onShow: () => {

				_onShow(App, ids.component, this);

			}
		}
	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		_logic.showFilterPopup = ($view) => {
			this.filter_popup.show($view, null, { pos: "top" });
		};

		_logic.onFilterChange = () => {

			let view = _logic.currentEditObject();
			let filterValues = FilterComponent.getValue() || {};

			let allComplete = true;
			(filterValues.rules || []).forEach((f) => {

				// if all 3 fields are present, we are good.
				if ((f.key)
					&& (f.rule)
					&& (f.value)) {

					allComplete = allComplete && true;
				} else {

					// else, we found an entry that wasn't complete:
					allComplete = false;
				}
			})

			// only perform the update if a complete row is specified:
			if (allComplete) {

				// we want to call .save() but give webix a chance to properly update it's 
				// select boxes before this call causes them to be removed:
				setTimeout(() => {
					this.propertyEditorSave(ids, view);
				}, 10);

			}


		};


		// create filter & sort popups
		this.initPopupEditors(App, ids, _logic);

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'formView',
				view: 'richselect',
				label: L('ab.component.connect.form', '*Add New Form'),
				labelWidth: App.config.labelWidthXLarge,
				on: {
					onChange: (newVal, oldVal) => {
						if (newVal == L('ab.component.connect.no', '*No add new option')) {
							$$(ids.formView).setValue("");
						}
					}
				}
			},
			{
				view: "fieldset",
				name: "addNewSettings",
				label: L('ab.component.connect.addNewSettings', '*Add New Popup Settings:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							view: "text",
							name: 'popupWidth',
							placeholder: L('ab.component.connect.popupWidthPlaceholder', '*Set popup width'),
							label: L("ab.component.page.popupWidth", "*Width:"),
							labelWidth: App.config.labelWidthLarge,
							validate: webix.rules.isNumber
						},
						{
							view: "text",
							name: 'popupHeight',
							placeholder: L('ab.component.connect.popupHeightPlaceholder', '*Set popup height'),
							label: L("ab.component.page.popupHeight", "*Height:"),
							labelWidth: App.config.labelWidthLarge,
							validate: webix.rules.isNumber
						},
					]
				}
			},
			{
				view: "fieldset",
				name: "advancedOption",
				label: L('ab.component.connect.advancedOptions', '*Advanced Options:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.connect.filterData", "*Filter Options:"),
									width: App.config.labelWidthLarge,
								},
								{
									view: "button",
									name: "buttonFilter",
									label: L("ab.component.connect.settings", "*Settings"),
									icon: "fa fa-gear",
									type: "icon",
									badge: 0,
									click: function () {
										_logic.showFilterPopup(this.$view);
									}
								}
							]
						},
					]
				}
			}

		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		// Set the options of the possible edit forms
		var editForms = [
			{ id: L('ab.component.connect.no', '*No add new option'), value: L('ab.component.connect.no', '*No add new option') }
		];
		// editForms = view.loopPages(view, view.application._pages, editForms, "form");
		// view.application._pages.forEach((o)=>{
		// 	o._views.forEach((j)=>{
		// 		if (j.key == "form" && j.settings.object == view.settings.dataviewID) {
		// 			// editForms.push({id:j.parent.id+"|"+j.id, value:j.label});
		// 			editForms.push({id:j.parent.id, value:j.label});				
		// 		}
		// 	});
		// });

		var pagesHasForm = view.pageRoot()
			.pages(p => {
				return p.views(v => {
					return v.key == "form" &&
						v.dataview &&
						v.dataview.datasource.id == view.field().settings.linkObject;
				}, true).length;
			}, true)
			.map(p => {
				return {
					id: p.id,
					value: p.label
				}
			});

		editForms = editForms.concat(pagesHasForm);

		$$(ids.formView).define("options", editForms);
		$$(ids.formView).refresh();

		$$(ids.formView).setValue(view.settings.formView || ABViewFormConnectPropertyComponentDefaults.formView);
		$$(ids.popupWidth).setValue(view.settings.popupWidth || ABViewFormConnectPropertyComponentDefaults.popupWidth);
		$$(ids.popupHeight).setValue(view.settings.popupHeight || ABViewFormConnectPropertyComponentDefaults.popupHeight);

		// initial populate of popups
		this.populatePopupEditors(view);

		// inform the user that some advanced settings have been set
		this.populateBadgeNumber(ids, view);

		// when a change is made in the properties the popups need to reflect the change
		this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
		if (!this.updateEventIds[view.id]) {
			this.updateEventIds[view.id] = true;

			view.addListener('properties.updated', () => {
				this.populatePopupEditors(view);
				this.populateBadgeNumber(ids, view);
			});
		}


	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.formView = $$(ids.formView).getValue();
		view.settings.popupWidth = $$(ids.popupWidth).getValue();
		view.settings.popupHeight = $$(ids.popupHeight).getValue();
		view.settings.objectWorkspace = {
			filterConditions: FilterComponent.getValue()
		};

	}

	static populateBadgeNumber(ids, view) {

		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.filterConditions &&
			view.settings.objectWorkspace.filterConditions.rules) {
			$$(ids.buttonFilter).define('badge', view.settings.objectWorkspace.filterConditions.rules.length);
			$$(ids.buttonFilter).refresh();
		}
		else {
			$$(ids.buttonFilter).define('badge', 0);
			$$(ids.buttonFilter).refresh();
		}

	}


	static initPopupEditors(App, ids, _logic) {

		var idBase = 'ABViewFormConnectPropertyEditor';


		FilterComponent = new RowFilter(App, idBase + "_filter");
		FilterComponent.init({
			// when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
			onChange: _logic.onFilterChange
		});

		this.filter_popup = webix.ui({
			view: "popup",
			width: 800,
			hidden: true,
			body: FilterComponent.ui
		});

	}


	static populatePopupEditors(view) {

		let filterConditions = ABViewFormConnectPropertyComponentDefaults.objectWorkspace.filterConditions;

		// // Clone ABObject
		// var field = view.field();
		// var linkedObj = field.datasourceLink;
		// if (linkedObj &&
		// 	linkedObj.objectWorkspace &&
		// 	linkedObj.objectWorkspace.filterConditions) {
		// 	filterConditions = linkedObj.objectWorkspace.filterConditions;
		// }
		// var objectCopy = linkedObj.clone();
		// if (objectCopy) {
		// 	objectCopy.objectWorkspace = view.settings.objectWorkspace;
		// 	filterConditions = objectCopy.objectWorkspace.filterConditions || ABViewFormConnectPropertyComponentDefaults.objectWorkspace.filterConditions;
		// }

		if (view.settings.objectWorkspace &&
			view.settings.objectWorkspace.filterConditions)
			filterConditions = view.settings.objectWorkspace.filterConditions;

		// Populate data to popups
		// FilterComponent.objectLoad(objectCopy);
		let field = view.field();
		if (field) {
			let linkedObj = field.datasourceLink;
			if (linkedObj)
				FilterComponent.objectLoad(linkedObj);
		}

		FilterComponent.viewLoad(view);
		FilterComponent.setValue(filterConditions);

	}


	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var field = this.field();
		// this field may be deleted
		if (!field)
			return super.component(App);

		var component = {};
		var form = this.parentFormComponent();
		var idBase = this.parentFormUniqueID('ABViewFormConnect_' + this.id + "_f_");
		var ids = {
			component: App.unique(idBase + '_component'),
			popup: App.unique(idBase + '_popup_add_new')
		}

		var settings = {};
		if (form)
			settings = form.settings;

		var requiredClass = "";
		if (field.settings.required == true || this.settings.required == true) {
			requiredClass = "webix_required";
		}
		var templateLabel = '';
		if (settings.showLabel) {
			if (settings.labelPosition == 'top')
				templateLabel = '<label style="display:block; text-align: left; margin: 0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_top_label ' + requiredClass + '">#label#</label>';
			else
				templateLabel = '<label style="width: #width#px; display: inline-block; line-height: 32px; float: left; margin: 0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_label ' + requiredClass + '">#label#</label>';
		}

		var newWidth = settings.labelWidth;
		var showAddButton = false;
		if (this.settings.formView) {
			newWidth += 40;
			showAddButton = true;
		} else if (settings.showLabel == true && settings.labelPosition == 'top') {
			newWidth = 0;
		}

		let template = ('<div class="customField">' + templateLabel + "#template#" + '</div>')
			.replace(/#width#/g, settings.labelWidth)
			.replace(/#label#/g, field.label)
			.replace(/#template#/g, field.columnHeader({
				width: newWidth,
				editable: true,
				showAddButton: showAddButton,
				skipRenderSelectivity: true
			}).template({}));

		component.init = (options) => {
		};

		component.logic = {

			/**
			 * @function callbackSaveData
			 *
			 */
			callbackSaveData: (saveData) => {

				// find the selectivity component
				var elem = $$(ids.component);
				if (!elem) return;

				// get the linked Object for current field
				// var linkedObj = field.datasourceLink;
				// isolate the connected field data that was saved
				// var savedItem = linkedObj.displayData(saveData);
				// repopulate the selectivity options now that there is a new one added
				// var filters = {};
				// if (this.settings.objectWorkspace && this.settings.objectWorkspace.filterConditions) {
				// 	filters = this.settings.objectWorkspace.filterConditions;
				// }

				field.getOptions(this.settings.objectWorkspace.filterConditions, "").then(function (data) {
					// find option with the matching id to the savedData
					var myOption = data.filter(d => d.id == saveData.id)[0];
					if (myOption == null) {
						$$(ids.popup).close();
						return;
					}

					let fieldVal = field.getValue(elem);
					if (Array.isArray(fieldVal)) {
						// Keep selected items
						fieldVal.push(myOption);
					}
					else {
						fieldVal = myOption;
					}

					var values = {};
					// retrieve the related field name
					var relatedField = field.relationName();
					// format payload to the setValue requirements
					values[relatedField] = fieldVal;
					// set the value of selectivity to the matching item that was just created
					field.setValue(elem, values);

					// close the popup when we are finished
					$$(ids.popup).close();
				});

			},

			callbackCancel: () => {
				$$(ids.popup).close();
				return false;
			},

			callbackClearOnLoad: () => {
				return true;
			},

			getValue: (rowData) => {

				var elem = $$(ids.component);

				return field.getValue(elem, rowData);

			},

			openFormPopup: (x, y) => {
				if ($$(ids.popup)) {
					$$(ids.popup).show();
					return;
				}

				var pageId = this.settings.formView;
				var page = this.application.pages(function (p) {
					return p.id == pageId;
				}, true)[0];


				// Clone page so we modify without causing problems
				var pageClone = _.cloneDeep(page);
				var instance = webix.uid();
				pageClone.id = pageClone.id + "-" + instance; // lets take the stored id can create a new dynamic one so our views don't duplicate
				var popUpComp = pageClone.component(App);
				var ui = popUpComp.ui;

				var popupTemplate = {
					view: "window",
					id: ids.popup,
					modal: true,
					position: "center",
					// position:function(state){
					// 	state.left = x + 20; // offset the popups
					// 	state.top = y + 20;
					// },
					resize: true,
					width: parseInt(this.settings.popupWidth) || 700,
					height: (parseInt(this.settings.popupHeight) + 44) || 450,
					css: 'ab-main-container',
					head: {
						view: "toolbar",
						css: "webix_dark",
						cols: [
							{
								view: "label",
								label: page.label,
								css: "modal_title",
								align: "center"
							},
							{
								view: "button",
								label: "Close",
								autowidth: true,
								align: "center",
								click: function () {

									var popup = this.getTopParentView();
									popup.close();

								}
							}
						]
					},
					body: {
						view: "scrollview",
						scroll: true,
						body: ui
					}
				};

				// Create popup
				webix.ui(popupTemplate).show();

				// Initial UI components
				setTimeout(() => {

					popUpComp.init({
						onSaveData: component.logic.callbackSaveData,
						onCancelClick: component.logic.callbackCancel,
						clearOnLoad: component.logic.callbackClearOnLoad
					});

					popUpComp.onShow();

				}, 50);

			}

		};

		component.ui = {
			id: ids.component,
			view: "forminput",
			labelWidth: 0,
			paddingY: 0,
			paddingX: 0,
			css: "ab-custom-field",
			name: field.columnName,
			body: {
				view: App.custom.focusabletemplate.view,
				css: "webix_el_box",
				borderless: true,
				template: template,
				onClick: {
					"customField": (id, e, trg) => {

						if (this.settings.disable == 1)
							return;

						var rowData = {};

						if ($$(ids.component)) {
							var node = $$(ids.component).$view;
							field.customEdit(rowData, App, node);
						}
					},
					"ab-connect-add-new-link": function (e, id, trg) {
						var topParentView = this.getTopParentView();
						component.logic.openFormPopup(topParentView.config.left, topParentView.config.top);
						e.stopPropagation();
						return false;
					}
				}
			},
		}

		if (settings.showLabel == true && settings.labelPosition == 'top') {
			component.ui.body.height = 80;
		}
		else {
			component.ui.body.height = 38;
		}

		component.onShow = () => {

			_onShow(App, ids.component, this);

		};

		return component;
	}

};