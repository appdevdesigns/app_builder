import ABViewDetailSelectivity from "./ABViewDetailSelectivity"
import ABViewPropertyAddPage from "./viewProperties/ABViewPropertyAddPage"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

const ABViewDetailPropertyComponentDefaults = {
	formView: '', // id of form to add new data
}

const ABViewDefaults = {
	key: 'detailconnect',	// {string} unique key for this view
	icon: 'list-ul',				// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.detail.connect' // {string} the multilingual label key for the class label
}

export default class ABViewDetailConnect extends ABViewDetailSelectivity {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

	}

	static common() {
		return ABViewDefaults;
	}

	///
	/// Instance Methods
	///

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		this.addPageTool.fromSettings(this.settings);
	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		let commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		let idBase = 'ABViewDetailConnectPropertyEditor';

		if (this.addPageProperty == null) {
			this.addPageProperty = ABViewPropertyAddPage.propertyComponent(App, idBase);
			this.addPageProperty.init({
				onSave: () => {

					let currView = _logic.currentEditObject();

					// refresh settings
					this.propertyEditorValues(ids, currView);

					// trigger a save()
					this.propertyEditorSave(ids, currView);

				}
			});
		}

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			this.addPageProperty.ui
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		this.addPageProperty.setSettings(view, view.settings);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings = this.addPageProperty.getSettings(view);

		// refresh settings of app page tool
		view.addPageTool.fromSettings(view.settings);

	}

	/**
	 * @method component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @param {string} idPrefix
	 * 
	 * @return {obj} UI component
	 */
	component(App, idPrefix) {

		let idBase = 'ABViewDetailConnect_' + (idPrefix || '') + this.id;
		let baseComp = super.component(App, idBase);

		let addPageComponent = this.addPageTool.component(App, idBase);

		let _init = (options) => {

			baseComp.init(options);

			addPageComponent.applicationLoad(this.application);
			addPageComponent.init({
				// TODO : callbacks
			});

		};

		// Add plus button in front of template
		baseComp.ui.template = baseComp.ui.template.replace("#display#", addPageComponent.ui + " #display#");

		// Click to open new data form
		baseComp.ui.onClick = baseComp.ui.onClick || {};
		baseComp.ui.onClick["ab-connect-add-new-link"] = function (e, id, trg) {

			addPageComponent.onClick();

			e.stopPropagation();
			return false;
		};

		return {
			ui: baseComp.ui,

			init: _init,
			logic: baseComp.logic
		};

	}

	get addPageTool() {

		if (this.__addPageTool == null)
			this.__addPageTool = new ABViewPropertyAddPage();

		return this.__addPageTool;
	}


}