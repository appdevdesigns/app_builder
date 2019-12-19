const ABViewDetailSelectivityCore = require("../../core/views/ABViewDetailSelectivityCore");

const ABViewDetailPropertyComponentDefaults = ABViewDetailSelectivityCore.defaultValues();

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewDetailSelectivity extends ABViewDetailSelectivityCore {

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

		var idBase = 'ABViewDetailSelectivityEditorComponent';
		var ids = {
			component: App.unique(idBase + '_component')
		}


		var elem = this.component(App).ui;
		elem.id = ids.component;

		var _ui = {
			rows: [
				elem,
				{}
			]
		};

		var _init = (options) => {
		}

		var _logic = {
		}


		return {
			ui: _ui,
			init: _init,
			logic: _logic
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
			{
				view: 'counter',
				name: "height",
				label: L("ab.components.common.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.height).setValue(view.settings.height || ABViewDetailPropertyComponentDefaults.height);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.height = $$(ids.height).getValue();

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

		var idBase = 'ABViewDetailSelectivity_' + (idPrefix || '') + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		};
		var className = 'ab-detail-selectivity';


		component.ui.id = ids.component;

		if (this.settings.height)
			component.ui.height = this.settings.height;

		var _init = (options) => {

			component.init(options);


			// add div of selectivity to detail
			var divSelectivity = '<div class="#className#"></div>'.replace("#className#", className);
			component.logic.setValue(ids.component, divSelectivity);

		};

		var _logic = {

			getDomSelectivity: () => {
				var elem = $$(ids.component);
				if (!elem) return;

				return elem.$view.getElementsByClassName(className)[0];
			},

			setValue: (val) => {

				// convert value to array
				if (val != null && !(val instanceof Array)) {
					val = [val];
				}

				setTimeout(function () {
					// get selectivity dom
					var domSelectivity = _logic.getDomSelectivity();
					var isUsers = false;
					if (component.ui.isUsers)
						isUsers = component.ui.isUsers;

					// render selectivity to html dom
					var selectivitySettings = {
						multiple: true,
						readOnly: true,
						isUsers: isUsers
					};
					field.selectivityRender(domSelectivity, selectivitySettings, App, {});

					// set value to selectivity
					field.selectivitySet(domSelectivity, val, App);
				}, 50);

			}

		};

		return {
			ui: component.ui,

			init: _init,
			logic: _logic
		};
	}

};