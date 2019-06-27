export default class AB_Work_Dataview_List extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_dataview_list');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {

				addNew: L('ab.dataview.addNew', '*Add new data view'),

				confirmDeleteTitle: L('ab.dataview.delete.title', "*Delete data view"),
				confirmDeleteMessage: L('ab.dataview.delete.message', "*Do you want to delete <b>{0}</b>?"),
				title: L('ab.dataview.list.title', '*Data Views'),
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

			list: this.unique('editlist'),
			buttonNew: this.unique('buttonNew')
		};


		// Our webix UI definition:
		this.ui = {
			id: ids.component,
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
							_logic.selectObject(id);
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
					view: 'button',
					id: ids.buttonNew,
					value: labels.component.addNew,
					type: "form",
					click: function () {
						_logic.clickNewObject(true); // pass true so it will select the new object after you created it
					}
				}
			]
		};

		var CurrentApplication = null;
		var objectList = null;

		let _initialized = false;
		let _settings = {};

		// Our init() function for setting up our UI
		this.init = (options) => {
		};


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
			 * Initialize the Object List from the provided ABApplication
			 *
			 * If no ABApplication is provided, then show an empty form. (create operation)
			 *
			 * @param {ABApplication} application  	[optional] The current ABApplication
			 *										we are working with.
			 */
			applicationLoad: function (application) {
				// _logic.listBusy();

				// CurrentApplication = application;

				// // get a DataCollection of all our objects
				// objectList = new webix.DataCollection({
				// 	data: application.objects(),
				// });

				// // setup object list settings
				// $$(ids.listSetting).getParentView().blockEvent();
				// $$(ids.listSetting).define("collapsed", _settings.objectlistIsOpen != true);
				// $$(ids.listSetting).refresh();
				// $$(ids.listSetting).getParentView().unblockEvent();

				// $$(ids.searchText).blockEvent();
				// $$(ids.searchText).setValue(_settings.objectlistSearchText);
				// $$(ids.searchText).unblockEvent();

				// $$(ids.sort).blockEvent();
				// $$(ids.sort).setValue(_settings.objectlistSortDirection);
				// $$(ids.sort).unblockEvent();

				// $$(ids.group).blockEvent();
				// $$(ids.group).setValue(_settings.objectlistIsGroup);
				// $$(ids.group).unblockEvent();


				// // clear our list and display our objects:
				// var List = $$(ids.list);
				// List.clearAll();
				// List.data.unsync();
				// List.data.sync(objectList);
				// List.refresh();
				// List.unselectAll();


				// // sort objects
				// _logic.listSort(_settings.objectlistSortDirection);

				// // filter object list
				// _logic.listSearch();


				// // hide progress loading cursor
				// _logic.listReady();


				// // prepare our Popup with the current Application
				// PopupNewObjectComponent.applicationLoad(application);

			},


			clickEditMenu: function (e, id, trg) {
				// // Show menu
				// PopupEditObjectComponent.show(trg);

				// return false;
			},

			listBusy: () => {

			},

			listReady: () => {
				
			}

		};

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.busy = _logic.listBusy;
		this.ready = _logic.listReady;


	}

}