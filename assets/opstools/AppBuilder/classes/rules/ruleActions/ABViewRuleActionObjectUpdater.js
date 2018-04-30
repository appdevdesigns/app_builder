//
// ABViewRuleActionObjectUpdater
//
// An action that allows you to update fields on an object. 
//
//
import ABViewRuleAction from "../ABViewRuleAction"


export default class ABViewRuleActionObjectUpdater extends ABViewRuleAction {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase, currentForm) {

		super(App, idBase, currentForm);
		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}


		this.key = 'ABViewRuleActionFormRecordRuleUpdate';
		this.label = L('ab.component.ruleaction.updateRecord', '*Update Record');


		this.updateObject = null;  // the object this Action will Update.

		this.formRows = [];	// keep track of the Value Components being set
							// [
							//		{ fieldId: xxx, value:yyy, type:key['string', 'number', 'date',...]} 
							// ]

		this.stashRules = {}; // keep track of rule settings among our selected objects.


		// Labels for UI components
		var labels = this.labels = {
			// common: App.labels,
			component: {


				errorRequired: L("ab.ruleAction.Update.required", "*A value is required"),
				set: L("ab.component.form.set", "*Set"),
				setPlaceholder: L("ab.component.form.setPlaceholder", "*Choose a field"),
				to: L("ab.component.form.to", "*To"),
			}
		};

	}


	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {

		if (this._uiUpdater == null) {
			this._uiUpdater = this.valueDisplayList(idBase);
		}

		return this._uiUpdater;
	}


	// Our Values Display is a List of ValueRows
	// Each ValueRow will display an additional set of [add] [delete] buttons.


	valueDisplayList(idBase) {

		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			// return idBase + '_' + key  + '_' + uniqueInstanceID;
			return idBase + '_' + key  + '_' + uniqueInstanceID;
		}
		var ids = {
			updateForm: myUnique('updateForm'),	
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

				// store this row
				this.formRows.push(row);
			},


			formClear: () => {
				var UpdateForm = _logic.formGet();
				if (!UpdateForm) return;

				var children = UpdateForm.getChildViews();

				// NOTE: need to clone this array, because it is connected with the UpdatForm's 
				// internal array of items.  Once we start .removeView() the element actually 
				// is removed from the internal array, which then upset's the .forEach() from 
				// properly iterating through the structure.  It results in missed items from
				// being sent to the .forEach().
				// So Clone it and use that for .forEach()
				var cloneChildren = [];
				children.forEach((c)=>{ cloneChildren.push(c);})
				cloneChildren.forEach((c)=>{
					UpdateForm.removeView(c);
				})

				// clear our stored .formRows
				this.formRows = [];
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
				
				// Note: we just want the { valueRules:[] } here:
				var mySettings = settings.valueRules || settings;

				_logic.setValues(mySettings)

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
				if (this.updateObject) {

					options = (this.updateObject.fields() || []).map(f => {
						return {
							id: f.id,
							value: f.label
						};
					});

					// Remove fields who are selected
					if (shouldFilter) {

						// store this row
						var usedHash = {};
						this.formRows.forEach((row) => {
							var rowView = $$(row.ui.id);
							if (rowView) {
								var field = rowView.getChildViews()[1];
								usedHash[field.getValue()] = true;
							}
						});
						options = options.filter((o)=>{ return (! usedHash[o.id]); });
						
					}

				}
				return options;

			},


			isValid: () => {

				var validator = OP.Validation.validator();
				var valueField = $$(ids.row).getChildViews()[3];
				var FormView = valueField.getParentView().getParentView();


				var field = this.getUpdateObjectField( $$(ids.field).getValue() );
				if (field) {
					
					var value = field.getValue(valueField, {});

					// // if a standard component that supports .getValue()
					// if (valueField.getValue) {
					// 	value = valueField.getValue();
					// } else {
					// 	// else use for field.getValue();
					// 	value = field.getValue(valueField, {});
					// }

					// our .isValidData() wants value in an object:
					var obj = {};
					obj[field.columnName] = value;

					field.isValidData(obj, validator);

					// if value is empty, this is also an error:
					if ((value == '' || value == null) 
						|| ((Array.isArray(value)) && (value.length == 0))) {

						validator.addError(field.columnName, this.labels.component.errorRequired);
					}

					// field.getParentView()  ->  row
					// row.getParentView()  -> Form
					FormView.clearValidation();
					validator.updateForm(FormView);

					return validator.pass();

				} else {

					// if we didn't find an associated field ... then this isn't good
					// data.


//// TODO: display error for our field picker.  Note, it doesn't have a unique .name 
// field.
var fieldField = $$(ids.row).getChildViews()[1];
fieldField.define('invalidMessage', this.labels.component.errorRequired);
fieldField.define('invalid', true);
fieldField.refresh();
					// fieldField.markInvalid(this.labels.component.errorRequired);
					return false;
				}
			},


			selectField: (columnID) => {

				var field = this.getUpdateObjectField(columnID );
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
					field.customDisplay(field, this.App, $row.getChildViews()[3].$view, true, true);

			
			},

			setValue: (data) => {
				$$(ids.field).setValue(data.fieldID);
					// note: this triggers our _logic.selectField() fn.
				var field = this.getUpdateObjectField( data.fieldID );
				if (field)
					field.setValue($$(ids.value), data.value);
			},

			toSettings: () => {

				// if this isn't the last entry row
				// * a row with valid data has the [delete] button showing.
				var buttonDelete = $$(ids.buttonDelete);
				if (buttonDelete && buttonDelete.isVisible()) {

					var data = {};
					data.fieldID = $$(ids.field).getValue();

					var valueField = $$(ids.value);
					var field = this.getUpdateObjectField( data.fieldID );
					
					data.value = field.getValue(valueField, {});
					data.op = 'set';  // possible to create other types of operations.
					data.type = field.key;

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
					autowidth: true,
					label: this.labels.component.set
				},
				{
					// Field list
					view: "combo",
					placeholder: this.labels.component.setPlaceholder,
					id: ids.field,
					height: 32,
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
					autowidth: true,
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
					click: function () {

						if (_logic.isValid()) {

							_logic.buttonsToggle();
							_logic.callbacks.onAdd();
						}
						
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



	getUpdateObjectField(fieldID) {
		return this.updateObject.fields((f)=>{ return f.id == fieldID })[0];
	}



	/**
	 * @method processUpdateObject
	 * Perform the specified update actions on the provided objectToUpdate
	 * @param {obj} options  Additional information required to make updates.
	 * @param {obj} objectToUpdate  The object to make the updates on.
	 * @return {bool}   true if an update took place, false if no updates.
	 */
	processUpdateObject(options, objectToUpdate) {

		var isUpdated = false;

		this.valueRules = this.valueRules || {};
		this.valueRules.fieldOperations = this.valueRules.fieldOperations || [];

		// for each of our operations
		this.valueRules.fieldOperations.forEach((op) => {
			// op = {
			// 	fieldID:'zzzzz', 
			//	value: 'xxx',
			//	op: 'set',
			//  type:''
			// }

			var field = this.getUpdateObjectField(op.fieldID);
			if (field) { 

				switch(op.op) {

					case 'set': 
						objectToUpdate[field.columnName] = op.value; 
						break;
				}
				
				isUpdated = true;
			}
		})


		return isUpdated;
	}



	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	// @return {Promise}
	process(options) {

		return new Promise( (resolve, reject) => {

			var isUpdated = this.processUpdateObject({}, options.data);

			if (!isUpdated) {
				resolve();
			} else {

				// get the model from the provided Form Obj:
				var dc = options.form.dataCollection();
				if (!dc) return resolve();

				var model = dc.model;
				model.update(options.data.id, options.data)
				.catch((err)=>{
					OP.Error.log('!!! ABViewRuleActionFormRecordRuleUpdate.process(): update error:', {error:err, data:options.data });
					reject(err);
				})
				.then(resolve);

			}
		})
	}


	// objectLoad
	// save the current object this Action is associated with.
	objectLoad(object) {
		super.objectLoad(object);
		this.updateObjectLoad(object);
	}

	// updateObjectLoad
	// save the given object as the object we will update.
	updateObjectLoad(object) {

		// stash rules for old object
		if (this.updateObject) {
			this.stashRules[this.updateObject.id] = this.valueRules;
		}

		this.updateObject = object;

		// with a new updateObject, then reset our UI
		this._uiUpdater = null; 

		// reload any stashed rules, or set to {}
		this.valueRules = this.stashRules[this.updateObject.id] || {};
	}

	// fromSettings
	// initialize this Action from a given set of setting values.
	// @param {obj}  settings
	fromSettings(settings) {
		settings = settings || {};

		super.fromSettings(settings); // let the parent handle the QB


		// make sure UI is updated:
		// set our updateObject
		if (settings.updateObjectURL) {
			var updateObject = this.currentForm.application.urlResolve(settings.updateObjectURL);
			this.updateObject = updateObject;
		}


		// if we have a display component, then populate it:
		if (this._uiUpdater) {

			// now we handle our valueRules:{} object settings.
			// pass the settings off to our DisplayList component:
			this._uiUpdater.fromSettings(settings);
		}
	}


	// toSettings
	// return an object that represents the current state of this Action
	// @return {obj}
	toSettings() {

		// settings: {
		//	valueRules:{}
		// }

		// let our parent store our QB settings
		var settings = super.toSettings();

		settings.valueRules = this._uiUpdater.toSettings();
		settings.updateObjectURL = this.updateObject.urlPointer();

		return settings;
	}


}