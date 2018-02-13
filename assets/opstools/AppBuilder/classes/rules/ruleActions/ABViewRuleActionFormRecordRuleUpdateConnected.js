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
// - solve missing connected field info required for creating 2nary table
// - server side needs to support BOTH QueryBuilder and Sails where clause formats
// - 
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
		this.qbCondition = null;	// the QB condition entered for selecting which remote object.


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


	// connectedFieldList
	// return the fields in our .baseObject that are connections to other objects.
	// @return {array} of {ABField} 
	connectedFieldList() {
		var connectKey = "connectObject"; // ABFieldConnect.defaults().key;
		if (this.baseObject  && this.baseObject.fields) {
			return this.baseObject.fields((f)=>{ return f.key == connectKey; });
		} else {
			return [];
		}
		
	}

	// connectedObject
	// return the ABObject associated with the selected connection field.
	// @return {ABObject}
	connectedObject() {

		if (this.selectedFieldID) {
			var selectedField = this.selectedField();
			if (selectedField) {
				return selectedField.datasourceLink;
			}
		}

		return null;
	}


	// selectedField
	// return the selected {ABField} object.
	// @return {ABField} 
	selectedField() {
		return this.connectedFieldList().filter((f)=>{ return f.id == this.selectedFieldID; })[0];
	}






	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {

		if (this._uiChooser == null) {
			this._uiChooser = this.valueDisplayChooser(idBase);
		}

		return this._uiChooser;
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

		var _logic =  this._logic =  {


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
					///// NOTE: important to call super.valueDisplayComponent()
					this.updateComponent = super.valueDisplayComponent(ids.updateFieldsForm);  // parent obj

					_logic.showQBIfNeeded();

					// create a new blank update form
					_logic.addDisplay( this.updateComponent.ui);
					this.updateComponent.init();		


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

				// this triggers the update of the display, creation of QB, 
				$$(ids.selectConnectedField).setValue(settings.selectedFieldID);

				if (this.objectQB) {
					this.objectQB.setValue(this.qbCondition);
				}

				if (this.updateComponent) {
					this.updateComponent.fromSettings(settings);
				}


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



	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	// @return {Promise}
	process(options) {

		// prepare .valueRules
		this.valueRules = this.valueRules || {};
		this.valueRules.fieldOperations = this.valueRules.fieldOperations || [];

		// get connected object
		var connObj = this.connectedObject();
		var model = connObj.model();

		var connectionField = this.selectedField();

		var condition = null;	// our lookup condition


		// add a condition based upon our connection type:
		switch(connectionField.settings.linkType) {

			case "one":

//// PROBLEM: how do we ensure we have a value for: options.data[connectionField.columnName]
////   If we just tie two forms together, the 2nd Form doesn't know how to populate this, or 
////   where to find it.


				// if connectionField.linkType == 'one'  && connectionField.isSource 
				// then this object can only have 1 of the connectedObjects
				//		the ID of the connectedObject is contained in my field
				//		I need to AND our condition to include the id:
				if (connectionField.settings.isSource) {

					 condition = {
						"glue": "and",
						"rules": [{
							"key": "id",
							"rule": "equals",
							"value": options.data[connectionField.columnName]
						}]
					}

				}

				break;
		}




		return new Promise( (resolve, reject) => {


			// upateIt()
			// updates a given item with our changes.
			var updateIt = (item, cb) => {

				var isUpdated = false;

				// for each of our operations
				this.valueRules.fieldOperations.forEach((op) => {
					// op = {
					// 	fieldID:'zzzzz', 
					//	value: 'xxx',
					//	op: 'set',
					//  type:''
					// }

					var field = connObj.fields((f)=>{ return f.id == op.fieldID })[0];
					if (field) { 

						switch(op.op) {

							case 'set': 
								item[field.columnName] = op.value; 
								break;
						}
						
						isUpdated = true;
					}
				})

				if (!isUpdated) {
					cb();
				} else {

				
					model.update(item.id, item)
					.catch((err)=>{
						OP.Error.log('!!! ABViewRuleActionFormRecordRuleUpdateConnected.process(): update error:', {error:err, data:options.data });
						cb(err);
					})
					.then(()=>{
						cb();
					});

				}

			}




			if (condition) {
				condition.rules.push(this.qbCondition);
			} else {
				condition = this.qbCondition;
			}


			model.findAll({ where: condition })
			.then((list)=>{

				var done = 0;

				// list : {data: Array(4), total_count: 4, pos: null, offset: null, limit: null}
				if (list && list.data) {  list = list.data; }

				list.forEach((item) => {
					updateIt(item, (err) => {

						done++;
						if (done >= list.length) {
							resolve();
						}
					})
				})
				
				
			})
			.catch(reject);


			


			
		})
	}




	// fromSettings
	// initialize this Action from a given set of setting values.
	// @param {obj}  settings
	fromSettings(settings) {
		settings = settings || {};

		this.selectedFieldID = settings.selectedFieldID || null;
		this.qbCondition = settings.qbCondition || {};

		super.fromSettings(settings);


		// if we have a display component, then populate it:
		if (this._uiChooser) {
			this._logic.fromSettings(settings);
		}
	}


	// toSettings
	// return an object that represents the current state of this Action
	// @return {obj}
	toSettings() {

		// settings: {
		// 	selectedFieldID: 'guid',
		//  qbCondition: [],
		//	valueRules:{}		// from ABViewRuleActionObjectUpdater
		// }

		// let our parent store our QB settings
		var settings = super.toSettings();

		settings.selectedFieldID = this.selectedFieldID;
		settings.qbCondition = this.objectQB ? this.objectQB.getValue()[0] : null;

		return settings;
	}


}