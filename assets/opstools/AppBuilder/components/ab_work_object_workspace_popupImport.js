/*
 * ab_work_object_workspace_popupImport
 *
 * Manage the Import CSV data to objects.
 *
 */


export default class ABWorkObjectPopupImport extends OP.Component {

	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_popupImport';

		super(App, idBase);
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				title: L('ab.object.importCsv', '*Import CSV'),
				import: L('ab.object.form.csv.import') || "*Import",
				selectCsvFile: L('ab.object.form.csv.selectCsvFile', "*Choose a CSV file"),
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			popupImport: this.unique(idBase + '_popupImport'),
			form: this.unique(idBase + '_form'),

			uploadFileList: this.unique(idBase + '_uploadList'),
			separatedBy: this.unique('separated-by'),
		};


		// webix UI definition:
		this.ui = {
			view: "window",
			id: ids.popupImport,
			head: labels.component.title,
			modal: true,
			width: 400,
			height: 300,
			position: "center",
			select: false,
			hidden: true,
			body: {
				view: "form",
				id: ids.form,
				borderless: true,
				width: 400,
				elements: [
					{
						rows: [
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
										// return _logic.loadCsvFile(fileInfo);
									}
								}
							},
							{
								id: ids.separatedBy,
								view: "richselect",
								name: "separatedBy",
								label: labels.component.separatedBy,
								labelWidth: 140,
								options: [
									{ id: ",", value: "Comma (,)" },
									{ id: "\t", value: "Tab (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)" },
									{ id: ";", value: "Semicolon (;)" },
									{ id: "\s", value: "Space ( )" }
								],
								value: ',',
								on: {
									onChange: () => {
										_logic.populateColumnList();
									}
								}
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
				]
			}
		};

		var _currentObject = null;

		// for setting up UI
		this.init = (options) => {
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);
		};

		// internal business logic 
		var _logic = this._logic = {

			objectLoad: function (object) {
				_currentObject = object;
			},

			/**
			 * @function show()
			 *
			 * Show popup.
			 */
			show: function () {
				$$(ids.popupImport).show();
			},

			import: () => {
			}

		};

		// Expose any globally accessible Actions:
		this.actions({
		});

		this.objectLoad = _logic.objectLoad;
		this.show = _logic.show;
		this.import = _logic.import;

	}
}