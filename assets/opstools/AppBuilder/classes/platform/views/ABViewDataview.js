const ABViewDataviewCore = require("../../core/views/ABViewDataviewCore");
const ABViewPropertyLinkPage = require("./viewProperties/ABViewPropertyLinkPage");

const ABViewDataviewPropertyComponentDefaults = ABViewDataviewCore.defaultValues();

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDataview extends ABViewDataviewCore {

	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, defaultValues);

	}



	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var idBase = 'ABViewDataviewPropertyEditor';

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		this.linkPageComponent = ABViewPropertyLinkPage.propertyComponent(App, idBase);

		return commonUI.concat([
			{
				view: "counter",
				name: "xCount",
				min: 1, // we cannot have 0 columns per row so lets not accept it
				label: L('ab.components.dataview.xCount', "*Items in a row"),
				labelWidth: App.config.labelWidthLarge,
				step: 1
			},
			this.linkPageComponent.ui
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.xCount).setValue(view.settings.xCount || ABViewDataviewPropertyComponentDefaults.xCount);

		this.linkPageComponent.viewLoad(view);
		this.linkPageComponent.setSettings(view.settings);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.xCount = $$(ids.xCount).getValue();

		let linkSettings = this.linkPageComponent.getSettings();
		for (let key in linkSettings) {
			view.settings[key] = linkSettings[key];
		}

	}
}