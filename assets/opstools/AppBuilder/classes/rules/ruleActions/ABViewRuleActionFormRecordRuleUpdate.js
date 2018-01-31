//
// ABViewRuleActionFormRecordRuleUpdate
//
// An action that allows you to update fields on an object. 
//
//
import ABViewRuleAction from "../ABViewRuleAction"


export default class ABViewRuleActionFormRecordRuleUpdate extends ABViewRuleAction {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {

		super(App, idBase);
		var L = this.Label;


		this.key = 'ABViewRuleActionFormRecordRuleUpdate';
		this.label = L('ab.component.ruleaction.abviewruleActionFormRecordRuleUpdate', '*Update Record');


		this.currentObject = null;  // the object this Action is tied to.


		// Labels for UI components
		var labels = this.labels = {
			common: App.labels,
			component: {

				set: L("ab.component.form.set", "*Set"),
				to: L("ab.component.form.to", "*To"),
			}
		};

		// // internal list of Webix IDs to reference our UI components.
		// var ids = this.ids = {
		// 	// each instance must be unique
		// 	component: this.unique(idBase + '_component')+'_'+webix.uid(),	
		// 	// rules: this.unique(idBase + '_rules'),

		// 	// action: this.unique(idBase + '_action'),
		// 	// when: this.unique(idBase + '_when'),

		// 	// values: this.unique(idBase + '_values'),
		// 	// set: this.unique(idBase + '_set')

		// };


		// this.ui = {};


		// // for setting up UI
		// this.init = (options) => {
		// 	// register callbacks:
		// 	for (var c in _logic.callbacks) {
		// 		_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		// 	}
		// };

		// // internal business logic 
		// var _logic = this._logic = {

		// 	callbacks: {
		// 		onDelete: function () { console.warn('NO onDelete()!') },
		// 		onSave: function (field) { console.warn('NO onSave()!') },
		// 	},

		// }

	}

////
//// LEFT OFF HERE:
// - persist data 
// - displaying the Rule should populate QB with existing data.


	conditionFields() {
		
		var fieldTypes = ['string', 'number', 'date'];

		var currFields = [];

		if (this.currentObject) {
			this.currentObject.fields().forEach((f)=>{

				if (fieldTypes.indexOf(f.key) != -1) {
					currFields.push({
						id: f.id,
						value: f.label,
						type: f.key
					});
				}
			})
		}

		return currFields;

	}


	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {

		if (this._ui == null) {
			this._ui = this.valueDisplayList(idBase);
		}

		return this._ui;
	}


	// Our Values Display is a List of ValueRows
	// Each ValueRow will display an additional set of [add] [delete] buttons.


	valueDisplayList(idBase) {

		var ids = {
			updateForm: idBase + '_updateForm',	
		};

		var _ui = {
			view: "form",
			id: ids.updateForm,
// hidden: true,
			elements: []
		};


		var init = (valueRules) => {
			valueRules = valueRules || this.valueRules;
			_logic.setValues(valueRules);
		}

		var _logic = {

			// addRow
			// add a new data entry to this form.
			// @param {obj} data  (optional) initial values for this row.
			addRow: (data) => {

				// get a new Row Component
				var row = this.valueDisplayRow(idBase);

				// get our Form
				var UpdateForm = _logic.formGet();
				if (!UpdateForm) return;

				// add row to Form
				UpdateForm.addView(row.ui);

				// initialize row with any provided data:
				row.init({ onAdd:()=>{

					// add a new Row
					_logic.addRow();

				}, onDelete:()=>{
					UpdateForm.removeView($$(row.ui.id));
				}, data:data});

				UpdateForm.adjust();
			},


			formClear: () => {
				var UpdateForm = _logic.formGet();
				if (!UpdateForm) return;

				var children = UpdateForm.getChildViews();
				children.forEach((c)=>{
					UpdateForm.removeView(c);
				})
			},


			formGet: () => {
				var UpdateForm = $$(ids.updateForm);
				if (!UpdateForm) {
					 // this is a problem!
					OP.Error.log('ABViewRuleActionFormRecordRuleUpdate.init() could not find webix form.', {id:ids.updateForm });
					return null; 
				}

				return UpdateForm;
			},


			setValues: (valueRules ) => {

				valueRules = valueRules || [];

				// find the form
				var UpdateForm = _logic.formGet();
				if (!UpdateForm) return; 
			
				// clear form:
				_logic.formClear();

				// if there are values to 
				if (valueRules.length > 0) {

					valueRules.forEach((r) => {
						_logic.addRow(r);
					})

				} else {

					// display an empty row
					_logic.addRow(); 
				}

			}
			
		};

		return {
			ui: _ui,
			init:init,
			_logic:_logic
		};
	}


