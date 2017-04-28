/* 
 * ABField
 * 
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */




import OP from "../../OP/OP"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABField {

    constructor(attributes, application) {


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


  		// setup our default labelOnChange functionality:
  		var onChange = function (newVal, oldVal) {

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
					labelRight: App.labels.dataFieldShowIcon, // 'Show icon',
					labelWidth: 0,
					value:true
				}
			]
		}

  		return _ui;
  	}


//// TODO: Refactor isValid() to ignore op and not error if duplicateName is own .id

	isValid() {

		var errors = null;


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
	 * persist this instance of ABObject with it's parent ABApplication
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
					this.label = this.label || this.name;
					this.urlPath = this.urlPath || this.application.name + '/' + this.name;
				}

				this.application.objectSave(this)
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
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to 
	 * update that from all the current values of our child fields.
	 *
	 * @return {json} 
	 */
	toObj () {

		OP.Multilingual.unTranslate(this, this, ["label"]);

		// // for each Object: compile to json
		// var currObjects = [];
		// this.objects.forEach((obj) => {
		// 	currObjects.push(obj.toObj())
		// })
		// this.json.objects = currObjects;

		return {

		}
	}






	///
	/// Fields
	///




}
