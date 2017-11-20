
/*
 * ab_work_interface_list_newPage_quickPage
 *
 * Display the form for creating a new template page 
 *
 */

import ABPage from '../classes/views/ABViewPage'


export default class AB_Work_Interface_List_NewPage_QuickPage extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_interface_list_newPage_quickPage');

		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),
				parentPage: L('ab.interface.page.parentList', '*Parent Page'),
				placeholderPageName: L('ab.interface.placeholderPageName', '*Page name'),

				rootPage: L('ab.interface.rootPage', '*[Root page]')
			}
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			form: this.unique('form'),

			parentList: this.unique('parentList'),
			selectDataSource: this.unique('selectDataSource'),
			displayGrid: this.unique('displayGrid'),
			addNewButton: this.unique('addNewButton'),
			addNewForm: this.unique('addNewForm'),
			editData: this.unique('editData'),
			viewData: this.unique('viewData')

		}


		// Our init() function for setting up our UI
		this.init = function () {

			webix.extend($$(ids.component), webix.ProgressBar);

		}

		var CurrentApplication = null,
			CurrentPage = null,
			CurrentDc = null;

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
			 * @function selectPage()
			 *
			 * Select the parent page
			 */
			selectPage: function (newPageUrl, oldPageUrl) {

				var options = [];

				CurrentPage = CurrentApplication.urlResolve(newPageUrl.trim());
				if (CurrentPage) {

					// Populate the data collections to list
					options = CurrentPage.pageRoot().dataCollections().map((dc) => {
						return {
							id: dc.id,
							value: dc.label
						}
					}) || [];

				}

				$$(ids.selectDataSource).define('options', options);
				$$(ids.selectDataSource).refresh();

				// update select data source
				var dcId = $$(ids.selectDataSource).getValue();
				_logic.selectDataSource(dcId);

			},

			/**
			 * @function selectDataSource()
			 *
			 * Select the data source
			 */
			selectDataSource: function (newDcId, OldDcId) {

				if (CurrentPage)
					CurrentDc = CurrentPage.pageRoot().dataCollections(dc => dc.id == newDcId)[0];
				else
					CurrentDc = null;

				// Rename data source name to template
				$$(ids.form).getChildViews().forEach(function (r) {
					if (r && r.config.labelRight) {
						var label = r.config.labelRight.replace(/<b>[\s\S]*?<\/b>/, '<b>"' + (CurrentDc ? CurrentDc.label : '') + '"<\/b>');

						r.define('labelRight', label);
						r.refresh();
					}
				});


			},

			/**
			 * @function clear()
			 *
			 * Clear our form
			 */
			clear: function () {
				$$(ids.form).clearValidation();
				$$(ids.form).clear();
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


			/**
			 * @function formBusy
			 *
			 * Show the progress indicator to indicate a Form operation is in 
			 * progress.
			 */
			formBusy: function () {

				$$(ids.component).showProgress({ type: "icon" });
			},


			/**
			 * @function formReady()
			 *
			 * remove the busy indicator from the form.
			 */
			formReady: function () {
				$$(ids.component).hideProgress();
			},


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

				if (!CurrentDc) return null;
				
				// TODO : validate unique page's name 

				return {
					parent: CurrentPage, // should be either null or an {}
					name: CurrentDc.label,
					key: ABPage.common().key
				}

			}

		};


		// Our webix UI definition:
		this.ui = {
			view: "scrollview",
			id: ids.component,
			scroll: "y",
			height: 400,

			body: {
				rows: [
					{
						view: "form",
						id: ids.form,
						elements: [
							{
								view: "select",
								id: ids.parentList,
								label: labels.component.parentPage,
								name: "parent",
								labelWidth: 170,
								options: [],
								on: { onChange: _logic.selectPage }
							},
							{
								view: "select",
								id: ids.selectDataSource,
								label: "Select a data source",
								labelWidth: 170,
								options: [],
								on: { onChange: _logic.selectDataSource }
							},
							{ height: 10 },
							{
								view: "checkbox",
								id: ids.displayGrid,
								labelRight: "Display multiple <b>object.label</b> in a Grid",
								labelWidth: 2
							},
							{
								view: "checkbox",
								id: ids.addNewButton,
								labelRight: "A Menu button linked to a page to Add a new <b>object.label</b>",
								labelWidth: 2
							},
							{
								view: "checkbox",
								id: ids.addNewForm,
								labelRight: "Add a new <b>object.label</b> with a Form",
								labelWidth: 2
							},
							{ height: 10 },
							{
								view: "label",
								label: "Each record in the Grid can be linked to a page that shows on Edit form or a page to View Details",
								css: "ab-text-bold"
							},
							{
								view: "checkbox",
								id: ids.editData,
								labelRight: "Edit selected <b>object.label</b>",
								labelWidth: 2
							},
							{
								view: "checkbox",
								id: ids.viewData,
								labelRight: "View details of <b>object.label</b>",
								labelWidth: 2
							}
						]
					}
				]
			}

		};


		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.clear = _logic.clear;
		this.errors = _logic.errors;
		this.show = _logic.show;
		this.values = _logic.values;
		this.formBusy = _logic.formBusy;
		this.formReady = _logic.formReady;

	}

}