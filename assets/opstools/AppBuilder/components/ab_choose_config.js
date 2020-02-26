
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class ABChooseConfig extends ABComponent { 

	constructor(App) {
		super(App, 'ab_choose_config');

		var L = this.Label;

		var labels = {

			common: App.labels,

			component: {
				title: L('ab.config.title', '*Configure App Builder'),

				buttonBackToList: L('ab.config.buttonBackToList', '*Back'),

				selectUsers: L('ab.config.selectUsers', '*Select Users'),
				buttonCreateRelayUser: L('ab.config.createRelayUser', '*Create Relay User'),
				buttonUpdatePublicServer: L('ab.config.updatePublicServer', '*Update Public Server'),

				selectQRUsers: L('ab.config.selectQRUsers', '*Select Relay User'),
				selectQRApp: L('ab.config.selectQRApp', '*Select Relay Application'),
				buttonSendQREmail: L('ab.config.sendQREmail', '*Send QR Email'),

				selectQRVersion: L('ab.config.selectQRVersion', '*Select App Version'),
				versionDevelop: L('ab.config.versionDevelop', '*Develop'),
				versionStaging: L('ab.config.versionStaging', '*Staging'),
				versionProduction: L('ab.config.versionProduction', '*Production'),
				versionNSApp: L('ab.config.versionNSApp', '*NS App'),

				confirmUsersCreated: L('ab.config.confirmUsersCreated', '*Users successfully created'),
				errorUsersCreated:   L('ab.config.confirmUsersCreated', '*Error creating users.'),

				confirmUsersPublished: L('ab.config.confirmUsersPublished', '*Users successfully published'),
				errorUsersPublished: L('ab.config.errorUsersPublished', '*Error publishing users.'),

				confirmQRSent:  L('ab.config.confirmQRSent', '*QR Email Sent'),
				errorQRSent: L('ab.config.errorQRSent', '*Error sending QR email'),

				errorQRCode: L('ab.config.errorQRCode', '*Error retrieving user\'s QR code.'),

				createNew: L('ab.application.createNew', '*Add new application'),
				noApplication: L('ab.application.noApplication', "*There is no application data"),

				confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
				confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?"),
				qrPreview: L('ab.config.qrPreview', '*Generate QR Code'),

				buttonSendConfirmationEmails: L('ab.config.sendConfirmationEmails', '*Send Confirmation Emails'),
				confirmEmailsSent: L('ab.config.confirmEmailsSent', '*Confirmation Emails Sent'),
				errorEmailsSent: L('ab.config.errorEmailsSent', '*Error Sending Confirmation Emails'),

				buttonSendFeeConfirmationEmails: L('ab.config.sendConfirmationEmails', '*Send Fee Confirmation Emails'),
				confirmFeeEmailsSent: L('ab.config.confirmEmailsSent', '*Fee Confirmation Emails Sent'),
				errorFeeEmailsSent: L('ab.config.errorEmailsSent', '*Error Sending Fee Confirmation Emails'),
			}
		}


		var ids = {
			component: 	this.unique('component'),

			rows: this.unique('rows'),
			userList:   this.unique('userlist'),
			qrUserList: this.unique('qruserlist'),
			qrAppList:  this.unique('qrapplist'),

			qrUserList2: this.unique('qruserlist2'),
			qrAppList2:  this.unique('qrapplist2'),
			qrVersion:  this.unique('qrversion'),
			qrVersion2:  this.unique('qrversion2'),

			qrCode: this.unique('qrcode'),
			qrCodeImage: this.unique('qrcodeimage'),
		}	


		this.ui = {

			id: ids.component,
			type: "space",
			cols: [
				{
					maxWidth: App.config.appListSpacerColMaxWidth,
					minWidth: App.config.appListSpacerColMinWidth,
					width: App.config.appListSpacerColMaxWidth
				},
				{
					rows: [
						{
							minHeight: 25,
						},
						//
						// ToolBar
						//
						{
							view: "toolbar",
							cols: [
								{
			                    	view:"button",
			                    	label: labels.component.buttonBackToList,
									autowidth: true,
									// type: "icon",
									// icon: "fa fa-plus",
									click: () => {
										
										this.emit('view.list');
									}
								},
							
								{ view: "label", label:labels.component.title, fillspace: true },
								
							]
						},


						//
						// The List of Actions
						//
						{
							id:ids.rows,
							rows:[
								// Create Relay User:
								{
									view:"template",
									template:labels.component.buttonCreateRelayUser,
									type:"header",
									css:"bg-gray webix_header"
								},
								{
									type: "form",
									rows: [
										{
					                        id:ids.userList,
					                        name:'users',
					                        view:"multicombo",
					                        label:labels.component.selectUsers,
					                        value:'',
											labelWidth:App.config.labelWidthXXLarge,
											minWidth: 800,
					                        options:[]
					                    },
										{
											cols:[
												{},
												{
													view:"button",
													label: labels.component.buttonCreateRelayUser,
													autowidth: true,
													// type: "icon",
													// icon: "fa fa-plus",
													click: () => {
														
														_logic.buttonCreateRelayUser();
													}
												}
											]
										}
									]
								},
								
								// Button: Update Public Server
								{
									view:"template",
									template:labels.component.buttonUpdatePublicServer,
									type:"header",
									css:"bg-gray webix_header"
								},
								{
									type: "form",
									rows: [
										{
											cols: [
												{},
												{
													view:"button",
							                    	label: labels.component.buttonUpdatePublicServer,
													autowidth: true,
													click: () => {
														_logic.buttonUpdatePublicServer();
													}
												},
												{}
											]
										}
									]
								},

								// Send QR Email:
								{
									view:"template",
									template:labels.component.buttonSendQREmail,
									type:"header",
									css:"bg-gray webix_header"
								},
								{
									type: "form",
									rows: [
										{
					                        id:ids.qrUserList,
					                        name:'qrusers',
					                        view:"multicombo",
					                        label:labels.component.selectQRUsers,
											labelWidth:App.config.labelWidthXXLarge,
											minWidth: 800,
					                        value:'',
					                        options:[]
					                    },
										{
					                        id:ids.qrAppList,
					                        name:'qrApps',
					                        view:"multicombo",
					                        label:labels.component.selectQRApp,
											labelWidth:App.config.labelWidthXXLarge,
											minWidth: 800,
					                        value:'',
					                        options:[]
					                    },
										{
											cols:[
												{},
												{
							                    	view:"button",
							                    	label: labels.component.buttonSendQREmail,
													autowidth: true,
													click: () => {
														_logic.buttonSendQREmail();
													}
												}
											]
										}
									]
								},

								// choose user & App and see a QR Code:
								{
									view:"template",
									template:labels.component.qrPreview,
									type:"header",
									css:"bg-gray webix_header"
								},
								{
									type: "form",
									rows:[
										{
					                        id:ids.qrUserList2,
					                        name:'qrusers2',
					                        view:"combo",
					                        label:labels.component.selectQRUsers,
					                        value:'',
											labelWidth:App.config.labelWidthXXLarge,
											minWidth: 800,
					                        options:[],
					                        on:{
					                        	onChange:function(newVal, oldVal) {
					                        		_logic.updateQRCode();
					                        	}
					                        }
					                    },
										{
											id:ids.qrAppList2,
											name:'qrApps2',
											view:"multicombo",
											label:labels.component.selectQRApp,
											labelWidth:App.config.labelWidthXXLarge,
											minWidth: 800,
											value:'',
											options:[],
											on:{
												onChange:function(newVal, oldVal) {
													_logic.updateQRCode();
												}
											}
										},
										{
											id:ids.qrVersion2,
											name:'qrVersion2',
											view:"combo",
											label:labels.component.selectQRVersion,
											labelWidth:App.config.labelWidthXXLarge,
											minWidth: 800,
											value:'P',
											options:[
												{id:'D', value:labels.component.versionDevelop },
												{id:'S', value:labels.component.versionStaging },
												{id:'P', value:labels.component.versionProduction },
												{id:'N', value:labels.component.versionNSApp }
												],
											on:{
												onChange:function(newVal, oldVal) {
													_logic.updateQRCode();
												}
											}
										},
										{
											cols:[
												{},
												{
													id: ids.qrCode,
													view: "template",
													template:"QR Image Here",
							                        width:280,
									                height:280,
												},
												{}
											]
										}
									]
								},
								// Button: Send Confirmation Emails
								{
									view:"template",
									template:labels.component.buttonSendConfirmationEmails,
									type:"header",
									css:"bg-gray webix_header"
								},
								{
									type: "form",
									rows: [
										{
											cols: [
												{},
												{
													view:"button",
							                    	label: labels.component.buttonSendConfirmationEmails,
													autowidth: true,
													click: () => {
														_logic.buttonSendConfirmationEmails();
													}
												},
												{}
											]
										}
									]
								},

								// Button: Send Fee Confirmation Emails
								{
									view:"template",
									template:labels.component.buttonSendFeeConfirmationEmails,
									type:"header",
									css:"bg-gray webix_header"
								},
								{
									type: "form",
									rows: [
										{
											cols: [
												{},
												{
													view:"button",
							                    	label: labels.component.buttonSendFeeConfirmationEmails,
													autowidth: true,
													click: () => {
														_logic.buttonSendFeeConfirmationEmails();
													}
												},
												{}
											]
										}
									]
								},
							]
						},
						{
							minHeight: 25,
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
						OP.Error.log(labels.component.errorUsersCreated, err);
					})
				} 

			},

			buttonSendConfirmationEmails: ()=>{
				_logic.busy();

				OP.Comm.Service.post({
					url:'/app_builder/Event/sendConfirmationEmail',
					data:{
						// user:user,
						// mobileApp:mobileApp,
						// // email:
					}
				})
				.then((response)=>{
					OP.Dialog.Message({
						text:labels.component.confirmEmailsSent
					})
					_logic.ready();
				})
				.catch((err)=>{
					_logic.ready();
					var message = labels.component.errorEmailsSent; 
					if (err.message) message += ': '+err.message;

					OP.Error.log(message, err);
				})

			},

			buttonSendFeeConfirmationEmails: ()=>{
				_logic.busy();

				OP.Comm.Service.post({
					url:'/app_builder/Event/sendFeeConfirmationEmail',
					data:{
// regID:816,
						// mobileApp:mobileApp,
						// // email:
					}
				})
				.then((response)=>{
					OP.Dialog.Message({
						text:labels.component.confirmFeeEmailsSent
					})
					_logic.ready();
				})
				.catch((err)=>{
					_logic.ready();
					var message = labels.component.errorFeeEmailsSent; 
					if (err.message) message += ': '+err.message;

					OP.Error.log(message, err);
				})

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
					var message = labels.component.errorQRSent; 
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
					OP.Error.log(labels.component.errorUsersPublished, err);
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

						$$(ids.qrUserList2).define('options', options);
						$$(ids.qrUserList2).refresh();

					}

				})
				.catch((err)=>{
console.error(err);
				});


				// "/app_builder/mobile/apps"
				OP.Comm.Service.get({
					url: "/app_builder/mobile/apps"
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

						$$(ids.qrAppList2).define('options', options);
						$$(ids.qrAppList2).refresh();

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


			updateQRCode:function() {
				var user = $$(ids.qrUserList2).getValue();
				var mobileApp =  $$(ids.qrAppList2).getValue();
				var version = $$(ids.qrVersion2).getValue();

				if (user != '' && mobileApp != '') {



					_logic.busy();

					$$(ids.qrCode).showProgress({ icon: 'cursor' });
					var img = document.getElementById(ids.qrCodeImage);
					if (!img) {
						OP.Error.log('Error locating QR Cursor Image tag.')
						return;
					}
					
					// clear current image:
					img.src="";

					OP.Comm.Service.post({
						url:'/app_builder/QR/adminQRCode',
						data:{
							user:user,
							mobileApp:mobileApp,
							version:version
							// email:
						}
					})
					.then((response)=>{

						// find the <image> and load up the image data
						// var img = document.getElementById(ids.qrCodeImage);
						img.src=response.image;

						// $$(ids.rows).hideProgress();
						_logic.ready();
					})
					.catch((err)=>{

						$$(ids.rows).hideProgress();
						_logic.ready();
						var message = labels.component.errorQRSent; 
						if (err.message) message += ': '+err.message;

						OP.Error.log(message, err);
					})
				}
			}

		}
		this._logic = _logic;




		/*
		 * @function _init
		 *
		 * The init() that performs the necessary setup for our AppList chooser.
		 */
		this.init = function() {
			webix.extend($$(ids.rows), webix.ProgressBar);
			webix.extend($$(ids.qrCode), webix.ProgressBar);

			$$(ids.qrCode).setHTML('<img id="'+ids.qrCodeImage+'">');

			// start things off by loading the current list of Applications
			_logic.loadData();
		}


		this.show = function() {
			$$(ids.component).show();
		}

	}

}
