const ABComponent = require("./ABComponent");

module.exports = class RowUpdater extends ABComponent {

	constructor(App, idBase) {

		super(App, idBase);

		var L = this.Label;

		var labels = {
			common: (App || {}).labels,
			component: {

				addNew: L("ab.component.form.addNew", "*Add field to edit"),

				set: L("ab.component.form.set", "*Set"),
				setOption1: L("ab.component.form.recordrule.set.customValue", "*to a custom value"),
				setOption2: L("ab.component.form.recordrule.set.formValue", "*to a form value"),
				setOption3: L("ab.component.form.recordrule.set.connectedValue", "*to a connected value"),

				to: L("ab.component.form.to", "*To"),

			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			updateForm: this.unique(idBase + '_updateForm'),
			addNew: this.unique(idBase + '_addNew'),

			field: this.unique('field'),
			updateAction: this.unique('updateAction'),

		};

		var _Object;

		var updateValueOptions = [
			{ id: "customValue", value: labels.component.setOption1 },
			{ id: "formValue", value: labels.component.setOption2 },
			{ id: "connectedValue", value: labels.component.setOption3 }
		];

		// setting up UI
		this.init = (options) => {
		};

		// internal business logic
		var _logic = this._logic = {

			/**
			 * @method objectLoad
			 * set object
			 *
			 * @param object {Object}
			 */
			objectLoad: function (object) {

				_Object = object;

			},


			getFieldList: function (excludeSelected) {

				var options = (_Object.fields() || []).map(f => {
					return {
						id: f.id,
						value: f.label
					};
				});

				return options;

			},

			getUI: function () {

				return {
					view: 'layout',
					isolate: true,
					cols: [
						{
							// Label
							view: 'label',
							width: 40,
							label: labels.component.set
						},
						{
							// Field list
							view: "combo",
							id: ids.field,
							options: _logic.getFieldList(true),
							on: {
								onChange: function (columnId) {

									var $viewCond = this.getParentView();
									_logic.selectField(columnId, $viewCond);

								}
							}
						},
						{
							// Label
							view: 'label',
							width: 40,
							label: labels.component.to
						},
						// Field value
						{},
						// {
						// 	// Update action
						// 	view: "combo",
						// 	id: ids.updateAction,
						// 	options: updateValueOptions,
						// 	on: {
						// 		onChange: function (updateValue) {

						// 			var $viewCond = this.getParentView();
						// 			// _logic.selectField(columnId, $viewCond);

						// 		}
						// 	}
						// },
						{
							// "Add" button
							view: "button",
							icon: "fa fa-plus",
							type: "icon",
							width: 30,
							click: function () {
								var $viewForm = this.getFormView();

								var indexView = $viewForm.index(this.getParentView());

								_logic.addUpdateValue(indexView + 1);
							}
						},
						{
							// "Remove" button
							view: "button",
							icon: "fa fa-trash",
							type: "icon",
							width: 30,
							click: function () {

								var $viewCond = this.getParentView();

								_logic.removeUpdateValue($viewCond);
							}
						}
					]
				};

			},

			getAddButtonUI: function () {
				return {
					view: "button",
					id: ids.addNew,
					icon: "fa fa-plus",
					type: "iconButton",
					label: labels.component.addNew,
					click: function () {

						_logic.addUpdateValue();

					}
				}
			},

			addUpdateValue: function (index) {

				var $viewForm = $$(ids.updateForm);

				var remainFields = _logic.getFieldList(true);
				if (remainFields.length < 1) return;

				var ui = _logic.getUI();

				var viewId = $viewForm.addView(ui, index);

				_logic.toggleAddNewButton();

				return viewId;
			},

			removeUpdateValue: function ($viewCond) {

				var $viewForm = $$(ids.updateForm);

				$viewForm.removeView($viewCond);

				_logic.toggleAddNewButton();

			},

			toggleAddNewButton: function () {

				var $viewForm = $$(ids.updateForm);
				if (!$viewForm) return;

				// Show "Add new filter" button
				if ($viewForm.getChildViews().length < 1) {

					$viewForm.hide();
					$$(ids.addNew).show();
				}
				// Hide "Add new filter" button
				else {

					$viewForm.show();
					$$(ids.addNew).hide();
				}

			},

			selectField: function (columnId, $viewCond) {
				var fieldInfo = _Object.fields(col => col.id == columnId)[0],
					fieldComponent = fieldInfo.formComponent(),
					abView = fieldComponent.newInstance(fieldInfo.object.application),
					formFieldComponent = abView.component(App),
					inputView = formFieldComponent.ui;

// WORKAROUND: add '[Current User]' option to the user data field
if (fieldInfo.key == 'user') {
	inputView.options = inputView.options || [];
	inputView.options.unshift({
		id: 'ab-current-user',
		value: '*[Current User]'
	});
}

				// Change component to display value
				$viewCond.removeView($viewCond.getChildViews()[3]);
				$viewCond.addView(inputView, 3);

				formFieldComponent.init();

				// Show custom display of data field
				if (fieldInfo.customDisplay)
					fieldInfo.customDisplay(fieldInfo, App, $viewCond.getChildViews()[3].$view);

				// _logic.refreshFieldList();
				// $$(this).adjust();
				$$($viewCond).adjust();
				$viewCond.getFormView().adjust();

			},

			getValue: function () {

				var result = [];

				var $viewForm = $$(ids.updateForm);
				if ($viewForm) {
					$viewForm.getChildViews().forEach($viewCond => {

						// Ignore "Add new" button
						if (!$viewCond || !$viewCond.$$) return;

						var $fieldElem = $viewCond.$$(ids.field);
						if (!$fieldElem) return;

						var fieldId = $fieldElem.getValue();
						if (!fieldId) return;

						var $valueElem = $viewCond.getChildViews()[3];
						if (!$valueElem) return;

						var fieldInfo = _Object.fields(f => f.id == fieldId)[0];

						// Get value from data field manager
						var val = fieldInfo.getValue($valueElem);

						// Add to output
						result.push({
							fieldId: fieldId,
							value: val
						});

					});
				}


				return result;

			},

			setValue: function (settings) {

				settings = settings || [];

				var $viewForm = $$(ids.updateForm);
				if (!$viewForm || settings.length < 1) return;

				// Redraw form with no elements
				webix.ui([], $viewForm);

				// Add "new filter" button
				if (settings.length == 0) {
					_logic.toggleAddNewButton();
				}

				settings.forEach(item => {

					var $viewCond = $$(_logic.addUpdateValue());

					$viewCond.$$(ids.field).setValue(item.fieldId);

					var $valueElem = $viewCond.getChildViews()[3];
					if (!$valueElem) return;

					var fieldInfo = _Object.fields(f => f.id == item.fieldId)[0];
					if (!fieldInfo) return;

					// Set value
					var rowData = {};
					rowData[fieldInfo.columnName] = item.value;
					fieldInfo.setValue($valueElem, rowData);

				});

			}


		}

		// webix UI definition:
		this.ui = {
			rows: [
				{
					view: "form",
					id: ids.updateForm,
					hidden: true,
					elements: []
				},
				_logic.getAddButtonUI()
			]
		};

		// Interface methods for parent component:
		this.objectLoad = _logic.objectLoad;
		this.addUpdateValue = _logic.addUpdateValue;
		this.getValue = _logic.getValue;
		this.setValue = _logic.setValue;

	}
}