
/*
 * ab_work_process_list
 *
 * Manage the Process List
 *
 */

// import ABListNewProcess from "./ab_work_process_list_newProcess"
// import ABListEditMenu from "./ab_common_popupEditMenu"   // "./ab_work_process_list_popupEditMenu"



export default class AB_Work_Process_List extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App) {
		super(App, 'ab_work_process_list');
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {

				addNew: L('ab.process.addNew', '*Add new process'),

				confirmDeleteTitle: L('ab.process.delete.title', "*Delete Process"),
				title: L('ab.process.list.title', '*Process'),
				searchPlaceholder: L('ab.process.list.search.placeholder', "*Process name"),

				// we can reuse some of the Object ones:
				confirmDeleteMessage: L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?"),
				listSearch: L('ab.object.list.search', "*Search"),
				listSetting: L('ab.object.list.setting', "*Setting"),
				listSort: L('ab.object.list.sort', "*Sort"),
				listAsc: L('ab.object.list.sort.asc', "*A -> Z"),
				listDesc: L('ab.object.list.sort.desc', "*Z -> A"),
				listGroup: L('ab.object.list.group', "*Group"),
			}
		}

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

			listSetting: this.unique('listsetting'),
			list: this.unique('editlist'),
			searchText: this.unique('searchText'),
			sort: this.unique('sort'),
			group: this.unique('group'),
			buttonNew: this.unique('buttonNew')

		}


		// There is a Popup for adding a new Process:
// var PopupNewProcessComponent = new ABListNewProcess(App);

		// the popup edit list for each entry in the list.
