import ABViewDataCollection from "../classes/views/ABViewDataCollection"

export default class AB_Work_Interface_Workspace_Editor_Data extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_interface_workspace_editor_data');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				// formHeader: L('ab.application.form.header', "*Application Info"),
			}
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('editor_data'),

			editDataCollection: this.unique('editDataCollection'),
			dataCollections: this.unique('dataCollections')
		};

		var _template = [
			'<div class="ab-component-in-page">',
			'<i class="fa fa-trash ab-component-remove"></i>' +
			'<i class="fa fa-edit ab-component-edit"></i>' +
			'<div id="' + ids.component + '_#objID#" >',
			'<i class="fa fa-#icon#"></i>',
			' #label#',
			'</div>',
			'</div>'
		].join('');

		var CurrentView = null;
		var CurrentRootPage = null;


		// setting up UI
		this.init = function () {
		};


		// internal business logic 
		var _logic = this.logic = {

			/**
			 * @function show()
			 *
			 * Show this component.
			 */
			show: function () {
				$$(ids.component).show();
			},


			/**
			* @method viewLoad
			* A new View has been selected for editing, so update
			* our interface with the details for this View.
			* @param {ABView} view  current view instance.
			*/
			viewLoad: function (view) {

				CurrentView = view;
				CurrentRootPage = view.pageRoot();

				// clear edit area
				$$(ids.editDataCollection).getChildViews().forEach((childView) => {
					$$(ids.editDataCollection).removeView(childView);
				});

				// clear list
				$$(ids.dataCollections).clearAll();

				// render editor ui
				if (CurrentView instanceof ABViewDataCollection) {

					$$(ids.dataCollections).hide();
					$$(ids.editDataCollection).show();

					var editorComponent = CurrentView.editorComponent(App, 'preview');
					$$(ids.editDataCollection).addView(editorComponent.ui);
					editorComponent.init();

				}
				// load view's data sources in list
				else {

					$$(ids.dataCollections).show();
					$$(ids.editDataCollection).hide();

					$$(ids.dataCollections).parse(CurrentRootPage.dataCollections());

				}

			},


			/**
			 * @method newDataCollection
			 * Add a new ABViewDataCollection to current page
			 */
			newDataCollection: function () {

				var newDataCollection = CurrentRootPage.dataCollectionNew();

				newDataCollection.save()
					.then(() => {

						_logic.viewLoad(CurrentView);

					});

			},


			/**
			 * @method dataCollectionEdit
			 * 
			 */
			dataCollectionEdit: function (e, id, trg) {

				var datacollection = CurrentRootPage.dataCollections(function (data) { return data.id == id; })[0];

				if (!datacollection) return false;

				// NOTE: let webix finish this onClick event, before
				// calling .populateInterfaceWorkspace() which will replace
				// the interface elements with the edited view.  (apparently
				// that causes errors.)
				setTimeout(() => {
					App.actions.populateInterfaceWorkspace(datacollection);
				}, 50);

				e.preventDefault();
				return false;

			},


			/**
			 * @method dataCollectionRemove
			 * 
			 */
			dataCollectionRemove: function (e, id, trg) {


				var datacollection = CurrentRootPage.dataCollections(function (data) { return data.id == id; })[0];
				if (datacollection) {

					OP.Dialog.Confirm({
						title: L('ab.interface.component.datacollection.confirmDeleteTitle', '*Delete Data Source'),
						text: L('ab.interface.component.datacollection.confirmDeleteMessage', 'Do you want to delete <b>{0}</b>?').replace('{0}', datacollection.label),
						callback: (result) => {
							if (result) {
								CurrentView.dataCollectionDestroy(datacollection);

								// remove tab option
								$$(ids.dataCollections).remove(id);
							}
						}
					});

				}

				e.preventDefault();
				return false;

			},


			/**
			 * @method listTemplate
			 * 
			 */
			listTemplate: function (dataCollection) {

				let icon = dataCollection.icon;

				if (dataCollection.settings.isQuery)
					icon = "cubes";

				return _template
					.replace('#objID#', dataCollection.id)
					.replace('#icon#', icon)
					.replace('#label#', dataCollection.label);

			}


		};


		// webix UI definition:
		this.ui = {
			id: ids.component,
			rows: [
				{
					id: ids.dataCollections,
					view: 'list',
					css: 'ab-data-list',
					template: _logic.listTemplate,
					select: false,
					onClick: {
						"ab-component-edit": function (e, id, trg) {
							_logic.dataCollectionEdit(e, id, trg);
						},
						"ab-component-remove": function (e, id, trg) {
							_logic.dataCollectionRemove(e, id, trg);
						}
					}
				},
				{
					id: ids.editDataCollection,
					view: 'layout',
					rows: []
				}
			]
		};


		// Expose any globally accessible Actions:
		this.actions({
		});


		// Interface methods for parent component:
		this.show = _logic.show;
		this.viewLoad = _logic.viewLoad;
		this.newDataCollection = _logic.newDataCollection;


	}

}