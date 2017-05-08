
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */
import ABApplication from "../classes/ABApplication"
import "./ab_choose_list_menu"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var labels = {

	application: {
		title: L('ab.application.application', '*Application'),
		createNew: L('ab.application.createNew', '*Create application'),
		noApplication: L('ab.application.noApplication', "*There is no application data")
	}
}



OP.Component.extend('ab_choose_list', function(App) {

	labels.common = App.labels;

	var ids = {
		component:App.unique('ab_choose_listcomponent'),
		list:App.unique('ab_choose_list'),
		toolBar:App.unique('ab_choose_list_toolbar'),
		buttonCreateNewApplication: App.unique('ab_choose_list_buttonNewApp')
	}

	var MenuComponent = OP.Component['ab_choose_list_menu'](App);
	var PopupMenu = webix.ui(MenuComponent.ui);
	PopupMenu.hide();

	var _ui = {

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
							{ view: "label", label:labels.application.title, fillspace: true },
							{
								id: ids.buttonCreateNewApplication,
								view: "button",
								label: labels.application.createNew,
								autowidth: true,
								type: "icon",
								icon: "plus",
								click: function() {

									// Inform our Chooser we have a request to create an Application:
									App.actions.transitionApplicationForm( /* leave empty for a create */ );
								}
							},
							{
								view: "uploader",
								label: labels.common.import,
								autowidth: true,
								upload: '/app_builder/appJSON',
								multiple: false,
								type: "icon",
								icon: "upload",
								autosend: true,
								on: {
									onAfterFileAdd: function () {
										this.disable();
										_logic.busy();
									},
									onFileUpload: function (item, response) {
										_logic.loadData(); // refresh app list
										this.enable();
			                            _logic.ready();
									},
									onFileUploadError: function (details, response) {
										var errorMessage = 'Error: ' + (response && response.message);
										webix.message({
											type: 'error',
											text: errorMessage
										});
										_logic.loadData(); // refresh app list
										this.enable();
			                            _logic.ready();
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
							iconGear: "<span class='webix_icon fa-cog'></span>"
						},
						select: false,
						onClick: {
							"ab-app-list-item": function (e, id, trg) {
								_logic.busy();

								this.select(id);

								var selectedApp = this.getItem(id);

								if (selectedApp) {


									_logic.ready();


									// We've selected an Application to work with
									App.actions.transitionWorkspace( selectedApp );

								}

								return false; // block default behavior
							},
							"ab-app-list-edit": function (e, id, trg) {
								// Show menu
								PopupMenu.show(trg);
								this.select(id);

								return false; // block default behavior
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
		 * @function refreshOverlay
		 *
		 * If we have no items in our list, display a Message.
		 */
		refreshOverlay: function() {
			var appList = $$(ids.list);

			if (!appList.count()) //if no data is available
				appList.showOverlay(labels.application.noApplication);
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
	var _init = function() {
		webix.extend($$(ids.list), webix.ProgressBar);
		webix.extend($$(ids.list), webix.OverlayBox);

		MenuComponent.init();

		// start things off by loading the current list of Applications
		_logic.loadData();
	}



	/*
	 * {json} _actions
	 *
	 * The exported methods available to other Components.
	 */
	var _actions = {


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
		transitionApplicationList:function() {
			$$(ids.component).show();
		}
	}



	return {
		ui: _ui,
		init: _init,
		actions:_actions,


		_logic:_logic	// exposed for Unit Testing
	}
})
