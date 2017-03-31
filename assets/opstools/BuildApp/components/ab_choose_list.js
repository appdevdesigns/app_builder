
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
			{ width:100 },
			{
				id: ids.component,
				autoheight: true,
				autowidth: true,
				rows: [
					{ height: 30 },
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
									App.action.createApplicationRequest();
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
			                            $$('self.webixUiId.appList').showProgress({ type: "icon" });
									},
									onFileUpload: function (item, response) {
										_logic.loadData(); // refresh app list
										this.enable();
			                            $$('self.webixUiId.appList').hideProgress();
									},
									onFileUploadError: function (details, response) {
										var errorMessage = 'Error: ' + (response && response.message);
										webix.message({
											type: 'error',
											text: errorMessage
										});
										_logic.loadData(); // refresh app list
										this.enable();
			                            $$('self.webixUiId.appList').hideProgress();
									}
								}
							}
						]
					},
					{
						view:'label',
						label:'The List'
					}
				]
			},

			{ width:100 }
		]
	}





	var _logic = {


		init: function() {
			webix.extend($$(ids.list), webix.ProgressBar);
			webix.extend($$(ids.list), webix.OverlayBox);
		},

		buttonCreateNewApplication: function() {
			this.resetState();
			this.populateForm();
		},

		reset:function() {
			$$(ids.list).unselectAll();
		},

		// resetState: function () {
		// 	var self = this;

		// 	$$(self.webixUiId.appList).unselectAll();
		// 	$$(self.webixUiId.appForm).clear();
		// 	$$(self.webixUiId.appForm).clearValidation();
		// 	$$(self.webixUiId.appFormPermissionList).clearValidation();
		// 	$$(self.webixUiId.appFormPermissionList).clearAll();
		// 	$$(self.webixUiId.appFormCreateRoleButton).setValue(0);
		// },

		loadData:function(){

			console.log('... should load application data now.')
		}
	}



	return {
		ui: _ui,
		logic: _logic
	}
})
