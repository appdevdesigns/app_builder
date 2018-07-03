/*
 * ABViewDataview
 *
 *
 *
 */

import ABViewDetail from "./ABViewDetail"
import ABPropertyComponent from "../ABPropertyComponent"
import ABViewDetailComponent from "./ABViewDetailComponent"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewDataviewDefaults = {
	key: 'dataview',					// {string} unique key for this view
	icon: 'th',							// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.dataview'	// {string} the multilingual label key for the class label
}

export default class ABViewDataview extends ABViewDetail {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super(values, application, parent, (defaultValues || ABViewDataviewDefaults));

	}

	static common() {
		return ABViewDataviewDefaults;
	}


	///
	/// Instance Methods
	///



	//
	// Property Editor
	// 

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

	}



	/**
	* @method component()
	* return a UI component based upon this view.
	* @param {obj } App 
	* @return {obj } UI component
	*/
	component(App) {

		var com = {};

		var idBase = 'ABViewDataview_' + this.id;
		var ids = {
			component: App.unique(idBase + '_component'),
		}

		com.ui = {
			id: ids.component,
			type: 'space',
			rows: []
		};

		com.init = (options) => {
			// we will initial in .onShow
		};

		com.logic = {
		};

		com.onShow = () => {

			var dc = this.dataCollection();
			var rows = dc.getData();

			// clear UI
			// $$(ids.component)


			rows.forEach(row => {

				let detailCom = _.cloneDeep(super.component(App));

				$$(ids.component).addView(detailCom.ui);

				detailCom.init();
				detailCom.logic.displayData(row);

			});

		};

		return com;

	}

}