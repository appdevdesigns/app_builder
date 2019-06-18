
/*
 * ab_work_query_list_newQuery
 *
 * Display the form for creating a new Query.
 *
 */

import ABBlankQuery from "./ab_work_query_list_newQuery_blank"
import ABImportQuery from "./ab_work_query_list_newQuery_import"

export default class AB_Work_Query_List_NewQuery extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App) {
		super(App, 'ab_work_query_list_newQuery');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				addNew: L('ab.query.addNew', '*Add new query')
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			tab: this.unique('tab')
		};

		let BlankTab = new ABBlankQuery(App);
		let ImportTab = new ABImportQuery(App);

		// Our webix UI definition:
		this.ui = {
			view: "window",
			id: ids.component,
			position: "center",
			modal: true,
			head: labels.component.addNew,
			body: {
				view: "tabview",
				id: ids.tab,
				cells: [
					BlankTab.ui,
					// ImportTab.ui,
				],
				tabbar: {
					on: {
						onAfterTabClick: (id) => {

							_logic.switchTab(id);

						}
					}
				}
			}

		};



		// Our init() function for setting up our UI
		this.init = (options) => {
			webix.ui(this.ui);
			webix.extend($$(ids.component), webix.ProgressBar);

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}


			var ourCBs = {
				onCancel: _logic.hide,
				onSave: _logic.save,
				onDone: _logic.done,
				onBusyStart: _logic.showBusy,
				onBusyEnd: _logic.hideBusy
			}

			// TODO
			BlankTab.init(ourCBs);
			// ImportTab.init(ourCBs);

		}



		// our internal business logic
		var _logic = this._logic = {


			/**
			 * @function applicationLoad()
			 *
			 * prepare ourself with the current application
			 */
			applicationLoad: function (application) {
				// _logic.show();
				currentApplication = application;	// remember our current Application.
			},


			callbacks: {
				onDone: function () { }
			},


			/**
			 * @function hide()
			 *
			 * remove the busy indicator from the form.
			 */
			hide: function () {
				if ($$(ids.component))
					$$(ids.component).hide();
			},


			/**
			 * Show the busy indicator
			 */
			showBusy: () => {
				if ($$(ids.component)) {
					$$(ids.component).showProgress();
				}
			},


			/**
			 * Hide the busy indicator
			 */
			hideBusy: () => {
				if ($$(ids.component)) {
					$$(ids.component).hideProgress();
				}
			},


			/**
			 * Finished saving, so hide the popup and clean up.
			 * @param {object} query
			 */
			done: (query) => {

				var selectNew = true;

				_logic.hideBusy();
				_logic.hide();							// hide our popup
				_logic.callbacks.onDone(null, query, selectNew, null);		// tell parent component we're done
			},

			switchTab: (tabId) => {

				if (tabId == BlankTab.ui.body.id) {
					if (BlankTab.onShow)
						BlankTab.onShow(currentApplication);
				}
				else if (tabId == ImportTab.ui.body.id) {
					if (ImportTab.onShow)
						ImportTab.onShow(currentApplication);
				}

			},

			/**
			 * @function save
			 *
			 * take the data gathered by our child creation tabs, and
			 * add it to our current application.
			 *
			 */
			save: function () {

				// validate
				if (!$$(ids.form).validate()) return;

				// show loading cursor
				_logic.showBusy();

				var formVals = $$(ids.form).getValues(),
					queryName = formVals["name"],
					objectId = formVals["object"];

				var selectedObj = currentApplication.objects(obj => obj.id == objectId)[0];

				// create an instance of ABObjectQuery
				var query = currentApplication.queryNew({
					name: queryName,
					label: queryName,
					joins: {
						alias: "BASE_OBJECT", // TODO
						objectURL: selectedObj.urlPointer(),
						links: []
					}
				});

				// save to db
				query.save()
					.then(() => {
						_logic.done(query);
					})
					.catch(err => {

						_logic.hideBusy();
						_logic.callbacks.onDone(err);

					});

			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {
				if ($$(ids.component))
					$$(ids.component).show();
			}

		}


		var currentApplication = null;


		// Expose any globally accessible Actions:
		this.actions({

		});



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}
