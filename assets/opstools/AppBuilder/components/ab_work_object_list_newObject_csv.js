
/*
 * ab_work_object_list_newObject_csv
 *
 * Display the form for import CSV file to a object.
 *
 */
import ABField from "../classes/dataFields/ABField"
import CSVImporter from "../classes/CSVImporter"

export default class AB_Work_Object_List_NewObject_Csv extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_object_list_newObject');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				placeholderName: L('ab.object.form.placeholderName', "*Object name"),

				importCsvHeader: L('ab.object.form.csv.importCsvHeader', "*Import CSV"),
				selectCsvFile: L('ab.object.form.csv.selectCsvFile', "*Choose a CSV file"),

				fileTypeErrorTitle: L('ab.object.form.csv.fileTypeError', "*This file extension is disallow"),
				fileTypeError: L('ab.object.form.csv.fileTypeError', "*Please only upload CSV file"),

				separatedBy: L('ab.object.form.csv.separatedBy', "*Separated by"),
				headerFirstLine: L('ab.object.form.csv.headerFirstLine', "*Header on first line"),

				import: L('ab.object.form.csv.import') || "*Import",
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),

			form: this.unique('csv'),
			uploadFileList: this.unique('upload-file-list'),
			separatedBy: this.unique('separated-by'),
			headerOnFirstLine: this.unique('header-first-line'),
			columnList: this.unique('column-list'),
			importButton: this.unique('import-csv-data')
		}

		var dataRows = [];

		var csvImporter = new CSVImporter();

		// Our webix UI definition:
		this.ui = {
			id: ids.component,
			header: labels.component.importCsvHeader,
			body: {
				view: "form",
				id: ids.form,
				width: 400,
				rules: {
				},
				elements: [
					{
						view: "text",
						label: labels.common.formName,
						name: "name",
						required: true,
						placeholder: labels.component.placeholderName,
						labelWidth: 70
					},
					{
						view: "uploader",
						name: "csvFile",
						value: labels.component.selectCsvFile,
						accept: "text/csv",
						multiple: false,
						autosend: false,
						link: ids.uploadFileList,
						on: {
							onBeforeFileAdd: (fileInfo) => {
								return _logic.loadCsvFile(fileInfo);
							}
						}
					},
					{
						id: ids.uploadFileList,
						name: "uploadedFile",
						view: "list",
						type: "uploader",
						autoheight: true,
						borderless: true,
						onClick: {
							webix_remove_upload: (e, id, trg) => {
								_logic.removeCsvFile(id);
							}
						}
					},
					{
						id: ids.separatedBy,
						view: "richselect",
						name: "separatedBy",
						label: labels.component.separatedBy,
						labelWidth: 140,
						options: csvImporter.getSeparateItems(),
						value: ',',
						on: {
							onChange: () => {
								_logic.populateColumnList();
							}
						}
					},
					{
						id: ids.headerOnFirstLine,
						view: "checkbox",
						name: "headerOnFirstLine",
						labelRight: labels.component.headerFirstLine,
						labelWidth: 0,
						disabled: true,
						value: true,
						on: {
							onChange: (newVal, oldVal) => {
								_logic.populateColumnList();
							}
						}
					},
					{
						id: ids.columnList,
						view: App.custom.activelist.view,
						datatype: "json",
						multiselect: false,
						select: false,
						disabled: true,
						height: 260,
						minHeight: 260,
						maxHeight: 260,
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
									{ id: 'LongText', value: 'Long text' },
									{ id: 'number', value: 'Number' },
									{ id: 'date', value: 'Date' },
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
							{ fillspace: true },
							{
								view: "button",
								name: "cancel",
								value: labels.common.cancel,
								css: "ab-cancel-button",
								autowidth: true,
								click: () => {
									_logic.cancel();
								}
							},
							{
								view: "button",
								name: "import",
								id: ids.importButton,
								value: labels.component.import,
								disabled: true,
								autowidth: true,
								type: "form",
								click: () => {
									_logic.import();
								}
							}
						]
					}
				]
			}
		};


		// Our init() function for setting up our UI
		this.init = (options) => {

			if ($$(ids.form))
				webix.extend($$(ids.form), webix.ProgressBar);

			// load up our callbacks.
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}
		};

		// our internal business logic 
		var _logic = this._logic = {

			callbacks: {
				onCancel: () => { console.warn('NO onCancel()!') },
				onSave: (values, cb) => { console.warn('NO onSave()!') },
			},

			loadCsvFile: (fileInfo) => {

				if (!csvImporter.validateFile(fileInfo)) {
					webix.alert({
						title: labels.component.fileTypeErrorTitle,
						text: labels.component.fileTypeError,
						ok: labels.common.ok
					});

					return false;
				}

				// show loading cursor
				if ($$(ids.form).showProgress)
					$$(ids.form).showProgress({ type: "icon" });

				// read CSV file
				csvImporter.getDataRows(fileInfo, getSeparatedBy())
					.then(data => {

						dataRows = data;

						$$(ids.headerOnFirstLine).enable();
						$$(ids.columnList).enable();
						$$(ids.importButton).enable();
		
						_logic.populateColumnList();

						if ($$(ids.form).hideProgress)
							$$(ids.form).hideProgress();

					});

				return true;

			},

			removeCsvFile: (fileId) => {
				$$(ids.uploadFileList).remove(fileId);
				_logic.formClear();
				return true;
			},

			populateColumnList: () => {
				$$(ids.columnList).clearAll();

				var firstLine = dataRows[0];
				if (firstLine == null) return;

				var columnList = [];

				if ($$(ids.headerOnFirstLine).getValue()) {
					columnList = firstLine.map(function (colName, index) {
						return {
							include: true,
							columnName: colName,
							dataType: csvImporter.getGuessDataType(dataRows, index)
						};
					});
				}
				else {
					for (var i = 0; i < firstLine.length; i++) {
						columnList.push({
							include: true,
							columnName: 'Field ' + (i + 1),
							dataType: csvImporter.getGuessDataType(dataRows, i)
						});
					}
				}

				$$(ids.columnList).parse(columnList);
			},

			import: () => {
				var saveButton = $$(ids.importButton);
				saveButton.disable();

				if (!$$(ids.form).validate()) {
					saveButton.enable();
					return false;
				}

				// Validate required column names
				var emptyColNames = $$(ids.columnList).data.find((col) => {
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

				// Validate reserve column names
				var reservedColNames = $$(ids.columnList).data.find(col => {
					return col.include && ABField.reservedNames.indexOf(col.columnName.trim().toLowerCase()) > -1;
				});
				if (reservedColNames.length > 0) {
					webix.alert({
						title: "Column name is invalid",
						text: "Please enter column name does not match [" + ABField.reservedNames.join(', ') + "]",
						ok: labels.common.ok
					});

					saveButton.enable();
					return false;
				}


				// create new object
				var newObjAttr = {
					primaryColumnName: "uuid", // set uuid to be primary column
					name: $$(ids.form).getValues()['name'],
					fields: []
				};

				// add new columns to object
				$$(ids.columnList).data.find({}).forEach((item, index) => {
					if (item.include) {

						var newField = {
							id: OP.Util.uuid(),
							columnName: item.columnName,
							label: item.columnName,
							key: item.dataType,
							settings: {
								showIcon: 1,
								weight: index
							}
						};

						switch (item.dataType) {
							case 'string':
							case 'LongText':
								newField.settings.supportMultilingual = 0;
								break;
						}

						newObjAttr.fields.push(newField);
					}
				});

				// now send data back to be added:
				_logic.callbacks.onSave(newObjAttr, (validator, newObj) => {

					if (validator) {

						if (validator.updateForm)
							validator.updateForm($$(ids.form));

						// get notified if there was an error saving.
						saveButton.enable();
						return Promise.reject("the enter data is invalid");
					}

					// add rows to Server
					var objModel = newObj.model();

					// Add each records sequentially
					var subTasks = Promise.resolve();
					dataRows.forEach((data, index) => {
						subTasks = subTasks.then(x => {

							if ($$(ids.headerOnFirstLine).getValue() && index == 0) 
								return Promise.resolve();

							var rowData = {};
							var colValues = data;

							newObj.fields().forEach((col) => {
								if (colValues[col.settings.weight] != null)
									rowData[col.columnName] = colValues[col.settings.weight];
							})

							// Add row data
							return objModel.create(rowData);

						});
					});

					// if there was no error, clear the form for the next
					// entry:
					return subTasks.then(() => {
						_logic.formClear();
						saveButton.enable();

						return Promise.resolve();
					});

				});
			},

			cancel: () => {
				_logic.formClear();
				_logic.callbacks.onCancel();
			},

			formClear: () => {
				dataRows = [];

				$$(ids.form).clearValidation();
				$$(ids.form).clear();
				$$(ids.separatedBy).setValue(',');

				$$(ids.columnList).clearAll();
				$$(ids.uploadFileList).clearAll();

				$$(ids.headerOnFirstLine).disable();
				$$(ids.columnList).disable();
				$$(ids.importButton).disable();
			}

		};



		// private functions

		var getSeparatedBy = () => {
			return $$(ids.separatedBy).getValue();
		}


	} // end constructor


}