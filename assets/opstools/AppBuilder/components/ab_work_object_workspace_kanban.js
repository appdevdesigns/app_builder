
/*
 * ab_work_object_workspace_kanban
 *
 * Manage the Object Workspace KanBan area.
 *
 */

import ABFieldList from "../classes/dataFields/ABFieldList";
import ABFieldUser from "../classes/dataFields/ABFieldUser";

import AB_Work_Form from "app_builder/assets/opstools/AppBuilder/components/ab_work_object_workspace_formSidePanel"
import ABFieldConnect from "app_builder/assets/opstools/AppBuilder/classes/dataFields/ABFieldConnect";


export default class ABWorkObjectKanBan extends OP.Component {

	/**
	 * 
	 * @param {*} App 
	 * @param {*} idBase 
	 */

	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_kanban';
		super(App, idBase);

		var L = this.Label;
		var labels = {
			common: App.labels,
			component: {
				confirmDeleteCardTitle: L('ab.object.deleteCard.title', "*Remove card"),
				confirmDeleteCardMessage: L('ab.object.deleteCard.message', "*Do you want to delete this card?")
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique(idBase + '_workspace_kanban'),
			kanban: this.unique(idBase + '_kanban'),
			resizer: this.unique(idBase + '_resizer'),
		}

		let FormSide = new AB_Work_Form(App, idBase + '_kanban_form');

		var CurrentObject = null;	// current ABObject being displayed
		var CurrentDC = null;
		var CurrentVerticalField = null;
		var CurrentHorizontalField = null;
		var CurrentOwnerField = null;

		let _updatingOwnerRowId;

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			cols: [
				{
					id: ids.kanban,
					view: "kanban",
					cols: [],
					userList: {
						view: 'menu',
						yCount: 8,
						// scroll: false,
						template: '<i class="fa fa-user"></i> #value#',
						width: 150,
						on: {
							onSelectChange: function () {

								if (_updatingOwnerRowId == null) // get this row id from onAvatarClick event
									return;

								let userId = this.getSelectedId(false);
								if (userId == null)
									return;

								_logic.updateOwner(_updatingOwnerRowId, userId);
							}
						}
					},
					editor: false, // we use side bar
					users: [],
					tags: [],
					data: [],
					on: {
						onListAfterSelect: (itemId, list) => {
							if (itemId) {
								let data = $$(ids.kanban).getItem(itemId);
								FormSide.show(data);
							}
							else
								FormSide.hide();
						},
						onAfterStatusChange: (rowId, status, list) => {

							_logic.updateStatus(rowId, status);

						},
						onAvatarClick: function (rowId, ev, node, list) {

							// keep this row id for update owner data in .userList
							_updatingOwnerRowId = rowId;

						},
					}
				},
				{
					id: ids.resizer,
					view: "resizer",
					borderless: true,
				},
				FormSide.ui
			]
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			webix.extend($$(ids.kanban), webix.ProgressBar);

			FormSide.init({
				onAddData: _logic.saveData,
				onUpdateData: _logic.saveData,
				onClose: _logic.unselect
			})

		}


