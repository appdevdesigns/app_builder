/*
 * ABField
 *
 * An ABField defines a single unique Field/Column in a ABObject.
 *
 */

import ABFieldBase from "./ABFieldBase"
import ABViewManager from "../ABViewManager"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABField extends ABFieldBase {

    constructor(values, object, fieldDefaults) {

    	super(values, object, fieldDefaults);

   //  	// NOTE: setup this first so later we can use .fieldType(), .fieldIcon()
   //  	this.defaults = fieldDefaults;


    	
  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'fieldKey',				// unique key for this Field
  	// 		icon:'font',				// fa-[icon] reference for an icon for this Field Type
  	// 		label:'',					// pulled from translation
	// 		columnName:'column_name',	// a valid mysql table.column name
	//		settings: {					// unique settings for the type of field
	//		showIcon:true/false,		// only useful in Object Workspace DataTable
	//		isImported: 1/0,			// flag to mark is import from other object

	// 	// specific for dataField
	// },
	// translations:[]
  	// 	}
  		
  	// 	this.fromValues(values);



    	// label is a multilingual value:
    	OP.Multilingual.translate(this, this, ['label']);


    	// this.object = object;
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
				oldVal == $$(ids.columnName).getValue() &&
				$$(ids.columnName).isEnabled()) {
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
					label: App.labels.dataFieldLabel, // Label
					placeholder: App.labels.dataFieldLabelPlaceholder, // Label
					labelWidth: App.config.labelWidthLarge,
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
					disallowEdit: true,
					label: App.labels.dataFieldColumnName, // 'Field Name',
					labelWidth: App.config.labelWidthLarge,
					placeholder: App.labels.dataFieldColumnNamePlaceholder, // 'Database field name',
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
	  

	static get reservedNames() {
		return ['id', 'created_at', 'updated_at', 'properties', 'createdAt', 'updatedAt'];
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

						// TODO workaround : where should I destroy a link object
						if (this.key == "connectObject") {
							var application = this.object.application;
							var linkObject = application.objects((obj) => obj.id == this.settings.linkObject)[0];

							if (linkObject) {

								var linkField = linkObject.fields((f) => f.id == this.settings.linkColumn)[0];
								if (linkField) {
									linkField.destroy().then(() => {});
								}

							}
						}


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

					if (isAdd &&
						this.key != "connectObject" // does not .migrateCreate, we have to wait until the link column will finish
						) {

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

		return super.toObj();
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


	/*
	 * @function customDisplay
	 * perform any custom display modifications for this field.  If this isn't 
	 * a standard value display (think image, Map, graph, etc...) then use this
	 * method to create the display in the table/grid cell.
	 * @param {object} row is the {name=>value} hash of the current row of data.
	 * @param {App} App the shared ui App object useful more making globally
	 *					unique id references.
	 * @param {HtmlDOM} node  the HTML Dom object for this field's display.
	 */
	customDisplay(row, App, node) {
		
	}


	/*
	 * @function customEdit
	 * 
	 * 
	 * 
	 * @param {object} row is the {name=>value} hash of the current row of data.
	 * @param {App} App the shared ui App object useful more making globally
	 *					unique id references.
	 * @param {HtmlDOM} node  the HTML Dom object for this field's display.
	 */
	customEdit(row, App, node) {
		return true;
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

	
	/**
	 * @method getValue
	 * this function uses for form component and mass update popup
	 * to get value of fields that apply custom editor
	 * 
	 * @param {Object} item - Webix element
	 * @param {Object} rowData - data of row
	 * 
	 * @return {Object}
	 */
	getValue(item, rowData) {
		return item.getValue();
	};

	/**
	 * @method setValue
	 * this function uses for form component and mass update popup
	 * to get value of fields that apply custom editor
	 * 
	 * @param {Object} item - Webix element
	 * @param {Object} rowData - data of row
	 * 
	 */
	setValue(item, rowData) {

		if (!item) return;

		var val = rowData[this.columnName];

		item.setValue(val);
	};




	/**
	 * @method format
	 * return display text to detail comonent and define label of object
	 * 
	 * @param {Object} rowData - data
	 */
	format(rowData) {

		if (rowData && rowData[this.columnName] != null)
			return rowData[this.columnName];
		else
			return "";

	};



	/**
	 * @method formComponent
	 * returns a drag and droppable component that is used on the UI
	 * interface builder to place form components related to this ABField.
	 * 
	 * an ABField defines which form component is used to edit it's contents.
	 * However, what is returned here, needs to be able to create an instance of
	 * the component that will be stored with the ABViewForm.
	 */
	formComponent() {
		
		// NOTE: what is being returned here needs to mimic an ABView CLASS.
		// primarily the .common() and .newInstance() methods.
		
		return {

			// .common() is used to create the display in the list
			common: () => {
				return {
					
					// NOTE: form components should return .label:
					// label: 'PlaceHolder',  // form components should return .label

					// but since this is a common place holder: use the 
					// multilingual label here:
					labelKey: 'ab.abfield.labelPlaceholder',
					icon:  'square'
				}
			},


			// .newInstance() is used to create the view instance when the component
			// 		is dropped onto the ABView list.
			newInstance: (application, parent) => {

				// NOTE: in case you were wondering, the base ABField
				// 		 will just return a label with 'ABFieldPlaceholder' 
				// 		 as the text.  Any sub class of ABField should overwrite
				// 		 this and return an actual Form Component.

				// store object id and field id to field component
				var values = this.formComponent().common();
				values.settings = values.settings || {};
				values.settings.objectId = this.object.id;
				values.settings.fieldId = this.id;
				// values.id = this.id;

				var ABFieldPlaceholder = ABViewManager.newView(values, application, parent);
				// ABFieldPlaceholder.formatTitle();
				// ABFieldPlaceholder.text = "ABFieldPlaceholder";

				return ABFieldPlaceholder;
			}

		}
	}



	/**
	 * @method detailComponent
	 */
	detailComponent() {
		
		return {

			common: () => {
				return {
					icon:  'square'
				}
			},


			// .newInstance() is used to create the view instance when the component
			// 		is dropped onto the ABView list.
			newInstance: (application, parent) => {

				// store object id and field id to field component
				var values = this.detailComponent().common();
				values.settings = values.settings || {};
				values.settings.objectId = this.object.id;
				values.settings.fieldId = this.id;

				var ABFieldPlaceholder = ABViewManager.newView(values, application, parent);

				return ABFieldPlaceholder;
			}

		}
	}



}
