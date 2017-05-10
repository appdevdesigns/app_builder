/* 
 * ABFieldComponent
 * 
 * An ABFieldComponent defines the UI component used by an ABField to display it's properties.
 *
 */

import ABField from "./ABField"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABFieldComponent {


    constructor(options) {

    	this.options = options;

    	this.fieldDefaults = options.fieldDefaults || {};

    	this.elements = options.elements || function (App) { return []; } ;

    	this.defaultValues = options.defaultValues || {};

    	this.rules = options.rules || {};

    	this.logic = options.logic || {};

    	this.init = options.init || function() {};



    	this.idBase = this.fieldDefaults.name || '??fieldName??';

    	// this.ids = options.ids || {};
    	this.ids = {};

    	
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///




	///
	/// Instance Methods
	///

	component (App) {

		// for each provided element: create an this.ids for it:
    	var elements = this.elements(App);
    	elements.forEach((e) => {
    		if (e.name) {
    			this.ids[e.name] = e.name;
    		}
    	})



		var ids = {

			component: App.unique(this.idBase+'_component'),

			// the common property fields
			label: App.unique(this.idBase+'_label'),
			columnName: App.unique(this.idBase+'_columnName'),
			fieldDescription: App.unique(this.idBase+'_fieldDescription'),
			showIcon: App.unique(this.idBase+'_showIcon'),
		}

		// make sure to include this instances element's ids into our list:
		for (var i in this.ids) {
			ids[i] = App.unique(this.idBase+'_'+i);
		}

		// update our elements to include our ids:
    	elements.forEach((e) => {
    		if (e.name) {
    			e.id = ids[e.name];
    		}
    	})

		//// NOTE: we merge in the common headers below.
		var _ui = {
			view:'form',
			id: ids.component,
			autoheight:true,
			borderless:true,
			elements: [
				// {
				// 	view: "text",
				// 	id: ids.textDefault,
				// 	name:'textDefault',
				// 	placeholder: labels.component.defaultText
				// },
				// {
				// 	view: "checkbox",
				// 	id: ids.supportMultilingual,
				// 	name:'supportMultilingual',
				// 	labelRight: labels.component.supportMultilingual,
				// 	labelWidth: 0,
				// 	value: true
				// }
			],

			rules:{
				'label':webix.rules.isNotEmpty,
				'columnName':webix.rules.isNotEmpty
			}
		}



		var _init = function() {

			// call our provided .init() routine
			this.init(ids);
		}



		var _logic = {

			/*
			 * @function clear
			 *
			 * clear the form.
			 */
			clear: () => {

				ABField.clearEditor( ids );

				for(var f in this.defaultValues) { 
					var component = $$(ids[f]);
					if(component) {
						component.setValue(this.defaultValues[f]);
					} else {
						console.warn('!! could not find component for default value: name:'+f+' id:'+ids[f]);
					}
				}

				$$(ids.component).clearValidation();


				// perform provided .clear()
				if (this.logic.clear) {
					this.logic.clear(ids);
				}
			},


			/*
			 * @function isValid
			 *
			 * checks the current values on the componet to see if they are Valid
			 */
			isValid: () => {

				var isValid = $$(ids.component).validate();

				// perform provided .isValid()
				if (this.logic.isValid) {
					isValid = this.logic.isValid(ids, isValid);
				}

				return isValid;
			},


			/*
			 * @function labelOnChange
			 *
			 * The ABField.definitionEditor implements a default operation
			 * to update the value of the .columnName with the current value of 
			 * label.
			 * 
			 * if you want to override that functionality, implement this fn()
			 *
			 * @param {string} newVal	The new value of label
			 * @param {string} oldVal	The previous value
			 */
			// labelOnChange: function (newVal, oldVal) {

			// 	// When the Label value changes, update our Column Name value 
			// 	// to match.

			// 	oldVal = oldVal || '';
			// 	if (newVal != oldVal &&
			// 		oldVal == $$(ids.columnName).getValue()) {
			// 		$$(ids.columnName).setValue(newVal);
			// 	}
			// },


			/*
			 * @function populate
			 *
			 * populate the form with the given ABField instance provided.
			 *
			 * @param {ABField} field
			 */
			populate: (field) => {

console.error('TODO: .populate()');

				// populate the base ABField values:
				ABField.editorPopulate(ids, field);

				elements.forEach(function(e){
					$$(ids[e.name]).setValue(field.settings[e.name]);
				})
			},


			/*
			 * @function show
			 *
			 * show this component.
			 */
			show: () => {
				$$(ids.component).clearValidation();
				$$(ids.component).show();

				// perform provided .show()
				if (this.logic.show) {
					this.logic.show(ids)
				}
			},


			/*
			 * @function values
			 *
			 * return the values for this form.
			 * @return {obj}  
			 */
			values: () => {

				var settings = $$(ids.component).getValues();
				var values = ABField.editorValues(settings);

				values.type = this.fieldDefaults.type;
		
				// perform provided .values()
				if (this.logic.values) {
					values = this.logic.values(ids, values)
				}

				return values;
			}

		}

		// apply additional logic functions:
		for (var l in this.logic) {
			if (!_logic[l]) _logic[l] = this.logic[l];
		}


		// make sure our given elements, have an id set:


		// get the common UI headers entries, and insert them above ours here:
		// NOTE: put this here so that _logic is defined.
		var commonUI = ABField.definitionEditor(App, ids, _logic, this.fieldDefaults);
		_ui.elements = commonUI.rows.concat(elements);


		// return the current instance of this component:
		return this._component = {
			ui:_ui,					// {obj} 	the webix ui definition for this component
			init:_init,				// {fn} 	init() to setup this component  
			// actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


			// DataField exposed actions:
			clear: _logic.clear,
			isValid:_logic.isValid,
			populate: _logic.populate,
			show: _logic.show,
			values: _logic.values,


			_logic: _logic			// {obj} 	Unit Testing
		}
	}




	// populate(field) {
	// 	this._component.populate(field);
	// }

}
