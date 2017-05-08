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

    	this.elements = options.elements || [];

    	this.defaultValues = options.defaultValues || {};

    	this.rules = options.rules || {};

    	this.logic = options.logic || {};

    	this.init = options.init || function() {};



    	this.idBase = this.fieldDefaults.name || '??fieldName??';

    	// this.ids = options.ids || {};
    	this.ids = {};

    	// for each provided element: create an this.ids for it:
    	this.elements.forEach((e) => {
    		if (e.name) {
    			this.ids[e.name] = e.name;
    		}
    	})
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///


	/**
	 * @function definitionEditor
	 *
	 * Many DataFields share some base information for their usage 
	 * in the AppBuilder.  The UI Editors have a common header 
	 * and footer format, and this function allows child DataFields
	 * to not have to define those over and over.
	 *
	 * The common layout header contains:
	 *		[Menu Label]
	 *		[textBox: labelName]
	 *		[text:    description]
	 *
	 * The defined DataField UI will be added at the end of this.
	 *
	 * This routine actually updated the live DataField definition
	 * with the common header info.
	 *
	 * @param {DataField} field  The DataField object to work with.
	 */
  	static definitionEditor( App, ids, _logic, Field ) {

/// TODO: maybe just pass in onChange instead of _logic
/// if not onChange, then use our default:

  		// setup our default labelOnChange functionality:
  		var onChange = function (newVal, oldVal) {

  			oldVal = oldVal || '';

			if (newVal != oldVal &&
				oldVal == $$(ids.columnName).getValue()) {
				$$(ids.columnName).setValue(newVal);
			}
		}

		// if they provided a labelOnChange() override, use that:
		if (_logic.labelOnChange) {
			onChange = _logic.labelOnChange;
		}


  		var _ui = {
			// id: ids.component,
			rows: [
				{
					view: "label",
					label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', Field.icon).replace('{1}', Field.menuName)
				},
				{
					view: "text",
					id: ids.label,
					name:'label',
					label: App.labels.dataFieldHeaderLabel, 
					placeholder: App.labels.dataFieldHeaderLabelPlaceholder,
					labelWidth: 50,
					css: 'ab-new-label-name',
					on: {
						onChange: function (newVal, oldVal) {
							onChange(newVal, oldVal);
						}
					}
				},
				{
					view: "text",
					id: ids.columnName,
					name:'columnName',
					label: App.labels.dataFieldColumnName, // 'Name',
					placeholder: App.labels.dataFieldColumnNamePlaceholder, // 'Column name',
					labelWidth: App.config.labelWidthSmall
				},
				{
					view: "label",
					id: ids.fieldDescription,
					label: Field.description
				},
				{
					view: 'checkbox',
					id: ids.showIcon, 
					name:'showIcon',
					labelRight: App.labels.dataFieldShowIcon, // 'Show icon',
					labelWidth: 0,
					value:true
				}
			]
		}

  		return _ui;
  	}


	///
	/// Instance Methods
	///

	component (App) {

		// labels.common = App.labels;

		// var idBase = 'ab_datafield_string';


		// var componentDefaults = {
		// 	textDefault: '', 
		// 	supportMultilingual:1
		// };



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

				// perform provided .populate()
				if (this.logic.populate) {
					this.logic.populate(ids, field)
				}
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

		// apply overrides to our logic functions:
		for (var l in this.logic) {
			if (!_logic[l]) _logic[l] = this.logic[l];
		}


		// make sure our given elements, have an id set:


		// get the common UI headers entries, and insert them above ours here:
		// NOTE: put this here so that _logic is defined.
		var commonUI = ABField.definitionEditor(App, ids, _logic, this.fieldDefaults);
		_ui.elements = commonUI.rows.concat(this.elements);


		// return the current instance of this component:
		return {
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

}
