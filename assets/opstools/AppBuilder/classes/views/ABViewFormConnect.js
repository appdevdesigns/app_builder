/*
 * ABViewFormConnect
 *
 * An ABViewFormConnect defines a UI text box component.
 *
 */

import ABViewFormCustom from "./ABViewFormCustom"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormConnectPropertyComponentDefaults = {
	formView: '' // 'richselect' or 'radio'
}


var ABViewFormConnectDefaults = {
	key: 'connect',		// {string} unique key for this view
	icon: 'list-ul',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.connect' // {string} the multilingual label key for the class label
}

export default class ABViewFormConnect extends ABViewFormCustom {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormConnectDefaults);

		// OP.Multilingual.translate(this, this, ['text']);

		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//			format: x				// the display style of the text
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}


	static common() {
		return ABViewFormConnectDefaults;
	}
	///
	/// Instance Methods
	///


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
	// editorComponent(App, mode) {
	// }



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

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
			}

		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);
		
		// Set the options of the possible edit forms
		var editForms = [
			{id:L('ab.component.connect.no', '*No add new option'), value:L('ab.component.connect.no', '*No add new option')}
		];
		// editForms = view.loopPages(view, view.application._pages, editForms, "form");
		// view.application._pages.forEach((o)=>{
		// 	o._views.forEach((j)=>{
		// 		if (j.key == "form" && j.settings.object == view.settings.dataSource) {
		// 			// editForms.push({id:j.parent.id+"|"+j.id, value:j.label});
		// 			editForms.push({id:j.parent.id, value:j.label});				
		// 		}
		// 	});
		// });

		var pagesHasForm = view.pageRoot()
			.pages(p => {
				return p.views(v => v.key == "form" && v.dataCollection().datasource.id == view.field().settings.linkObject).length;
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
		
	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.formView = $$(ids.formView).getValue();

	}



	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {		
		var component = super.component(App);
		var field = this.field();
		var form = this.parentFormComponent();

		// this field may be deleted
		if (!field) return component;

		var idBase = this.parentFormUniqueID('ABViewFormConnect_' + this.id + "_f_");
		var ids = {
			component: App.unique(idBase + '_component'),
			popup: App.unique(idBase + '_popup_add_new')
		}

		var settings = {};
		if (form)
			settings = form.settings;

		var templateLabel = '';
		if (settings.showLabel == true) {
			if (settings.labelPosition == 'top')
				templateLabel = '<label style="display:block; text-align: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_top_label">#label#</label>';
			else
				templateLabel = '<label style="width: #width#px; display: inline-block; line-height: 32px; float: left; margin: 0; padding:1px 7.5px 0 3px; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">#label#</label>';
		}

		var newWidth = settings.labelWidth;
		var showAddButton = false;
		if (this.settings.formView) {
			newWidth += 40;
			showAddButton = true;
		} else if (settings.showLabel == true && settings.labelPosition == 'top') {
			newWidth = 0;
		}

		var template = ('<div class="customField">' + templateLabel + "#template#" + '</div>')
			.replace(/#width#/g, settings.labelWidth)
			.replace(/#label#/g, field.label)
			.replace(/#template#/g, field.columnHeader(null, newWidth, true, showAddButton).template({}));



		component.ui = {
			id: 	ids.component,
			view: 	"forminput",
			css:    "ab-custom-field",
		    name:   component.ui.name,
		    body:{
				view: App.custom.focusabletemplate.view,
				// css:  "webix_el_box",
				borderless: true,
				height: component.ui.height,
				template: template,
				onClick: {
					"customField": function (id, e, trg) {
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


// component.ui.id = ids.component;
// // component.ui.view = "template";
// component.ui.view = 'forminput';
// // component.ui.focus = ()=>{};

// component.ui.body = {
// 	view: App.custom.focusabletemplate.view,
// 	template:'<div class="customField">' + template + '</div>',
// 	// focus: function() {}
// }

// component.ui.body.css = "webix_el_box";

// if (settings.showLabel == true && settings.labelPosition == 'top') {
// 	component.ui.body.height = 80;
// }
// else if (field.settings.useHeight) {
// 	component.ui.body.height = parseInt(field.settings.imageHeight);
// }
// else {
// 	component.ui.body.height = 38;
// }
// component.ui.body.borderless = true;
// component.ui.body.template = '<div class="customField">' + template + '</div>';
// component.ui.body.onClick = {
// 	"customField": function (id, e, trg) {
// 		var rowData = {};

// 		if ($$(ids.component)) {
// 			var node = $$(ids.component).$view;
// 			field.customEdit(rowData, App, node);
// 		}
// 	},
// 	"ab-connect-add-new-link": function (id, e, trg) {
// 		component.logic.openFormPopup();
// 	}
// };

		component.onShow = () => {

			var elem = $$(ids.component);
			if (!elem) return;

			var rowData = {},
				node = elem.$view;

			field.customDisplay(rowData, App, node, true, this.settings.formView);

		};

// // make sure each of our child views get .init() called
// component.init = (options) => {

// 	component.onShow();

// }

		component.logic = {

			/**
			 * @function callbackSaveData
			 *
			 */
			callbackSaveData: (saveData) => {

				// find the selectivity component
				var elem = $$(ids.component);
				// get the linked Object for current field
				var linkedObj = field.datasourceLink;
				// isolate the connected field data that was saved
				// var savedItem = linkedObj.displayData(saveData);
				// repopulate the selectivity options now that there is a new one added
				field.getOptions().then(function (data) {
					// find option with the matching id to the savedData
					var myOption = data.filter(d => d.id == saveData.id);
					var values = {};
					// retrieve the related field name
					var relatedField = field.relationName();
					// format payload to the setValue requirements
					values[relatedField] = myOption[0];
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
					position:function(state){
						state.left = x + 20; // offset the popups
						state.top = y + 20;
					},
					resize: true,
					width: 700,
					height: 450,
					css: 'ab-main-container',
					head: {
						view: "toolbar",
						cols: [
							{ view: "label", label: page.label },
							{
								view: "button", label: "Close", width: 100, align: "right",
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
				setTimeout( () => {
					
					popUpComp.init({
						onSaveData:component.logic.callbackSaveData,
						onCancelClick:component.logic.callbackCancel,
						clearOnLoad:component.logic.callbackClearOnLoad
					});
				
				}, 50);

			}

		};


		return component;
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}
	
	loopPages(view, o, detailViews, type) {
		if (typeof o == "array" || typeof o == "object") {
			o.forEach((p)=>{
				if (p._pages.length > 0) {
					detailViews = view.loopPages(view, p._pages, detailViews, type);
				}
				detailViews = view.loopViews(view, p._views, detailViews, type);
			});
		}
		detailViews = view.loopViews(view, o, detailViews);
		return detailViews;
	}
	
	loopViews(view, o, detailViews, type) {
		if (typeof o == "array" || typeof o == "object") {
			o.forEach((j)=>{
				if (j.key == type) {
					detailViews.push({id:j.parent.id, value:j.label});				
				}
			});
			return detailViews;			
		}
		return detailViews;
	}


};
