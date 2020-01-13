const ABComponent = require("../classes/platform/ABComponent");

const RowFilter = require("../classes/platform/RowFilter");

module.exports = class AB_Work_Admin_Role_Scope_Form extends ABComponent {

	constructor(App) {

		let idBase = 'ab_work_admin_role_scope_form';

		super(App, idBase);

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				newScope: L('ab.scope.new.title', "*Add new scope")
			}
		};

		let CurrentApplication;

		// internal list of Webix IDs to reference our UI components.
		let ids = {
			popup: this.unique('popup'),
			form: this.unique('form'),
			object: this.unique('object'),
			buttonSave: this.unique('buttonSave')
		};

		this._rowFilter = new RowFilter(App, idBase);

		// Our webix UI definition:
		this.ui = {
			id: ids.popup,
			view: "window",
			head: labels.component.newScope,
			hidden: true,
			modal: true,
			position: "center",
			body: {
				id: ids.form,
				view: 'form',
				// padding: 24,
				width: 800,
				elementsConfig: { labelAlign: "right", labelWidth: 85 },
				rows: [
					{
						view: "text",
						name: "name",
						label: "Name",
						placeholder: "Enter Name"
					},
					{
						view: "text",
						name: "description",
						label: "Description",
						placeholder: "Enter Description"
					},
					{
						view: "checkbox",
						name: "isGlobal",
						label: "Is Global"
					},
					{
						id: ids.object,
						view: "multicombo",
						name: "objectIds",
						label: "Objects",
						options: []
					},
					{
						view: "forminput",
						paddingY: 0,
						paddingX: 0,
						label: "Filter",
						css: "ab-custom-field",
						body: this._rowFilter.ui
					},
					{
						cols: [
							{ fillspace: true },
							{
								view: 'button',
								autowidth: true,
								value: L("ab.common.cancel", "*Cancel"),
								click: () => {

									_logic.cancel();

								}
							},
							{
								view: "button",
								type: "form",
								id: ids.buttonSave,
								autowidth: true,
								value: L("ab.common.save", "*Save"),
								click: () => {

									_logic.save();

								}
							}
						]
					},
					{
						fillspace: true
					}
				]
			}
		};

		// Our init() function for setting up our UI
		this.init = function (roleDC, scopeDC) {

			webix.ui(this.ui);

			this._roleDC = roleDC;
			this._scopeDC = scopeDC;
			if (this._scopeDC) {

				// if ($$(ids.form))
				// 	$$(ids.form).bind(this._scopeDC);

				// Update RowFilter
				this._scopeDC.attachEvent("onAfterCursorChange", (currId) => {

					_logic.refreshData();

				});
			}

			if ($$(ids.form))
				webix.extend($$(ids.form), webix.ProgressBar);

			this._rowFilter.init({
				showObjectName: true
			});

		}
		// our internal business logic
		let _logic = {

			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application 
			 */
			applicationLoad: function (application) {

				CurrentApplication = application;
				this._rowFilter.applicationLoad(application);

			},

			refreshData: () => {

				$$(ids.form).clear();

				let currScopeId = this._scopeDC.getCursor();
				let currScope = this._scopeDC.getItem(currScopeId);
				if (currScope) {

					$$(ids.form).setValues({
						name: currScope.name,
						description: currScope.description,
						isGlobal: currScope.isGlobal,
						objectIds: currScope.objectIds
					});

					// Update row filter
					let fieldList = [];
					(currScope.objects() || []).forEach(obj => {
						fieldList = fieldList.concat(obj.fields());
					});

					this._rowFilter.fieldsLoad(fieldList);
					this._rowFilter.setValue(currScope.filter);
				}
				else {
					$$(ids.form).setValues({});

					this._rowFilter.fieldsLoad([], null);
					this._rowFilter.setValue(null);
				}

			},

			save: () => {

				if (!this._scopeDC)
					return;

				_logic.busy();

				let roleId;
				if (this._roleDC)
					roleId = this._roleDC.getCursor();

				let role = this._roleDC.getItem(roleId);

				let vals = $$(ids.form).getValues() || {};

				let currScope = _logic.getScope();

				// Add new
				let isAdded = false;
				if (!currScope) {
					currScope = CurrentApplication.scopeNew(vals);
					isAdded = true;
				}
				// Update
				else {
					for (let key in vals) {
						if (vals[key] != undefined)
							currScope[key] = vals[key];
					}
					isAdded = false;
				}

				// set .filter
				currScope.filter = this._rowFilter.getValue();

				CurrentApplication.scopeSave(currScope, role)
					.catch(err => {
						console.error(err);
						_logic.ready();
					})
					.then(data => {

						// Set object to scope
						let objectIds = (data.objectIds || "").split(',');
						if (objectIds && objectIds.length) {
							data._objects = CurrentApplication.objects(o => objectIds.indexOf(o.id) > -1);
						}

						if (isAdded) {
							currScope.id = data.id;
							this._scopeDC.add(currScope);
						}

						this._scopeDC.updateItem(data.id, data);

						_logic.ready();
						_logic.hide();
					});

			},

			getScope: () => {

				if (!this._scopeDC) return null;

				let currScopeId = this._scopeDC.getCursor();
				if (!currScopeId) return null;

				return this._scopeDC.getItem(currScopeId);

			},

			cancel: () => {

				if (this._scopeDC) {
					this._scopeDC.setCursor(null);
				}

				_logic.hide();

			},

			show: () => {

				if ($$(ids.popup))
					$$(ids.popup).show();

				let objOptions = CurrentApplication.objects().map(o => {
					return {
						id: o.id,
						value: o.label
					}
				});

				let scope = _logic.getScope();
				if (scope &&
					scope.object &&
					scope.object[0]) {
					let exists = (objOptions.filter(o => o.id == scope.object[0].id).length > 0);
					if (!exists) {
						objOptions.push({
							id: scope.object[0].id,
							value: scope.object[0].label
						});
					}
				}

				$$(ids.object).define("options", objOptions);
				$$(ids.object).refresh();

				_logic.refreshData();

			},

			hide: () => {

				if ($$(ids.popup))
					$$(ids.popup).hide();

			},

			busy: () => {

				if ($$(ids.form) &&
					$$(ids.form).showProgress)
					$$(ids.form).showProgress({ type: "icon" });

				$$(ids.buttonSave).disable();

			},

			ready: () => {

				if ($$(ids.form) &&
					$$(ids.form).hideProgress)
					$$(ids.form).hideProgress();

				$$(ids.buttonSave).enable();

			},

		};

		this._logic = _logic;

		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;
	}

};