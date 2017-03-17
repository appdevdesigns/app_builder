steal(
	'opstools/BuildApp/controllers/utils/InputValidator.js',

	function (inputValidator) {

		var componentIds = {
			addNewForm: 'ab-object-blank-object-form',
			saveButton: 'ab-object-blank-object-save',
			cancelButton: 'ab-object-blank-object-cancel'
		},
			labels = {
				common: {
					create: AD.lang.label.getLabel('ab.common.create') || "Create",
					formName: AD.lang.label.getLabel('ab.common.form.name') || "Name",
					add: AD.lang.label.getLabel('ab.common.add') || "Add",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
				},
				object: {
					placeholderName: AD.lang.label.getLabel('ab.object.form.placeholderName') || "Object name"
				}
			};

		var instance = {

			onInit: function () {
				$$(componentIds.addNewForm).clearValidation();
				$$(componentIds.addNewForm).clear();
			},

			getCreateView: function () {
				return {
					header: labels.common.create,
					body: {
						view: "form",
						id: componentIds.addNewForm,
						width: 400,
						rules: {
							name: inputValidator.rules.preventDuplicateObjectName
						},
						elements: [
							{ view: "text", label: labels.common.formName, name: "name", required: true, placeholder: labels.object.placeholderName, labelWidth: 70 },
							{
								margin: 5,
								cols: [
									{
										view: "button", id: componentIds.saveButton, value: labels.common.add, type: "form", click: function () {
											var saveButton = this;
											saveButton.disable();

											if (!$$(componentIds.addNewForm).validate()) {
												saveButton.enable();
												return false;
											}

											var newObjectName = $$(componentIds.addNewForm).elements['name'].getValue().trim();

											if (!inputValidator.validate(newObjectName)) {
												saveButton.enable();
												return false;
											}

											$(instance).trigger('startCreate');

											var newObject = {
												name: newObjectName,
												label: newObjectName
											};

											// Add new object to server
											AD.classes.AppBuilder.currApp.createObject(newObject)
												.fail(function (err) {
													$(instance).trigger('createFail', { error: err });

													saveButton.enable();

												})
												.done(function (result) {
													if (result.translate) result.translate();

													$(instance).trigger('createDone', { newObject: result });

													saveButton.enable();
												});

										}
									},
									{
										view: "button", id: componentIds.cancelButton, value: labels.common.cancel, click: function () {
											$(instance).trigger('cancel');
										}
									}
								]
							}
						]

					}
				};
			}

		};

		return instance;

	});