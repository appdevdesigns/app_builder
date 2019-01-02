/*
 * ab_work_object_workspace_kanban_sidePanel
 *
 * Manage the Object Workspace KanBan update data area.
 *
 */

import ABViewForm from '../classes/views/ABViewForm'
import ABViewFormButton from '../classes/views/ABViewFormButton'

export default class ABWorkObjectKanBan extends OP.Component {

	/**
	 * 
	 * @param {*} App 
	 * @param {*} idBase 
	 */

	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_kanban_sidePanel';
		super(App, idBase);

		var L = this.Label;
		var labels = {
			common: App.labels,
			component: {
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique(idBase + '_workspace_kanban_side'),
			form: this.unique(idBase + '_workspace_kanban_side_form')
		};

		var CurrentObject = null;	// current ABObject being displayed

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			width: 300,
			hidden: true,
			rows: [
				{
					cols: [{},
					{
						view: "icon",
						icon: "wxi-close",
						align: "right",
						click: function (id) {

							_logic.hide();

						}
					}
					]
				},
				{
					id: ids.form,
					view: 'form',
					borderless: true,
					rows: []
				},
				{}
			]
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			// register our callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}
		};


		// our internal business logic
		var _logic = this._logic = {

			callbacks: {

				onAddData: function(data) {},
				onUpdateData: function(data) {},
				onClose: function () { },
			},

			objectLoad: (object) => {

				CurrentObject = object;

			},

			hide: function () {

				$$(ids.component).hide();

				_logic.callbacks.onClose();

			},

			show: function (data) {

				$$(ids.component).show();

				_logic.refreshForm(data);

			},

			refreshForm: function (data) {

				// data = data || {};

				let formAttrs = {
					settings: {
						columns: 1,
						labelPosition: 'top',
						showLabel: 1,
						clearOnLoad: 0,
						clearOnSave: 0,
						labelWidth: 120,
						height: 0
					}
				};
				let form = new ABViewForm(formAttrs, CurrentObject.application);

				// Populate child elements
				CurrentObject.fields().forEach((f, index) => {
					form.addFieldToForm(f, index);
				});

				// add default button (Save button)
				form._views.push(new ABViewFormButton({
					settings: {
						includeSave: true,
						includeCancel: false,
						includeReset: false
					},
					position: {
						y: CurrentObject.fields().length // yPosition
					}
				}, CurrentObject.application, form));

				// add temp id to views
				form._views.forEach(v => v.id = OP.Util.uuid());

				let formCom = form.component(App);

				// Rebuild form
				webix.ui(formCom.ui.rows, $$(ids.form));
				webix.extend($$(ids.form), webix.ProgressBar);

				formCom.init({
					onBeforeSaveData: () => {

						// show progress icon
						if ($$(ids.form).showProgress)
							$$(ids.form).showProgress({ type: "icon" });

						// get update data
						var formVals = form.getFormValues($$(ids.form), CurrentObject);

						// validate data
						if (!form.validateData($$(ids.form), CurrentObject, formVals))
							return false;

						if (formVals.id) {
							CurrentObject.model().update(formVals.id, formVals)
								.catch((err) => {

									// TODO : error message
									console.error(err);

									if ($$(ids.form).hideProgress)
										$$(ids.form).hideProgress({ type: "icon" });

								})
								.then((updateVals) => {

									_logic.callbacks.onUpdateData(updateVals);

									if ($$(ids.form).hideProgress)
										$$(ids.form).hideProgress({ type: "icon" });

								});
						}
						// else add new row
						else {
							CurrentObject.model().create(formVals)
								.catch((err) => {

									// TODO : error message
									console.error(err);

									if ($$(ids.form).hideProgress)
										$$(ids.form).hideProgress({ type: "icon" });

								})
								.then((newVals) => {

									_logic.callbacks.onAddData(newVals);

									if ($$(ids.form).hideProgress)
										$$(ids.form).hideProgress({ type: "icon" });

								});
						}

						return false;
					}
				});

				// display data
				$$(ids.form).parse(data);

				formCom.onShow(data);


			}

		};

		// 
		// Define our external interface methods:
		// 

		this.hide = _logic.hide;
		this.show = _logic.show;
		this.objectLoad = _logic.objectLoad;

	}

}



