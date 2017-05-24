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



    	// label is a multilingual value:
    	OP.Multilingual.translate(this, this, ['label']);


    	this.object = object;
  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///

  	static clearEditor( ids) {

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


  	static editorPopulate( ids, field ) {

  		$$(ids.label).setValue(field.label);
  		$$(ids.columnName).setValue(field.columnName);
  		$$(ids.showIcon).setValue(field.settings.showIcon);

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
				// {
				// 	view: "label",
				// 	label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', Field.icon).replace('{1}', Field.menuName)
				// },
				{
					view: "text",
					id: ids.label,
					name:'label',
					label: App.labels.dataFieldHeaderLabel,
					placeholder: App.labels.dataFieldHeaderLabelPlaceholder,
					labelWidth: App.config.labelWidthMedium,
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
					labelWidth: App.config.labelWidthMedium,
					placeholder: App.labels.dataFieldColumnNamePlaceholder, // 'Column name',
				},
				{
					view: "label",
					id: ids.fieldDescription,
					label: Field.description,
					align: "right",
				},
				{
					view: 'checkbox',
					id: ids.showIcon,
					name:'showIcon',
					labelRight: App.labels.dataFieldShowIcon, // 'Show icon',
					labelWidth: App.config.labelWidthCheckbox,
					value:true
				}
			]
		}

  		return _ui;
  	}


  	static editorValues (settings) {

  		var obj = {
  			label: settings.label,
  			columnName: settings.columnName,
  			settings:settings
  		}

  		delete settings.label;
  		delete settings.columnName;

  		return obj;
  	}


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



  	/*
  	 * @method isValid
  	 * check the current values to make sure they are valid.
  	 * Here we check the default values provided by ABField.
  	 *
  	 * @return null or [{OP.Validation.validator()}] objects.
  	 */
	isValid() {

		var validator = OP.Validation.validator();

		// .columnName must be unique among fileds on the same object
		var isNameUnique = (this.object.fields((f)=>{
			var isDifferent = (f.id != this.id);
			return (f.id != this.id)
					&& (f.columnName.toLowerCase() == this.columnName.toLowerCase() );
		}).length == 0);
		if (!isNameUnique) {
			validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.columnName) );
		}

		return validator;
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
		return new Promise(
			(resolve, reject) => {

				// verify we have been .save()d before:
				if (this.id) {

					// NOTE: our .migrateXXX() routines expect the object to currently exist
					// in the DB before we perform the DB operations.  So we need to
					// .migrateDrop()  before we actually .objectDestroy() this.
					this.migrateDrop()
					.then(()=>{
						return this.object.fieldRemove(this);
					})
					.then(resolve)
					.catch(reject)

				} else {

					resolve();  // nothing to do really
				}

			}
		)

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

				var isAdd = false;
				// if this is our initial save()
				if (!this.id) {
					isAdd = true;
					this.id = OP.Util.uuid();	// setup default .id
				}


				this.object.fieldSave(this)
				.then(() => {

					if (isAdd) {

						this.migrateCreate()
						.then(()=>{
							resolve(this);
						})
						.catch(reject);

					} else {
						resolve(this);
					}

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


    	// convert from "0" => 0
    	this.settings.showIcon = parseInt(this.settings.showIcon);
	}



	///
	/// DB Migrations
	///

	migrateCreate() {
		var url = '/app_builder/migrate/application/#appID#/object/#objID#/field/#fieldID#'
			.replace('#appID#', this.object.application.id)
			.replace('#objID#', this.object.id)
			.replace('#fieldID#', this.id)

		return OP.Comm.Service.post({
			url: url
		})
	}


	migrateDrop() {
		var url = '/app_builder/migrate/application/#appID#/object/#objID#/field/#fieldID#'
			.replace('#appID#', this.object.application.id)
			.replace('#objID#', this.object.id)
			.replace('#fieldID#', this.id)

		return OP.Comm.Service['delete']({
			url: url
		})
	}



	///
	/// Working with Actual Object Values:
	///

	/*
	 * @function columnHeader
	 * Return the column header for a webix grid component for this specific
	 * data field.
	 * @param {bool} isObjectWorkspace is this being used in the Object
	 *								   workspace.
	 * @return {obj}  configuration obj
	 */
	columnHeader (isObjectWorkspace) {

		var config = {
			id: this.columnName, // this.id,
			header: this.label,
		}

		if (isObjectWorkspace) {
			if (this.settings.showIcon) {
				config.header = '<span class="webix_icon fa-{icon}"></span>'.replace('{icon}', this.fieldIcon() ) + config.header;
			}
		}

		return config;
	}



	/**
	 * @method isValidData
	 * Parse through the given data and return an error if this field's
	 * data seems invalid.
	 * @param {obj} data  a key=>value hash of the inputs to parse.
	 */
	isValidData(data, validator) {

		console.error('!!! Field ['+this.fieldKey()+'] has not implemented .isValidData()!!!');

	}



	/*
	 * @function isMultilingual
	 * does this field represent multilingual data?
	 * @return {bool}
	 */
	isMultilingual() {
		return false;
	}


}
