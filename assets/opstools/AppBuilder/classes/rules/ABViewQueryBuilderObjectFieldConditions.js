//
// ABViewQueryBuilderObjectFieldConditions
//
// A UI component that is responsible for displaying a QueryBuilder based upon 
// the fields of a given ABObject.
//
// This object is also responsible for saving it's state to a settings value,
// and generating the settings value to be saved.


export default class ABViewQueryBuilderObjectFieldConditions {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(label) {

		this.label = label;
		this.ui = null;
	}


	// component
	// initialize the UI display for this popup editor.
	component(App, idBase) {

		this.App = App;
		this.idBase = idBase;

		var L = function(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		var uniqueInstanceID = webix.uid();
		var myUnique = (key) => {
			// return this.unique(idBase + key ) + '_' + uniqueInstanceID;
			return idBase + '_' + key  + '_' + uniqueInstanceID;
		}

		// internal list of Webix IDs to reference our UI components.
		var ids = this.ids = {
			component: myUnique('qbObjectFieldConditions'),
			queryBuilder: myUnique('qBuilder')
		};


		// webix UI definition:
		this.ui = {
			cols: [
				{
				    view: "querybuilder",
				    id: ids.queryBuilder,
				    fields: this.conditionFields()
				}
			]
		};

		// tack on a label if provided.
		if (this.label) {
			this.ui.cols.unshift({
				view: 'label',
				css: 'ab-text-bold',
				label: this.label,
				width: this.App.config.labelWidthLarge
			})
		}


		// for setting up UI
		this.init = (options) => {
			options = options || {};
			
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

		};



		// internal business logic 
		var _logic = this._logic = {


			callbacks: {
				onCancel: function () { console.warn('NO onCancel()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},

			getValue: () => {
				var values = null;
				var QB = $$(ids.queryBuilder);
				if (QB) {
					values = QB.getValue();
				}


				// convert dates to simpler format:
				// by default we're getting long values: "Mon Feb 2, 2018 GMT xxxxxxx",
				// and webix doesn't seem to understand them when we send them back.
				// so save simple date values: "mm/dd/yyyy"
				var rules = values[0];
				if (rules) {
					var fields = values[1];

					rules.rules.forEach((r)=>{
						var field = fields.filter((f)=>{ return f.id == r.key;})[0];
						if (field) {
							if (field.type == 'date') {
								r.value = webix.i18n.dateFormatStr(r.value);
							}
						}
					})
				}


				return values;
			
			},

			setValue: (values) => {

				values = values || [];
				if (values.length == 0) { values.push({}); };	// push default rules
				if (values.length < 2) { values.push(this.conditionFields())}

				var QB = $$(ids.queryBuilder);
				if (QB) {
					QB.setValue(values);
				}
			}

		};

		this.getValue = _logic.getValue;
		this.show = _logic.show;
		this.setValue = _logic.setValue;
	}



	objectLoad(object) {
		this.currentObject = object;
	}


	// conditionFields()
	// Return the list of fields we are able to update.
	// @return {array} of querybuilder field definitions: 
	//					[
	// 						{ id:"fname",   value:"First Name", type:"string" },
	//					    { id:"lname",   value:"Last Name",  type:"string" },
	//					    { id:"age",     value:"Age",        type:"number" },
	//					    { id:"bdate",   value:"Birth Date", type:"date" }
	//					]
	conditionFields() {
		
		var fieldTypes = ['string', 'number', 'date'];

		var currFields = [];

		if (this.currentObject) {
			this.currentObject.fields().forEach((f)=>{

				if (fieldTypes.indexOf(f.key) != -1) {

					// NOTE: the .id value must match the obj[.id]  in the data set
					// so if your object data looks like:
					// 	{
					//		name_first:'Neo',
					//		name_last: 'The One'
					//  },
					// then the ids should be:
					// { id:'name_first', value:'xxx', type:'string' }
					currFields.push({
						id: f.columnName,
						value: f.label,
						type: f.key
					});
				}
			})
		}

		return currFields;
	}


	// process
	// Take the provided data and process each of our rules.
	// @param {obj} options
	// @return {promise}
	process(options) {

		return new Promise((resolve, reject) => {

			var numDone = 0;
			var onDone =  () => {
				numDone++;
				if (numDone >= this.listRules.length) {
					resolve();
				}
			}

			this.listRules.forEach((rule)=>{

				rule.process(options)
				.then(function(){
					onDone();
				})
				.catch((err)=>{
					reject(err);
				})

			})


			if (this.listRules.length == 0) {
				resolve();
			}
		});
	}



	// // fromSettings
	// // Create an initial set of default values based upon our settings object.
	// // @param {obj} settings  The settings object we created in .toSettings()
	// fromSettings (settings) {
	// 	// settings: [
	// 	//  { rule.settings },
	// 	//  { rule.settings }
	// 	// ]

	// 	// clear any existing Rules:
	// 	this.listRules.forEach((rule)=>{
	// 		$$(this.ids.rules).removeView(rule.ids.component);
	// 	})
	// 	this.listRules = [];


	// 	if (settings) {
	// 		settings.forEach((ruleSettings)=>{
	// 			this.addRule(ruleSettings);
	// 		})
	// 	}
	// }


	// // toSettings
	// // create a settings object to be persisted with the application.
	// // @return {array} of rule settings.
	// toSettings () {
	// 	var settings = [];
	// 	this.listRules.forEach((r)=>{
	// 		settings.push(r.toSettings());
	// 	})
	// 	return settings;
	// }


}