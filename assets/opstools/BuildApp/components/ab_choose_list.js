
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */
var ids = {
	list:'ab_choose_list',
	toolBar:'ab_choose_list_toolbar'
}

var _ui = {

	cols: [
		{ width:100 },
		{
			id: ids.list,
			autoheight: true,
			autowidth: true,
			rows: [
				{ height: 30 },
				{
					view: "toolbar",
					id: ids.toolBar,
					cols: [
						{ view: "label", label: 'self.labels.application.title', fillspace: true },
						{
							view: "button", value: 'self.labels.application.createNew', width: 200,
							click: function() { 
								_logic.buttonCreateNewApplication();
							}
						},
						{
							view: "uploader",
							value: 'self.labels.common.import',
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
OP.UI.extend('ab_choose_list', _ui);





var _logic = {


	init: function() {
		webix.extend($$(ids.list), webix.ProgressBar);
		webix.extend($$(ids.list), webix.OverlayBox);
	},

	buttonCreateNewApplication: function() {
		self.resetState();
		self.populateForm();
	},

	loadData:function(){

		console.log('... should load application data now.')
	}
}
OP.Logic.extend('ab_choose_list', _logic);


