
/*
 * ab_work_interface_list_newPage_quickPage
 *
 * Display the form for creating a new template page 
 *
 */

import ABViewDetail from '../classes/views/ABViewDetail'
import ABViewForm from '../classes/views/ABViewForm'
import ABViewFormButton from '../classes/views/ABViewFormButton'
import ABViewGrid from '../classes/views/ABViewGrid'
import ABViewLabel from '../classes/views/ABViewLabel'
import ABViewMenu from '../classes/views/ABViewMenu'
import ABViewPage from '../classes/views/ABViewPage'


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
			selectDataCollection: this.unique('selectDataCollection'),
			displayGrid: this.unique('displayGrid'),
			addable: this.unique('addable'),
			formAdd: this.unique('formAdd'),
			editable: this.unique('editable'),
			viewable: this.unique('viewable'),

			subDcs: this.unique('subDcs')

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

				$$(ids.selectDataCollection).define('options', options);
				$$(ids.selectDataCollection).refresh();

				// update select data source
				var dcId = $$(ids.selectDataCollection).getValue();
				_logic.selectDataCollection(dcId);

			},

			/**
			 * @function selectDataCollection()
			 *
			 * Select the data collection
			 */
			selectDataCollection: function (newDcId, OldDcId) {

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

				// Pull data collections that parent is the selected dc
				var subDcs = [];
				if (CurrentDc) {
					subDcs = CurrentPage.pageRoot().dataCollections(dc => dc.settings.linkDataCollection == CurrentDc.id);
				}

				// Re-build sub-dcs layout
				$$(ids.subDcs).reconstruct();

				// Add title
				if (subDcs.length > 0) {
					$$(ids.subDcs).addView({
						view: "label",
						label: "Do you want to add other options?",
						css: "ab-text-bold"
					});
				}

				// Add sub-dcs to layout
				subDcs.forEach((subDc) => {
					$$(ids.subDcs).addView({
						view: "checkbox",
						name: subDc.id + '|list',
						labelRight: 'List connected <b>"#label#"</b> with a Grid'.replace('#label#', subDc.label),
						labelWidth: 2
					});

					$$(ids.subDcs).addView({
						view: "checkbox",
						name: subDc.id + '|form',
						labelRight: 'Add a connected <b>"#label#"</b> with a Form'.replace('#label#', subDc.label),
						labelWidth: 2
					});
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


			getFormView: function () {

				// create a new form instance
				var newForm = new ABViewForm({
					label: CurrentDc.label + " Form",
					settings: {
						datacollection: CurrentDc.id,
						showLabel: true,
						labelPosition: 'left',
						labelWidth: 120
					}
				}, CurrentApplication);

				// populate fields to a form
				var object = CurrentDc.datasource;
				object.fields().forEach((f, index) => {
					newForm.addFieldToForm(f, index);
				});

				// Add action button to the form
				newForm._views.push(new ABViewFormButton({
					label: 'Form buttons',
					settings: {
						includeSave: true,
						includeCancel: true,
						includeReset: false
					},
					position: {
						y: object.fields().length
					}
				}));

				return newForm;

			},


			getDetailView: function () {

				// create a new detail instance
				var newDetail = new ABViewDetail({
					label: "View " + CurrentDc.label,
					settings: {
						datacollection: CurrentDc.id,
						showLabel: true,
						labelPosition: 'left',
						labelWidth: 120
					}
				}, CurrentApplication);

				// populate fields to a form
				var object = CurrentDc.datasource;
				object.fields().forEach((f, index) => {
					newDetail.addFieldToView(f, index);
				});

				return newDetail;
			},


			values: function () {

				if (!CurrentDc) return null;

				// TODO : validate unique page's name 

				var pages = [];
				var views = [];
				var formValues = $$(ids.form).getValues();
				var subValues = $$(ids.subDcs).getValues();

				var addPageId = null;
				var viewPageId = null;

				// Edit page
				if (formValues.addable || formValues.editable) {

					addPageId = OP.Util.uuid();

					var newForm = _logic.getFormView();

					// Add a page
					pages.push({
						id: addPageId,
						key: ABViewPage.common().key,
						icon: ABViewPage.common().icon,
						name: CurrentDc.label,
						settings: {
							type: "popup"
						},
						views: [
							// Title
							{
								key: ABViewLabel.common().key,
								icon: ABViewLabel.common().icon,
								label: "Title",
								text: CurrentDc.label,
								settings: {
									format: 1
								}
							},
							// Form
							newForm.toObj()
						]
					});


					// Add a menu
					if (formValues.addable) {
						views.push({
							key: ABViewMenu.common().key,
							icon: ABViewMenu.common().icon,
							label: "Menu",
							settings: {
								pages: [addPageId]
							}
						});
					}

				}

				// View page
				if (formValues.viewable) {

					viewPageId = OP.Util.uuid();

					var newDetail = _logic.getDetailView();

					pages.push({
						id: viewPageId,
						key: ABViewPage.common().key,
						icon: ABViewPage.common().icon,
						name: "View " + CurrentDc.label,
						settings: {
							type: "popup"
						},
						views: [
							// Title
							{
								key: ABViewLabel.common().key,
								icon: ABViewLabel.common().icon,
								label: "Title",
								text: "View " + CurrentDc.label,
								settings: {
									format: 1
								}
							},
							// Detail
							newDetail.toObj(),
							// Menu
							{
								key: ABViewMenu.common().key,
								icon: ABViewMenu.common().icon,
								label: "Menu",
								settings: {
									pages: []
								}
							}
						]
					});

				}

				// Add a grid to show data of data source
				if (formValues.showGrid) {

					views.push({
						key: ABViewGrid.common().key,
						icon: ABViewGrid.common().icon,
						label: CurrentDc.label,
						settings: {
							dataSource: CurrentDc.id,
							height: 300,
							editPage: formValues.editable ? addPageId : null,
							detailsPage: formValues.viewable ? viewPageId : null
						}
					});

				}

				// Edit form
				if (formValues.formAdd) {

					// add the title to the form
					views.push({
						key: ABViewLabel.common().key,
						icon: ABViewLabel.common().icon,
						label: "Title",
						text: 'Add ' + CurrentDc.label,
						settings: {
							format: 1
						}
					});

					var newForm = _logic.getFormView();

					// add the new form to page
					views.push(newForm.toObj());

				}


				return {
					parent: CurrentPage, // should be either null or an {}
					name: CurrentDc.label,
					key: ABViewPage.common().key,
					views: views,
					pages: pages
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
								name: "parent",
								label: labels.component.parentPage,
								labelWidth: 170,
								options: [],
								on: { onChange: _logic.selectPage }
							},
							{
								view: "select",
								id: ids.selectDataCollection,
								name: "datacollection",
								label: "Select a data source",
								labelWidth: 170,
								options: [],
								on: { onChange: _logic.selectDataCollection }
							},
							{ height: 10 },
							{
								view: "checkbox",
								id: ids.displayGrid,
								name: "showGrid",
								labelRight: 'Display multiple <b>""</b> in a Grid',
								labelWidth: 2
							},
							{
								view: "checkbox",
								id: ids.addable,
								name: "addable",
								labelRight: 'A Menu button linked to a page to Add a new <b>""</b>',
								labelWidth: 2
							},
							{
								view: "checkbox",
								id: ids.formAdd,
								name: "formAdd",
								labelRight: 'Add a new <b>""</b> with a Form',
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
								id: ids.editable,
								name: "editable",
								labelRight: 'Edit selected <b>""</b>',
								labelWidth: 2
							},
							{
								view: "checkbox",
								id: ids.viewable,
								name: "viewable",
								labelRight: 'View details of <b>""</b>',
								labelWidth: 2
							},
							{
								view: "form",
								id: ids.subDcs,
								borderless: true,
								elements: []
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