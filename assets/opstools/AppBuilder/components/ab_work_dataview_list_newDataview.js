/*
 * ab_work_dataview_list_newDataview
 *
 * Display the form for creating a new Dataview.
 *
 */

import ABBlankDataview from "./ab_work_dataview_list_newDataview_blank"

export default class AB_Work_Dataview_List_NewDataview extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_dataview_list_newdataview');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				addNew: L('ab.dataview.addNew', '*Add new data view')
			}
		}

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			tab: this.unique('tab')
		}

		let CurrentApplication;

		let BlankTab = new ABBlankDataview(App);


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
					BlankTab.ui
				],
				tabbar: {
					on: {
						onAfterTabClick: (id) => {

							_logic.switchTab(id);

						}
					}
				}
			},
			on: {
				onBeforeShow: () => {

					var id = $$(ids.tab).getValue();
					_logic.switchTab(id);

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

			BlankTab.init(ourCBs);
			// CsvTab.init(ourCBs);
			// ImportTab.init(ourCBs);
			// ExternalTab.init(ourCBs);

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
				CurrentApplication = application;	// remember our current Application.
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
			 * @param {ABDataview} dataview
			 */
			done: (dataview) => {
				_logic.hideBusy();
				_logic.hide();								// hide our popup
				_logic.callbacks.onDone(null, dataview);	// tell parent component we're done
			},


			/**
			 * @function save
			 *
			 * take the data gathered by our child creation tabs, and
			 * add it to our current application.
			 *
			 * @param {obj} values  key=>value hash of model values.
			 * @param {fn}  cb 		node style callback to indicate success/failure
			 * 						return Promise
			 */
			save: function (values, cb) {

				// must have an application set.
				if (!CurrentApplication) {
					OP.Dialog.Alert({
						title: 'Shoot!',
						test: 'No Application Set!  Why?'
					});
					cb(true);	// there was an error.
					return false;
				}

				// create a new (unsaved) instance of our object:
				var newDataview = CurrentApplication.dataviewNew(values);


				// have newObject validate it's values.
				var validator = newDataview.isValid();
				if (validator.fail()) {
					cb(validator);							// tell current Tab component the errors
					return false;							// stop here.
				}


				// show progress
				_logic.showBusy();

				// if we get here, save the new Object
				newDataview.save()
					.then(function (obj) {

						// successfully done:
						cb(null, obj)									// tell current tab component save successful
							.then(() => _logic.done(obj));
					})
					.catch(function (err) {
						// hide progress
						_logic.hideBusy();

						cb(err);								// tell current Tab component there was an error
					})
			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {
				if ($$(ids.component))
					$$(ids.component).show();

				var id = $$(ids.tab).getValue();
				_logic.switchTab(id);
			},

			switchTab: function (tabId) {

				if (tabId == BlankTab.ui.body.id) {
					if (BlankTab.onShow)
						BlankTab.onShow(CurrentApplication);
				}
				// TODO
				// else if (tabId == ImportTab.ui.body.id) {
				// 	if (ImportTab.onShow)
				// 		ImportTab.onShow(CurrentApplication);
				// }

			}

		}

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}