steal(
	'opstools/BuildApp/controllers/data_fields/string.js',
	function () {
		// Convert import data fields to array
		var fields = $.map(arguments, function (dataField, index) {
			return [dataField];
		});;

		AD.classes.AppBuilder = AD.classes.AppBuilder || {};
		AD.classes.AppBuilder.DataFields = {

			getFieldMenuList: function () {
				return fields.map(function (f) {
					return {
						view: 'button',
						value: f.menuName,
						fieldType: f.fieldType,
						icon: f.icon,
						type: 'icon'
					};
				});
			},

			getEditDefinitions: function () {
				return fields.map(function (f) { return f.editDefinition; });
			},

			populateSettings: function (data) {
				var field = fields.filter(function (f) { return f.type == data.type; });

				if (field && field.length > 0) {
					field[0].populateSettings(data);
				}
			}

		};
	}
);