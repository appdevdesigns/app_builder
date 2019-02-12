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
import { resolve } from "url";
import { runInNewContext } from "vm";


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

			var dc = this.dataCollection;
			if (!dc) return;

			com.onShow();

			this.eventAdd({
				emitter: dc,
				eventName: "loadData",
				listener: () => {

					com.onShow();
				}
			});

		};

		com.logic = {
		};

		com.onShow = () => {

			let baseCom = super.component(App);
			baseCom.onShow();

			// clear UI
			webix.ui(com.ui, $$(ids.component));

			var dc = this.dataCollection;
			if (!dc) return;

			var rows = dc.getData();

			rows.forEach(row => {

				let detailCom = _.cloneDeep(super.component(App, row.id));

				$$(ids.component).addView(detailCom.ui);

				detailCom.init();
				detailCom.logic.displayData(row);

			});

		};

		return com;

	}


	//// Report ////

	print() {

		return new Promise((resolve, reject) => {

			var reportDef = [];

			var dc = this.dataCollection;
			if (!dc) return reportDef;

			var rows = dc.getData();

			var tasks = [];

			rows.forEach(row => {

				// add tasks
				tasks.push(new Promise((next,err) => {

					// pull container definition
					super.print(row).then(containerDef => {

						// add to rows
						reportDef.push(containerDef);
						next();

					}).catch(err);


				}));

			});


			// final fn - return report definition
			tasks.push(new Promise((next, err) => {
				resolve(reportDef);
				next();
			}));

			// action sequentially
			tasks.reduce((promiseChain, currTask) => {
				return promiseChain.then(currTask);
			}, Promise.resolve([]));

		});

	}

}