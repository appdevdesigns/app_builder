
/*
 * ab_work_interface_list_newPage_blankPage
 *
 * Display the form for creating a new blank page 
 *
 */

import ABPage from '../classes/views/ABViewPage'


export default class AB_Work_Interface_List_NewPage_BlankPage extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_interface_list_newPage_blankPage');

		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),
				parentPage: L('ab.interface.page.parentList', '*Parent Page'),
				placeholderPageName: L('ab.interface.placeholderPageName', '*Page name'),

				rootPage: L('ab.interface.rootPage', '*[Root page]')
			}
		}


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

			parentList: this.unique('parentList'),
			formName: this.unique('formName')

		}



		// Our webix UI definition:
		this.ui = {
			view: "form",
			id: ids.component,

			//// TODO: @James
			width: 400,

			elements: [
				{
					view: "select",
					id: ids.parentList,
					label: labels.component.parentPage,
					name: "parent",
					labelWidth: 110,
					options: []
				},
				{
					view: "text",
					id: ids.formName,
					label: labels.common.formName,
					name: "name",
					required: true,
					placeholder: labels.component.placeholderPageName,
					labelWidth: 110
				}
			]

		};



		// Our init() function for setting up our UI
		this.init = function () {

			webix.extend($$(ids.component), webix.ProgressBar);

		}


		var CurrentApplication = null;

		// our internal business logic 
		var _logic = this._logic = {


			/**
			 * @function applicationLoad()
			 *
			 * Prepare our New Popups with the current Application
			 */
			applicationLoad: function (application) {
				CurrentApplication = application;

				var options = [{ id: '-', value: labels.component.rootPage }];

				var addPage = function (page, indent) {
					indent = indent || '';
					options.push({ id: page.urlPointer(), value: indent + page.label });
					page.pages().forEach(function (p) {
						addPage(p, indent + '-');
					})
				}
				application.pages().forEach(function (page) {
					addPage(page, '');
				});

				$$(ids.parentList).define('options', options);
				$$(ids.parentList).refresh();

			},

			/**
			 * @function clear()
			 *
			 * Clear our form
			 */
			clear: function () {
				$$(ids.component).clearValidation();
				$$(ids.component).clear();
				$$(ids.parentList).setValue('-');
			},



			/**
			 * @function errors()
			 *
			 * show errors on our form:
			 */
			errors: function (validator) {
				validator.updateForm($$(ids.component));
			},


			// /**
			//  * @function formBusy
			//  *
			//  * Show the progress indicator to indicate a Form operation is in 
			//  * progress.
			//  */
			// formBusy: function() {

			// 	$$(ids.form).showProgress({ type: 'icon' });
			// },


			// /**
			//  * @function formReady()
			//  *
			//  * remove the busy indicator from the form.
			//  */
			// formReady: function() {
			// 	$$(ids.form).hideProgress();
			// },


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				// $$(componentId.addNewForm).clearValidation();
				// $$(componentId.addNewForm).clear();

				// var options = [{ id: '', value: '[Root page]' }];
				// application.pages.each(function (d) {
				// 	if (!d.parent) { // Get only root pages
				// 		options.push({ id: d.id, value: d.label });
				// 	}
				// });

				// $$(componentId.addNewParentList).define('options', options);

				// // Default select parent page
				// if (selectedPage) {
				// 	var selected_page_id = selectedPage.id;

				// 	if (selectedPage.parent)
				// 		selected_page_id = selectedPage.parent.id || selectedPage.parent;

				// 	$$(componentId.addNewParentList).setValue(selected_page_id);
				// }
				// else
				// 	$$(componentId.addNewParentList).setValue('');

				// $$(componentId.addNewParentList).render();


				$$(ids.component).show();
			},


			values: function () {

				var parent = $$(ids.parentList).getValue().trim();
				if (parent == '-') parent = null;

				// convert a parent .id value to the actual object (or undefined if not found)
				if (parent) {
					parent = CurrentApplication.urlResolve(parent);
				}

				// TODO : validate unique page's name 

				return {
					parent: parent, // should be either null or an {}
					name: $$(ids.formName).getValue().trim(),
					key: ABPage.common().key
				}

			},


			showProgress: () => {
				$$(ids.component).showProgress({ type: "icon" });
			},


			hideProgress: () => {
				$$(ids.component).hideProgress();
			},

		}



		// Expose any globally accessible Actions:
		this.actions({


			/**
			 * @function populateApplicationForm()
			 *
			 * Initialze the Form with the values from the provided ABApplication.
			 *
			 * If no ABApplication is provided, then show an empty form. (create operation)
			 *
			 * @param {ABApplication} Application  	[optional] The current ABApplication 
			 *										we are working with.
			 */
			// populateApplicationForm:function(Application){

			// 	_logic.formReset();
			// 	if (Application) {
			// 		// populate Form here:
			// 		_logic.formPopulate(Application);
			// 	}
			// 	_logic.permissionPopulate(Application);
			// 	_logic.show();
			// }

		})


		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.clear = _logic.clear;
		this.errors = _logic.errors;
		this.show = _logic.show;
		this.values = _logic.values;
		this.showProgress = _logic.showProgress;
		this.hideProgress = _logic.hideProgress;


	}

}