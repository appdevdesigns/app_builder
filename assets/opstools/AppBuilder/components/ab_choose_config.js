
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */


export default class ABChooseConfig extends OP.Component { 

	constructor(App) {
		super(App, 'ab_choose_config');

		var L = this.Label;

		var labels = {

			common: App.labels,

			component: {
				title: L('ab.config.title', '*Configure App Builder'),

				selectUsers: L('ab.config.selectUsers', '*Select Users'),
				buttonCreateRelayUser: L('ab.config.createRelayUser', '*Create Relay User'),
				buttonUpdatePublicServer: L('ab.config.updatePublicServer', '*Update Public Server'),

				selectQRUsers: L('ab.config.selectQRUsers', '*Select Relay User'),
				selectQRApp: L('ab.config.selectQRApp', '*Select Relay Application'),
				buttonSendQREmail: L('ab.config.sendQREmail', '*Send QR Email'),

				confirmUsersCreated: L('ab.config.confirmUsersCreated', '*Users successfully created'),
				confirmUsersPublished: L('ab.config.confirmUsersPublished', '*Users successfully published'),

				createNew: L('ab.application.createNew', '*Add new application'),
				noApplication: L('ab.application.noApplication', "*There is no application data"),

				confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
				confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")					
			}
		}


		var ids = {
			component: 	this.unique('component'),

			rows: this.unique('rows'),
			userList:   this.unique('userlist'),
			qrUserList: this.unique('qruserlist'),
			qrAppList:  this.unique('qrapplist')
		}	


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
							cols: [
							
								{ view: "label", label:labels.component.title, fillspace: true },
								
							]
						},


						//
						// The List of Applications
						//
						{
							id:ids.rows,
							rows:[

								// Create Relay User:
								{
									cols:[
										{
					                        id:ids.userList,
					                        name:'users',
					                        view:"multicombo",
					                        label:labels.component.selectUsers,
					                        value:'',
					                        options:[]
					                    },
					                    {
					                    	view:"button",
					                    	label: labels.component.buttonCreateRelayUser,
											autowidth: true,
											// type: "icon",
											// icon: "plus",
											click: () => {
												
												_logic.buttonCreateRelayUser();
											}
										}
					            
									]
								},

								// Button: Update Public Server
								{
									cols:[
										{

										},
										{
					                    	view:"button",
					                    	label: labels.component.buttonUpdatePublicServer,
											autowidth: true,
											click: () => {
												_logic.buttonUpdatePublicServer();
											}
										}
									]
								},

								// Send QR Email:
								{
									cols:[
										{
					                        id:ids.qrUserList,
					                        name:'qrusers',
					                        view:"multicombo",
					                        label:labels.component.selectQRUsers,
					                        value:'',
					                        options:[]
					                    },
					                    {
					                        id:ids.qrAppList,
					                        name:'qrApps',
					                        view:"multicombo",
					                        label:labels.component.selectQRApp,
					                        value:'',
					                        options:[]
					                    },
										{
					                    	view:"button",
					                    	label: labels.component.buttonSendQREmail,
											autowidth: true,
											click: () => {
												_logic.buttonSendQREmail();
											}
										}
									]
								},
							]
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
				if ($$(ids.rows).showProgress)
					$$(ids.rows).showProgress({ icon: 'cursor' });
			},


			buttonCreateRelayUser: ()=>{

				
				var names = $$(ids.userList).getValue();
				if (names != '') {

					_logic.busy();
					names = names.split(',');

					OP.Comm.Service.post({
						url:'/app_builder/relay/initialize',
						data:{
							users:names
						}
					})
					.then((response)=>{

						OP.Dialog.Message({
							text:labels.component.confirmUsersCreated
						})
						_logic.loadData();
						_logic.ready();
					})
					.catch((err)=>{
						_logic.ready();
						OP.Error.log('Error initializing users.', err);
					})
				} 

			},


			buttonSendQREmail: ()=>{

				_logic.busy();

				var user = $$(ids.qrUserList).getValue();
				var mobileApp = $$(ids.qrAppList).getValue();

				OP.Comm.Service.post({
					url:'/app_builder/QR/sendEmail',
					data:{
						user:user,
						mobileApp:mobileApp,
						// email:
					}
				})
				.then((response)=>{
					OP.Dialog.Message({
						text:labels.component.confirmQRSent
					})
					_logic.ready();
				})
				.catch((err)=>{
					_logic.ready();
					var message = 'Error sending QR email';
					if (err.message) message += ': '+err.message;

					OP.Error.log(message, err);
				})
				
			},


			buttonUpdatePublicServer: ()=>{

				_logic.busy();

				OP.Comm.Service.post({
					url:'/app_builder/relay/publishusers',
					data:{}
				})
				.then((response)=>{
					OP.Dialog.Message({
						text:labels.component.confirmUsersPublished
					})
					_logic.ready();
				})
				.catch((err)=>{
					_logic.ready();
					OP.Error.log('Error publishing users.', err);
				})
				

			},

			loadData:function() {

				// "/app_builder/relay/uninitializedusers"
				OP.Comm.Service.get({
					url: "/app_builder/relay/uninitializedusers"
				})
				.then((data)=>{

					if (data && data.length > 0) {

						var options = [];
						data.forEach((d)=>{
							options.push({id:d, value:d});
						})

						$$(ids.userList).define('options', options);
						$$(ids.userList).refresh();

					}

				})
				.catch((err)=>{
console.error(err);
				});


				// "/app_builder/relay/users"
				OP.Comm.Service.get({
					url: "/app_builder/relay/users"
				})
				.then((data)=>{

					if (data && data.length > 0) {

						var options = [];
						data.forEach((d)=>{
							options.push({id:d, value:d});
						})

						$$(ids.qrUserList).define('options', options);
						$$(ids.qrUserList).refresh();

					}

				})
				.catch((err)=>{
console.error(err);
				});


				// "/app_builder/application/allmobileapps"
				OP.Comm.Service.get({
					url: "/app_builder/application/allmobileapps"
				})
				.then((data)=>{

					if (data && data.length > 0) {

						var options = [];
						data.forEach((d)=>{
							OP.Multilingual.translate(d, d, ['label']);
							options.push({id:d.id, value:d.label, appID:d.appID });
						})

						$$(ids.qrAppList).define('options', options);
						$$(ids.qrAppList).refresh();

					}

				})
				.catch((err)=>{
console.error(err);
				});

			},


			/**
			 * @function ready
			 *
			 * remove the busy indicator on our App List
			 */
			ready: function() {
				if ($$(ids.rows).hideProgress)
					$$(ids.rows).hideProgress();
			},

		}
		this._logic = _logic;




		/*
		 * @function _init
		 *
		 * The init() that performs the necessary setup for our AppList chooser.
		 */
		this.init = function() {
			webix.extend($$(ids.rows), webix.ProgressBar);

			
			// start things off by loading the current list of Applications
			_logic.loadData();
		}


		this.show = function() {
			$$(ids.component).show();
		}

	}

}
