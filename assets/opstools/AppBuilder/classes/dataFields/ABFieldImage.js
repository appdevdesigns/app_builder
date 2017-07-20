/*
 * ABFieldImage
 *
 * An ABFieldImage defines a Image field type.
 *
 */

import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var ABFieldImageDefaults = {
	key : 'image', // unique key to reference this specific DataField
	// type : 'string', // http://sailsjs.org/documentation/concepts/models-and-orm/attributes#?attribute-options
	icon : 'file-image-o',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'		
	
	// menuName: what gets displayed in the Editor drop list
	menuName : L('ab.dataField.image.menuName', '*Image Attachment'),
	
	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.image.description', '*Attach an image to this object.')
}



var defaultValues = {
	'useWidth':0,
	'imageWidth':'',
	'useHeight': 0,
	'imageHeight': '',
	'removeExistingData': 0
}



/**
 * ABFieldImageComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 *
 * @param {obj} App  the current Component Application instance for the current UI.
 * @return {obj} the Component object.
 */
var ABFieldImageComponent = new ABFieldComponent({

	fieldDefaults: ABFieldImageDefaults,

	elements:(App, field) => {

		var ids = {
			imageWidth: '',
			imageHeight: ''
		}
		ids = field.idsUnique(ids, App);

		return [
			{
				cols: [
					{
						view:"checkbox",
						name:"useWidth", 
						labelRight:L('ab.dataField.image.width', "*width"), 
			            width: 80,
			            labelWidth: 0,
						value:1,
			            click: function() {
							if (this.getValue())
								$$(ids.imageWidth).enable()
							else
								$$(ids.imageWidth).disable();
			            }
					},
					{
						view: 'text',
						name:'imageWidth',
						id: ids.imageWidth
					}
				]
			},
			{
				cols: [
					{
						view:"checkbox",
						name:"useHeight",
// id:componentIds.useHeight, 
						labelRight:L('ab.dataField.image.height', "*height"), 
			          	width: 80,
			            labelWidth: 0,
						value:1,
			            click: function() {
							if (this.getValue())
								$$(ids.imageHeight).enable()
							else
								$$(ids.imageHeight).disable();
			            }

					},
					{
						view: 'text',
						name: 'imageHeight',
			          	id: ids.imageHeight
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
			$$(ids.useWidth).setValue(0);
			$$(ids.useHeight).setValue(0);

			$$(ids.imageWidth).setValue('');
			$$(ids.imageHeight).setValue('');
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





class ABFieldImage extends ABField {

    constructor(values, object) {
    	super(values, object, ABFieldImageDefaults);

    	/*
    	{
			settings: {
				'useWidth':0,
				'imageWidth':'',
				'useHeight': 0,
				'imageHeight': '',
				'removeExistingData': 0
			}
    	}
    	*/

    	// we're responsible for setting up our specific settings:
    	for (var dv in defaultValues) {
    		this.settings[dv] = values.settings[dv] || defaultValues[dv];
    	}


    	// text to Int:
    	this.settings.useWidth = parseInt(this.settings.useWidth);
    	this.settings.useHeight = parseInt(this.settings.useHeight);
    	this.settings.removeExistingData = parseInt(this.settings.removeExistingData);
  	}


  	// return the default values for this DataField
  	static defaults() {
  		return ABFieldImageDefaults;
  	}



	/*
	 * @function propertiesComponent
	 *
	 * return a UI Component that contains the property definitions for this Field.
	 *
	 * @param {App} App the UI App instance passed around the Components.
	 * @return {Component}
	 */
  	static propertiesComponent(App) {
  		return ABFieldImageComponent.component(App);
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
	 * On a destroy operation, ask if the user wants to keep the related images.
	 */
	destroy () {
		return new Promise(
			(resolve, reject) => {

				// verify we have been .save()d before:
				if (this.id) {

					// Ask the user what to do about the existing images:
					OP.Dialog.Confirm({
						title: L('ab.dataField.image.keepImages', '*Keep Images?'),
						message: L('ab.dataField.image.keepImagesDescription', '*Do you want to keep the images referenced by #label#?').replace('#label#', this.label),
						callback: (result) => {

							// update this setting so the server can respond correctly in
							// ABFieldImage.migrateDrop()
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




	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABApplication instance
	 * into the values needed for saving to the DB.
	 *
	 * Most of the instance data is stored in .json field, so be sure to
	 * update that from all the current values of our child fields.
	 *
	 * @return {json}
	 */
	// toObj () {

	// 	var obj = super.toObj();

	// 	// obj.settings = this.settings;  // <--  super.toObj()

	// 	return obj;
	// }




	///
	/// Working with Actual Object Values:
	///

	idCustomContainer(obj) {
		return "#columnName#-#id#-image"
			.replace('#id#', obj.id)
			.replace('#columnName#', this.columnName.replace(/ /g, '_'));
	}


	// return the grid column header definition for this instance of ABFieldImage
	columnHeader (isObjectWorkspace) {
		var config = super.columnHeader(isObjectWorkspace);

		config.editor = false;  // 'text';  // '[edit_type]'   for your unique situation
		config.sort   = 'string' // '[sort_type]'   for your unique situation

		if (this.settings.useWidth) {
			config.width = this.settings.imageWidth;
		}

		// populate our default template:
		config.template = (obj) => {

			var imgDiv = [
				'<div id="#id#" class="ab-image-data-field">',
				this.imageTemplate(obj),
				'</div>'
			].join('');

			return imgDiv
				.replace('#id#', this.idCustomContainer(obj) )
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
	customDisplay(row, App, node) {
		// sanity check.
		if (!node) { return }


		var idBase = App.unique(this.idCustomContainer(row));
		var ids = {
			container:idBase+'-container',
			uploader: idBase+'-uploader',
			icon: idBase+'-icon',
			image: idBase+'-image'
		}


		// safety check:
		// webix seems to crash if you specify a .container that doesn't exists:
		// Note: when the template is first created, we don't have App.unique() 
		var parentContainer = node.querySelector('#'+this.idCustomContainer(row)); // $$(this.idCustomContainer(obj));
		if(parentContainer) {

			parentContainer.innerHTML = '';
			parentContainer.id = idBase;	// change it to the unique one.

			var imgHeight = 33;
			if (this.settings.useHeight){
				imgHeight = parseInt(this.settings.imageHeight);
			}

			var imgWidth = 50;
			if (this.settings.useWidth){
				imgWidth = parseInt(this.settings.imageWidth);
			}
//// TODO: actually pay attention to the height and width when 
//// displaying the images.

			// use a webix component for displaying the content.
			// do this so I can use the progress spinner
			var webixContainer = webix.ui({
				view:'template',
				id: ids.container,
				container: idBase,
				
				template:this.imageTemplate(row),

				borderless:true,
				height: imgHeight,
				width:  imgWidth
			});
			webix.extend(webixContainer, webix.ProgressBar);

			////
			//// Prepare the Uploader
			////

			// The Server Side action key format for this Application:
			var actionKey = 'opstool.AB_'+this.object.application.name.replace('_','')+'.view';
			var url = '/'+[ 'opsportal', 'image', this.object.application.name, actionKey, '1'].join('/');

			var uploader = webix.ui({ 
			    view:"uploader",  
			    id:ids.uploader, 
			    apiOnly: true, 
			    upload:url,
			    inputName:'image',
			    multiple: false,
			    // formData:{
			    // 	appKey:application.name,
			    // 	permission:actionKey,
			    // 	isWebix:true,
			    // 	imageParam:'upload'
			    // },
			    on: {

			    	// when a file is added to the uploader
			    	onBeforeFileAdd:function(item){

						node.classList.remove('webix_invalid');
						node.classList.remove('webix_invalid_cell');
						
			    		// verify file type
			    		var acceptableTypes = ['jpg', 'jpeg', 'bmp', 'png', 'gif'];
					    var type = item.type.toLowerCase();
					    if (acceptableTypes.indexOf(type) == -1){
//// TODO: multilingual
webix.message("Only ["+acceptableTypes.join(", ")+"] images are supported");
					        return false;
					    }

						// start progress indicator
						webixContainer.showProgress({
						   type:"icon",
						   delay:2000
						});
					},

			    	// when upload is complete:
			    	onFileUpload:(item, response)=>{
						
						webixContainer.hideProgress();
						this.showImage(idBase, response.data.uuid);

// TODO: delete previous image from our OPsPortal service?
						
						// update just this value on our current object.model
						var values = {};
						values[this.columnName] = response.data.uuid
						this.object.model().update(row.id, values)
						.then(()=>{
							// update the client side data object as well so other data changes won't cause this save to be reverted
							$$(node).updateItem(row.id, values);
						})
						.catch((err)=>{

							node.classList.add('webix_invalid');
							node.classList.add('webix_invalid_cell');
						
							OP.Error.log('Error updating our entry.', {error:err, row:row, values:values });
							console.error(err);
						})

					},

					// if an error was returned
					onFileUploadError:function(item, response){
						OP.Error.log('Error loading image', response);
						webixContainer.hideProgress();
					}
			    }
			});
			uploader.addDropZone(webixContainer.$view);

			// open file upload dialog when's click
			parentContainer.addEventListener("click", () => {
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

		var idBase = App.unique(this.idCustomContainer(row)),
			idUploader = idBase + '-uploader';

		$$(idUploader).fileDialog({ rowid: row.id });

		return false;
	}



	imageTemplate(obj) {

		// deault view is icon:
		var iconDisplay = '';
		var imageDisplay = 'display:none;';
		var imageURL    = ''
		
		// if we have a value for this field, then switch to image:
		var value = obj[this.columnName];
		if ((value) && (value != '')) {
			iconDisplay = 'display:none;';
			imageDisplay = '';
			imageURL    = "background-image:url('/opsportal/image/" + this.object.application.name+"/"+obj[this.columnName]+"');"
		}

		return [
			'<div class="image-data-field-icon" style="text-align: center; height: 100%; position: relative; '+iconDisplay+'"><i class="fa fa-picture-o fa-2x" style="opacity: 0.6; position: absolute; top: 50%; margin-top: -15px; right: 50%; margin-right: -10px;"></i></div>',
			'<div class="image-data-field-image" style="'+imageDisplay+' width:100%; height:100%; background-repeat: no-repeat; background-position: center center; background-size: cover; '+imageURL+'"></div>',
		].join('');

	}


	showImage(id, uuid) {
		var parentContainer = document.getElementById(id); // $$(this.idCustomContainer(obj));
		if(parentContainer) {

			parentContainer.querySelector('.image-data-field-icon').style.display = 'none';
			var image = parentContainer.querySelector('.image-data-field-image');
			image.style.display = '';
			image.style.backgroundImage = "url('/opsportal/image/" + this.object.application.name+"/"+uuid+"')";

		}
	}


}



//// NOTE: if you need a unique [edit_type] by your returned config.editor above:
// webix.editors = {
//   "[edit_type]": {
//     focus: function () {...}
//     getValue: function () {...},
//     setValue: function (value) {...},
//     render: function () {...}
//   }
// };


//// NOTE: if you need a unique [sort_type] by your returned config.sort above:
// webix.DataStore.prototype.sorting.as.[sort_type] = function(a,b){ 
//     return a > b ? 1 : -1; 
// }


export default ABFieldImage;
