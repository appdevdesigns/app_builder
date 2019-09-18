/*
 * ABFieldFile
 *
 * An ABFieldFile defines a File field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldFileDefaults = {
	key : 'file', // unique key to reference this specific DataField
	// type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	icon : 'file',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	
	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.file.menuName', '*File Attachment'),
	
	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.file.description', '*Attach a File to this object.'),

	isSortable: false,
	isFilterable: false,
	useAsLabel: false,

	supportRequire: false

}


var defaultValues = {
	removeExistingData: 0,
	fileSize: 0,
	fileType: ""
}


/**
 * ABFieldFileComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldFileComponent = new ABFieldComponent({

	fieldDefaults: ABFieldFileDefaults,

	elements:(App, field) => {

		var ids = {
			fileSize: '',
			fileType: ''
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				cols: [
					{
						view:"checkbox",
						name:"limitFileSize", 
						labelRight:L('ab.dataField.file.fileSize', "*Size (MB)"), 
			            width: 120,
			            labelWidth: 0,
						value:1,
			            click: function() {
							if (this.getValue())
								$$(ids.fileSize).enable()
							else
								$$(ids.fileSize).disable();
			            }
					},
					{
						view: 'counter',
						name: 'fileSize',
						id: ids.fileSize
					}
				]
			},
			{
				cols: [
					{
						view:"checkbox",
						name:"limitFileType",
						labelRight:L('ab.dataField.file.fileType', "*Type"), 
			          	width: 120,
			            labelWidth: 0,
						value:1,
			            click: function() {
							if (this.getValue())
								$$(ids.fileType).enable()
							else
								$$(ids.fileType).disable();
			            }

					},
					{
						view: 'text',
						name: 'fileType',
						placeholder: L('ab.dataField.file.fileTypePlaceholder', 'txt,rtf,doc,docx,...'),
			          	id: ids.fileType
					}
				]
			}
		]
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules:{
		// 'textDefault':webix.rules.isNotEmpty,
		// 'supportMultilingual':webix.rules.isNotEmpty
	},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these: 
	// 	@param {obj} ids  the list of ids used to generate the UI.  your 
	//					  provided .elements will have matching .name keys
	//					  to access them here.
	//  @param {obj} values the current set of values provided for this instance
	// 					  of ABField:
	//					  {
	//						id:'',			// if already .saved()
	// 						label:'',
	// 						columnName:'',
	//						settings:{
	//							showIcon:'',
	//
	//							your element key=>values here	
	//						}
	//					  }
	//
	// 		.clear(ids)  : reset the display to an empty state
	// 		.isValid(ids, isValid): perform validation on the current editor values
	// 		.populate(ids, ABField) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic:{

		clear: (ids) => {
			$$(ids.fileSize).setValue(0);
			$$(ids.fileType).setValue('');
		}

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init:function(ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

})




class ABFieldFile extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldFileDefaults);

    	// we're responsible for setting up our specific settings:
    	for (var dv in defaultValues) {
    		this.settings[dv] = values.settings[dv] || defaultValues[dv];
    	}


    	// text to Int:
    	this.settings.fileSize = parseInt(this.settings.fileSize);
    	this.settings.limitFileSize = parseInt(this.settings.limitFileSize);
		this.settings.limitFileType = parseInt(this.settings.limitFileType);
    	this.settings.removeExistingData = parseInt(this.settings.removeExistingData);
  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldFileDefaults;
  	}



	/*
	 * @function propertiesComponent
	 *
	 * return a UI Component that contains the property definitions for this Field.
	 *
	 * @param {App} App the UI App instance passed around the Components.
	 * @param {stirng} idBase
	 * @return {Component}
	 */
  	static propertiesComponent(App, idBase) {
  		return ABFieldFileComponent.component(App, idBase);
  	}



	///
	/// Instance Methods
	///


	isValid() {

		var validator = super.isValid();

		// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;
	}


	/**
	 * @function destroy
	 * On a destroy operation, ask if the user wants to keep the related file.
	 */
	destroy () {
		return new Promise(
			(resolve, reject) => {

				// verify we have been .save()d before:
				if (this.id) {

					// Ask the user what to do about the existing file:
					OP.Dialog.Confirm({
						title: L('ab.dataField.file.keepFiles', '*Keep Files?'),
						message: L('ab.dataField.file.keepFIlesDescription', '*Do you want to keep the files referenced by #label#?').replace('#label#', this.label),
						callback: (result) => {

							// update this setting so the server can respond correctly in
							// ABFieldFile.migrateDrop()
							this.settings.removeExistingData = result ? 0: 1;
							this.save()
							.then(()=>{
								// TODO: a reminder that you still got alot on the server to do!
								OP.Dialog.Alert({
									title:'!! TODO !!',
									text:'Tell a Developer to actually pay attention to this!'
								})
								// now the default .destroy() 
								super.destroy()
								.then(resolve)
								.catch(reject);
							})
							.catch(reject);
						}
					})

				} else {
					resolve();  // nothing to do really
				}
				
			}
		)
	}

	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldFile
	columnHeader (options) {

		options = options || {};

		var config = super.columnHeader(options);

		config.editor = false; 

		var editable = options.editable;

		// populate our default template:
		config.template = (obj) => {

			if (obj.$group)
				return this.dataValue(obj);

			var fileDiv = [
				'<div class="ab-file-data-field" style="float: left;">',
				'<div class="webix_view ab-file-holder">',
				'<div class="webix_template">',
				this.fileTemplate(obj, editable),
				'</div>',
				'</div>',
				'</div>'
			].join('');


			return fileDiv;
		}

		return config;
	}

	/*
	 * @function customDisplay
	 * perform any custom display modifications for this field.  
	 * @param {object} row is the {name=>value} hash of the current row of data.
	 * @param {App} App the shared ui App object useful more making globally
	 *					unique id references.
	 * @param {HtmlDOM} node  the HTML Dom object for this field's display.
	 */
	customDisplay(row, App, node, options) {
// 		// sanity check.
		if (!node) { return }

		options = options || {};

		var typesList = [];
		var maximumSize = 0;

		if (this.settings.limitFileType && 
			this.settings.fileType) {
			typesList = this.settings.fileType.split(',');
		};

		if (this.settings.limitFileSize &&
			this.settings.fileSize) {
				maximumSize = this.settings.fileSize;
		};

// 		// safety check:
// 		// webix seems to crash if you specify a .container that doesn't exists:
// 		// Note: when the template is first created, we don't have App.unique() 
		var parentContainer = node.querySelector('.ab-file-holder');
		if(parentContainer) {

			parentContainer.innerHTML = '';
			// parentContainer.id = idBase;	// change it to the unique one.

// 			// use a webix component for displaying the content.
// 			// do this so I can use the progress spinner

			var webixContainer = webix.ui({
				view:'template',
				container: parentContainer,
				
				template:this.fileTemplate(row, options.editable),

				borderless:true,
				width: 160,
				height: 60
			});
			webix.extend(webixContainer, webix.ProgressBar);

// 			////
// 			//// Prepare the Uploader
// 			////

			if (!options.editable) {
				var domNode = parentContainer.querySelector(".delete-image");
				if (domNode)
					domNode.style.display = "none";
	
				return;
			}

// 			// The Server Side action key format for this Application:
			var actionKey = 'opstool.AB_'+this.object.application.name.replace('_','')+'.view';
			var url = '/'+[ 'opsportal', 'file', this.object.application.name, actionKey, '1'].join('/');

			var uploader = webix.ui({ 
				view:"uploader",  
				apiOnly: true, 
				upload:url,
				inputName:'file',
				multiple: false,
				on: {

					// when a file is added to the uploader
					onBeforeFileAdd:function(item){

						node.classList.remove('webix_invalid');
						node.classList.remove('webix_invalid_cell');
						
						// verify file type
						var acceptableTypes = typesList;
						if (acceptableTypes && acceptableTypes != '') {
							var type = item.type.toLowerCase();
							if (acceptableTypes.indexOf(type) == -1){
								webix.message("Only ["+acceptableTypes.join(", ")+"] file are supported");
								return false;
							}
						};

						//verify file size
						//Convert to MegaBytes
						if (maximumSize > 0) {
							var acceptableSizes = maximumSize * 1000000;
							if (item.size > acceptableSizes) {
								webix.message("Maximum file size is " + maximumSize + "MB");
								return false;
							};

						};


						// start progress indicator
						webixContainer.showProgress({
						type:"icon",
						delay:2000
						});
					},

					// when upload is complete:
					onFileUpload:(item, response)=>{
						
						webixContainer.hideProgress();
						// this.showFile(idBase, response.data.uuid);
						
						var values = {};
						values[this.columnName] = {}
						values[this.columnName].uuid = response.data.uuid;
						values[this.columnName].filename = item.name;

						// update just this value on our current object.model
						if (row.id) {
							this.object.model().update(row.id, values)
							.then(()=>{
								// update the client side data object as well so other data changes won't cause this save to be reverted
								if ($$(node) && $$(node).updateItem)
									$$(node).updateItem(row.id, values);
							})
							.catch((err)=>{

								node.classList.add('webix_invalid');
								node.classList.add('webix_invalid_cell');
							
								OP.Error.log('Error updating our entry.', { error:err, row:row, values:values });
								console.error(err);
							})
						}

						// update value in the form component
						this.setValue($$(node), values);

					},

					// if an error was returned
					onFileUploadError:function(item, response){
						OP.Error.log('Error loading file', response);
						webixContainer.hideProgress();
					}
				}
			});
			uploader.addDropZone(webixContainer.$view);

			// store upload id into html element (it will be used in .customEdit)
			node.dataset['uploaderId'] = uploader.config.id;

			// open file upload dialog when's click
			node.addEventListener("click", (e) => {
				if (e.target.className.indexOf('delete-image') > -1) {
					this.deleteFile = true;
				}
			});

		}
	}


	/*
	* @function customEdit
	* 
	* @param {object} row is the {name=>value} hash of the current row of data.
	* @param {App} App the shared ui App object useful more making globally
	*					unique id references.
	* @param {HtmlDOM} node  the HTML Dom object for this field's display.
	*/
	customEdit(row, App, node) {

		if (this.deleteFile == true) {
			// remove the property because it is only needed to prevent the file dialog from showing
			delete this.deleteFile;
			
			// Ask the user if they really want to delete the photo
			OP.Dialog.Confirm({
				title: "",
				message: L('ab.dataField.file.removeFileDescription', '*Are you sure you want to remove this file?'),
				callback: (result) => {
					var confirmDelete = result ? 1: 0;
					if (confirmDelete) {
						// update just this value on our current object.model
						var values = {};
						values[this.columnName] = "";

						if (row.id) {
							this.object.model().update(row.id, values)
							.then(()=>{
								// update the client side data object as well so other data changes won't cause this save to be reverted
								if ($$(node) && $$(node).updateItem)
									$$(node).updateItem(row.id, values);
							})
							.catch((err)=>{

								node.classList.add('webix_invalid');
								node.classList.add('webix_invalid_cell');
							
								OP.Error.log('Error updating our entry.', {error:err, row:row, values:values });
								console.error(err);
							})
						}
						// update value in the form component
						else {
							this.setValue($$(node), values);
						}

					}
				}
			})
			
		}
		else {
			let rowData = this.dataValue(row);
			if (!rowData || !rowData.uuid) {

				var uploaderId = node.dataset['uploaderId'],
					uploader = $$(uploaderId);

				if (uploader && uploader.fileDialog)
					uploader.fileDialog({ rowid: row.id });
			}

		}

		return false;
	}



	/*
	* @funciton formComponent
	* returns a drag and droppable component that is used on the UI
	* interface builder to place form components related to this ABField.
	* 
	* an ABField defines which form component is used to edit it's contents.
	* However, what is returned here, needs to be able to create an instance of
	* the component that will be stored with the ABViewForm.
	*/
	formComponent() {

		return super.formComponent('fieldcustom');
	}

	detailComponent() {
		
		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: 'detailcustom'
			}
		};

		return detailComponentSetting;
	}

	//File Template

	fileTemplate(obj, editable) {

		var iconDisplay = '';
		var fileDisplay = 'display:none;';
		var fileURL = '';


		var value = '';
		var name = '';

		let rowData = this.dataValue(obj);
		if (rowData) {
			value = rowData.uuid;
			name = rowData.filename;
		};

		if (value && name) {
			iconDisplay =  'display:none;';
			fileDisplay = '';
			fileURL =  '/opsportal/file/' + this.object.application.name + '/' + value;
		}

		var html = [
			'<div class="file-data-field-icon" style="text-align: center; height: inherit; display: table-cell; vertical-align: middle; border: 2px dotted #CCC; background: #FFF; border-radius: 10px; font-size: 11px; line-height: 13px; padding: 0 10px; '+iconDisplay+'"><i class="fa fa-file fa-2x" style="opacity: 0.6; font-size: 32px; margin-top: 3px; margin-bottom: 5px;"></i>#drag#</div>',
			'<div class="file-data-field-name" style="' + fileDisplay + ' width:100%; height:100%; position:relative; "><a target="_blank" href="' + fileURL +'">' + (name || "") + '</a>#remove#</div>',
		].join('');

		html = html.replace('#drag#', editable ? '<br/>Drag and drop or click here' : '');
		html = html.replace('#remove#', editable ? '<a style="' + fileDisplay + '" class="ab-delete-photo" href="javascript:void(0);"><i class="fa fa-times delete-image"></i></a>' : '');

		return html;


	}


	getValue(item, rowData) {

		var file = item.$view.querySelector('.file-data-field-name');
		var fileLink = file.querySelector('a');

		return {
			uuid: file.getAttribute('file-uuid'),
			filename: fileLink.innerHTML
		};
	}

	setValue(item, rowData) {

		if (!item) return;

		var domNode = item.$view;
		if (!domNode) return;

		var val = null;
		if (rowData) {
			val = this.dataValue(rowData);

			// if (val == null) {
			// 	// assume they just sent us a single value
			// 	val = rowData;
			// }
		}

		var fileicon = domNode.querySelector('.file-data-field-icon');
		if (fileicon)
			fileicon.style.display = ((val && val.uuid) ? 'none' : 'block');

		var file = domNode.querySelector('.file-data-field-name');
		if (file) {

			var fileDeleteIcon = file.querySelector('.ab-delete-photo');
			if (fileDeleteIcon)
				fileDeleteIcon.style.display = ((val && val.uuid) ? 'block' : 'none');

			file.style.display = ((val && val.uuid) ? 'block' : 'none');
			if (val && val.uuid)
				file.setAttribute('file-uuid', val.uuid);
			else
				file.removeAttribute('file-uuid');
			
			var fileLink = file.querySelector('a');
			var fileURL =  '/opsportal/file/' + this.object.application.name + '/' + (val ? val.uuid : "");
			fileLink.href = fileURL;
			fileLink.innerHTML = (val ? val.filename : "");
		}

	}
	
	/**
	 * @method isValidData
	 * Parse through the given data and return an error if this field's
	 * data seems invalid.
	 * @param {obj} data  a key=>value hash of the inputs to parse.
	 * @param {OPValidator} validator  provided Validator fn
	 * @return {array} 
	 */
	isValidData(data, validator) {
		
		super.isValidData(data, validator);
		
	}

	dataValue(rowData) {

		let propName = "{objectName}.{columnName}"
			.replace('{objectName}', this.alias || this.object.name)
			.replace('{columnName}', this.columnName);

		let result = rowData[this.columnName] || rowData[propName] || {};
		if (typeof result == 'string') {
			try {
				result = JSON.parse(result);
			}
			catch (err) {}
		}

		return result;

	}

	format(rowData) {

		let result = this.dataValue(rowData);
		if (result) {

			if (typeof result == 'string') {
				try {
					result = JSON.parse(result);
				}
				catch(err) {}
			}

			// return file name
			return result ? (result.filename || "") : "";
		}
		else {
			return "";
		}

	}

}


export default ABFieldFile;
