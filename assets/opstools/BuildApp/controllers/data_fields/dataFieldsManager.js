steal(
	'opstools/BuildApp/controllers/data_fields/connectObject.js',
	'opstools/BuildApp/controllers/data_fields/string.js',
	'opstools/BuildApp/controllers/data_fields/text.js',
	'opstools/BuildApp/controllers/data_fields/number.js',
	'opstools/BuildApp/controllers/data_fields/date.js',
	'opstools/BuildApp/controllers/data_fields/boolean.js',
	'opstools/BuildApp/controllers/data_fields/list.js',
	function () {

		// steal() will pass in each of the above loaded objects
		// as parameters to this function().


		// convert the provided objects into a [fields]
		var fields = $.map(arguments, function (dataField, index) {
			return [dataField];
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
				return field[0]
			else
				return null;
		}



		AD.classes.AppBuilder = AD.classes.AppBuilder || {};
		AD.classes.AppBuilder.DataFields = {



			/**
			 * getEditDefinition
			 *
			 * return an array of all the Webix layout definitions for each of
			 * the DataFields. These definitions will be used to create the
			 * editor display when defining an instance of this DataField.
			 *
			 * @return {array} 
			 */
			getEditDefinitions: function () {
				return fields.map(function (f) { return f.editDefinition; });
			},


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
			getEditViewId: function (name) {
				var field = getField(name);

				if (field != null) {
					return field.editDefinition.id;
				}
				else {
					return null;
				}
			},


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
			getFieldMenuList: function () {
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
			},


			/**
			 * getSettings
			 *
			 * Have the DataField scan it's Webix Entry form and return the 
			 * values collected.
			 * 
			 * @param {string} name  Which DataField to return data from.
			 * @return {json}        the settings values, or null.				
			 */
			getSettings: function (name) {
				var field = getField(name);

				if (field != null) {
					return field.getSettings();
				}
				else {
					return null;
				}
			},


			/**
			 * populateSettings
			 *
			 * Have the DataField prepare it's display with the provided data.
			 *
			 * If no DataField matches data.name, then silently move on.
			 * 
			 * @param {ABColumn} data  An instance of ABColumn that contains 
			 *						the settings for a DataField.
			 *						NOTE: data.name  contains the DataField key					
			 */
			populateSettings: function (data) {
				var field = getField(data.name);

				if (field != null) {
					field.populateSettings(data);
				}
			},


			/**
			 * resetState
			 *
			 * Tell all DataFields to clear their Webix entry forms.
			 * 				
			 */
			resetState: function () {
				fields.forEach(function (f) {
					if (f.resetState)
						f.resetState();
				});
			}

		};
	}
);