		// our internal business logic
		var _logic = this._logic = {

			kanbanListTemplate: function () {

				return {
					icons: [
						// { icon: "mdi mdi-comment", show: function (obj) { return !!obj.comments }, template: "#comments.length#" },
						{
							icon: "fa fa-trash-o", click: function (rowId, e) {

								_logic.removeCard(rowId);

							}
						}
					],
					// avatar template
					templateAvatar: function (obj) {
						if (CurrentOwnerField && obj[CurrentOwnerField.columnName]) {
							return CurrentOwnerField.format(obj);
						}
						else {
							return "<span class='webix_icon fa fa-user'></span>";
						}
					},
					// template for item body
					// show item image and text
					templateBody: function (data) {

						return CurrentObject.displayData(data);

						// var html = "";
						// if (obj.image)
						// 	html += "<img class='image' src='../common/imgs/attachments/" + obj.image + "'/>";
						// html += "<div>" + obj.text + "</div>";
						// return html;
					}
				};
			},

			/**
			 * @function hide()
			 *
			 * hide this component.
			 */
			hide: function () {
				$$(ids.component).hide();
			},


			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {

				$$(ids.component).show();

				FormSide.hide();

				if (!CurrentObject) return;

				// Get object's kanban view
				let kanbanView = CurrentObject.workspaceViews.getCurrentView();
				if (!kanbanView || kanbanView.type != "kanban") return;

				// Get vertical grouping field and populate to kanban list
				// NOTE: this field should be the select list type
				CurrentVerticalField = kanbanView.getVerticalGroupingField();
				if (!CurrentVerticalField) return;

				let horizontalOptions = [];
				CurrentHorizontalField = kanbanView.getHorizontalGroupingField();

				Promise.resolve()
					.then(() => {

						return new Promise((next, err) => {

							if (!CurrentHorizontalField || !(CurrentHorizontalField instanceof ABFieldConnect))
								return next();

							// Pull horizontal options
							CurrentHorizontalField.getOptions()
								.catch(err)
								.then(options => {

									horizontalOptions = options;

									next();

								});

						});

					})
					.then(() => {

						return new Promise((next, err) => {

							// Option format -  { id: "1543563751920", text: "Normal", hex: "#4CAF50" }
							let verticalOptions = (CurrentVerticalField.settings.options || []).map(opt => {

								// Vertical & Horizontal fields
								if (CurrentVerticalField && CurrentHorizontalField) {

									let rows = [],
										// [{
										//		id: '',
										//		text: ''
										// }]
										horizontalVals = [];

									// pull options of the Horizontal field
									if (CurrentHorizontalField instanceof ABFieldList) {
										horizontalVals = CurrentHorizontalField.settings.options;
									}
									else if (CurrentHorizontalField instanceof ABFieldUser) {
										horizontalVals = CurrentHorizontalField.getUsers().map(u => {
											return {
												id: u.id,
												text: u.text || u.value
											}
										});
									}
									else if (CurrentHorizontalField instanceof ABFieldConnect) {

										horizontalVals = horizontalOptions.map(({ id, text }) => ({ id, text }));

									}

									horizontalVals.push({
										id: "",
										text: "Other"
									});

									horizontalVals.forEach(val => {

										let statusOps = {};
										statusOps[CurrentVerticalField.columnName] = opt.id;
										statusOps[CurrentHorizontalField.columnName] = val.id;

										// Header
										rows.push({
											template: val.text,
											height: 20,
											css: "progress_header"
										});

										// Kanban list
										rows.push({
											view: "kanbanlist",
											status: statusOps,
											type: _logic.kanbanListTemplate()
										});

									});

									return {
										header: opt.text,
										body: {
											margin: 0,
											rows: rows
										}
									};

								}
								// Vertical field only
								else if (CurrentVerticalField) {

									let statusOps = {};
									statusOps[CurrentVerticalField.columnName] = opt.id;

									return {
										header: opt.text,
										body: {
											view: "kanbanlist",
											status: statusOps,
											type: _logic.kanbanListTemplate()
										}
									};

								}

							});

							// Rebuild kanban that contains options
							// NOTE: webix kanban does not support dynamic vertical list
							webix.ui(verticalOptions, $$(ids.kanban));
							$$(ids.kanban).reconstruct();

							// Owner field
							CurrentOwnerField = kanbanView.getOwnerField();
							if (CurrentOwnerField) {

								let $menuUser = $$(ids.kanban).getUserList();
								$menuUser.clearAll();

								if (CurrentOwnerField instanceof ABFieldUser) {
									let users = OP.User.userlist().map(u => {
										return {
											id: u.username,
											value: u.username
										};
									});

									$menuUser.parse(users);
								}

								else if (CurrentOwnerField instanceof ABFieldConnect) {
									CurrentOwnerField.getOptions().then(options => {

										$menuUser.parse(options.map(opt => {
											return {
												id: opt.id,
												value: opt.text
											};
										}));

									});

								}


							}


							next();

						});
					});

			},

			busy: function () {

				if ($$(ids.kanban).showProgress)
					$$(ids.kanban).showProgress({ type: "icon" });

			},

			ready: function () {

				if ($$(ids.kanban).hideProgress)
					$$(ids.kanban).hideProgress();

			},

			objectLoad: (object) => {

				CurrentObject = object;

				FormSide.objectLoad(object);

			},

			/**
			 * @method dataCollectionLoad
			 * 
			 * @param dataCollection {ABViewDataCollection}
			 */
			dataCollectionLoad: (dataCollection) => {

				CurrentDC = dataCollection;

				if (CurrentDC)
					CurrentDC.bind($$(ids.kanban));
				else
					$$(ids.kanban).unbind();

			},


			updateStatus: function (rowId, status) {

				if (!CurrentVerticalField) return;

				// Show loading cursor
				_logic.busy();

				let patch = {};

				// update multi-values
				if (status instanceof Object) {
					patch = status;
				}
				// update single value
				else {
					patch[CurrentVerticalField.columnName] = status;
				}


				CurrentObject.model()
					.update(rowId, patch)
					.then(() => {

						_logic.ready();

					})
					.catch((err) => {

						OP.Error.log('Error saving item:', { error: err });

						_logic.ready();

					});

			},

			updateOwner: function (rowId, val) {

				if (!CurrentOwnerField) return;

				// Show loading cursor
				_logic.busy();

				let patch = {};
				patch[CurrentOwnerField.columnName] = val;

				CurrentObject.model()
					.update(rowId, patch)
					.then(updatedRow => {

						// update card
						$$(ids.kanban).updateItem(rowId, updatedRow);

						_logic.ready();

					})
					.catch((err) => {

						OP.Error.log('Error saving item:', { error: err });

						_logic.ready();

					});

			},

			saveData(data) {

				// update
				if (data.id && $$(ids.kanban).exists(data.id)) {
					$$(ids.kanban).updateItem(data.id, data);
				}
				// insert
				else {
					$$(ids.kanban).add(data);
				}

			},

			unselect: function () {

				$$(ids.kanban).eachList(function (list, status) {
					if (list && list.unselect)
						list.unselect();
				});

			},

			addCard: () => {

				_logic.unselect();

				// show the side form
				FormSide.show();

			},

			removeCard: (rowId) => {

				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteCardTitle,
					text: labels.component.confirmDeleteCardMessage,
					callback: (result) => {
						if (!result) return;

						_logic.busy();

						CurrentObject.model()
							.delete(rowId)
							.then(response => {

								if (response.numRows > 0) {
									$$(ids.kanban).remove(rowId);
								}
								else {

									OP.Dialog.Alert({
										text: 'No rows were effected.  This does not seem right.'
									})

								}

								_logic.ready();
							})
							.catch((err) => {

								OP.Error.log('Error deleting item:', { error: err });

								_logic.ready();

								//// TODO: what do we do here?	
							});

					}
				});

			}


		}



		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;
		this.dataCollectionLoad = _logic.dataCollectionLoad;
		this.addCard = _logic.addCard;

	}

}