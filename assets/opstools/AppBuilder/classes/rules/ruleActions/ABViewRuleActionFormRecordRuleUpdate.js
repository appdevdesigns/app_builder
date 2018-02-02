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

		this.formRows = [];	// keep track of the Value Components being set
							// [
							//		{ fieldId: xxx, value:yyy, type:key['string', 'number', 'date',...]} 
							// ]

		// Labels for UI components
		var labels = this.labels = {
			common: App.labels,
			component: {

				set: L("ab.component.form.set", "*Set"),
				to: L("ab.component.form.to", "*To"),
			}
		};

	}

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

// UpdateForm.adjust();

				// store this row
				this.formRows.push(row);
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

				// valueRules = {
				//	fieldOperations:[
				//		{ fieldID:xxx, value:yyyy, type:zzz, op:aaa }
				//	]
				// }

				valueRules = valueRules || {};
				valueRules.fieldOperations = valueRules.fieldOperations || [];

				// find the form
				var UpdateForm = _logic.formGet();
				if (!UpdateForm) return; 
			
				// clear form:
				_logic.formClear();

				// if there are values to 
				if (valueRules.fieldOperations.length > 0) {

					valueRules.fieldOperations.forEach((r) => {
						_logic.addRow(r);
					})
				} 

				// display an empty row
				_logic.addRow(); 

			}, 

			fromSettings: (settings) => {

				// make sure UI is updated:
				_logic.setValues(settings)

			},

			toSettings:() => {

				// valueRules = {
				//	fieldOperations:[
				//		{ fieldID:xxx, value:yyyy, type:zzz, op:aaa }
				//	]
				// }
				var settings = {fieldOperations:[]};

				// for each of our formRows, decode the propery {} 
				this.formRows.forEach((fr) => {
					var rowSettings = fr.toSettings();
					if (rowSettings) {
						settings.fieldOperations.push(fr.toSettings());
					}
				})

				return settings;
			}
			
		};

		return {
			ui: _ui,
			init:init,
			fromSettings: (settings) => { _logic.fromSettings(settings); },
			toSettings: ()=> { return _logic.toSettings() },
			_logic:_logic
		};
	}


	valueDisplayRow(idBase) {

		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			// return idBase + '_' + key  + '_' + uniqueInstanceID;
			return key  + '_' + uniqueInstanceID;
		}

		var ids = {
			row:      		myUnique('row'),
			updateForm: 	myUnique('updateFormRow'),	
			field: 			myUnique('field'),
			value:  		myUnique('value'),
			buttonAdd: 		myUnique('add'),
			buttonDelete: 	myUnique('delete')
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

			getObjectField: (fieldID) => {
				return this.currentObject.fields((f)=>{ return f.id == fieldID })[0];
			}, 

			selectField: (columnID) => {

				var field = _logic.getObjectField(columnID );
				if (!field) return;

				var fieldComponent = field.formComponent(),
					abView = fieldComponent.newInstance(field.object.application),
					formFieldComponent = abView.component(this.App),
					inputView = formFieldComponent.ui;

					inputView.id = ids.value;  // set our expected id 

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

// $$($row).adjust();
// $row.getFormView().adjust();
			
			},

			setValue: (data) => {
				$$(ids.field).setValue(data.fieldID);
					// note: this triggers our _logic.selectField() fn.
				$$(ids.value).setValue(data.value);	
			},

			toSettings: () => {

				// if this isn't the last entry row
				// * a row with valid data has the [delete] button showing.
				var buttonDelete = $$(ids.buttonDelete);
				if (buttonDelete && buttonDelete.isVisible()) {

					var data = {};
					data.fieldID = $$(ids.field).getValue();
					data.value = $$(ids.value).getValue();

					data.op = 'set';  // possible to create other types of operations.

					var field = _logic.getObjectField(data.fieldID);
					data.type = field.type;

					return data;
				}
				else {
					return null;
				}
			}
		}


		var _ui = {
			id: ids.row,
			view: 'layout',
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
					}
				}
			]
		};


		var init = (options) => {
			for( var c in _logic.callbacks){
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			if (options.data) {
				// options.data = { formID:xxx, value:yyy,  type:zzzz }
				_logic.setValue(options.data);

				_logic.buttonsToggle();
			}
		}

		

		return {
			ui: _ui,
			init:init,
			toSettings: () => { return _logic.toSettings() },
			_logic:_logic
		};

	}


	// fromSettings
	// initialize this Action from a given set of setting values.
	// @param {obj}  settings
	fromSettings(settings) {
		settings = settings || {};
		super.fromSettings(settings); // let the parent handle the QB

		// now we handle our valueRules:{} object settings.
		// pass the settings off to our DisplayList component:
		this._ui.fromSettings(settings.valueRules);
	}


	// toSettings
	// return an object that represents the current state of this Action
	// @return {obj}
	toSettings() {

		// settings: {
		//	querycondition:{},
		//	values:{}
		// }

		// let our parent store our QB settings
		var settings = super.toSettings();

		// settings = { queryRules:{} }

		settings.valueRules = this._ui.toSettings();

		return settings;
	}


}