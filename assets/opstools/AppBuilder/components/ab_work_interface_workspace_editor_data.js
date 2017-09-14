import ABViewPage from "../classes/views/ABViewPage"

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
			component: this.unique('dataSource'),
			view: this.unique('view')
		};

		var _template = [
			'<div class="ab-component-in-page">',
			'<i class="fa fa-trash ab-component-remove"></i>' +
			'<i class="fa fa-edit ab-component-edit"></i>' +
			'<div id="' + ids.view + '_#objID#" >',
			'<i class="fa fa-#icon#"></i>',
			' #label#',
			'</div>',
			'</div>'
		].join('');

		var CurrentPage = null;


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
			* @param {ABViewPage} page  current view instance.
			*/
			pageLoad: function (page) {

				if (!(page instanceof ABViewPage)) return;

				CurrentPage = page;

				// clear list
				$$(ids.component).clearAll();

				// load view's data sources in list
				$$(ids.component).parse(page.dataSources());

			},


			/**
			 * @method newDataSource
			 * Add a new ABViewDataSource to current page
			 */
			newDataSource: function () {

				var newDataSource = CurrentPage.dataSourceNew();

				newDataSource.save()
					.then(() => {

						_logic.pageLoad(CurrentPage);

					});

			},


			/**
			 * @method dataSourceEdit
			 * 
			 */
			dataSourceEdit: function (e, id, trg) {

				var datasource = CurrentPage.dataSources(function (data) { return data.id == id; })[0];

				if (!datasource) return false;

				// NOTE: let webix finish this onClick event, before
				// calling .populateInterfaceWorkspace() which will replace
				// the interface elements with the edited view.  (apparently
				// that causes errors.)
				setTimeout(() => {
					App.actions.populateInterfaceWorkspace(datasource);
				}, 50);

				e.preventDefault();
				return false;

			},


			/**
			 * @method dataSourceRemove
			 * 
			 */
			dataSourceRemove: function (e, id, trg) {


				var datasource = CurrentPage.dataSources(function (data) { return data.id == id; })[0];
				if (datasource) {

					OP.Dialog.Confirm({
						title: L('ab.interface.component.datasource.confirmDeleteTitle', '*Delete Data Source'),
						text: L('ab.interface.component.datasource.confirmDeleteMessage', 'Do you want to delete <b>{0}</b>?').replace('{0}', datasource.label),
						callback: (result) => {
							if (result) {
								CurrentPage.dataSourceDestroy(datasource);

								// remove tab option
								$$(ids.component).remove(id);
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
			listTemplate: function (dataSource) {

				return _template
					.replace('#objID#', dataSource.id)
					.replace('#icon#', dataSource.icon)
					.replace('#label#', dataSource.label);

			}


		};


		// webix UI definition:
		this.ui = {
			id: ids.component,
			view: 'list',
			template: _logic.listTemplate,
			select: false,
			onClick: {
				"ab-component-edit": function (e, id, trg) {
					_logic.dataSourceEdit(e, id, trg);
				},
				"ab-component-remove": function (e, id, trg) {
					_logic.dataSourceRemove(e, id, trg);
				}
			}
		};


		// Expose any globally accessible Actions:
		this.actions({
		});


		// Interface methods for parent component:
		this.show = _logic.show;
		this.pageLoad = _logic.pageLoad;
		this.newDataSource = _logic.newDataSource;


	}

}