// var PopupEditProcessComponent = new ABListEditMenu(App);

		// console.log("look here------------------>", App.custom.editunitlist.view);

		// Our webix UI definition:
		this.ui = {
			id:ids.component,
			rows: [
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
						return labels.component.title;
					},
					template: function(obj, common) {
						return _logic.templateListItem(obj, common);
					},
					type: {
						height: 35,
						headerHeight:35,
						iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa fa-cog'></span></div>"
					},
					on: {
						onAfterSelect: function (id) {
							_logic.selectProcess(id);
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
					view: "accordion",
					multi: true,
					css: "ab-object-list-filter",
					rows: [
						{
							id: ids.listSetting,
							header: labels.component.listSetting,
							headerHeight: 45,
							headerAltHeight: 45,
							body: {
								padding: 5,
								rows: [
									{
										id: ids.searchText,
										view: "search",
										icon: "fa fa-search",
										label: labels.component.listSearch,
										labelWidth: 80,
										placeholder: labels.component.searchPlaceholder,
										height: 35,
										keyPressTimeout: 100,
										on: {
											onTimedKeyPress: function() {
												_logic.listSearch();
												_logic.save();
											}
										}
									},
									{
										id: ids.sort,
										view: "segmented",
										label: labels.component.listSort,
										labelWidth: 80,
										height: 35,
										options: [
											{ id: "asc", value: labels.component.listAsc },
											{ id: "desc", value: labels.component.listDesc }
										],
										on: {
											onChange: (newVal, oldVal) => {
												_logic.listSort(newVal);
												_logic.save();
											}
										}
									},
									{
										id: ids.group,
										view: "checkbox",
										label: labels.component.listGroup,
										labelWidth: 80,
										on: {
											onChange: (newVal, oldVal) => {
												_logic.listGroup(newVal);
												_logic.save();
											}
										}
									}
								]
							}
						}
					],
					on: {
						onAfterCollapse: (id) => {
							_logic.listSettingCollapse();
							_logic.save();
						},
						onAfterExpand: (id) => {
							_logic.listSettingExpand();
							_logic.save();
						}
					}
				},
				{
					view: 'button',
					id: ids.buttonNew,
					value: labels.component.addNew,
					type: "form",
					click: function () {
						_logic.clickNewProcess(true); // pass true so it will select the new object after you created it
					}
				}
			]
		};



		var CurrentApplication = null;
		var processList = null;

		let _initialized = false;
		let _settings = {};


		// Our init() function for setting up our UI
		this.init = (options) => {

            // register our callbacks:
            for (var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }

			if ($$(ids.component))
				$$(ids.component).adjust();

			if ($$(ids.list)) {
				webix.extend($$(ids.list), webix.ProgressBar);
				$$(ids.list).adjust();
			}

// PopupNewProcessComponent.init({
// 	onDone: _logic.callbackNewProcess
// });

// PopupEditProcessComponent.init({
// 	onClick: _logic.callbackProcessEditorMenu,
// 	hideCopy: true
// })

			_settings = webix.storage.local.get("process_settings") || {
				objectlistIsOpen: false,
				objectlistSearchText: "",
				objectlistSortDirection: "",
				objectlistIsGroup: false
			};

			// mark initialed
			_initialized = true;

		}



		// our internal business logic
		var _logic = this._logic = {

			callbacks: {
				
				/**
				 * @function onChange
				 */
				onChange: function () { }
			},


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Process List from the provided ABApplication
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
debugger;
				processList = new webix.DataCollection({
					data: application.processes(),
				});

				// setup object list settings
				$$(ids.listSetting).getParentView().blockEvent();
				$$(ids.listSetting).define("collapsed", _settings.objectlistIsOpen != true);
				$$(ids.listSetting).refresh();
				$$(ids.listSetting).getParentView().unblockEvent();
				
				$$(ids.searchText).blockEvent();
				$$(ids.searchText).setValue(_settings.objectlistSearchText);
				$$(ids.searchText).unblockEvent();

				$$(ids.sort).blockEvent();
				$$(ids.sort).setValue(_settings.objectlistSortDirection);
				$$(ids.sort).unblockEvent();
				
				$$(ids.group).blockEvent();
				$$(ids.group).setValue(_settings.objectlistIsGroup);
				$$(ids.group).unblockEvent();


				// clear our list and display our objects:
				var List = $$(ids.list);
				List.clearAll();
				List.data.unsync();
				List.data.sync(processList);
				List.refresh();
				List.unselectAll();


				// sort objects
				_logic.listSort(_settings.objectlistSortDirection);

				// filter object list
				_logic.listSearch();


				// hide progress loading cursor
				_logic.listReady();


				// prepare our Popup with the current Application
// PopupNewProcessComponent.applicationLoad(application);

			},


			clickEditMenu: function(e, id, trg) {
				// Show menu
				PopupEditProcessComponent.show(trg);

				return false;
			},

			listSettingCollapse: function() {

				// if (CurrentApplication && CurrentApplication.objectlistIsOpen != false) {
				// 	CurrentApplication.objectlistIsOpen = false;

				_settings.objectlistIsOpen = false;

				// }

			},

			listSettingExpand: function() {
				// if (CurrentApplication && CurrentApplication.objectlistIsOpen != true) {
				// 	CurrentApplication.objectlistIsOpen = true;

				_settings.objectlistIsOpen = true;

				// }
			},

			listBusy:function() {
				if ($$(ids.list) &&
					$$(ids.list).showProgress)
					$$(ids.list).showProgress({ type: "icon" });
			},

			listReady:function() {
				if ($$(ids.list) &&
					$$(ids.list).hideProgress)
					$$(ids.list).hideProgress();
			},

			listSearch: function() {
				var searchText = $$(ids.searchText).getValue().toLowerCase();

				$$(ids.list).filter(function (item) {
					return !item.label || item.label.toLowerCase().indexOf(searchText) > -1;
				});

				// if (CurrentApplication && CurrentApplication.objectlistSearchText != searchText) {

				_settings.objectlistSearchText = searchText;

				// }

			},

			listSort: function(sortType) {
				if (processList == null) return;

				processList.sort("label", sortType);

				_logic.listSearch();

				// // save to database
				// if (CurrentApplication && CurrentApplication.objectlistSortDirection != sortType) {
				// CurrentApplication.objectlistSortDirection = sortType;

				_settings.objectlistSortDirection = sortType;

				// }

			},

			listGroup: function(isGroup) {
				if (isGroup == true) {
					$$(ids.list).define("uniteBy", (item) => {
						return item.label.toUpperCase().substr(0,1);
					});
				}
				else {
					$$(ids.list).define("uniteBy", (item) => {
						return labels.component.title;
					});
				}

				$$(ids.list).refresh();

				// // save to database
				// if (CurrentApplication && CurrentApplication.objectlistIsGroup != isGroup) {
				// 	CurrentApplication.objectlistIsGroup = isGroup;

				_settings.objectlistIsGroup = isGroup;

				// }

			},

			listCount: function() {
				if ($$(ids.list))
					return $$(ids.list).count();
			},

			onAfterEditStop: function(state, editor, ignoreUpdate) {

				_logic.showGear(editor.id);

				if (state.value != state.old) {
					_logic.listBusy();

					var selectedProcess = $$(ids.list).getSelectedItem(false);
					selectedProcess.label = state.value;

					// Call server to rename
					selectedProcess.save()
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

				var selectedProcess = $$(ids.list).getSelectedItem(false);
				selectedProcess.label = state.value;

				var validator = selectedProcess.isValid();
				if (validator.fail()) {
					selectedProcess.label = state.old;

					return false; // stop here.
				}

				return true;
			},

			/**
			 * @function save()
			 * 
			 */
			save: function() {

				// if this UI does not be initialed, then skip it
				if (!_initialized) return;

				// CurrentApplication.save();
				webix.storage.local.put("process_settings", _settings);

			},


			/**
			 * @function selectProcess()
			 *
			 * Perform these actions when an Process is selected in the List.
			 */
			selectProcess: function (id) {

				var object = $$(ids.list).getItem(id);

				_logic.callbacks.onChange(object);

				_logic.showGear(id);
			},

			showGear: function(id) {

				let $item = $$(ids.list).getItemNode(id);
				if ($item) {
					let gearIcon = $item.querySelector('.ab-object-list-edit');
					if (gearIcon) {
						gearIcon.style.visibility = "visible";
						gearIcon.style.display = "block";
					}
				}

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
			 * Defines the template for each row of our ProcessList.
			 *
			 * @param {obj} obj the current instance of ABProcess for the row.
			 * @param {?} common the webix.common icon data structure
			 * @return {string}
			 */
			templateListItem: function(obj, common) {
				return _templateListItem
					.replace('#label#', obj.label || '??label??')
					.replace('{common.iconGear}', common.iconGear);
			},


			/**
			 * @function callbackNewProcess
			 *
			 * Once a New Process was created in the Popup, follow up with it here.
			 */
			callbackNewProcess:function(err, object, selectNew, callback){

				if (err) {
					OP.Error.log('Error creating New Process', {error: err});
					return;
				}

				let objects = CurrentApplication.objects();
				processList.parse(objects);

				// if (processList.exists(object.id))
				// 	processList.updateItem(object.id, object);
				// else
				// 	processList.add(object);

				if (selectNew != null && selectNew == true) {
					$$(ids.list).select(object.id);
				}
				else if (callback) {
					callback();
				}

			},


			/**
			 * @function clickNewProcess
			 *
			 * Manages initiating the transition to the new Process Popup window
			 */
			clickNewProcess:function(selectNew, callback) {
				// show the new popup
				PopupNewProcessComponent.show(selectNew, callback);
			},

			exclude: function() {
				var objectId = $$(ids.list).getSelectedId(false);

				_logic.listBusy();

				CurrentApplication.objectExclude(objectId)
					.then(() => {

						processList.remove(objectId);

						_logic.listReady();

						// clear object workspace
						_logic.callbacks.onChange(null);
					});

			},

			rename: function () {
				var objectId = $$(ids.list).getSelectedId(false);
				$$(ids.list).edit(objectId);
			},

			remove: function () {

				var selectedProcess = $$(ids.list).getSelectedItem(false);

				// verify they mean to do this:
				OP.Dialog.Confirm({
					title: labels.component.confirmDeleteTitle,
					message: labels.component.confirmDeleteMessage.replace('{0}', selectedProcess.label),
					callback: (isOK) => {

						if (isOK) {
							_logic.listBusy();

							selectedProcess.destroy()
								.then(() => {
									_logic.listReady();

									processList.remove(selectedProcess.id);

									// refresh items list
									_logic.callbackNewProcess();

									// clear object workspace
									_logic.callbacks.onChange(null);
								});

						}
					}
				})
			},

			callbackProcessEditorMenu: function (action) {
				switch (action) {
					case 'rename':
						_logic.rename();
						break;
					case 'exclude':
						_logic.exclude();
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
		 * The Process Row template definition.
		 */
		var _templateListItem = [
			"<div class='ab-object-list-item'>",
				"#label#",
				"{common.iconGear}",
			"</div>",
		].join('');



		// Expose any globally accessible Actions:
		this.actions({


			/**
			 * @function getSelectedProcess
			 *
			 * returns which ABProcess is currently selected.
			 * @return {ABProcess}  or {null} if nothing selected.
			 */
			getSelectedProcess:function() {
				return $$(ids.list).getSelectedItem();
			},

			addNewProcess:function(selectNew, callback) {
				_logic.clickNewProcess(selectNew, callback);
			}

		})


		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.busy = _logic.listBusy;
		this.ready = _logic.listReady;
		this.count = _logic.listCount;

	}

}