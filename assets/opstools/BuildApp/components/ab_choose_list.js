
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var labels = {

	application: {
		title: L('ab.application.application', '*Application'),
		createNew: L('ab.application.createNew', '*Add new application')
	}
}



OP.Component.extend('ab_choose_list', function(App) {

	labels.common = App.labels.common;

	var ids = {
		component:App.unique('ab_choose_listcomponent'),
		list:App.unique('ab_choose_list'),
		toolBar:App.unique('ab_choose_list_toolbar'),
		buttonCreateNewApplication: App.unique('ab_choose_list_buttonNewApp')
	}

	var _ui = {

		cols: [

			//
			// Left Column Spacer
			//
			{ width:100 },


			//
			// Center column Content:
			// 
			{
				id: ids.component,
				autoheight: true,
				autowidth: true,
				rows: [

					// 
					// Top Spacer
					//
					{ height: 30 },

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
								value: labels.application.createNew, 
								width: 200,
								click: function() { 

									// Inform our Chooser we have a request to create an Application:
									App.actions.createApplicationRequest();
								}
							},
							{
								view: "uploader",
								value: labels.common.import,
								width: 200,
								upload: '/app_builder/appJSON',
								multiple: false,
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
						minHeight: 227,
						autowidth: true,
						css: 'ab-app-select-list',
						template: function (obj, common) {
							return _logic.templateListItem(obj, common);
						},
						type: {
							height: 100, // Defines item height
							iconGear: "<span class='webix_icon fa-cog'></span>"
						},
						select: false,
						onClick: {
							"ab-app-list-item": function (e, id, trg) {
								_logic.busy();

								this.select(id);

								var selectedApp = data.filter(function (app) { return app.id == id })

								if (selectedApp && selectedApp.length > 0) {
		

									_logic.ready();
									

									// Trigger select app event
									App.actions.selectApplication( selectedApp[0] );
									
								}

								return false; // block default behavior
							},
							"ab-app-list-edit": function (e, id, trg) {
								// Show menu
$$(self.webixUiId.appListMenu).show(trg);
								this.select(id);

								return false; // block default behavior
							}
						}
					}
				]
			},

			// 
			// Right Column Spacer
			// 
			{ width:100 }
		]
	}





	var _logic = {


		init: function() {
			webix.extend($$(ids.list), webix.ProgressBar);
			webix.extend($$(ids.list), webix.OverlayBox);

			// start things off by loading the current list of Applications
			this.loadData();
		},


		busy: function() {
			if ($$(ids.list).showProgress)
				$$(ids.list).showProgress({ icon: 'cursor' });
		},

		ready: function() {
			if ($$(ids.list).hideProgress)
				$$(ids.list).hideProgress();
		},

		reset:function() {
			$$(ids.list).unselectAll();
		},

		loadData:function(){
			// var Model = AD.Model.get('opstools.BuildApp.ABApplication');
		},


		refreshList: function() {

		},


		templateListItem: function(obj, common) {
			return _templateListItem
				.replace('#label#', obj.label || '')
				.replace('#description#', obj.description || '')
				.replace('{common.iconGear}', common.iconGear);
		}
	}


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

							


	return {
		ui: _ui,
		logic: _logic
	}
})
