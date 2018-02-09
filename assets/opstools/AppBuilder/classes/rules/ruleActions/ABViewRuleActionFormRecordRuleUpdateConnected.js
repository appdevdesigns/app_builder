//
// ABViewRuleActionFormRecordRuleUpdateConnected
//
// An action that allows you to update fields on an object that is connected to 
// the current object we just Added/Updated
//
//
import ABViewRuleActionObjectUpdater from "./ABViewRuleActionObjectUpdater"
// import ABFieldConnect from "../../dataFields/ABFieldConnect"

import ObjectQueryBuilder from "../ABViewQueryBuilderObjectFieldConditions"


//// LEFT OFF HERE:
// Now implement Update Connected Object:
// - toSettings() and fromSettings();
// - debug importing ABFieldConnect errors
//

export default class ABViewRuleActionFormRecordRuleUpdateConnected extends ABViewRuleActionObjectUpdater {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor() {

		super();
		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}


		this.key = 'ABViewRuleActionFormRecordRuleUpdateConnected';
		this.label = L('ab.component.ruleaction.updateConnectedRecord', '*Update Connected Record');

		this.baseObject = null;  // the object the current form is working with.  
								 // Use this to find our connected fields.

		this.selectedFieldID = null;  // the selected field ID in the .baseObject that is 
									  // used for updating.  This should be one of the connection Fields.

		this.fieldDropList = [];	// the list of fields to offer based upon the current .baseObject.


		this.objectQB = null;		// the QueryBuilder used for offering conditions based upon our connected Object.



