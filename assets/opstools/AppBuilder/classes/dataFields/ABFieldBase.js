/*
 * ABFieldBase
 *
 * ABFieldBase defines the common ABField structure that is shared between 
 * the client and the server.  Mostly how it manages it's internal data, and
 * how it is related to the ABObject classes.
 *
 */

// import OP from "../../OP/OP"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABField {

    constructor(values, object, fieldDefaults) {

    	// NOTE: setup this first so later we can use .fieldType(), .fieldIcon()
    	this.defaults = fieldDefaults;


    	/*
  		{
  			id:'uuid',					// uuid value for this obj
  			key:'fieldKey',				// unique key for this Field
  			icon:'font',				// fa-[icon] reference for an icon for this Field Type
  			label:'',					// pulled from translation
			columnName:'column_name',	// a valid mysql table.column name
			settings: {					// unique settings for the type of field
				showIcon:true/false,	// only useful in Object Workspace DataTable

				// specific for dataField
			},
			translations:[]
  		}
  		*/
  		this.fromValues(values);


    	this.object = object;
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///



  	// unique key to reference this specific DataField
  	fieldKey() {
  		return this.defaults.key;
  	}

  	// font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
  	fieldIcon() {
  		return this.defaults.icon;
  	}

  	// the multilingual text for the name of this data field.
  	fieldMenuName() {
  		return this.defaults.menuName;
  	}

  	// the multilingual text for the name of this data field.
  	fieldDescription() {
  		return this.defaults.description;
  	}

	// the flag to set when checking if field should be filterable
	fieldIsFilterable() {
		if (this.defaults.isFilterable != null) {
			if (typeof this.defaults.isFilterable === "function") {
				return this.defaults.isFilterable(this);
			}
			else {
				return this.defaults.isFilterable;
			}
		}

		return 1;
	}

	// the flag to set when checking if field should be sortable
	fieldIsSortable() {
		if (this.defaults.isSortable != null) {
			if (typeof this.defaults.isSortable === "function") {
				return this.defaults.isSortable(this);
			}
			else {
				return this.defaults.isSortable;
			}
		}

		return 1;
	}

	// the flag to set when checking if the field should be used as a label
	fieldUseAsLabel() {
		if (this.defaults.useAsLabel != null) {
			if (typeof this.defaults.useAsLabel === "function") {
				return this.defaults.useAsLabel(this);
			}
			else {
				return this.defaults.useAsLabel;
			}
		}

		return 1;
	}



	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABField instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj () {

		return {
			id : this.id,
			key : this.key,
			icon : this.icon,
			columnName: this.columnName,
			settings: this.settings,
			translations:this.translations
		}
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

 		this.id = values.id;			// NOTE: only exists after .save()
    	this.key = values.key || this.fieldKey();
    	this.icon = values.icon || this.fieldIcon();

    	// if this is being instantiated on a read from the Property UI,
    	// .label is coming in under .settings.label
    	this.label = values.label || values.settings.label || '?label?';

    	this.columnName = values.columnName || '';
    	this.translations = values.translations || [];

    	this.settings = values.settings || {};
    	this.settings.showIcon = values.settings.showIcon+"" || "1";
		this.settings.width = values.settings.width+"" || "0";

    	// convert from "0" => 0
    	this.settings.showIcon = parseInt(this.settings.showIcon);
		this.settings.width = parseInt(this.settings.width);
	}



	/**
	 * @method urlPointer()
	 * return a string pointer to decode this object from the root application
	 * object.
	 * @return {string} pointer reference
	 */
	urlPointer() {
		return this.object.urlField() + this.id;
	}



	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {
		values[this.columnName] = '';
	}


}

