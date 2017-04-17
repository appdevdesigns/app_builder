


var appListControl = {

	cols: [
		{ width:100 },
		{
			id: 'applistrow',
			autoheight: true,
			autowidth: true,
			rows: [
				{ height: 30 },
				{
					view: "toolbar",
					id: 'self.webixUiId.appListToolbar',
					cols: [
						{ view: "label", label: 'self.labels.application.title', fillspace: true },
						{
							view: "button", value: 'self.labels.application.createNew', width: 200,
							click: function() { 
								appListLogic.buttonCreateNewApplication();
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
									self.loadData(); // refresh app list
									this.enable();
		                            $$('self.webixUiId.appList').hideProgress();
								},
								onFileUploadError: function (details, response) {
									var errorMessage = 'Error: ' + (response && response.message);
									webix.message({
										type: 'error',
										text: errorMessage
									});
									appListLogic.loadData(); // refresh app list
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





// Application multi-views
var applicationList = {
	id: 'self.webixUiId.appView',
	autoheight: true,
	cells: [
		appListControl,
		// appFormControl
	]
};

OP.UI.extend('ab_app_list', applicationList);





var appListLogic = {

	init: function() {

	},

	buttonCreateNewApplication: function() {
		self.resetState();
		self.populateForm();
	},

	loadData:function(){

		console.log('... should load application data now.')
	}
}
OP.Logic.extend('ab_app_list', appListLogic);


