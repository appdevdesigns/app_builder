
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


				createNew: L('ab.application.createNew', '*Add new application'),
				noApplication: L('ab.application.noApplication', "*There is no application data"),

				confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
				confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")					
			}
		}


		var ids = {
			component: 	this.unique('component'),

			rows: this.unique('rows'),
			userList:   this.unique('userlist')
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
								}
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

						_logic.loadData();
						_logic.ready();
					})
					.catch((err)=>{
						OP.Error.log('Error initializing users.', err);
					})
				} 

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
