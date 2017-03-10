steal(
	'opstools/BuildApp/controllers/utils/InputValidator.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	function (inputValidator) {
		var componentIds = {
			importCsvForm: 'ab-object-csv-import-form',
			headerOnFirstLine: 'ab-object-csv-import-header-first-check-box',
			uploadFileList: 'ab-object-csv-import-upload-list',
			columnList: 'ab-object-csv-import-column-list',
			importButton: 'ab-object-csv-import-button'
		},
			labels = {
				common: {
					importCsvHeader: AD.lang.label.getLabel('ab.common.importCsvHeader') || "Import CSV",
					formName: AD.lang.label.getLabel('ab.common.form.name') || "Name",
					import: AD.lang.label.getLabel('ab.common.import') || "Import",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
				},
				object: {
					placeholderName: AD.lang.label.getLabel('ab.object.form.placeholderName') || "Object name"
				}
			};

		var instance = {
			onInit: function () {
				$$(componentIds.columnList).clearAll();

				$$(componentIds.headerOnFirstLine).disable();
				$$(componentIds.columnList).disable();
				$$(componentIds.importButton).disable();
			},

			getCreateView: function () {
				return {
					header: labels.common.importCsvHeader,
					body: {
						view: "form",
						id: componentIds.importCsvForm,
						width: 400,
						elements: [
							{ view: "text", label: labels.common.formName, name: "name", required: true, placeholder: labels.object.placeholderName, labelWidth: 70 },
							{
								view: "uploader",
								name: "csvFile",
								value: "Upload a CSV file",
								accept: "text/csv",
								multiple: false,
								autosend: false,
								link: componentIds.uploadFileList,
								on: {
									onBeforeFileAdd: function (item) {
										var reader = new FileReader();

										reader.onload = function (e) {
											alert(reader.result);

											$$(componentIds.headerOnFirstLine).enable();
											$$(componentIds.columnList).enable();
											$$(componentIds.importButton).enable();

											$$(componentIds.columnList).parse([
												{ columnName: "Test One" },
												{ columnName: "Test Two" },
												{ columnName: "Test Three" },
												{ columnName: "Test Four" }
											]);
										}

										reader.readAsText(item.file);
									}
								}
							},
							{
								id: componentIds.uploadFileList,
								view: "list",
								type: "uploader",
								autoheight: true,
								borderless: true
							},
							{
								id: componentIds.headerOnFirstLine,
								view: "checkbox",
								labelRight: "Header on first line",
								labelWidth: 0
							},
							{
								id: componentIds.columnList,
								view: 'activelist',
								css: 'ab-main-container',
								datatype: "json",
								height: 280,
								type: {
									height: 40
								},
								activeContent: {
									include: {
										view: "checkbox",
										width: 30,
										value: true
									},
									dataType: {
										view: "select",
										options: [
											{ id: 'string', value: 'Single text' },
											{ id: 'text', value: 'Long text' },
											{ id: 'number', value: 'Number' },
											{ id: 'date', value: 'Date' },
											{ id: 'boolean', value: 'Checkbox' },
										],
										width: 120
									},
									editType: {
										view: "button",
										type: "icon",
										icon: "cog",
										width: 25
									}
								},
								template:
								'<span class="float-left">{common.include()}</span>' +
								'<span class="float-left" style="width: 140px; overflow: hidden;">#columnName#</span>' +
								'<span class="float-left">{common.dataType()}</span>' +
								'<span class="float-left">{common.editType()}</span>'
							},
							{
								margin: 5,
								cols: [
									{
										view: "button",
										id: componentIds.importButton,
										value: labels.common.import, type: "form", click: function () {
											var saveButton = this;
											saveButton.disable();

											if (!$$(componentIds.importCsvForm).validate()) {
												saveButton.enable();
												return false;
											}

											var newObjectName = $$(componentIds.importCsvForm).elements['name'].getValue().trim();

											if (!inputValidator.validate(newObjectName)) {
												saveButton.enable();
												return false;
											}

											$(instance).trigger('startCreate');
										}
									},
									{
										view: "button", value: labels.common.cancel, click: function () {
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