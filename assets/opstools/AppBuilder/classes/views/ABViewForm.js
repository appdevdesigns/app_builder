/*
 * ABViewForm
 *
 * An ABViewFormPanel that represents a "Form" in the system.
 *
 *
 */

import ABViewFormPanel from "./ABViewFormPanel"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewFormDefaults = {
	key: 'form',		// unique key identifier for this ABViewForm
	icon: 'list-alt',		// icon reference: (without 'fa-' )
	labelKey: 'ab.components.form' // {string} the multilingual label key for the class label

}

export default class ABViewForm extends ABViewFormPanel {

	constructor(values, application, parent) {

		super(values, application, parent, ABViewFormDefaults);


		// 	{
		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//		},

		//		translations:[]
		// 	}


	}


	static common() {
		return ABViewFormDefaults;
	}

	///
	/// Instance Methods
	///

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = [];
		this.views().forEach((v) => {
			viewComponents.push(v.component(App));
		})

		var idBase = 'ABViewForm_' + this.id,
			ids = {
				component: App.unique(idBase + '_component'),
			};


		// an ABViewForm_ is a collection of rows:
		var _ui = {
			id: ids.component,
			view: 'form',
			elements: []
		}

		// insert each of our sub views into our rows:
		viewComponents.forEach((view) => {
			_ui.elements.push(view.ui);
		})


		// make sure each of our child views get .init() called
		var _init = (options) => {
			viewComponents.forEach((view) => {
				view.init();
			})

			$$(ids.component).adjust();
		}


		return {
			ui: _ui,
			init: _init
		}
	}

}
