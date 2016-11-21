steal(
	'opstools/BuildApp/controllers/data_fields/connectObject.js',
	'opstools/BuildApp/controllers/data_fields/string.js',
	'opstools/BuildApp/controllers/data_fields/text.js',
	'opstools/BuildApp/controllers/data_fields/number.js',
	'opstools/BuildApp/controllers/data_fields/date.js',
	'opstools/BuildApp/controllers/data_fields/boolean.js',
	'opstools/BuildApp/controllers/data_fields/list.js',
	'opstools/BuildApp/controllers/data_fields/attachment.js',
	'opstools/BuildApp/controllers/data_fields/image.js',
	function () {
		var self = {};

		// steal() will pass in each of the above loaded objects
		// as parameters to this function().

		var componentIds = {
			labelName: 'ab-new-{0}-label'
		};

		// convert the provided objects into a [fields]
		var fields = $.map(arguments, function (dataField, index) {

			// if the dataField.includeHeader value is set, then update the 
			includeHeaderDefinition(dataField);

			return [dataField];
		});

		// Listen save event
		fields.forEach(function (field) {
			$(field).on('update', function (event, data) {
				data.fieldName = field.name;
				$(self).trigger('update', data);
			});
			// TODO:			
			// possible way to have each field able to reference the DataFieldManager:
			// field.DataFieldManager = self;
		});

		/**
		 * getField()
		 *
		 * return the DataField object by it's name.
		 *
		 * @param {string} name  The unique key to lookup the DataField
		 * @return {DataField}  or null.
		 */
		function getField(name) {
			var field = fields.filter(function (f) { return f.name == name });

			if (field && field.length > 0)
				return field[0];
			else
				return null;
		}


		/**
		 * @function includeHeaderDefinition
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
		function includeHeaderDefinition(field) {
			if (field.includeHeader) {
				if (!field.editDefinition.rows) field.editDefinition.rows = [];

				var headerDefinition = [];

				// Title
				if (field.icon && field.menuName) {
					headerDefinition.push({
						view: "label",
						label: "<span class='webix_icon fa-{0}'></span>{1}".replace('{0}', field.icon).replace('{1}', field.menuName)
					});
				}

				// Label text box
				headerDefinition.push({
					view: "text",
					id: componentIds.labelName.replace('{0}', field.name),
					label: 'Label',
					placeholder: 'Header name',
					labelWidth: 50,
					css: 'ab-new-label-name'
				});

				// Description
				if (field.description) {
					headerDefinition.push({
						view: "label",
						label: field.description
					});
				}

				field.editDefinition.rows = headerDefinition.concat(field.editDefinition.rows);
			}
		}

		/**
		 * getEditDefinition
		 *
		 * return an array of all the Webix layout definitions for each of
		 * the DataFields. These definitions will be used to create the
		 * editor display when defining an instance of this DataField.
		 *
		 * @return {array} 
		 */
		self.getEditDefinitions = function () {
			return fields.map(function (f) { return f.editDefinition; });
		};


		/**
		 * getEditViewId
		 *
		 * return the Webix id for the edit form of the DataField specified
		 * by name.
		 *
		 * @param {string} name  The name of the DataField to return it's
		 *						 edit view id for.
		 *
		 * @return {integer}  The $$(webix.id) to find the proper edit view.
		 */
		self.getEditViewId = function (name) {
			var field = getField(name);

			if (field && field.editDefinition) {
				return field.editDefinition.id;
			}
			else {
				return null;
			}
		};


		/**
		 * getFieldMenuList()
		 *
		 * return a list of available fields that can be added to an Object
		 * 
		 * @return {array}  array of webix button definitions for the 
		 *					AppBuilder.choose field entry.
		 *					.view: 'button'
		 *					.value:  the multilingual text that should display
		 *							for this entry
		 *					.fieldName: the reference key for this field
		 *					.fieldType: the data type for this field
		 *					.icon:  the font-awesome icon reference
		 */
		self.getFieldMenuList = function () {
			return fields.map(function (f) {
				return {
					view: 'button',
					value: AD.lang.label.getLabel(f.menuName) || f.menuName,
					fieldName: f.name,
					fieldType: f.type,
					icon: f.icon,
					type: 'icon'
				};
			});
		};


		/**
		 * getSettings
		 *
		 * Have the DataField scan it's Webix Entry form and return the 
		 * values collected.
		 * 
		 * @param {string} name  Which DataField to return data from.
		 * @return {json}        the settings values, or null.				
		 */
		self.getSettings = function (name) {
			var field = getField(name);

			if (field != null) {
				var fieldInfo = field.getSettings();
				if (fieldInfo) {
					fieldInfo.name = $$(componentIds.labelName.replace('{0}', name)).getValue();
					fieldInfo.label = $$(componentIds.labelName.replace('{0}', name)).getValue();
					fieldInfo.id = $$(componentIds.labelName.replace('{0}', name)).columnId;
					fieldInfo.weight = $$(componentIds.labelName.replace('{0}', name)).weight;
				}

				return fieldInfo;
			}
			else {
				return null;
			}
		};


		/**
		 * populateSettings
		 *
		 * Have the DataField prepare it's display with the provided data.
		 *
		 * If no DataField matches data.name, then silently move on.
		 * 
		 * @param {ABApplication} application the ABApplication object that defines 
		 *							this App.  From this we can access any additional
		 *							info required for this DataField to work.
		 *							ex: attempting to access other objects ..
		 *
		 * @param {ABColumn} data  An instance of ABColumn that contains 
		 *						the settings for a DataField.
		 *						NOTE: data.name  contains the DataField key					
		 */
		self.populateSettings = function (application, data) {
			var field = getField(data.fieldName);

			if (!field) return;

			if ($$(componentIds.labelName.replace('{0}', data.fieldName)))
				$$(componentIds.labelName.replace('{0}', data.fieldName)).setValue(data.label);
			else
				$$(componentIds.labelName.replace('{0}', data.fieldName)).setValue('');

			$$(componentIds.labelName.replace('{0}', data.fieldName)).columnId = data.id;
			$$(componentIds.labelName.replace('{0}', data.fieldName)).weight = data.weight;

			field.populateSettings(application, data);
		};


		/**
		 * customDisplay
		 *
		 * Allow a DataField to manually create it's display in other UI components.
		 *
		 * @param {string} fieldName  Which DataField to work with.	
		 * @param {obj} application : The current ABApplication instance 
		 * @param {obj} object  : The ABObject that contains this DataField
		 * @param {obj} fieldData : The ABColumn instance that defines this DataField
		 * @param {int} rowId   : the .id of the Model instance from which we are 
		 *						  getting the data for this DataField
		 * @param {} data       : the value of this DataField
		 * @param {el} itemNode : the DOM element of the Webix Cell that contains
		 * 						  the display of this DataField
		 * @param {obj} options : provided by the calling UI component (Grid/Form)
		 *						  .readOnly  {bool}  should we display as readOnly?	
		 * @return {bool}		: true (or non False) if there is a customDisplay
		 *						: false if no customDisplay
		 */
		self.customDisplay = function (fieldName, application, object, fieldData, rowId, data, itemNode, options) {
			var field = getField(fieldName);
			options = options || {};

			if (field && field.customDisplay)
				return field.customDisplay(application, object, fieldData, rowId, data, itemNode, options);
			else
				return false;
		};

		self.customEdit = function (application, object, fieldData, dataId, itemNode) {
			var field = getField(fieldData.fieldName);

			if (field && field.customEdit)
				return field.customEdit(application, object, fieldData, dataId, itemNode);
			else
				return true;
		};

		self.hasCustomEdit = function (fieldName) {
			var field = getField(fieldName);

			if (field && field.customEdit)
				return true;
			else
				return false;
		};

		self.getValue = function (application, object, fieldData, itemNode) {
			var field = getField(fieldData.fieldName);

			if (field && field.getValue)
				return field.getValue(application, object, fieldData, itemNode);
			else
				return null;
		};

		self.setValue = function (fieldData, itemNode, data) {
			var field = getField(fieldData.fieldName);

			if (field && field.setValue)
				return field.setValue(fieldData, itemNode, data);
		};

		self.getRowHeight = function (fieldData, data) {
			var field = getField(fieldData.fieldName);

			if (field && field.getRowHeight) {
				var rowHeight = parseInt(field.getRowHeight(fieldData, data));
				if (typeof rowHeight === "number")
					return rowHeight;
				else
					return null
			}
			else
				return null;
		};

		self.validate = function (fieldData, value) {
			//if (value == null || typeof value == 'undefined' || value.length < 1) return true;

			var field = getField(fieldData.fieldName);

			if (field && field.validate)
				return field.validate(fieldData, value);
			else
				return true;
		};

		/**
		 * resetState
		 *
		 * Tell all DataFields to clear their Webix entry forms.
		 * 				
		 */
		self.resetState = function () {
			fields.forEach(function (f) {
				var elLabel = $$(componentIds.labelName.replace('{0}', f.name));
				if (elLabel)
					elLabel.setValue('');

				if (f.resetState)
					f.resetState();
			});
		};


		return self;
	}
);