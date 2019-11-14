const ABViewDetailCustomCore = require("../../core/views/ABViewDetailCustomCore");

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDetailCustom extends ABViewDetailCustomCore {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, defaultValues);

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

		var idBase = 'ABViewDetailCustomEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}

		var component = this.component(App);

		var textElem = component.ui;
		textElem.id = ids.component;

		var _ui = {
			rows: [
				textElem,
				{}
			]
		};

		var _init = component.init;
		var _logic = component.logic;

		var _onShow = component.onShow;


		return {
			ui: _ui,
			init: _init,
			logic: _logic,

			onShow: _onShow
		}
	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);


		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

	}



	/**
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @param {string} idPrefix
	 * 
	 * @return {obj} UI component
	 */
	component(App, idPrefix) {

		var component = super.component(App);
		var field = this.field();
		var detailView = this.detailComponent();

		var idBase = 'ABViewDetailCustom_' + (idPrefix || '') + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		var templateLabel = '';
		if (detailView.settings.showLabel == true) {
			if (detailView.settings.labelPosition == 'top')
				templateLabel = "<label style='display:block; text-align: left;' class='webix_inp_top_label'>#label#</label>";
			else
				templateLabel = "<label style='width: #width#px; display: inline-block; float: left; line-height: 32px;'>#label#</label>";
		}

		var template = (templateLabel + "#result#")
			// var template = (templateLabel)
			.replace(/#width#/g, detailView.settings.labelWidth)
			.replace(/#label#/g, field ? field.label : "")
			.replace(/#result#/g, field ? field.columnHeader().template({}) : "");

		component.ui.id = ids.component;
		component.ui.view = "template";
		component.ui.minHeight = 45;
		component.ui.height = 60;
		component.ui.borderless = true;
		component.ui.template = template;

		// make sure each of our child views get .init() called
		component.init = (options) => {
		};

		component.onShow = () => {

			if (!field) return;

			var elem = $$(ids.component);
			if (!elem) return;

			var detailCom = this.detailComponent(),
				rowData = detailCom.datacollection.getCursor() || {},
				node = elem.$view;

			field.customDisplay(rowData, App, node, {
				editable: false
			});

		};

		component.logic.setValue = (val) => {

			if (!field) return;

			var elem = $$(ids.component);
			if (!elem) return;

			var rowData = {};
			rowData[field.columnName] = val;

			field.setValue(elem, rowData);
		};


		return component;
	}

};