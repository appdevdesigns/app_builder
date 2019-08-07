/*
 * ABViewDocxBuilder
 *
 * An ABViewDocxBuilder defines a UI label display component.
 *
 */

import ABFieldConnect from "../dataFields/ABFieldConnect";
import ABFieldImage from "../dataFields/ABFieldImage";
import ABObjectQuery from "../ABObjectQuery";
import ABViewWidget from "./ABViewWidget"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var ABViewDocxBuilderPropertyComponentDefaults = {
	buttonlabel: "Download DOCX",
	dataviewID: null,
	width: 200,
	filename: "", // uuid
	filelabel: "output.docx"
}


var ABViewDefaults = {
	key: 'docxBuilder',		// {string} unique key for this view
	icon: 'file-word-o',	// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.docxBuilder' // {string} the multilingual label key for the class label
}

function letUserDownload(blob, filename) {
	let url = window.URL.createObjectURL(blob);

	let a = document.createElement('a');
	a.href = url;
	a.download = filename;
	document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
	a.click();
	a.remove();  //afterwards we remove the element again

	window.URL.revokeObjectURL(url);

}

export default class ABViewDocxBuilder extends ABViewWidget {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABViewWidget} parent the ABViewWidget this view is a child of. (can be null)
	 */
	constructor(values, application, parent) {

		super(values, application, parent, ABViewDefaults);

		// 		id:'uuid',					// uuid value for this obj
		// 		key:'viewKey',				// unique key for this View Type
		// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
		// 		label:'',					// pulled from translation

		//		settings: {					// unique settings for the type of field
		//			format: x				// the display style of the text
		//		},

		// 		views:[],					// the child views contained by this view.

		//		translations:[]				// text: the actual text being displayed by this label.

		// 	}

	}

	static common() {
		return ABViewDefaults;
	}

	///
	/// Instance Methods
	///

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// convert from "0" => 0
		this.settings.width = parseInt(this.settings.width || ABViewDocxBuilderPropertyComponentDefaults.width);

	}



	//
	//	Editor Related
	//


	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {

		var idBase = 'ABViewDocxBuilderEditorComponent';

		var DocxBuilderComponent = this.component(App, idBase);

		return DocxBuilderComponent;

	}

	//
	// Property Editor
	// 
	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		_logic.validateType = (item) => {

			// verify file type
			var acceptableTypes = ['docx'];
			var type = item.type.toLowerCase();
			if (acceptableTypes.indexOf(type) == -1) {
				//// TODO: multilingual
				webix.message("Only [" + acceptableTypes.join(", ") + "] files are supported");
				return false;
			}
			else {

				// set upload url to uploader
				let currView = _logic.currentEditObject();
				let uploadUrl = currView.uploadUrl();

				$$(ids.docxFile).define("upload", uploadUrl);
				$$(ids.docxFile).refresh();

				return true;
			}
		};

		_logic.uploadedFile = (fileInfo) => {

			if (!fileInfo || !fileInfo.data)
				return;

			let currView = _logic.currentEditObject();
			currView.settings.filename = fileInfo.data.uuid;
			currView.settings.filelabel = fileInfo.name;

			$$(ids.filelabel).setValue(currView.settings.filelabel);
			$$(ids.docxDownload).show();

		};

		_logic.downloadFile = () => {

			let currView = _logic.currentEditObject();
			let url = currView.downloadUrl();

			fetch(url)
				.then(response => response.blob())
				.then(blob => {

					letUserDownload(blob, currView.settings.filelabel);

				});

		};

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				view: "fieldset",
				label: L('ab.component.label.dataSource', '*Data:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							name: 'dataview',
							view: 'richselect',
							label: L('ab.components.docxBuilder.dataSource', "*Data Source"),
							labelWidth: App.config.labelWidthLarge
						},
					]
				}
			},

			{
				view: "fieldset",
				label: L('ab.component.docxBuilder.templateFile', '*Template file:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							cols: [
								{
									view: "label",
									label: L("ab.component.docxBuilder.title", "*DOCX file:"),
									css: 'ab-text-bold',
									width: App.config.labelWidthXLarge,
								},
								{
									view: "uploader",
									value: '*Upload',
									name: "docxFile",
									apiOnly: true,
									inputName: 'file',
									multiple: false,
									on: {
										onBeforeFileAdd: (item) => {

											return _logic.validateType(item);

										},

										onFileUpload: (file, response) => {

											_logic.uploadedFile(file);

										},

										onFileUploadError: (file, response) => {

										}
									}
								}
							]
						},
						{
							name: 'filelabel',
							view: 'text',
							label: L('ab.components.docxBuilder.filename', "*Filename"),
							labelWidth: App.config.labelWidthLarge
						},
						{
							name: "docxDownload",
							view: "button",
							type: "icon",
							icon: "fa fa-file-word-o",
							label: "Download Template File",
							click: () => {
								_logic.downloadFile();
							}
						}
					]
				}
			},

			{
				view: "fieldset",
				label: L('ab.component.label.customizeDisplay', '*Customize Display:'),
				labelWidth: App.config.labelWidthLarge,
				body: {
					type: "clean",
					padding: 10,
					rows: [
						{
							name: 'buttonlabel',
							view: 'text',
							label: L('ab.components.docxBuilder.text', "*Label"),
							labelWidth: App.config.labelWidthLarge
						},

						{
							view: 'counter',
							name: "width",
							label: L("ab.components.docxBuilder.width", "*Width:"),
							labelWidth: App.config.labelWidthLarge,
						},

					]
				}
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		let $DcSelector = $$(ids.dataview);

		let selectedDvId = (view.settings.dataviewID ? view.settings.dataviewID : null);

		// Pull data views to options
		let dvOptions = view.application.dataviews()
			.map((dc) => {

				return {
					id: dc.id,
					value: dc.label
				};
			});

		dvOptions.unshift({
			id: null,
			value: '[Select]'
		});
		$DcSelector.define('options', dvOptions);
		$DcSelector.define('value', selectedDvId);
		$DcSelector.refresh();

		$$(ids.filelabel).setValue(view.settings.filelabel);
		$$(ids.buttonlabel).setValue(view.settings.buttonlabel);
		$$(ids.width).setValue(view.settings.width);

		if (view.settings.filename) {
			$$(ids.docxDownload).show();
		}
		else {
			$$(ids.docxDownload).hide();
		}

	}

	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.buttonlabel = $$(ids.buttonlabel).getValue();
		view.settings.dataviewID = $$(ids.dataview).getValue();
		view.settings.width = $$(ids.width).getValue();
		view.settings.filelabel = $$(ids.filelabel).getValue();

	}


	/**
	 * @function component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		var idBase = 'ABViewDocxBuilder_' + this.id;
		var ids = {
			button: App.unique(idBase + '_button'),
			noFile: App.unique(idBase + '_noFile')
		};

		var _ui = {
			cols: [
				{
					id: ids.button,
					view: "button",
					type: "icon",
					icon: "fa fa-file-word-o",
					label: this.settings.buttonlabel || ABViewDocxBuilderPropertyComponentDefaults.buttonlabel,
					width: this.settings.width || ABViewDocxBuilderPropertyComponentDefaults.width,
					click: () => {
						_logic.renderFile();
					}
				},
				{
					id: ids.noFile,
					view: "label",
					label: "No template file"
				},
				{
					type: 'spacer'
				}
			]
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {

			let DownloadButton = $$(ids.button);
			let NoFileLabel = $$(ids.noFile);

			if (DownloadButton)
				webix.extend(DownloadButton, webix.ProgressBar);

			if (this.settings.filename) {
				DownloadButton.show();
				NoFileLabel.hide();
			}
			else {
				DownloadButton.hide();
				NoFileLabel.show();
			}

		};

		let _logic = {

			busy: () => {

				let DownloadButton = $$(ids.button);
				if (!DownloadButton) return;

				DownloadButton.disable();

				if (DownloadButton.showProgress)
					DownloadButton.showProgress({ type: "icon" });


			},

			ready: () => {

				let DownloadButton = $$(ids.button);
				if (!DownloadButton) return;

				DownloadButton.enable();

				if (DownloadButton.hideProgress)
					DownloadButton.hideProgress();

			},

			renderFile: () => {

				_logic.busy();

				let currCursor = {};
				let images = {};

				Promise.resolve()
					// Get current cursor
					.then(() => {

						let dv = this.dataview;
						if (dv) {
							currCursor = dv.getCursor();

							// update property names to column labels to match format names in docx file
							if (currCursor) {

								let obj = dv.datasource;
								if (obj) {

									currCursor = _.clone(currCursor);

									let normalizeCursor = (field, label) => {

										if (field instanceof ABFieldConnect) {

											// If field is connected field, then 
											// {
											//		fieldName: {Object} or [Array]
											//		fieldName_label: "Value1, Value2"
											// }

											currCursor[label] = currCursor[label];
											currCursor[label + '_label'] = field.format(currCursor);
										}
										else {
											currCursor[label] = field.format(currCursor);
										}

										if (currCursor[label] == null)
											currCursor[label] = '';

									};

									// Query Objects
									if (obj instanceof ABObjectQuery) {
										obj.fields().forEach(f => {

											// Replace alias with label of object
											let label = f.columnName.replace(f.alias, f.object.label);

											normalizeCursor(f, label);

										});
									}
									// Normal Objects
									else {
										obj.fields().forEach(f => {

											normalizeCursor(f, f.label);

										});
									}

								}

							}
							else {
								currCursor = {};
							}
						}

						console.log("DOCX data: ", currCursor);

						return Promise.resolve();
					})
					// Download images
					.then(() => {

						let dv = this.dataview;
						if (!dv) return Promise.resolve();

						let obj = dv.datasource;
						if (!obj) return Promise.resolve();

						let tasks = [];

						obj.fields(f => f instanceof ABFieldImage).forEach(f => {

							let imageVal = f.format(currCursor);
							if (!imageVal) return;

							tasks.push(new Promise((ok, bad) => {

								let imgUrl = `/opsportal/image/${this.application.name}/${imageVal}`;

								JSZipUtils.getBinaryContent(imgUrl, function (error, content) {
									if (error)
										return bad(error);
									else {

										// store binary of image
										images[imageVal] = content;

										ok();
									}
								});

							}));

						});

						return Promise.all(tasks);

					})
					.then(() => {

						// Download the template file
						return new Promise((next, err) => {

							let url = this.downloadUrl();

							JSZipUtils.getBinaryContent(url, (error, content) => {

								if (error)
									return err(error);

								next(content);

							});
						});

					})
					.then(content => {

						// Generate Docx file
						return new Promise((next, err) => {

							let zip = new JSZip(content);
							let doc = new Docxtemplater();

							let imageModule = new ImageModule({
								centered: false,
								getImage: (tagValue, tagName) => {

									// NOTE: .getImage of version 3.0.2 does not support async
									//			we can buy newer version to support it
									//			https://docxtemplater.com/modules/image/

									return images[tagValue] || "";

								},
								getSize: (imgBuffer, tagValue, tagName) => {

									let defaultVal = [300, 160];

									let dv = this.dataview;
									if (!dv) return defaultVal;

									let obj = dv.datasource;
									if (!obj) return defaultVal;

									let imageField = obj.fields(f => f.columnName == tagName)[0];
									if (imageField.settings.useWidth &&
										imageField.settings.imageWidth)
										defaultVal[0] = imageField.settings.imageWidth;

									if (imageField.settings.useHeight &&
										imageField.settings.imageHeight)
										defaultVal[1] = imageField.settings.imageHeight;
	
									return defaultVal;
								}
								// getSize: function (imgBuffer, tagValue, tagName) {
								// 	if (imgBuffer) {
								// 		var maxWidth = 300;
								// 		var maxHeight = 160;

								// 		// Find aspect ratio image dimensions
								// 		try {
								// 			var image = sizeOf(imgBuffer);
								// 			var ratio = Math.min(maxWidth / image.width, maxHeight / image.height);

								// 			return [image.width * ratio, image.height * ratio];
								// 		}
								// 		// if invalid image, then should return 0, 0 sizes
								// 		catch (err) {
								// 			return [0, 0];
								// 		}

								// 	}
								// 	else {
								// 		return [0, 0];
								// 	}
								// }
							});

							try {

								doc
									.attachModule(imageModule)
									.loadZip(zip)
									.setData(currCursor)
									.render(); // render the document

							}
							catch (error) {

								return err(error);
							}

							var docxFile = doc.getZip().generate({
								type: "blob",
								mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
							}) //Output the document using Data-URI

							next(docxFile);

						});

					})
					.then(blobFile => {

						// Let user download the output file
						return new Promise((next, err) => {

							letUserDownload(blobFile, this.settings.filelabel);

							next();
						});
					})
					// Final step
					.then(() => {
						_logic.ready();
					});

			}

		};

		return {
			ui: _ui,
			init: _init,
			logic: _logic
		}

	}

	uploadUrl() {

		let actionKey = 'opstool.AB_' + this.application.name.replace('_', '') + '.view';

		return '/' + ['opsportal', 'file', this.application.name, actionKey, '1'].join('/');

	}

	downloadUrl() {
		return `/opsportal/file/${this.application.name}/${this.settings.filename}`;
	}

}