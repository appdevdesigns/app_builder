steal(
	'opstools/BuildApp/controllers/utils/InputValidator.js',

	'opstools/BuildApp/controllers/webix_custom_components/ActiveList.js',
	function (inputValidator) {
		var componentIds = {
			importCsvForm: 'ab-object-csv-import-form',
			objectName: 'ab-object-csv-import-object-name',
			headerOnFirstLine: 'ab-object-csv-import-header-first-check-box',
			uploadFileList: 'ab-object-csv-import-upload-list',
			separatedBy: 'ab-object-csv-import-separated-by',
			columnList: 'ab-object-csv-import-column-list',
			importButton: 'ab-object-csv-import-button'
		},
			labels = {
				common: {
					importCsvHeader: AD.lang.label.getLabel('ab.common.importCsvHeader') || "Import CSV",
					formName: AD.lang.label.getLabel('ab.common.form.name') || "Name",
					import: AD.lang.label.getLabel('ab.common.import') || "Import",
					ok: AD.lang.label.getLabel('ab.common.ok') || "Ok",
					cancel: AD.lang.label.getLabel('ab.common.cancel') || "Cancel"
				},
				object: {
					placeholderName: AD.lang.label.getLabel('ab.object.form.placeholderName') || "Object name"
				}
			};

		function populateColumnList() {
			$$(componentIds.columnList).clearAll();

			var firstLine = instance.dataRows[0];

			if (firstLine == null) return;

			var columnList = [];

			if ($$(componentIds.headerOnFirstLine).getValue()) {
				columnList = firstLine.split(getSeparatedBy()).map(function (colName, index) {
					return {
						include: true,
						columnName: colName.trim(),
						dataType: getGuessDataType(index)
					};
				});
			}
			else {
				for (var i = 0; i < firstLine.split(getSeparatedBy()).length; i++) {
					columnList.push({
						include: true,
						columnName: 'Field ' + (i + 1),
						dataType: getGuessDataType(i)
					});
				}
			}

			$$(componentIds.columnList).parse(columnList);
		}

		function getGuessDataType(colIndex) {
			var secondLine = instance.dataRows[1],
				dataCols = secondLine.split(getSeparatedBy()),
				data = dataCols[colIndex];

			if (data == null || data == "") {
				return 'string'
			}
			else if (data == 0 || data == 1 || data == true || data == false || data == 'checked' || data == 'unchecked') {
				return 'boolean';
			}
			else if (!isNaN(data)) {
				return 'number';
			}
			else if (Date.parse(data)) {
				return 'date';
			}
			else {
				if (data.length > 10)
					return 'text';
				else
					return 'string';
			}
		}

		function getSeparatedBy() {
			return $$(componentIds.separatedBy).getValue();
		}

		function resetState() {
			instance.dataRows = [];

			$$(componentIds.objectName).setValue('');

			$$(componentIds.columnList).clearAll();
			$$(componentIds.uploadFileList).clearAll();

			$$(componentIds.headerOnFirstLine).disable();
			$$(componentIds.columnList).disable();
			$$(componentIds.importButton).disable();
		}

		var instance = {
			onInit: function () {
				resetState();
			},

			getCreateView: function () {
				return {
					header: labels.common.importCsvHeader,
					body: {
						view: "form",
						id: componentIds.importCsvForm,
						width: 400,
						elements: [
							{ view: "text", id: componentIds.objectName, label: labels.common.formName, name: "name", required: true, placeholder: labels.object.placeholderName, labelWidth: 70 },
							{
								view: "uploader",
								name: "csvFile",
								value: "Choose a CSV file",
								accept: "text/csv",
								multiple: false,
								autosend: false,
								link: componentIds.uploadFileList,
								on: {
									onBeforeFileAdd: function (item) {
										if (item.file.type.toLowerCase() != "text/csv") {
											webix.alert({
												title: "This file extension is disallow",
												text: "Please only upload CSV file",
												ok: labels.common.ok
											});

											return false;
										}

										var reader = new FileReader();

										reader.onload = function (e) {
											instance.dataRows = reader.result.split('\n');

											$$(componentIds.headerOnFirstLine).enable();
											$$(componentIds.columnList).enable();
											$$(componentIds.importButton).enable();

											populateColumnList();
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
								borderless: true,
								onClick: {
									webix_remove_upload: function (e, id, trg) {
										this.remove(id);
										resetState();
										return true;
									}
								}
							},
							{
								id: componentIds.separatedBy,
								view: "richselect",
								label: "Separated by",
								labelWidth: 100,
								options: [
									{ id: ",", value: "Comma (,)" },
									{ id: "\t", value: "Tab (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)" },
									{ id: ";", value: "Semicolon (;)" },
									{ id: "\s", value: "Space ( )" }
								],
								value: ',',
								on: {
									onChange: function () {
										populateColumnList();
									}
								}
							},
							{
								id: componentIds.headerOnFirstLine,
								view: "checkbox",
								labelRight: "Header on first line",
								labelWidth: 0,
								value: true,
								on: {
									onChange: function (newVal, oldVal) {
										populateColumnList();
									}
								}
							},
							{
								id: componentIds.columnList,
								view: 'activelist',
								css: 'ab-main-container',
								datatype: "json",
								multiselect: false,
								select: false,
								height: 280,
								maxHeight: 280,
								type: {
									height: 40
								},
								activeContent: {
									include: {
										view: "checkbox",
										width: 30
									},
									columnName: {
										view: 'text',
										width: 170
									},
									dataType: {
										view: "select",
										options: [
											{ id: 'string', value: 'Single text' },
											{ id: 'text', value: 'Long text' },
											{ id: 'number', value: 'Number' },
											{ id: 'datetime', value: 'Date' },
											{ id: 'boolean', value: 'Checkbox' },
										],
										width: 120
									},
								},
								template:
								'<span class="float-left">{common.include()}</span>' +
								'<span class="float-left">{common.columnName()}</span>' +
								'<span class="float-left">{common.dataType()}</span>'
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

											// Validate required object name
											if (!inputValidator.validate(newObjectName)) {
												saveButton.enable();
												return false;
											}

											// Validate required column names
											var emptyColNames = $$(componentIds.columnList).data.find({}).filter(function (col) {
												return col.include && col.columnName.trim().length == 0;
											});
											if (emptyColNames.length > 0) {
												webix.alert({
													title: "Column name is required",
													text: "Please enter column name",
													ok: labels.common.ok
												});

												saveButton.enable();
												return false;
											}

											$(instance).trigger('startCreate');

											var newObject;

											async.series([
												// Create new object
												function (next) {
													var newObjectInfo = {
														name: newObjectName,
														label: newObjectName
													};

													AD.classes.AppBuilder.currApp.createObject(newObjectInfo)
														.then(function (result) {
															if (result.translate) result.translate();

															newObject = result;

															next();
														}, next);
												},
												// Create columns to object
												function (next) {
													var createColumnTasks = [];

													$$(componentIds.columnList).data.find({}).forEach(function (item, index) {
														if (item.include) {
															createColumnTasks.push(function (ok) {
																newObject.createColumn(
																	item.dataType,
																	{
																		name: item.columnName
																	})
																	.then(function () {
																		ok()
																	}, ok);
															});
														}
													});

													async.parallel(createColumnTasks, next);
												}
											], function (err) {
												if (err)
													$(instance).trigger('createFail', { error: err });
												else
													$(instance).trigger('createDone', { newObject: newObject });
											});
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