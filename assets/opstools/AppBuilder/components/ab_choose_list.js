
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */
import ABApplication from "../classes/ABApplication"
import AB_Choose_List_Menu from "./ab_common_popupEditMenu"


export default class ABChooseList extends OP.Component { 

	constructor(App) {
		super(App, 'ab_choose_list');

		var L = this.Label;

		var labels = {

			common: App.labels,

			component: {
				title: L('ab.application.application', '*Application'),

				createNew: L('ab.application.createNew', '*Add new application'),
				noApplication: L('ab.application.noApplication', "*There is no application data"),

				confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
				confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")					
			}
		}


		var ids = {
			component: 	this.unique('component'),

			uploader: 	this.unique('uploader'),
			list: 		this.unique('list'),
			toolBar: 	this.unique('toolbar'),
			buttonCreateNewApplication: this.unique('buttonNewApp')
		}	

		var MenuComponent = new AB_Choose_List_Menu(App);


		this.ui = {

			id: ids.component,
			responsive:"hide",

			cols: [
				{
					maxWidth: App.config.appListSpacerColMaxWidth,
					minWidth: App.config.appListSpacerColMinWidth,
					width: App.config.appListSpacerColMaxWidth
				},
				{
					responsiveCell:false,
					rows: [
						{
							maxHeight: App.config.appListSpacerRowHeight,
							hidden: App.config.hideMobile
						},
						//
						// ToolBar
						//
						{
							view: "toolbar",
							id: ids.toolBar,
							cols: [
								{ 
			                        view:"button", 
			                        type:"icon", 
			                        icon:"fa fa-male",
			                        width:25,
			                        click:()=>{
			                            this.emit('view.config');
			                        }
			                    },
								{ view: "label", label:labels.component.title, fillspace: true },
								{
									id: ids.buttonCreateNewApplication,
									view: "button",
									label: labels.component.createNew,
									autowidth: true,
									type: "icon",
									icon: "fa fa-plus",
									click: function() {
										// Inform our Chooser we have a request to create an Application:
										App.actions.transitionApplicationForm( /* leave empty for a create */ );
									}
								},
								{
									view: "uploader",
									id: ids.uploader,
									label: labels.common.import,
									autowidth: true,
									upload: '/app_builder/appJSON',
									multiple: false,
									type: "icon",
									icon: "fa fa-upload",
									autosend: true,
									on: {
										onAfterFileAdd: function () {
											_logic.onAfterFileAdd();
										},
										onFileUpload: function (item, response) {
											_logic.onFileUpload(item, response);
										},
										onFileUploadError: function (details, response) {
											_logic.onFileUploadError(details, response);
										}
									}
								}
							]
						},


						//
						// The List of Applications
						//
						{
							id: ids.list,
							view: "list",
							css: 'ab-app-select-list',
							template: function (obj, common) {
								return _logic.templateListItem(obj, common);
							},
							type: {
								height: App.config.appListRowHeight, // Defines item height
								iconGear: "<span class='webix_icon fa fa-cog'></span>"
							},
							select: false,
							onClick: {
								"ab-app-list-item": function (ev, id, trg) {
									return _logic.onClickListItem(ev, id, trg);
								},
								"ab-app-list-edit": function (ev, id, trg) {
									return _logic.onClickListEdit(ev, id, trg);
								}
							}
						},
						{
							maxHeight: App.config.appListSpacerRowHeight,
							hidden: App.config.hideMobile
						}
					]
				},
				{
					maxWidth: App.config.appListSpacerColMaxWidth,
					minWidth: App.config.appListSpacerColMinWidth,
					width: App.config.appListSpacerColMaxWidth
	 			}
			]
		}


		var _data={};


		var _logic = {


			/**
			 * @function busy
			 *
			 * show a busy indicator on our App List
			 */
			busy: function() {
				if ($$(ids.list).showProgress)
					$$(ids.list).showProgress({ icon: 'cursor' });
			},


			callbackApplicationEditorMenu: function(action) {

				var selectedApp = $$(ids.list).getSelectedItem();

				switch (action) {

					case 'edit':
						App.actions.transitionApplicationForm(selectedApp);
						break;

					case 'delete':
						OP.Dialog.ConfirmDelete({
							title: labels.component.confirmDeleteTitle,
							text: labels.component.confirmDeleteMessage.replace('{0}', selectedApp.label),
							callback: function (result) {

								if (!result) return;

								App.actions.deleteApplication(selectedApp);									
							}
						})
						break;

					case 'export':
						// Download the JSON file to disk
						window.location.assign('/app_builder/appJSON/' + selectedApp.id + '?download=1');
						break;
				}

			},


			/**
			 * @function loadData
			 *
			 * Load all the ABApplications and display them in our App List
			 */
			loadData:function(){

				// Get applications data from the server
				_logic.busy();
				ABApplication.allApplications()
					.then(function (data) {

						_logic.ready();

						// make sure our overlay is updated when items are added/removed
						// from our data list.
						data.attachEvent("onAfterAdd", function(id, index){
						    _logic.refreshOverlay();
						});

						data.attachEvent("onAfterDelete", function(id){
							_logic.refreshOverlay();
						})

						_data.listApplications = data;

						_logic.refreshList();
					})
					.catch(function (err) {
						_logic.ready();
						webix.message({
							type: "error",
							text: err
						});
						AD.error.log('App Builder : Error loading application data', { error: err });
					})
			},


			/**
			 * @function onAfterFileAdd
			 *
			 * UI updates for when a file upload is initiated
			 */
			onAfterFileAdd: function () {
				$$(ids.uploader).disable();
				_logic.busy();
			},


			/**
			 * @function onClickListEdit
			 *
			 * UI updates for when the edit gear is clicked
			 */
			onClickListEdit: function(ev, id, trg) {

				var options = [
					{ label: labels.common.edit, icon: "fa fa-pencil-square-o", command:'edit' },
					{ label: labels.common.export, icon: "fa fa-download", command:'export' },
					{ label: labels.common.delete, icon: "fa fa-trash", command:'delete' }
				];

				MenuComponent.menuOptions(options);

				// Show menu
				MenuComponent.show(trg);
				$$(ids.list).select(id);

				return false; // block default behavior
			},


			/**
			 * @function onClickListItem
			 *
			 * An item in the list is selected. So update the workspace with that 
			 * object.
			 */
			onClickListItem: function(ev, id, trg) {
									
				_logic.busy();

				$$(ids.list).select(id);

				var selectedApp = $$(ids.list).getItem(id);

				if (selectedApp) {

					// set the common App so it is accessible for all the Applications views
					selectedApp.App = App;		
					_logic.ready();

					// We've selected an Application to work with
					App.actions.transitionWorkspace( selectedApp );
				}

				return false; // block default behavior
			},


			/**
			 * @function onFileUpload
			 *
			 * The File Upload process finished.
			 */
			onFileUpload: function (item, response) {
				_logic.loadData(); // refresh app list
				$$(ids.uploader).enable();
	            _logic.ready();
	        },


			/**
			 * @function onFileUploadError
			 *
			 * The File Upload process exited with an error.
			 */
	        onFileUploadError: function(details, response) {

				var errorMessage = 'Error: ' + (response && response.message);
				OP.Dialog.Alert({
					text: errorMessage
				});
				// webix.message({
				// 	type: 'error',
				// 	text: errorMessage
				// });
				_logic.loadData(); // refresh app list
				$$(ids.uploader).enable();
	            _logic.ready();
	        },


			/**
			 * @function refreshOverlay
			 *
			 * If we have no items in our list, display a Message.
			 */
			refreshOverlay: function() {
				var appList = $$(ids.list);

				if (!appList.count()) //if no data is available
					appList.showOverlay(labels.component.noApplication);
				else
					appList.hideOverlay();
			},


			/**
			 * @function ready
			 *
			 * remove the busy indicator on our App List
			 */
			ready: function() {
				if ($$(ids.list).hideProgress)
					$$(ids.list).hideProgress();
			},


			/**
			 * @function reset
			 *
			 * Return our App List to an unselected state.
			 */
			reset:function() {
				$$(ids.list).unselectAll();
			},


			/**
			 * @function refreshList
			 *
			 * Apply our list of ABApplication data to our AppList
			 */
			refreshList: function() {

				var appList = $$(ids.list);

				appList.clearAll();
				appList.data.unsync();
				appList.data.sync(_data.listApplications);

				appList.sort("label", "asc");

				_logic.refreshOverlay();

				appList.refresh();

				_logic.ready();
			},


			/**
			 * @function show
			 *
			 * Trigger our List component to show
			 */
			show:function() {
				$$(ids.component).show();
			},


			/**
			 * @function templateListItem
			 *
			 * Defines the template for each row of our AppList.
			 *
			 * @param {obj} obj the current instance of ABApplication for the row.
			 * @param {?} common the webix.common icon data structure
			 * @return {string}
			 */
			templateListItem: function(obj, common) {
				return _templateListItem
					.replace('#label#', obj.label || '')
					.replace('#description#', obj.description || '')
					.replace('{common.iconGear}', common.iconGear);
			}
		}
		this._logic = _logic;


		/*
		 * _templateListItem
		 *
		 * The AppList Row template definition.
		 */
		var _templateListItem = [
			"<div class='ab-app-list-item'>",
				"<div class='ab-app-list-info'>",
					"<div class='ab-app-list-name'>#label#</div>",
					"<div class='ab-app-list-description'>#description#</div>",
				"</div>",
				"<div class='ab-app-list-edit'>",
					"{common.iconGear}",
				"</div>",
			"</div>"
		].join('');



		/*
		 * @function _init
		 *
		 * The init() that performs the necessary setup for our AppList chooser.
		 */
		this.init = function() {
			webix.extend($$(ids.list), webix.ProgressBar);
			webix.extend($$(ids.list), webix.OverlayBox);

			MenuComponent.init({
				onClick: _logic.callbackApplicationEditorMenu
			})

			// start things off by loading the current list of Applications
			_logic.loadData();
		}



		/*
		 * The exported methods available to other Components.
		 */
		this.actions({


			/**
			 * @function unselectApplication
			 *
			 * resets the AppList to an unselected state.
			 */
			unselectApplication:function() {
				_logic.reset();
			},


			/**
			 * @function getSelectedApplication
			 *
			 * returns which ABApplication is currently selected.
			 * @return {ABApplication}  or {null} if nothing selected.
			 */
			getSelectedApplication:function() {
				return $$(ids.list).getSelectedItem();
			},


			/**
			 * @function deleteApplication
			 *
			 * deletes the given ABAppliction.
			 *
			 * NOTE: this assumes the component using this method has already
			 * provided the delete confirmation.
			 *
			 * @param {ABApplication} app  the ABAppliction to delete.
			 */
			deleteApplication: function(app) {

				if (!app) return;

				// Delete application data
				_logic.busy();


				app.destroy()
					.then(function (result) {
						_logic.refreshList();
						_logic.reset();
						_logic.ready();

						webix.message({
							type: "success",
							text: labels.common.deleteSuccessMessage.replace('{0}', app.label)
						});
					})
					.catch(function (err) {
						_logic.reset();
						_logic.ready()

						webix.message({
							type: "error",
							text: labels.common.deleteErrorMessage.replace("{0}", app.label)
						});

						AD.error.log('App Builder : Error delete application data', { error: err });
					})
			},


			/**
			 * @function transitionApplicationList
			 *
			 * Trigger our List component to show
			 */
			transitionApplicationList:() => {
				_logic.refreshList();
				this.show();
			}
		})


		this.show = function() {
			$$(ids.component).show();
		}

	}

}
