
class OPValidator {

	constructor() {

		this.errors = [];
	}

	addError(name, message) {
		this.errors.push({name:name, message:message });
	}

	pass() {
		return this.errors.length == 0;
	}

	fail() {
		return this.errors.length > 0;
	}

	toValidationObject() {
		var obj = {
			error:'E_VALIDATION',
			invalidAttributes:{

			}
		}

		var attr = obj.invalidAttributes;
		
		this.errors.forEach((e)=>{

			attr[e.name] = attr[e.name] || [];
			attr[e.name].push(e);
		})

		return obj;
	}


	updateForm(form) {
		var vObj = this.toValidationObject();
		OP.Validation.isFormValidationError(vObj, form);
	}

	updateGrid(rowID, grid) {
		var vObj = this.toValidationObject();
		OP.Validation.isGridValidationError(vObj, rowID, grid);
	}
}


//// LEFT OFF HERE:
// add an OP.Validation  and remove OP.Form  OP.Grid
// update existing Applicaiton, Object, Field forms to use this.


export default {

	/**
	 * @function OP.Validation.validator
	 * return a new instance of OPValidator.
	 * @return {OPValidator}
	 */
	validator:function() {
		return new OPValidator();
	},

// var validator = OP.Validation.validator()
// validator.addError('name', 'message')
// validator.pass() 
// validator.updateForm(Form);
// validator.updateGrid(editor, Grid);

	/**
	 * @function OP.Validation.isFormValidationError
	 *
	 * scans the given error to see if it is a sails' response about an invalid
	 * value from one of the form elements.
	 *
	 * @codestart
	 * var form = $$('formID');
	 * var values = form.getValues();
	 * model.attr(values);
	 * model.save()
	 * .fail(function(err){
	 *     if (!OP.Form.isFormValidationError(err, form)) {
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
	isFormValidationError: function(error, form) {

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

	},



	/**
	 * @function OP.Validation.isGridValidationError
	 *
	 * scans the given error to see if it is a sails' response about an invalid
	 * value from one of our grid columns.
	 *
	 * @codestart
	 * var grid = $$('myGrid');
	 * model.attr(values);
	 * model.save()
	 * .fail(function(err){
	 *     if (!OP.Validation.isGridValidationError(err, editor, grid)) {
	 *         OP.error.log('Error saving current model ()', {error:err, values:values});
	 *     }
	 * })
	 * .then(function(newData){
	 * 
	 * });
	 * @codeend
	 *
	 * @param {obj} error  the error response object
	 * @param {integer} row the row id of the Grid to update.
	 * @param {obj} Grid   the webix grid instance (or reference)
	 * @return {bool}      true if error was about a grid column.  false otherwise.
	 */
	isGridValidationError: function(error, row, Grid) {


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

					var wasGrid = false;
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


							Grid.addCellCss(row, attr, "webix_invalid");
							Grid.addCellCss(row, attr, "webix_invalid_cell");

							var msg = [];
							attrs[attr].forEach((e)=>{
								msg.push(e.message);
							})
							
							OP.Dialog.Alert({
								text: attr + ': ' + msg.join(', ')
							})

							wasGrid = true;

					}

					Grid.refresh(row);

					if (wasGrid) {
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