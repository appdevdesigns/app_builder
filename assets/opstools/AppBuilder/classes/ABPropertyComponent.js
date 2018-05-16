/* 
 * ABPropertyComponent
 * 
 * An ABPropertyComponent defines the UI component used by an object to display it's properties.
 * This is used by ABField objects and ABView objects.
 *
 */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABPropertyComponent {


    constructor(options) {

    	this.options = options;

    	this.EditObject = options.editObject;
    	if (!this.EditObject) {
    		console.error('!! No Edit Object provided !!');
    	}

    	this.fieldDefaults = options.fieldDefaults || {};

    	this.elements = options.elements || function (App) { return []; } ;

    	this.defaultValues = options.defaultValues || {};

    	this.rules = options.rules || {};

    	this.logic = options.logic || {};

    	this.init = options.init || function() {};



    	this.idBase = this.fieldDefaults.key || '??fieldKey??';

    	// this.ids = options.ids || {};
    	this.ids = {};


    	// keep track of any onChange handlers from the provided elements.
    	this.oldOnChange = {};  

    	// flag to indicate if we are in the process of populating our form.
    	this.isPopulating = false;
    	
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

    	////
    	//// prepare our ids
    	////

		var ids = {

			component: App.unique(this.idBase+'_component'),

		}



		////
		//// our UI definition:
		////

		// our base form:
		var _ui = {
			view:'form',
			id: ids.component,
			scroll: true,
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

				this.EditObject.propertyEditorClear( ids );

				for(var f in this.defaultValues) { 
					var component = $$(ids[f]);
					if(component && component.setValue) {
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
			 * @function currentEditObjecct
			 * return the last ABView object used in .populate().
			 * @return {ABView} 
			 */
			currentEditObject: () => {
				// NOTE: this.currentObject is the current object instance that is 
				// populating the Property Editor.
				return this.currentObject;
			},


			/*
			 * @function hide
			 *
			 * hide this component.
			 */
			hide: () => {
				$$(ids.component).clearValidation();
				$$(ids.component).hide( false, false);

				// perform provided .hide()
				if (this.logic.hide) {
					this.logic.hide(ids)
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

			onChange:(newVal, oldVal) => {
				// ignore onChange() when populating
				if (!this.isPopulating && typeof this.currentObject != "undefined") {
					this.EditObject.propertyEditorSave(ids, this.currentObject)
				}
			},


			/*
			 * @function populate
			 *
			 * populate the form with the given Object instance provided.
			 *
			 * @param {ABField|ABView} editedObject
			 */
			populate: (editedObject) => {

				this.isPopulating = true;
				this.currentObject = editedObject;

				// populate the base ABField values:
				this.EditObject.propertyEditorPopulate(App, ids, editedObject, _logic);

				// perform provided .populate()
				if (this.logic.populate) {
					this.logic.populate(ids, editedObject);
				}
				this.isPopulating = false;
			},


			/*
			 * @function show
			 *
			 * show this component.
			 */
			show: (a, b) => {
				$$(ids.component).clearValidation();
				$$(ids.component).show(a, b);

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
				var values = this.EditObject.propertyEditorValues(settings);

				values.key = this.fieldDefaults.key;
		
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
		var elements = this.EditObject.propertyEditorDefaultElements(App, ids, _logic, this.fieldDefaults);
    	this.eachDeep(elements, (e) => {
    		if (e.name) {
    			// if element has an .id, then use it in our list as is
    			if (e.id) {
    				ids[e.name] = e.id;
    			}

    			// otherwise create a new entry in our base list
    			this.ids[e.name] = e.name;
    		}
    	})


		// convert the entries in our base list into a globally acceptable id
		// and use that in our ids list if it doesn't already exist
		for (var i in this.ids) {
			if (!ids[i]) {
				ids[i] = App.unique(this.idBase+'_'+i);
			}
		}

		// update our elements to include our ids as we have them now.
		this.eachDeep(elements, (e) => {
    		if (e.name) {
    			e.id = ids[e.name];
    		}

    		// while I'm at it: set some default values for common components:
    		// set a .labelWidth for text views:
    		if (e.view == 'text') {
    			if (!e.labelWidth) {
    				e.labelWidth = App.config.labelWidthMedium
    			}
    		}

    		// all elements should have an onChange event:
    		if (e.on && e.on.onChange) {
    			this.oldOnChange[e.name] = e.on.onChange;
    			e.on.onChange = (newVal, oldVal) => {
    				if (this.oldOnChange[e.name]) this.oldOnChange[e.name](newVal, oldVal);
    				_logic.onChange(newVal, oldVal);
    			}
    		} else {
    			if (!e.on) e.on = {};
    			if (!e.on.onChange) e.on.onChange = _logic.onChange;
    		}

    	})


		_ui.elements = elements;

		// add empty element to fill layout space 
		_ui.elements.push({});

		for (var r in this.rules) {
			_ui.rules[r] = this.rules[r];
		}


		// return the current instance of this component:
		return this._component = {
			ui:_ui,					// {obj} 	the webix ui definition for this component
			init:_init,				// {fn} 	init() to setup this component  
			// actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


			// DataField exposed actions:
			clear: _logic.clear,
			hide: _logic.hide,
			isValid:_logic.isValid,
			populate: _logic.populate,
			show: _logic.show,
			values: _logic.values,


			_logic: _logic			// {obj} 	Unit Testing
		}
	}



	/**
	 * @function eachDeep
	 * a depth first fn to apply fn() to each element of our list.
	 * @param {array} list  array of webix elements to scan
	 * @param {fn} fn function to apply to each element.
	 */
	eachDeep(list, fn) {

		// make sure list is an array:
		if (! Array.isArray(list)){
			list = [list];
		}

		list.forEach((e) => {

			// process sub columns
			if (e.cols) {
				this.eachDeep(e.cols, fn);
				return;
			}

			// or rows
			if (e.rows) {
				this.eachDeep(e.rows, fn);
				return;
			}

			// or a fieldset (with a body)
			if (e.body) {
				this.eachDeep(e.body, fn);
			}

			// or just process this element:
			fn(e)
		})
	}


	idsUnique(ids, App) {

		for (var i in ids) {
			if (ids[i] == '') {
				ids[i] = App.unique(this.idBase+'_'+i)
			} else {
				ids[i] = App.unique(this.idBase+'_'+ids[i])
			}
		}
		return ids;
	}

	// populate(field) {
	// 	this._component.populate(field);
	// }

}
