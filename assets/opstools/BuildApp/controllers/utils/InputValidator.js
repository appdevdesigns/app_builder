steal(
	function () {
		var labels = {
			ok: AD.lang.label.getLabel('ab.common.ok') || "Ok",

			overMaxLength: AD.lang.label.getLabel('ab.validate.overMaxLength') || "This input value is invalid",
			overMaxLengthDescription: AD.lang.label.getLabel('ab.validate.overMaxLengthDescription') || "Should not have number of character more than #maxLength#.",

			invalidFormat: AD.lang.label.getLabel('ab.validate.invalidFormat') || "This input value is invalid format",
			invalidFormatDescription: AD.lang.label.getLabel('ab.validate.invalidFormatDescription') || "System disallow enter special character.",
		};

		return {
			rules: {
				preventDuplicateObjectName: function (value, id) {
					// Check duplicate
					var duplicateObject = AD.classes.AppBuilder.currApp.objects.filter(function (obj) {
						return obj.id != id &&
							(obj.name.toLowerCase().trim() == value.toLowerCase().trim() ||
								obj.label.toLowerCase().trim() == value.toLowerCase().trim());
					});

					if (duplicateObject && duplicateObject.length > 0) {
						return false;
					}
					else {
						return true;
					}
				}
			},

			validate: function (input) {
				// Validate maximum length of field name
				var maxNameLength = 20;
				if (input && input.length > maxNameLength) {
					webix.alert({
						title: labels.overMaxLength,
						text: labels.overMaxLengthDescription.replace('#maxLength#', maxNameLength),
						ok: labels.ok
					});
					return false;
				}

				// Validate format field name
				if (!/^[a-zA-Z]{1}[a-zA-Z0-9\s]*$/.test(input)) {
					webix.alert({
						title: labels.invalidFormat,
						text: labels.invalidFormatDescription,
						ok: labels.ok
					});
					return false;
				}

				return true;
			}


		};
	}
);