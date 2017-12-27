
export default class RowUpdater extends OP.Component {

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
			updateForm: this.unique('updateForm'),
			field: this.unique('field'),
			updateAction: this.unique('updateAction'),
			addNew: this.unique('addNew')
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

				// // Remove fields who are selected
				// if (excludeSelected) {
				// 	console.log("PONG: ", $$(ids.updateForm).getValues());
				// }

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
							icon: "plus",
							type: "icon",
							width: 30,
							click: function () {
								var $viewForm = this.getFormView();

								var indexView = $viewForm.index(this.getParentView());

								_logic.addUpdateValue($viewForm, indexView + 1);
							}
						},
						{
							// "Remove" button
							view: "button",
							icon: "trash",
							type: "icon",
							width: 30,
							click: function () {

								var $viewForm = this.getFormView();
								var $viewCond = this.getParentView();

								_logic.removeUpdateValue($viewForm, $viewCond);
							}
						}
					]
				};

			},

			getAddButtonUI: function () {
				return {
					view: "button",
					id: ids.addNew,
					icon: "plus",
					type: "iconButton",
					label: labels.component.addNew,
					click: function () {

						var $viewForm = this.getFormView();
						_logic.addUpdateValue($viewForm);

					}
				}
			},

			addUpdateValue: function ($viewForm, index) {

				var remainFields = _logic.getFieldList(true);
				if (remainFields.length < 1) return;

				var ui = _logic.getUI();

				var viewId = $viewForm.addView(ui, index);

				_logic.toggleAddNewButton($viewForm);

				return viewId;
			},

			removeUpdateValue: function ($viewForm, $viewCond) {

				$viewForm.removeView($viewCond);

				_logic.toggleAddNewButton($viewForm);

			},

			toggleAddNewButton: function ($viewForm) {

				// Add "Add new filter" button
				if ($viewForm.getChildViews().length < 1) {
					$viewForm.addView(_logic.getAddButtonUI());
				}
				// Remove "Add new filter" button
				else {
					if ($viewForm.$$(ids.addNew))
						$viewForm.removeView(ids.addNew);

				}

			},

			selectField: function (columnId, $viewCond) {
				var fieldInfo = _Object.fields(col => col.id == columnId)[0],
					fieldComponent = fieldInfo.formComponent(),
					abView = fieldComponent.newInstance(fieldInfo.object.application),
					inputView = abView.component(App).ui;

				// Change component to display value
				$viewCond.removeView($viewCond.getChildViews()[3]);
				$viewCond.addView(inputView, 3);

				abView.component(App).init();

				// Show custom display of data field
				if (fieldInfo.customDisplay)
					fieldInfo.customDisplay(fieldInfo, App, $viewCond.getChildViews()[3].$view);

				// _logic.refreshFieldList();
				// $$(this).adjust();
				$$($viewCond).adjust();
				$viewCond.getFormView().adjust();

			},

			getValue: function ($viewForm) {

				var result = [];


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


				return result;

			},

			setValue: function (settings, $viewForm) {

				settings = settings || [];

				if (!$viewForm || settings.length < 1) return;

				// Rebuild
				$viewForm.getChildViews().forEach(v => {
					$viewForm.removeView(v);
				});

				settings.forEach(item => {

					var $viewCond = $$(_logic.addUpdateValue($viewForm));

					$viewCond.$$(ids.field).setValue(item.fieldId);

					var $valueElem = $viewCond.getChildViews()[3];
					if (!$valueElem) return;

					var fieldInfo = _Object.fields(f => f.id == item.fieldId)[0];
					if (!fieldInfo) return;

					// Set value
					fieldInfo.setValue($valueElem, item.value);

				});

			}


		}

		// webix UI definition:
		this.ui = {
			view: "form",
			id: ids.updateForm,
			isolate: true,
			elements: [
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