		this.labels.component.selectField = L("ab.ruleAction.UpdateConnected.selectField", "*Select which connected object to update.");
		this.labels.component.remoteCondition = L("ab.ruleAction.UpdateConnected.remoteCondition", "*How to choose which object:");
	}


	// field

	// objectLoad
	// save the current object this Action is associated with.
	// in the case of the UpdateConnected Action, assigning us 
	// this object only impacts the queryObject.
	// 
	// The Updater form will use another object we select in 
	// the form dropdown.
	// @param {obj} object
	//
	objectLoad(object) {
		this.queryObjectLoad(object);
		this.baseObject = object;

		// now build our fieldDropList for the select 
		var connectionFields = this.connectedFieldList();
		connectionFields.forEach((cf) => {
			this.fieldDropList.push({
				id: cf.id,
				value: cf.label
			})
		})
	}


	connectedFieldList() {
		var connectKey = "connectObject"; // ABFieldConnect.defaults().key;
		return this.baseObject.fields((f)=>{ return f.key == connectKey; });
	}

	connectedObject() {

		if (this.selectedFieldID) {
			var selectedField = this.selectedField();
			if (selectedField) {
				return selectedField.datasourceLink;
			}
		}

		return null;
	}


	selectedField() {
		return this.connectedFieldList().filter((f)=>{ return f.id == this.selectedFieldID; })[0];
	}






	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {

		if (this._ui == null) {
			this._ui = this.valueDisplayChooser(idBase);
		}

		return this._ui;
	}


	// Our Values Display is a Select Box with a choice of connected fields.
	// Once a field is chosen, then we display the Updater form.
	valueDisplayChooser(idBase) {

		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			// return idBase + '_' + key  + '_' + uniqueInstanceID;
			return key  + '_' + uniqueInstanceID;
		}

		var ids = {
			component: myUnique('updateConnectedValues'),
			updateForm: myUnique('updateChooser'),
			selectConnectedField: myUnique('updateSelect'),
			updateFieldsForm: myUnique('updateForm') 
		};

		var _ui = {
			id: ids.component,
			view: "layout",
			css: "ab-component-form-rule",
			rows: [
				{
					id: ids.selectConnectedField,
					view: "richselect",
					label: this.labels.component.selectField,
					labelWidth: this.App.config.labelWidthLarge,
					value: this.selectedField,
					options: this.fieldDropList,
					on: {
						onChange: (newVal, oldVal) => {
							_logic.selectAction(newVal, oldVal);
						}
					}
				}
			]
		};


		var init = (valueRules) => {
			valueRules = valueRules || this.valueRules;
// _logic.setValues(valueRules);
		}

		var _logic =  {


			addDisplay: ( view ) => {

				$$(ids.component).addView(view);
			},


			// removePreviousDisplays
			// remove the previous components that reflected the conditions and 
			// update values of the previously selected field.
			removePreviousDisplays: () => {

				var allViews = $$(ids.component).getChildViews();
				allViews.forEach((v)=>{

					// don't remove the field picker
					if (v.config.id != ids.selectConnectedField) {
						$$(ids.component).removeView(v);
					}
				})
			},


			selectAction: (newVal, oldVal) => {

				_logic.removePreviousDisplays(); // of the Query Builder and Update form for old selection:

				this.selectedFieldID = newVal;
				var connectedObject = this.connectedObject();

				if (connectedObject) {

					// it is the remote object that we are allowed to Update fields on.
					this.updateObjectLoad(connectedObject);
					var updateComponent = this.valueDisplayList(ids.updateFieldsForm);

					_logic.showQBIfNeeded();

					// create a new blank update form
					_logic.addDisplay( updateComponent.ui);
					updateComponent.init();		


				} else {
					OP.Error.log("!!! No connectedObject found.", {fieldID:this.selectedFieldID});
				}
			},

			showQBIfNeeded:() => {

				var field = this.selectedField();

				// we don't need the QB if the destination object link type if 'one'.
				// there will only be one to get back, so no conditions needed.
				if (field.settings.linkType != 'one') {

					var qbComponent = this.queryBuilderDisplay();

					qbComponent.component(this.App, this.idBase)
					_logic.addDisplay(qbComponent.ui);
					qbComponent.init({});

				}

			},


			fromSettings: (settings) => {

// // make sure UI is updated:
// _logic.setValues(settings)

			},

			toSettings:() => {

				// valueRules = {
				//	fieldOperations:[
				//		{ fieldID:xxx, value:yyyy, type:zzz, op:aaa }
				//	]
				// }
				var settings = {fieldOperations:[]};

// // for each of our formRows, decode the propery {} 
// this.formRows.forEach((fr) => {
// 	var rowSettings = fr.toSettings();
// 	if (rowSettings) {
// 		settings.fieldOperations.push(fr.toSettings());
// 	}
// })

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



	queryBuilderDisplay() {

		if (!this.objectQB) {
			this.objectQB = new ObjectQueryBuilder(this.labels.component.remoteCondition);

			var connObj = this.connectedObject();
			if (connObj) this.objectQB.objectLoad(connObj);
		}
		return this.objectQB;		
	}



/*

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

				var field = this.getObjectField( $$(ids.field).getValue() );
				var valueField = $$(ids.row).getChildViews()[3];
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

				var validator = OP.Validation.validator();
				field.isValidData(obj, validator);

				// if value is empty, this is also an error:
				if ((value == '') 
					|| ((Array.isArray(value)) && (value.length == 0))) {

					validator.addError(field.columnName, this.labels.component.errorRequired);
				}

				// field.getParentView()  ->  row
				// row.getParentView()  -> Form
				var FormView = valueField.getParentView().getParentView();
				FormView.clearValidation();
				validator.updateForm(FormView);

				return validator.pass();
			},


			selectField: (columnID) => {

				var field = this.getObjectField(columnID );
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

					var field = this.getObjectField(data.fieldID);
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



	getObjectField(fieldID) {
		return this.currentObject.fields((f)=>{ return f.id == fieldID })[0];
	}

	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	// @return {Promise}
	process(options) {

		return new Promise( (resolve, reject) => {

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

				var field = this.getObjectField(op.fieldID);
				if (field) { 

					switch(op.op) {

						case 'set': 
							options.data[field.columnName] = op.value; 
							break;
					}
					
					isUpdated = true;
				}
			})

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




	// fromSettings
	// initialize this Action from a given set of setting values.
	// @param {obj}  settings
	fromSettings(settings) {
		settings = settings || {};
		super.fromSettings(settings); // let the parent handle the QB


		// if we have a display component, then populate it:
		if (this._ui) {

			// now we handle our valueRules:{} object settings.
			// pass the settings off to our DisplayList component:
			this._ui.fromSettings(settings.valueRules);
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

		settings.valueRules = this._ui.toSettings();

		return settings;
	}
*/

}