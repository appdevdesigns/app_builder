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
	labelKey: 'ab.components.dataview',	// {string} the multilingual label key for the class label
	xCount: 1 // {int} the number of columns per row (need at least one)
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

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		return commonUI.concat([
			{
				view:"counter", 
				name:"xCount",
				min: 1, // we cannot have 0 columns per row so lets not accept it
				label: L('ab.components.dataview.xCount', "*Items in a row"), 
				labelWidth: App.config.labelWidthLarge,
				step:1 
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		$$(ids.xCount).setValue(view.settings.xCount || ABViewDataviewDefaults.xCount);

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.xCount = $$(ids.xCount).getValue();

	}


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

		let viewDef = {
			id: ids.component,
			paddingX: 5,
			paddingY: 9,
			type: 'space',
			rows: []
		};

		// if height is set, then add Y scrollbar
		if (this.settings.height >= 0) {
			com.ui = {
				view: "scrollview",
				height: this.settings.height,
				scroll: "y",
				body: viewDef
			};
		}
		// no scrollbar
		else {
			com.ui = viewDef;
		}

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
			webix.ui([], $$(ids.component));

			var dc = this.dataCollection;
			if (!dc) return;

			var rows = dc.getData();
			
			// lets build a grid based off the number of columns we want in each row
			var dataGrid = [];
			var colCount = 1; // start with column 1
			var rowObj = {cols:[]}; // create row that has a cols array to push items into
			// loop through items and put them into columns
			rows.forEach(row=> {
				// if the column value is higher than the number of columns allowed begin a new row
				if (colCount > parseInt(this.settings.xCount)) {
					dataGrid.push(rowObj);
					rowObj = {cols:[]};
					colCount = 1;
				} 
				
				// get the components configuation
				let detailCom = _.cloneDeep(super.component(App, row.id));

				// adjust the UI to make sure it will look like a "card"
				detailCom.ui.type = "space";
				detailCom.ui.paddingX = 5;
				detailCom.ui.paddingY = 1;

				// put the component into the column
				rowObj.cols.push(detailCom.ui);

				// we are done with this column move to the next
				colCount++;

			});
			
			// get any empty cols with number of colums minus the mod of the length and the xCount
			var emptyCols = parseInt(this.settings.xCount) - (rows.length % parseInt(this.settings.xCount));
			
			// make sure that we need emptyCols, that we are doing more than one column per row and that the emptyCols does not equal the number per row
			if (emptyCols && (parseInt(this.settings.xCount) > 1) && (emptyCols != parseInt(this.settings.xCount))) {
				for (var i = 0; i < emptyCols; i++) { 
					// add a spacer to fill column space
					rowObj.cols.push({});
				};
			}
			
			// push in the last row
			dataGrid.push(rowObj);

			// dynamically create the UI with this new configuration
			webix.ui(dataGrid, $$(ids.component));			

			// loop through the components so we can initialize their data
			// this has to be done after they have been attached to the view so we couldn't have done in the previous step
			rows.forEach(row => {
			
				let detailCom = _.cloneDeep(super.component(App, row.id));

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
				tasks.push(new Promise((next, err) => {

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