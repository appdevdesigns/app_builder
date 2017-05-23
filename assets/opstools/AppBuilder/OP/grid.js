
export default {


	/**
	 * @function OP.Grid.isValidationError
	 *
	 * scans the given error to see if it is a sails' response about an invalid
	 * value from one of our grid columns.
	 *
	 * @codestart
	 * var grid = $$('myGrid');
	 * model.attr(values);
	 * model.save()
	 * .fail(function(err){
	 *     if (!OP.Grid.isValidationError(err, grid)) {
	 *         OP.error.log('Error saving current model ()', {error:err, values:values});
	 *     }
	 * })
	 * .then(function(newData){
	 * 
	 * });
	 * @codeend
	 *
	 * @param {obj} error  the error response object
	 * @param {obj} form   the webix grid instance (or reference)
	 * @return {bool}      true if error was about a grid column.  false otherwise.
	 */
	isValidationError: function(error, editor, Grid) {


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

			// if this is from our server response:
			if (error.data && error.data.error && error.data.error == 'E_VALIDATION') {
				error = error.data;
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
						// if (form.elements[attr]) {

						// 	var errors = attrs[attr];
						// 	var msg = [];
						// 	errors.forEach(function(err) {
						// 		msg.push(err.message);
						// 	})

						// 	// set the invalid error message
						// 	form.markInvalid(attr, msg.join(', '));

						// 	// set focus to the 1st form element we mark:
						// 	if (!hasFocused) {
						// 		form.elements[attr].focus();
						// 		hasFocused = true;
						// 	}

						// 	wasForm = true;
						// }


							Grid.addCellCss(editor.row, attr, "webix_invalid");
							Grid.addCellCss(editor.row, attr, "webix_invalid_cell");

							var msg = [];
							attrs[attr].forEach((e)=>{
								msg.push(e.message);
							})
							
							OP.Dialog.Alert({
								text: attr + ': ' + msg.join(', ')
							})

							wasForm = true;

					}

					Grid.refresh(editor.row);

					if (wasForm) {
						return true;
					}
				}

			}
		}

		// if we missed updating our Grid with an error
		// this was not a validation error so return false
		return false

	}


	
}