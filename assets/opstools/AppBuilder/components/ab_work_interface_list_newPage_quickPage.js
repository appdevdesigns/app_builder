
/*
 * ab_work_interface_list_newPage_quickPage
 *
 * Display the form for creating a new template page 
 *
 */

import ABViewDataCollection from '../classes/views/ABViewDataCollection'
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

				rootPage: L('ab.interface.rootPage', '*[Root page]'),
				selectObject: L('ab.interface.selectObject', '*[Select object]')
			}
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
			form: this.unique('form'),

			parentList: this.unique('parentList'),
			selectObject: this.unique('selectObject'),
			displayGrid: this.unique('displayGrid'),
			addable: this.unique('addable'),
			formAdd: this.unique('formAdd'),
			editable: this.unique('editable'),
			viewable: this.unique('viewable'),

			subObjs: this.unique('subObjs')

		}


		// Our init() function for setting up our UI
		this.init = function () {

			webix.extend($$(ids.component), webix.ProgressBar);

		}

		var CurrentApplication = null,
			CurrentPage = null,
			CurrentObj = null;

		// our internal business logic 
		var _logic = this._logic = {

			/**
			 * @function applicationLoad()
			 *
			 * Prepare our New Popups with the current Application
			 */
			applicationLoad: function (application) {
				CurrentApplication = application;

				var pageOptions = [{ id: '-', value: labels.component.rootPage }];

				/* Pages */
				var addPage = function (page, indent) {
					indent = indent || '';
					pageOptions.push({ id: page.urlPointer(), value: indent + page.label });
					page.pages().forEach(function (p) {
						addPage(p, indent + '-');
					})
				}
				application.pages().forEach(function (page) {
					addPage(page, '');
				});

				$$(ids.parentList).define('options', pageOptions);
				$$(ids.parentList).refresh();

				/* Objects */
				var objOptions = CurrentApplication.objects().map((obj) => {
					return {
						id: obj.id,
						value: obj.label
					}
				}) || [];

				objOptions.unshift({
					id: '',
					value: labels.component.selectObject
				});

				$$(ids.selectObject).define('options', objOptions);
				$$(ids.selectObject).refresh();

			},

			/**
			 * @function selectPage()
			 *
			 * Select the parent page
			 */
			selectPage: function (newPageUrl, oldPageUrl) {

				CurrentPage = CurrentApplication.urlResolve(newPageUrl.trim());

			},

			/**
			 * @function selectObject()
			 *
			 * Select a object
			 */
			selectObject: function (newObjId, oldObjId) {

				CurrentObj = CurrentApplication.objects(obj => obj.id == newObjId)[0];

				// Rename data source name to template
				$$(ids.form).getChildViews().forEach(function (r) {
					if (r && r.config.labelRight) {
						var label = r.config.labelRight.replace(/<b>[\s\S]*?<\/b>/, '<b>"' + (CurrentObj ? CurrentObj.label : '') + '"<\/b>');

						r.define('labelRight', label);
						r.refresh();
					}
				});

				// Pull data collections that parent is the selected dc
				var subObjs = [];
				if (CurrentObj) {
					subObjs = CurrentApplication.objects(obj => {
						return obj.fields(f => f.key == 'connectObject' && f.settings.linkObject == CurrentObj.id).length > 0;
					});
				}

				// Re-build sub-dcs layout
				$$(ids.subObjs).reconstruct();

				// Add title
				if (subObjs.length > 0) {
					$$(ids.subObjs).addView({
						view: "label",
						label: "Do you want to add other options?",
						css: "ab-text-bold"
					});
				}

				// Add sub-dcs to layout
				subObjs.forEach((subObj) => {
					$$(ids.subObjs).addView({
						view: "checkbox",
						name: subObj.id + '|list',
						labelRight: 'List connected <b>"#label#"</b> with a Grid'.replace('#label#', subObj.label),
						labelWidth: 2
					});

					$$(ids.subObjs).addView({
						view: "checkbox",
						name: subObj.id + '|form',
						labelRight: 'Add a connected <b>"#label#"</b> with a Form'.replace('#label#', subObj.label),
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


			getDataCollection: function (label, obj, parentDc) {

				var dcConfig = {
					id: OP.Util.uuid(),
					label: label || obj.label,
					settings: {
						object: obj.id,
						objectUrl: obj.urlPointer(),
						loadAll: 0,
						fixSelect: ""
					}
				}

				if (parentDc) {

					dcConfig.settings.linkDataCollection = parentDc.id;

					var linkField = obj.fields(f => f.datasourceLink && f.datasourceLink.id == parentDc.datasource.id)[0];
					if (linkField)
						dcConfig.settings.linkField = linkField.id;
				}

				return new ABViewDataCollection(dcConfig, CurrentApplication);

			},


			getFormView: function (dc) {

				// create a new form instance
				var newForm = new ABViewForm({
					label: dc.label + " Form",
					settings: {
						datacollection: dc.id,
						showLabel: true,
						labelPosition: 'left',
						labelWidth: 120
					}
				}, CurrentApplication);

				// populate fields to a form
				var object = CurrentApplication.objects(obj => obj.id == dc.settings.object)[0];
				if (object) {
					object.fields().forEach((f, index) => {
						newForm.addFieldToForm(f, index);
					});
				}

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


			getDetailView: function (dc) {

				// create a new detail instance
				var newDetail = new ABViewDetail({
					label: "View " + dc.label,
					settings: {
						datacollection: dc.id,
						showLabel: true,
						labelPosition: 'left',
						labelWidth: 120
					}
				}, CurrentApplication);

				// populate fields to a form
				var object = dc.datasource;
				object.fields().forEach((f, index) => {
					newDetail.addFieldToView(f, index);
				});

				return newDetail;
			},


			values: function () {

				if (!CurrentObj) return null;

				// TODO : validate unique page's name 

				var pages = [];
				var views = [];
				var dataCollections = [];
				var formValues = $$(ids.form).getValues();
				var subValues = $$(ids.subObjs).getValues();

				var addPageId = null;
				var editPageId = null;
				var viewPageId = null;

				var addDc = null;
				var editDc = null;

				// Add a 'add' page
				if (formValues.addable) {

					addPageId = OP.Util.uuid();

					// a data collection for edit
					var addDcLabel = "Add " + CurrentObj.label;
					addDc = _logic.getDataCollection(addDcLabel, CurrentObj);
					dataCollections.push(addDc.toObj());

					var addForm = _logic.getFormView(addDc);

					// Add a 'add' page
					pages.push({
						id: addPageId,
						key: ABViewPage.common().key,
						icon: ABViewPage.common().icon,
						name: "Add " + CurrentObj.label,
						settings: {
							type: "popup"
						},
						views: [
							// Title
							{
								key: ABViewLabel.common().key,
								icon: ABViewLabel.common().icon,
								label: "Title",
								text: "Add " + CurrentObj.label,
								settings: {
									format: 1
								}
							},
							// Form
							addForm.toObj()
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

				if (formValues.editable || formValues.showGrid || formValues.viewable) {
					// a data collection for edit
					var editDcLabel = "Edit " + CurrentObj.label;
					editDc = _logic.getDataCollection(editDcLabel, CurrentObj);
					dataCollections.push(editDc.toObj());
				}


				// Add a 'edit' page
				if (formValues.editable) {

					editPageId = OP.Util.uuid();

					var editForm = _logic.getFormView(editDc);

					// Add a 'edit' page
					pages.push({
						id: editPageId,
						key: ABViewPage.common().key,
						icon: ABViewPage.common().icon,
						name: "Edit " + CurrentObj.label,
						settings: {
							type: "popup"
						},
						views: [
							// Title
							{
								key: ABViewLabel.common().key,
								icon: ABViewLabel.common().icon,
								label: "Title",
								text: "Edit " + CurrentObj.label,
								settings: {
									format: 1
								}
							},
							// Form
							editForm.toObj()
						]
					});

				}

				// View page
				if (formValues.viewable) {

					viewPageId = OP.Util.uuid();

					var newDetail = _logic.getDetailView(editDc);
					newDetail.position = newDetail.position || {};
					newDetail.position.y = 1;

					var viewsOfDetail = [
						// Title
						{
							key: ABViewLabel.common().key,
							icon: ABViewLabel.common().icon,
							label: "Title",
							text: "View " + CurrentObj.label,
							settings: {
								format: 1
							},
							position: {
								y: 0
							}
						},
						// Detail
						newDetail.toObj()
					];

					// define sub-pages to menu
					var menuSubPages = [];
					if (addPageId)
						menuSubPages.push(addPageId);

					Object.keys(subValues).forEach((key, i) => {
						if (subValues[key]) { // Check
							var vals = key.split('|');
							var objId = vals[0];
							var flag = vals[1]; // 'list' or 'form'

							var childObj = CurrentApplication.objects(obj => obj.id == objId)[0];

							// Add grids of sub-dcs
							if (flag == 'list') {

								// create a data collection
								var dcLabel = "Edit " + childObj.label;
								var childEditDc = _logic.getDataCollection(dcLabel, childObj, editDc);
								dataCollections.push(childEditDc.toObj());

								viewsOfDetail.push(
									// Title
									{
										key: ABViewLabel.common().key,
										icon: ABViewLabel.common().icon,
										label: "Title",
										text: childObj.label,
										settings: {
											format: 1
										},
										position: {
											y: viewsOfDetail.length + 1
										}
									},
									// Grid
									{
										key: ABViewGrid.common().key,
										icon: ABViewGrid.common().icon,
										label: childObj.label + "'s grid",
										settings: {
											dataSource: childEditDc.id,
											height: 300
										},
										position: {
											y: viewsOfDetail.length + 2
										}
									}
								);
							}
							// Create a new page with form
							else if (flag == 'form') {

								var subPageId = OP.Util.uuid();

								// create a data collection
								var dcLabel = "Add " + childObj.label;
								var childAddDc = _logic.getDataCollection(dcLabel, childObj, editDc);
								dataCollections.push(childAddDc.toObj());

								// add to menu
								menuSubPages.push(subPageId);

								var newForm = _logic.getFormView(childAddDc);

								pages.push({
									id: subPageId,
									key: ABViewPage.common().key,
									icon: ABViewPage.common().icon,
									name: "Add " + childObj.label,
									settings: {
										type: "popup"
									},
									views: [
										// Title
										{
											key: ABViewLabel.common().key,
											icon: ABViewLabel.common().icon,
											label: "Title",
											text: "Add " + childObj.label,
											settings: {
												format: 1
											}
										},
										// Form
										newForm.toObj()
									]
								});
							}


						}
					});

					// Menu
					viewsOfDetail.splice(1, 0, {
						key: ABViewMenu.common().key,
						icon: ABViewMenu.common().icon,
						label: "Menu",
						settings: {
							pages: menuSubPages
						},
						position: {
							y: 2
						}
					});

					pages.push({
						id: viewPageId,
						key: ABViewPage.common().key,
						icon: ABViewPage.common().icon,
						name: "View " + CurrentObj.label,
						settings: {
							type: "popup"
						},
						views: viewsOfDetail
					});

				}

				// Add a grid to show data of data source
				if (formValues.showGrid) {

					views.push({
						key: ABViewGrid.common().key,
						icon: ABViewGrid.common().icon,
						label: CurrentObj.label,
						settings: {
							dataSource: editDc.id,
							height: 300,
							editPage: formValues.editable ? editPageId : null,
							detailsPage: formValues.viewable ? viewPageId : null
						}
					});

				}

				// Edit form
				if (formValues.formAdd) {

					// a data collection for add
					var addDcLabel = "Add " + CurrentObj.label;
					if (addDc == null)
						addDc = _logic.getDataCollection(addDcLabel, CurrentObj);
					dataCollections.push(addDc.toObj());

					// add the title to the form
					views.push({
						key: ABViewLabel.common().key,
						icon: ABViewLabel.common().icon,
						label: "Title",
						text: 'Add ' + CurrentObj.label,
						settings: {
							format: 1
						}
					});

					var editForm = _logic.getFormView(addDc);

					// add the new form to page
					views.push(editForm.toObj());

				}


				return {
					parent: CurrentPage, // should be either null or an {}
					name: CurrentObj.label,
					key: ABViewPage.common().key,
					views: views,
					pages: pages,

					// data collection list will add to the root page
					dataCollections: dataCollections
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
								id: ids.selectObject,
								name: "datacollection",
								label: "Select a data source",
								labelWidth: 170,
								options: [],
								on: { onChange: _logic.selectObject }
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
								id: ids.subObjs,
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