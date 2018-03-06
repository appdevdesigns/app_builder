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
// - Continue filling out update Connected connection conditions:
//		- QueryBuilder: initial value on a numeric field & Date is not being set properly!
// - debug importing ABFieldConnect errors (see commented out import above)
//

export default class ABViewRuleActionFormRecordRuleUpdateConnected extends ABViewRuleActionObjectUpdater {


	constructor(App, idBase, currentForm) {

		super(App, idBase, currentForm);
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

	/**
	 * objectLoad
	 * save the current object this Action is associated with.
	 * in the case of the UpdateConnected Action, assigning us 
	 * this object only impacts the queryObject.
	 *
	 * The Updater form will use another object we select in 
	 * the form dropdown.
	 *
	 * @param {object} object 
	 *      
	 */
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


	/**
	 * connectedFieldList
	 * return the fields in our .baseObject that are connections to other objects.
	 * @return {array} of {ABField}     
	 */
	connectedFieldList() {
		var connectKey = "connectObject"; // ABFieldConnect.defaults().key;
		if (this.baseObject  && this.baseObject.fields) {
			return this.baseObject.fields((f)=>{ return f.key == connectKey; });
		} else {
			return [];
		}
		
	}


	/**
	 * connectedObject
	 * return the ABObject associated with the selected connection field.
	 * @return {ABObject}  
	 */
	connectedObject() {

		if (this.selectedFieldID) {
			var selectedField = this.selectedField();
			if (selectedField) {
				return selectedField.datasourceLink;
			}
		}

		return null;
	}


	/**
	 * selectedField
	 * return the selected {ABField} object.
	 * @return {ABField}  
	 */
	selectedField() {
		return this.connectedFieldList().filter((f)=>{ return f.id == this.selectedFieldID; })[0];
	}


	/**
	 * valueDisplayComponent
	 * Return an ABView to display our values form.
	 * @param {string}  idBase  a unique webix id to base our sub components on.
	 */
	valueDisplayComponent(idBase) {

		if (this._uiChooser == null) {
			this._uiChooser = this.valueDisplayChooser(idBase);
		}

		return this._uiChooser;
	}


	/**
	 * valueDisplayChooser
	 * Our Values Display is a Select Box with a choice of connected fields.
	 * Once a field is chosen, then we display the Updater form.
	 * @param {string}  idBase  a unique webix id to base our sub components on.
	 */
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

			// make sure our currently selected field is selected.
			if (this.selectedFieldID) {
				var select = $$(ids.selectConnectedField);
				if (select){
					select.setValue(this.selectedFieldID);
				}
			}
	
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
				var cloneAllViews = [];
				allViews.forEach((v)=>{ cloneAllViews.push(v); });
				cloneAllViews.forEach((v)=>{

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

				// // first time through, be sure to set the connectedObject first
				// this.selectedFieldID = settings.selectedFieldID;
				// var connectedObject = this.connectedObject();

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


	/**
	 * queryBuilderDisplay
	 * returns our Query Builder object used in our display. 
	 * It is called by the .showQBIfNeeded() method.
	 * @return {ABViewQueryBuilderObjectFieldConditions} 
	 */
	queryBuilderDisplay() {

		if (!this.objectQB) {
			this.objectQB = new ObjectQueryBuilder(this.labels.component.remoteCondition);

			var connObj = this.connectedObject();
			if (connObj) this.objectQB.objectLoad(connObj);
		}
		return this.objectQB;		
	}



	/**
	 * process
	 * gets called when a form is submitted and the data passes the Query Builder Rules.
	 * @param {obj} options
	 *				options.data : {obj} the key=>value of the data just entered by the form
	 *				options.form : {ABViewForm} the Form object that is processing this rule
	 * @return {Promise}
	 */
	process(options) {

		// prepare .valueRules
		this.valueRules = this.valueRules || {};
		this.valueRules.fieldOperations = this.valueRules.fieldOperations || [];

		// get connected object
		var connObj = this.connectedObject();
		var model = connObj.model();

		var connectionField = this.selectedField();

		var condition = null;	// our lookup condition



// 		// configureRemoteLinkToMe()
// 		// this fn() will add a condition for a 1:1, or M:1 connection where the
// 		// connectedObject has a link back to me.
// 		var configureRemoteLinkToMe = () => {

// // get a reference to the link field on the connected Object:
// 			var connectedObjectField = connectedObject.fields((f)=>{ return f.id == connectionField.settings.linkColumn; })[0];
// 			if (connectedObjectField && options.data.id) {

// 				// so we want: ('baseObject.fieldName' = my.id ) AND (whatever QB says here)
// 				condition = {
// 					"glue": "and",
// 					"rules": [
// 						{
// 							"key": connectedObjectField.columnName,
// 							"rule": "equals",
// 							"value": options.data.id
// 						},
// 						this.qbCondition
// 					]
// 				}

// 			} else {

// 				// without either of these points of data, we can't update what we intend.

// 			}
// 		}



		// modifyCondition
		// async fn() to fill out what the condition should be for limiting the remote
		// objects to values in use by the current object.
		// @param {fn} cb  the callback to use when we are finished:
		//					cb(err, )
		var modifyCondition = (cb) => {

			// So, let's get a copy of our current data, with all it's connected items 
			// attached.
			var thisModel = this.baseObject.model();
			thisModel.findConnected(connectionField.columnName, options.data)
			.then((items) => {

				// if we didn't get any results, then simply return
				// NOTE: this will leave condition == null and cancel this update.
				if ((!items) || (items.length==0)) {
					cb();
					return;
				}

				
				// then use these to limit the connected data of our Action:

				// get all the ids
				var ids = items.map((i)=>{ return i.id });


				// resulting condition: { id in [listIDs]} AND { QB Condition }
				condition = {
					"glue": "and",
					"rules": [
						{
							"key": "id",
							"rule": "in",
							"value": ids
						},
						this.qbCondition
					]
				}

			})
			.catch(cb)

				
	// 					thisModel.findAll({ includeRelativeData: true })
			



	// 		// add a condition based upon our connection type:
	// 		switch(connectionField.settings.linkType) {

	// 			case "one":

	// //// PROBLEM: how do we ensure we have a value for: options.data[connectionField.columnName]
	// ////   If we just tie two forms together, the 2nd Form doesn't know how to populate this, or 
	// ////   where to find it.


	// 				// if connectionField.linkType == 'one'  && connectionField.isSource 
	// 				// then this object can only have 1 of the connectedObjects
	// 				//		the ID of the connectedObject is contained in my field
	// 				//		I need to AND our condition to include the id:
	// 				if (connectionField.settings.isSource) {


	// 					// for this case to work, the id of our connectedObject must already
	// 					// be in our data:
	// 					if ( options.data[connectionField.columnName] ) {

	// 						// good to go, so update our condition.
	// 						// so we want: (id = "connectedObject.id" ) AND (whatever QB says here)
	// 						condition = {
	// 							"glue": "and",
	// 							"rules": [
	// 								{
	// 									"key": "id",
	// 									"rule": "equals",
	// 									"value": options.data[connectionField.columnName]
	// 								},
	// 								this.qbCondition
	// 							]
	// 						}

	// 					} else {

	// 						// Without the connected .id set, we can't lookup what is intended.
	// 						// so we keep condition == NULL and this will prevent the rule 
	// 						// from operating:

	// 					}


	// 				} else {

	// 					// if connectionField.linkType == 'one'  && ! connectionField.isSource 
	// 					// then this object can only have 1 of the connectedObjects
	// 					//		the ID of the baseObject is contained in the connectedObject's field
	// 					//		I need to AND our condition to include the id:

	// 					configureRemoteLinkToMe();

	// 				}

	// 				// in either case, return
	// 				cb();
	// 				break;


	// 			case "many" :


	// 				// M:1 
	// 				// if linkViaType == one, then the connected object has a link back to my id:
	// 				if (connectionField.settings.linkViaType == "one" ) {

	// 					// this behaves the same as the 1:1 !isSource option:
	// 					configureRemoteLinkToMe();
	// 					cb();	// return

	// 				} else {


	// 					// M:N
	// 					// There could be a number of connected objects.
	// 					// the connections are made in a 3rd table that we can't access.
	// 					// So, we need to do a lookup of all our possible entries, and limit the 
	// 					// condition to only work on those:
	// 					var thisModel = this.baseObject.model();
	// 					thisModel.findAll({ includeRelativeData: true })

	// 				}
	// 				break;
	// 		}

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



			modifyCondition((err) => {


				if (err) {
					reject(err);
					return;
				}


				if (condition === null) {

					// this is the case where we didn't have the proper data to complete our 
					// update.  So let's just fail gracefully, and continue on.

// QUESTION: is this the right way to handle it?
					resolve();

				} else {


					// get all the entries that match our condition:
					model.findAll({ where: condition })
					.then((list)=>{

						var done = 0;

						// list : {data: Array(4), total_count: 4, pos: null, offset: null, limit: null}
						if (list && list.data) {  list = list.data; }


						// for each entry, update it with our values:
						list.forEach((item) => {
							updateIt(item, (err) => {

								done++;
								if (done >= list.length) {

									// now they are all updated, so continue.
									resolve();
								}
							})
						})
						
						
					})
					.catch(reject);

				} 

			})  // end modifyCondition()
			
		})  // end Promise()
	}



	/**
	 * fromSettings
	 * initialize this Action from a given set of setting values.
	 * @param {obj} settings  the settings {} returned from toSettings()
	 */
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



	/**
	 * toSettings
	 * return an object that represents the current state of this Action
	 * @return {obj} 
	 */
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




// NOTE: Querybuilder v5.2 has a bug where it won't display the [and/or] 
// choosers properly if it hasn't been shown before the .setValue() call.
// so this work around allows us to refresh the display after the .show()
// on the popup.
// When they've fixed the bug, we'll remove this workaround:
qbFixAfterShow() {
	
	if (this.objectQB) {
		this.objectQB.setValue(this.qbCondition);
	}
}



}