steal(
	'opstools/BuildApp/controllers/data_fields/connectObject.js',
	'opstools/BuildApp/controllers/data_fields/string.js',
	'opstools/BuildApp/controllers/data_fields/text.js',
	'opstools/BuildApp/controllers/data_fields/number.js',
	'opstools/BuildApp/controllers/data_fields/date.js',
	'opstools/BuildApp/controllers/data_fields/boolean.js',
	'opstools/BuildApp/controllers/data_fields/list.js',
	'opstools/BuildApp/controllers/data_fields/attachment.js',
	function () {
		var componentIds = {
			headerName: 'ab-new-{0}-header',
			labelName: 'ab-new-{0}-label'
		};

		// Convert import data fields to array
		var fields = $.map(arguments, function (field, index) {

			includeHeaderDefinition(field);

			return [field];
		});

		function getField(name) {
			var field = fields.filter(function (f) { return f.name == name });

			if (field && field.length > 0)
				return field[0];
			else
				return null;
		}

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

				// Name text box
				headerDefinition.push({
					view: "text",
					id: componentIds.headerName.replace('{0}', field.name),
					label: "Name",
					placeholder: "Name",
					labelWidth: 50,
					css: 'ab-new-field-name', // Highlight this when open
					on: {
						onChange: function (newValue, oldValue) {
							if (oldValue == $$(componentIds.labelName.replace('{0}', field.name)).getValue())
								$$(componentIds.labelName.replace('{0}', field.name)).setValue(newValue);
						}
					}
				});

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

		AD.classes.AppBuilder = AD.classes.AppBuilder || {};
		AD.classes.AppBuilder.DataFields = {

			getFieldMenuList: function () {
				return fields.map(function (f) {
					return {
						view: 'button',
						value: f.menuName,
						fieldName: f.name,
						fieldType: f.type,
						icon: f.icon,
						type: 'icon'
					};
				});
			},

			getEditDefinitions: function () {
				return fields.map(function (f) { return f.editDefinition; });
			},

			getEditViewId: function (name) {
				var field = getField(name);

				if (field != null) {
					return field.editDefinition.id;
				}
				else {
					return null;
				}
			},

			populateSettings: function (data) {
				var field = getField(data.fieldName);

				$$(componentIds.headerName.replace('{0}', data.fieldName)).setValue(data.name.replace(/_/g, ' '));
				$$(componentIds.labelName.replace('{0}', data.fieldName)).setValue(data.label);

				if (field != null) {
					field.populateSettings(data);
				}
			},

			getSettings: function (name) {
				var field = getField(name);

				if (field != null) {
					var fieldInfo = field.getSettings();
					if (fieldInfo) {
						fieldInfo.name = $$(componentIds.headerName.replace('{0}', name)).getValue();
						fieldInfo.label = $$(componentIds.labelName.replace('{0}', name)).getValue();
					}

					return fieldInfo;
				}
				else {
					return null;
				}
			},

			resetState: function () {
				fields.forEach(function (f) {
					if ($$(componentIds.headerName.replace('{0}', f.name))) {
						$$(componentIds.headerName.replace('{0}', f.name)).setValue('');
						$$(componentIds.headerName.replace('{0}', f.name)).enable();
					}
					if ($$(componentIds.labelName.replace('{0}', f.name)))
						$$(componentIds.labelName.replace('{0}', f.name)).setValue('');

					if (f.resetState)
						f.resetState();
				});
			}

		};
	}
);