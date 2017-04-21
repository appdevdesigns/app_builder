
export default {

	/**
	 * @function OP.Form.validationError
	 *
	 * creates an error object that can be used in OP.Form.isValidationError()
	 * to update a webix form with error validation messages.
	 *
	 * @param {json} error 	an error object
	 *				error.name	{string} the attribute name (Form.element[error.name])
	 *				error.message {string} the message to display for the error
	 *
	 * @return {obj} an error object.
	 */
	validationError: function(error, errorObj) {

		errorObj = errorObj || {
			error:'E_VALIDATION',
			invalidAttributes:{

			}
		}

		var attr = errorObj.invalidAttributes;
		attr[error.name] = attr[error.name] || [];

		attr[error.name].push(error);

		return errorObj;
	},


	/**
	 * @function OP.Form.isValidationError
	 *
	 * scans the given error to see if it is a sails' respone about an invalid
	 * value from one of the form elements.
	 *
	 * @codestart
	 * var form = $$('formID');
	 * var values = form.getValues();
	 * model.attr(values);
	 * model.save()
	 * .fail(function(err){
	 *     if (!OP.Form.isValidationError(err, form)) {
	 *         OP.error.log('Error saving current model ()', {error:err, values:values});
	 *     }
	 * })
	 * .then(function(newData){
	 * 
	 * });
	 * @codeend
	 *
	 * @param {obj} error  the error response object
	 * @param {obj} form   the webix form instance (or reference)
	 * @return {bool}      true if error was about a form element.  false otherwise.
	 */
	isValidationError: function(error, form) {

		// {bool} have we set focus to form component?
		var hasFocused = false;


		// if we have an error object:
		if (error) { 


			//// if the error obj is provided by Sails response, 
			//// do some clean up on the error object:


			// dig down to sails provided error object:
			if ((error.error)
				&& (error.error == 'E_UNKNOWN')
				&& (error.raw)
				&& (error.raw.length > 0)) {

				error = error.raw[0]
			}

			// drill down to the embedded .err object if it exists
			if (error.err) {
				error = error.err;
			}


			//// Now process the error object
			//// 
			if (((error.error)
					&& (error.error == 'E_VALIDATION'))
				|| ((error.code) && (error.code == 'E_VALIDATION'))) {

				var attrs = error.invalidAttributes;
				if (attrs) {

					var wasForm = false;
					for (var attr in attrs) {

						// if this is a field in the form:
						if (form.elements[attr]) {

							var errors = attrs[attr];
							var msg = [];
							errors.forEach(function(err) {
								msg.push(err.message);
							})

							// set the invalid error message
							form.markInvalid(attr, msg.join(', '));

							// set focus to the 1st form element we mark:
							if (!hasFocused) {
								form.elements[attr].focus();
								hasFocused = true;
							}

							wasForm = true;
						}

					}

					if (wasForm) {
						return true;
					}
				}

			}
		}

		// if we missed updating our form with an error
		// this was not a validation error so return false
		return false

	}


	
}