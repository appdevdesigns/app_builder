
/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */

import ABListNewObject from "./ab_work_object_list_newObject"
import ABListEditMenu from "./ab_common_popupEditMenu"   // "./ab_work_object_list_popupEditMenu"



export default class AB_Work_Object_List extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App) {
		super(App, 'ab_work_object_list');
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {

				// formHeader: L('ab.application.form.header', "*Application Info"),
				addNew: L('ab.object.addNew', '*Add new object'),

				confirmDeleteTitle: L('ab.object.delete.title', "*Delete object"),
				confirmDeleteMessage: L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")
			}
		}

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

			list: this.unique('editlist'),
			searchText: this.unique('searchText'),
			buttonNew: this.unique('buttonNew')

		}


		// There is a Popup for adding a new Object:
		var PopupNewObjectComponent = new ABListNewObject(App);

		// the popup edit list for each entry in the list.
		var PopupEditObjectComponent = new ABListEditMenu(App);



		// Our webix UI definition:
		this.ui = {
			id:ids.component,
			rows: [
				{
					view: "accordion",
					multi: true,
					collapsed: true,
					css: "ab-object-list-filter",
					rows: [
						{
							header: "Settings",
							headerHeight: 30,
							headerAltHeight: 30,
							body: {
								rows: [
									{
										id: ids.searchText,
										view: "search",
										icon: "search",
										label: L('ab.object.list.search', "*Search"),
										labelWidth: 80,
										placeholder: L('ab.object.list.search.placeholder', "*Object name"),
										height: 35,
										keyPressTimeout: 100,
										on: {
											onTimedKeyPress: function() {
												_logic.listSearch();
											}
										}
									},
									{
										view: "segmented",
										label: L('ab.object.list.sort', "*Sort"),
										labelWidth: 80,
										height: 35,
										options: [
											{ id: "asc", value: "A -> Z" },
											{ id: "desc", value: "Z -> A" }
										],
										on: {
											onChange: (newVal, oldVal) => {
												_logic.listSort(newVal);
											}
										}
									},
									{
										view: "checkbox",
										label: L('ab.object.list.group', "*Group"),
										labelWidth: 80,
										on: {
											onChange: (newVal, oldVal) => {
												_logic.listGroup(newVal);
											}
										}
									}
								]
							}
						}
					]
				},
				{
					view: App.custom.editunitlist.view, // "editunitlist"
					id: ids.list,
					width: App.config.columnWidthLarge,

					select: true,

					editaction: 'custom',
					editable: true,
					editor: "text",
					editValue: "label",

					uniteBy: function(item) {
						return "   ";
					},
					template: function(obj, common) {
						return _logic.templateListItem(obj, common);
					},
					type: {
						height: 35,
						iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
					},
					on: {
						onAfterRender: function () {
							_logic.onAfterRender();
						},
						onAfterSelect: function (id) {
							_logic.selectObject(id);
						},
						onBeforeEditStop: function (state, editor) {
							_logic.onBeforeEditStop(state, editor);
						},
						onAfterEditStop: function (state, editor, ignoreUpdate) {
							_logic.onAfterEditStop(state, editor, ignoreUpdate);
						}
					},
					onClick: {
						"ab-object-list-edit": function (e, id, trg) {
							_logic.clickEditMenu(e, id, trg);
						}
					}
				},
				{
					view: 'button',
					id: ids.buttonNew,
					value: labels.component.addNew,
					click: function () {
						_logic.clickNewObject();
					}
				}
			]
		};



		var CurrentApplication = null;
		var objectList = null;


		// Our init() function for setting up our UI
		this.init = () => {

			if ($$(ids.component))
				$$(ids.component).adjust();

			if ($$(ids.list)) {
				webix.extend($$(ids.list), webix.ProgressBar);
				$$(ids.list).adjust();
			}

			PopupNewObjectComponent.init({
				onDone: _logic.callbackNewObject
			});

			PopupEditObjectComponent.init({
				onClick: _logic.callbackObjectEditorMenu
			})
		}



		// our internal business logic
		var _logic = this._logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object List from the provided ABApplication
			 *
			 * If no ABApplication is provided, then show an empty form. (create operation)
			 *
			 * @param {ABApplication} application  	[optional] The current ABApplication
			 *										we are working with.
			 */
			applicationLoad : function(application){
				_logic.listBusy();

				CurrentApplication = application;

				// get a DataCollection of all our objects
				objectList = new webix.DataCollection({
					data: application.objects(),
				});

				// sort objects
				_logic.listSort('asc');

				// clear our list and display our objects:
				var List = $$(ids.list);
				List.clearAll();
				List.data.unsync();
				List.data.sync(objectList);
				List.refresh();
				List.unselectAll();



				//
				_logic.listReady();


				// prepare our Popup with the current Application
				PopupNewObjectComponent.applicationLoad(application);

			},


			clickEditMenu: function(e, id, trg) {
				// Show menu
				PopupEditObjectComponent.show(trg);

				return false;
			},


			listBusy:function() {
				$$(ids.list).showProgress({ type: "icon" });
			},

			listReady:function() {
				$$(ids.list).hideProgress();
			},

			listSearch: function() {
				var searchText = $$(ids.searchText).getValue().toLowerCase();

				$$(ids.list).filter(function (item) {
					return item.label.toLowerCase().indexOf(searchText) > -1;
				});
			},

			listSort: function(sortType) {
				if (objectList == null) return;

				objectList.sort("label", sortType);

				_logic.listSearch();
			},

			listGroup: function(isGroup) {
				if (isGroup == true) {
					$$(ids.list).define("uniteBy", (item) => {
						return item.label.substr(0,1); 
					});
				}
				else {
					$$(ids.list).define("uniteBy", (item) => {
						return "   "; 
					});
				}

				$$(ids.list).refresh();
			},

			onAfterEditStop: function(state, editor, ignoreUpdate) {

				_logic.showGear(editor.id);

				if (state.value != state.old) {
					_logic.listBusy();

					var selectedObject = $$(ids.list).getSelectedItem(false);
					selectedObject.label = state.value;

					// Call server to rename
					selectedObject.save()
						.catch(function () {
							_logic.listReady();

							OP.Dialog.Alert({
								text: labels.common.renameErrorMessage.replace("{0}", state.old)
							});

						})
						.then(function () {
							_logic.listReady();

							// TODO : should use message box
							OP.Dialog.Alert({
								text: labels.common.renameSuccessMessage.replace("{0}", state.value)
							});

						});
				}
			},

			onBeforeEditStop: function(state, editor) {

				var selectedObject = $$(ids.list).getSelectedItem(false);
				selectedObject.label = state.value;

				var validator = selectedObject.isValid();
				if (validator.fail()) {
					selectedObject.label = state.old;

					return false; // stop here.
				}

				return true;
			},


			/**
			 * @function selectObject()
			 *
			 * Perform these actions when an Object is selected in the List.
			 */
			selectObject: function (id) {

				var object = $$(ids.list).getItem(id);
				App.actions.populateObjectWorkspace(object);

	//// TODO: do we need these?

				// // Refresh unsync number
				// self.refreshUnsyncNumber();

				_logic.showGear(id);
			},

			showGear: function(id) {
				var gearIcon = $$(ids.list).getItemNode(id).querySelector('.ab-object-list-edit');
				gearIcon.style.visibility = "visible";
				gearIcon.style.display = "block";
			},

			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show:function() {

				$$(ids.component).show();
			},



			/**
			 * @function templateListItem
			 *
			 * Defines the template for each row of our ObjectList.
			 *
			 * @param {obj} obj the current instance of ABObject for the row.
			 * @param {?} common the webix.common icon data structure
			 * @return {string}
			 */
			templateListItem: function(obj, common) {
				return _templateListItem
					.replace('#label#', obj.label || '??label??')
					.replace('{common.iconGear}', common.iconGear);
			},


			/**
			 * @function callbackNewObject
			 *
			 * Once a New Object was created in the Popup, follow up with it here.
			 */
			callbackNewObject:function(err, object){

				if (err) {
					OP.Error.log('Error creating New Object', {error: err});
					return;
				}

				objectList.add(object);

				$$(ids.list).select(object.id);

			},


			/**
			 * @function clickNewObject
			 *
			 * Manages initiating the transition to the new Object Popup window
			 */
			clickNewObject:function() {

				// show the new popup
				PopupNewObjectComponent.show();
			},

			rename: function () {
				var objectId = $$(ids.list).getSelectedId(false);
				$$(ids.list).edit(objectId);
			},

			remove: function () {

				var selectedObject = $$(ids.list).getSelectedItem(false);

				// verify they mean to do this:
				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteTitle,
					message: labels.component.confirmDeleteMessage.replace('{0}', selectedObject.label),
					callback: (isOK) => {

						if (isOK) {
							_logic.listBusy();

							selectedObject.destroy()
								.then(() => {
									_logic.listReady();

									objectList.remove(selectedObject.id);

									App.actions.clearObjectWorkspace();
								});

						}
					}
				})
			},

			callbackObjectEditorMenu: function (action) {
				switch (action) {
					case 'rename':
						_logic.rename();
						break;
					case 'delete':
						_logic.remove();
						break;
				}
			}
		}


		/*
		 * _templateListItem
		 *
		 * The Object Row template definition.
		 */
		var _templateListItem = [
			"<div class='ab-object-list-item'>",
				"#label#",
				// "{common.unsyncNumber}",
				"{common.iconGear}",
			"</div>",
		].join('');



		// Expose any globally accessible Actions:
		this.actions({


			/**
			 * @function getSelectedObject
			 *
			 * returns which ABObject is currently selected.
			 * @return {ABObject}  or {null} if nothing selected.
			 */
			getSelectedObject:function() {
				return $$(ids.list).getSelectedItem();
			},

		})


		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;

	}

}
