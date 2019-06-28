export default class AB_Work_Dataview_List_NewDataview extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_dataview_list_newdataview');

		let CurrentApplication;

		// Our init() function for setting up our UI
		this.init = (options) => {
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
			 * @param {object} obj
			 */
			done: (obj) => {
				_logic.hideBusy();
				_logic.hide();							// hide our popup
				_logic.callbacks.onDone(null, obj, selectNew, callback);		// tell parent component we're done
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
				var newObject = CurrentApplication.objectNew(values);


				// have newObject validate it's values.
				var validator = newObject.isValid();
				if (validator.fail()) {
					cb(validator);							// tell current Tab component the errors
					return false;							// stop here.
				}


				// show progress
				_logic.showBusy();

				// if we get here, save the new Object
				newObject.save()
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
			show: function (shouldSelectNew, callbackFunction) {
				if (shouldSelectNew != null) {
					selectNew = shouldSelectNew;
					callback = callbackFunction;
				}
				if ($$(ids.component))
					$$(ids.component).show();
			},

			switchTab: function (tabId) {

				if (tabId == BlankTab.ui.body.id) {
					if (BlankTab.onShow)
						BlankTab.onShow(CurrentApplication);
				}
				else if (tabId == ImportTab.ui.body.id) {
					if (ImportTab.onShow)
						ImportTab.onShow(CurrentApplication);
				}

			}

		}

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}