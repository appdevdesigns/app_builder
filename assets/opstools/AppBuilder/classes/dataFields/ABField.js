/*
 * ABField
 *
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */




// import OP from "../../OP/OP"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABField {

    constructor(values, object) {

    	this.label = values.label || '';
    	this.columnName = values.columnName || '';
    	this.showIcon = values.showIcon || "true";

    	// convert from "true" => true
    	this.showIcon = (this.showIcon === "true")? true:false;



    	// label is a multilingual value:
    	OP.Multilingual.translate(this, values, ['label']);

  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///

  	static clearEditor( App, ids) {

  		var defaultValues = {
  			label: '',
  			columnName:'',
  			showIcon:1
  		}

  		for(var f in defaultValues) {
			var component = $$(ids[f]);
			component.setValue(defaultValues[f]);
		}
  	}


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
					label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', Field.icon()).replace('{1}', Field.menuName())
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
					label: Field.description()
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




  	/*
  	 * @method isValid
  	 * check the current values to make sure they are valid.
  	 * Here we check the default values provided by ABField.
  	 *
  	 * @return null or [{OP.Form.validationError()}] objects.
  	 */
	isValid() {

		var errors = null;

		// .columnName must be unique among fileds on the same object
		var isNameUnique = (this.object.fields((f)=>{ return f.columnName.toLowerCase() == this.columnName.toLowerCase(); }).length == 0);
		if (!isNameUnique) {
			errors = OP.Form.validationError({
				name:'columnName',
				message:L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name),
			}, errors);
		}

		return errors;
	}



	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 *
	 * @return {Promise}
	 */
	destroy () {
		if (this.id) {
console.error('TODO: ABField.destroy()');

		}
	}


	/**
	 * @method save()
	 *
	 * persist this instance of ABField with it's parent ABObject
	 *
	 *
	 * @return {Promise}
	 *						.resolve( {this} )
	 */
	save () {
		return new Promise(
			(resolve, reject) => {

				// if this is our initial save()
				if (!this.id) {
					this.id = OP.Util.uuid();	// setup default .id
				}

				this.object.fieldSave(this)
				.then(() => {
					resolve(this);
				})
				.catch(function(err){
					reject(err);
				})
			}
		)
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABField instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj () {

		// store "label" in our translations
		OP.Multilingual.unTranslate(this, this, ["label"]);

		return {
			columnName: this.columnName,
			showIcon: this.showIcon,
			translations: this.translations
		}
	}






	///
	/// Working with Actual Object Values:
	///

	columnHeader (isObjectWorkspace) {

		var config = {
			id: this.columnName,
			header: this.label,
		}

		if (isObjectWorkspace) {
			if (this.showIcon) {
				config.header = '<span class="webix_icon fa-{icon}"></span>'.replace('{icon}', this.icon) + config.header;
			}
		}


		return config;
	}


}