	valueDisplayRow(idBase) {

		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			return idBase + key  + '_' + uniqueInstanceID;
		}

		var ids = {
			row:      		myUnique('_row'),
			updateForm: 	myUnique('_updateFormRow'),	
			field: 			myUnique('_field'),
			buttonAdd: 		myUnique('_add'),
			buttonDelete: 	myUnique('_delete')
		};


		var _logic = {

			callbacks: {
				onAdd: () => {

				},
				onDelete: () => {

				}
			},


			buttonsToggle: () => {
				$$(ids.row).getChildViews()[4].hide();
				$$(ids.row).getChildViews()[5].show();
			},

			getFieldList: (shouldFilter) => {

				var options = [];
				if (this.currentObject) {

					options = (this.currentObject.fields() || []).map(f => {
						return {
							id: f.id,
							value: f.label
						};
					});

					// // Remove fields who are selected
					// if (excludeSelected) {
					// 	console.log("PONG: ", $$(ids.updateForm).getValues());
					// }

				}
				return options;

			},

			selectField: (columnID) => {

				var field = this.currentObject.fields((f)=>{ return f.id == columnID })[0];
				if (!field) return;

				var fieldComponent = field.formComponent(),
					abView = fieldComponent.newInstance(field.object.application),
					formFieldComponent = abView.component(this.App),
					inputView = formFieldComponent.ui;


// WORKAROUND: add '[Current User]' option to the user data field
if (field.key == 'user') {
	inputView.options = inputView.options || [];
	inputView.options.unshift({
		id: 'ab-current-user',
		value: '*[Current User]'
	});
}

				// Change component to display this field's form input
				var $row = $$(ids.row);
				$row.removeView($row.getChildViews()[3]);
				$row.addView(inputView, 3);

				formFieldComponent.init();


				// Show custom display of data field
				if (field.customDisplay)
					field.customDisplay(field, this.App, $row.getChildViews()[3].$view);

				// _logic.refreshFieldList();
				// $$(this).adjust();
				$$($row).adjust();
				$row.getFormView().adjust();
			
			},

			setValue: (data) => {
console.error('!!! setValue():', data);				
			}
		}


		var _ui = {
			id: ids.row,
			view: 'layout',
			isolate: true,
			cols: [
				{
					// Label
					view: 'label',
					width: 40,
					label: this.labels.component.set
				},
				{
					// Field list
					view: "combo",
					id: ids.field,
					options: _logic.getFieldList(true),
					on: {
						onChange: function (columnId) {
// var $viewCond = this.getParentView();
							_logic.selectField(columnId);

						}
					}
				},
				{
					// Label
					view: 'label',
					width: 40,
					label: this.labels.component.to
				},

				// Field value
				// NOTE: this view gets replaced each time a field is selected.
				// We replace it with a component associated with the Field 
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

				// by default, we show the add button
				// if the row has data, we show the [remove] button.
				{
					// "Add" button 
					view: "button",
					id:   ids.buttonAdd,
					icon: "plus",
					type: "icon",
					width: 30,
					// hidden:true,
					click: function () {

						_logic.buttonsToggle();

						_logic.callbacks.onAdd();
// var $viewForm = this.getFormView();

// var indexView = $viewForm.index(this.getParentView());

// _logic.addUpdateValue(indexView + 1);
					}
				},
				{
					// "Remove" button  
					view: "button",
					id:   ids.buttonDelete,
					icon: "trash",
					type: "icon",
					width: 30,
					hidden:true,
					click: function () {

						_logic.callbacks.onDelete();
// var $viewCond = this.getParentView();

// _logic.removeUpdateValue($viewCond);
					}
				}
			]
		};


		var init = (options) => {
			for( var c in _logic.callbacks){
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			if (options.data) {
				_logic.setValue(options.data);

				_logic.buttonsToggle();
			}
		}

		

		return {
			ui: _ui,
			init:init,
			_logic:_logic
		};

	}


}