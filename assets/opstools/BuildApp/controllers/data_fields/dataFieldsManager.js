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
		// Convert import data fields to array
		var fields = $.map(arguments, function (dataField, index) {
			return [dataField];
		});

		function getField(name) {
			var field = fields.filter(function (f) { return f.name == name });

			if (field && field.length > 0)
				return field[0]
			else
				return null;
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

				if (field != null) {
					field.populateSettings(data);
				}
			},

			getSettings: function (name) {
				var field = getField(name);

				if (field != null) {
					return field.getSettings();
				}
				else {
					return null;
				}
			},

			resetState: function () {
				fields.forEach(function (f) {
					if (f.resetState)
						f.resetState();
				});
			}

		};
	}
);