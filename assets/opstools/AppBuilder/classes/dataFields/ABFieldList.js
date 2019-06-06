/*
 * ABFieldList
 *
 * An ABFieldList defines a select list field type.
 *
 */

import ABFieldSelectivity from "./ABFieldSelectivity"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABFieldListDefaults = {
	key: 'list', // unique key to reference this specific DataField

	icon: 'th-list',   // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

	// menuName: what gets displayed in the Editor drop list
	menuName: L('ab.dataField.list.menuName', '*Select list'),

	// description: what gets displayed in the Editor description.
	description: L('ab.dataField.list.description', '*Select list allows you to select predefined options below from a dropdown.'),
	isSortable: (field) => {
		if (field.settings.isMultiple) {
			return false;
		} else {
			return true;
		}
	},
	isFilterable: (field) => {
		if (field.settings.isMultiple) {
			return false;
		} else {
			return true;
		}
	},
	hasColors: (field) => {
		if (field.settings.hasColors) {
			return true;
		} else {
			return false;
		}
	},

	supportRequire: true

};

// store the original options (look at logic.populate)
var originalOptions = [];

// store the current field being edited/created
var currentField;

var defaultValues = {
	isMultiple: 0,
	hasColors: 0,
	options: [],
	default: 'none',
	multipleDefault: []
};

var ids = {
	isMultiple: 'ab-list-multiple-option',
	hasColors: 'ab-list-colors-option',
	default: 'ab-list-single-default',
	multipleDefault: 'ab-list-multiple-default',
	options: 'ab-list-option',
	colorboard: 'ab-colorboard'
};

var colors = [
	["#F44336", "#E91E63", "#9C27B0", "#673AB7"], 
	["#3F51B5", "#2196F3", "#03A9F4", "#00BCD4"], 
	["#009688", "#4CAF50", "#8BC34A", "#CDDC39"], 
	["#FFEB3B", "#FFC107", "#FF9800", "#FF5722"], 
	["#795548", "#9E9E9E", "#607D8B", "#000000"]
];

// TODO : use to render selectivity to set default values
var selectivityRender = new ABFieldSelectivity({
	settings: {}
}, {}, {});

function getNextHex() {
	var options = $$(ids.options);
	var usedColors = [];
	options.data.each(function(item) {
		usedColors.push(item.hex);
	})
	var allColors = [];
	colors.forEach(function(c) {
		if (typeof c == "object") {
			c.forEach(function(j) {
				allColors.push(j);
			});
		}
	});
	var newHex = "#3498db";
	for (var i = 0; i < allColors.length; i++) {
		if (usedColors.indexOf(allColors[i]) == -1) {
			newHex = allColors[i];
			break;
		}
	}
	return newHex;
}

function toggleColorControl(value) {
	var colorPickers = $$(ids.options).$view.querySelectorAll(".ab-color-picker");
	colorPickers.forEach(function (itm) {
		if (value == 1)
			itm.classList.remove("hide");
		else
			itm.classList.add("hide");
	})
}

function updateDefaultList(ids, settings = {}) {
	var optList = $$(ids.options).find({}).map(function (opt) {
		return {
			id: opt.id,
			value: opt.value,
			hex: opt.hex
		}
	});

	if ($$(ids.isMultiple).getValue()) {
		// Multiple default selector
		var domNode = $$(ids.multipleDefault).$view.querySelector('.list-data-values');
		selectivityRender.selectivityRender(domNode, {
			multiple: true,
			data: settings.multipleDefault,
			placeholder: L('ab.dataField.list.placeholder_multiple', '*Select items'),
			items: optList.map(function (opt) {
				return {
					id: opt.id,
					text: opt.value,
					hex: opt.hex
				}
			})
		});
		domNode.addEventListener("change", function(e) {
			if (e.value.length) {
				$$(ids.multipleDefault).define("required", false);
			} else if ($$(ids.multipleDefault).$view.querySelector(".webix_inp_label").classList.contains("webix_required")) {
				$$(ids.multipleDefault).define("required", true);
			}
		})
	} else {
		// Single default selector
		$$(ids.default).define('options', optList);
		if (settings.default)
			$$(ids.default).setValue(settings.default);

		$$(ids.default).refresh();
	}

}

/**
 * ABFieldListComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldListComponent = new ABFieldComponent({
	fieldDefaults: ABFieldListDefaults,

	elements: (App, field) => {
		ids = field.idsUnique(ids, App);

		return [
			{
				view: "checkbox",
				name: "isMultiple",
				disallowEdit: true,
				id: ids.isMultiple,
				labelRight: L('ab.dataField.list.isMultiple', '*Multiselect'),
				labelWidth: 0,
				value: false,
				on: {
					onChange: (newV, oldV) => {
						if (newV == true) {
							$$(ids.default).hide();
							$$(ids.multipleDefault).show();
						}
						else {
							$$(ids.default).show();
							$$(ids.multipleDefault).hide();
						}

						updateDefaultList(ids, field.settings);
					}
				}
			},
			{
				view: "checkbox",
				name: "hasColors",
				id: ids.hasColors,
				labelRight: L('ab.dataField.list.hasColors', '*Customize Colors'),
				labelWidth: 0,
				value: false,
				on: {
					onChange: (newV, oldV) => {
						if (newV == oldV) return false;
					
						toggleColorControl(newV);
					}
				}
			},
			{ view: "label", label: `<b>${L('ab.dataField.list.options', '*Options')}</b>` },
			{
				id: ids.options,
				name: 'options',
				css: 'padList',
				view: App.custom.editlist.view,
				template: "<div style='position: relative;'><i class='ab-color-picker fa fa-lg fa-chevron-circle-down' style=\'color:#hex#\'></i> #value#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
				autoheight: true,
				drag: true,
				editable: true,
				hex: "",
				editor: "text",
				editValue: "value",
				onClick: {
					"ab-new-field-remove": (e, itemId, trg) => {
						// Remove option item
						// check that item is in saved data already
						var matches = originalOptions.filter(function(x) {
							return x.id == itemId;
						})[0];
						if (matches) {
							// Ask the user if they want to remove option
							OP.Dialog.Confirm({
								title: L('ab.dataField.list.optionDeleteTitle', '*Delete Option'),
								text: L('ab.dataField.list.optionDeleteText', '*All exisiting entries with this value will be cleared. Are you sure you want to delete this option?'),
								fnYes: function() {
									// store the item that will be deleted for the save action
									currentField.pendingDeletions = currentField.pendingDeletions || [];
									currentField.pendingDeletions.push(itemId);
									$$(ids.options).remove(itemId);
								}
							})
						}
					},
					"ab-color-picker": function (e, itemId, trg) {
						// alert("open color picker");
						var item = itemId;
						webix.ui({
							id:ids.colorboard,
							view:"popup", 
							body:{
								view:"colorboard",
								id:"color",
								width:125,
								height:150,
								palette:colors,
								left:125,
								top:150,
								on: {
									onSelect: (hex) => {
										var vals = $$(ids.options).getItem(item);
										vals.hex = hex;
										$$(ids.options).updateItem(item, vals);
										$$(ids.colorboard).hide();
									}
								}
							}
						}).show(trg, {x:-7});
						return false;
					}
				},
				on: {
					onAfterAdd: () => {
						updateDefaultList(ids, field.settings);
					},
					onAfterEditStop: () => {
						updateDefaultList(ids, field.settings);
					},
					onAfterDelete: () => {
						updateDefaultList(ids, field.settings);
					},
					onAfterRender: () => {
						toggleColorControl($$(ids.hasColors).getValue());
					}
				}
			},
			{
				view: "button",
				value: L('ab.dataField.list.addNewOption', '*Add new option'),
				click: function () {
					var itemId = webix.uid();
					var nextHex = getNextHex();
					$$(ids.options).add({ id: itemId, value: '', hex: nextHex }, $$(ids.options).count());
					$$(ids.options).edit(itemId);
				}
			},
			{
				id: ids.default,
				placeholder: L('ab.dataField.list.selectDefault', "*Select Default"),
				name: "default",
				view: 'richselect',
				label: L('ab.common.default', "*Default")
			},
			{
				id: ids.multipleDefault,
				name: 'multipleDefault',
				view: 'forminput',
				labelWidth: 0,
				height: 36,
				borderless: true,
				hidden: true,
				body:{
					view: App.custom.focusabletemplate.view,
					css:  "customFieldCls", 
					borderless: true,
					template:
		 				`<label style="width: 80px;text-align: left;line-height:32px;" class="webix_inp_label">${L('ab.common.default', "*Default")}</label>` +
						'<div style="margin-left: 80px; height: 36px;" class="list-data-values form-entry"></div>',
				}
			}
		];
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: defaultValues,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules: {},

	// include additional behavior on default component operations here:
	// The base routines will be processed first, then these.  Any results
	// from the base routine, will be passed on to these:
	logic: {

		// isValid: function (ids, isValid) {

		// }

		clear: (ids) => {
			$$(ids.isMultiple).setValue(0);
			$$(ids.hasColors).setValue(0);
			$$(ids.options).clearAll();

			$$(ids.default).define('options', []);
			$$(ids.default).setValue(defaultValues.default);

			var domNode = $$(ids.multipleDefault).$view.querySelector('.list-data-values');
			if (domNode && domNode.selectivity) {
				domNode.selectivity.setData([]);
			}
		},

		populate: (ids, field) => {

			// store the options that currently exisit to compare later for deletes
			originalOptions = field.settings.options;
			// we need to access the fields -> object -> model to run updates on save (may be refactored later)
			currentField = field;
			// empty this out so we don't try to delete already deleted options (or delete options that we canceled before running)
			currentField.pendingDeletions = [];
			// set options to webix list
			var opts = field.settings.options.map(function (opt) {
				return {
					id: opt.id,
					value: opt.text,
					hex: opt.hex,
					translations: opt.translations
				}
			});
			$$(ids.options).parse(opts);
			$$(ids.options).refresh();

			// update single/multiple default selector
			setTimeout(() => {
				updateDefaultList(ids, field.settings);
			}, 10);
		},
		
		/*
		 * @function requiredOnChange
		 *
		 * The ABField.definitionEditor implements a default operation
		 * to look for a default field and set it to a required field 
		 * if the field is set to required
		 * 
		 * if you want to override that functionality, implement this fn()
		 *
		 * @param {string} newVal	The new value of label
		 * @param {string} oldVal	The previous value
		 */
		requiredOnChange: (newVal, oldVal, ids) => {
			
			// when require number, then default value needs to be reqired
			$$(ids.default).define("required", newVal);
			$$(ids.default).refresh();

			if ($$(ids.multipleDefault).$view.querySelector(".webix_inp_label")) {
				if (newVal) {
					$$(ids.multipleDefault).define("required", true);
					$$(ids.multipleDefault).$view.querySelector(".webix_inp_label").classList.add("webix_required");
				} else {
					$$(ids.multipleDefault).define("required", false);
					$$(ids.multipleDefault).$view.querySelector(".webix_inp_label").classList.remove("webix_required");
				}
			}
			
		},

		values: (ids, values) => {

			// Get options list from UI, then set them to settings
			values.settings.options = $$(ids.options).find({}).map(function (opt) {
				return {
					id: opt.id,
					text: opt.value,
					hex: opt.hex,
					translations: opt.translations
				}
			});

			// Un-translate options list
			values.settings.options.forEach(function (opt) {
				OP.Multilingual.unTranslate(opt, opt, ["text"]);
			});

			// Set multiple default value
			values.settings.multipleDefault = [];
			var domNode = $$(ids.multipleDefault).$view.querySelector('.list-data-values');
			if (domNode && domNode.selectivity) {
				values.settings.multipleDefault = domNode.selectivity.getData() || [];
			}

			return values;
		}

	}

});

class ABFieldList extends ABFieldSelectivity {
	constructor(values, object) {

		super(values, object, ABFieldListDefaults);

		// we're responsible for setting up our specific settings:
		for (var dv in defaultValues) {
			this.settings[dv] = values.settings[dv] || defaultValues[dv];
		}

		this.pendingDeletions = [];

	}

	// return the default values for this DataField
	static defaults() {
		return ABFieldListDefaults;
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
		return ABFieldListComponent.component(App, idBase);
	}

	///
	/// Instance Methods
	///


	save() {
		
		return super.save()
		.then(() => {
			
			// Now we want to clear out any entries that had values == to item removed from our list:
			if (this.pendingDeletions.length) {
				
				var model = this.object.model();
				
				if (this.settings.isMultiple == true) {
					
					// find all the entries that have one of the deleted values:
					// use Promise to prevent issues with data being loaded before it is deleted on client side
					return new Promise((resolve, reject) => {
						
						var numDone = 0;
						var numToDo = 0;
						
						model.findAll()
						.then((list)=>{
							
							list = list.data || list;

							// for each list item 
							list.forEach((item)=>{
								
								if (Array.isArray(item[this.columnName])) {

									// get fields not in pendingDeletions
									var remainingFields = item[this.columnName].filter((i)=>{ return this.pendingDeletions.indexOf(i.id) == -1; });
									
									if (remainingFields.length != item[this.columnName].length) {
										
										numToDo ++;
										
										// update value to new field list
										if (remainingFields.length == 0) {
											remainingFields = "";
										}
										var value = {};
										value[this.columnName] = remainingFields;
										model.update(item.id, value)
										.then(()=>{
											// if ($$(node) && $$(node).updateItem)
											// 	$$(node).updateItem(value.id, value);
											numDone++;
											if (numDone >= numToDo) {
												resolve();
											}
										})
										
									}
									
								}
								
							});
							if (numToDo == 0) {
								resolve();
							}
							
						})
						.catch(reject);
					});
					
				} else {
					
					// find all the entries that have one of the deleted values:
					var where = {};
					where[this.columnName] = this.pendingDeletions;
					return new Promise((resolve, reject) => {
						
						var numDone = 0;
						
						model.findAll(where)
						.then((list)=>{
							
							// make sure we just work with the { data:[] } that was returned
							list = list.data || list;
							
							// for each one, set the value to ''
							// NOTE: jQuery ajax routines filter out null values, so we can't 
							// set them to null. :(
							// var numDone = 0;
							var value = {};
							value[this.columnName] = '';
							
							list.forEach((item)=>{

								model.update(item.id, value)
								.then(()=>{
									numDone++;
									if (numDone >= list.length) {
										resolve();
									}
								})
							})
							if (list.length == 0) {
								resolve();
							}

						})
						.catch(reject);
					});
					
				}
				
			}
			
		});
		
	}

	isValid() {

		var validator = super.isValid();

		// validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

		return validator;
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// translate options list
		if (this.settings.options && this.settings.options.length > 0) {
			this.settings.options.forEach(function (opt) {
				OP.Multilingual.translate(opt, opt, ["text"]);
			});
		}

		this.settings.isMultiple = parseInt(this.settings.isMultiple);
		this.settings.hasColors = parseInt(this.settings.hasColors);

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
	toObj() {

		var obj = super.toObj();

		// Un-translate options list
		obj.settings.options.forEach(function (opt) {
			OP.Multilingual.unTranslate(opt, opt, ["text"]);
		});

		return obj;
	}




	///
	/// Working with Actual Object Values:
	///

	// return the grid column header definition for this instance of ABFieldList
	columnHeader(options) {

		options = options || {};

		var config = super.columnHeader(options);
		var field = this;
		var App = App;

		// Multiple select list
		if (this.settings.isMultiple == true) {
			
			config.template = function(row) {

				var node = document.createElement("div");
				node.classList.add("list-data-values");
				if (typeof options.width != "undefined") {
					node.style.marginLeft = options.width+'px';
				}
				
				var domNode = node;

				var placeholder = L('ab.dataField.list.placeholder_multiple', '*Select items');
				var readOnly = false;
				if (options.editable != null && options.editable == false) {
					readOnly = true;
					placeholder = "";
				}

				// var domNode = node.querySelector('.list-data-values');

				// get selected values
				var selectedData = [];
				if (row[field.columnName] != null) {
					selectedData = row[field.columnName];

					if (typeof selectedData == 'string')
						selectedData = JSON.parse(selectedData);
	
				}

				// Render selectivity
				field.selectivityRender(domNode, {
					multiple: true,
					readOnly: readOnly,
					placeholder: placeholder,
					hasColors: field.settings.hasColors,
					items: field.settings.options,
					data: selectedData
				}, App, row);

				return node.outerHTML;

			}
			
		}
		// Single select list
		else {
			
			var formClass = "";
		    var placeHolder = "";
		    if (options.editable) {
		        formClass = " form-entry";
		        placeHolder = "<span style='color: #CCC; padding: 0 5px;'>"+L('ab.dataField.list.placeholder', '*Select item')+"</span>";
			}
			var isRemovable = (options.editable && !this.settings.required);
			
			config.template = function(obj) {
				var myHex = "#666666";
				var myText = placeHolder;
				field.settings.options.forEach(function(h) {
					if (h.id == obj[field.columnName]) {
						myHex = h.hex;
						myText = h.text;
					}
				});
				if (field.settings.hasColors && obj[field.columnName]) {
					return '<span class="selectivity-single-selected-item rendered'+formClass+'" style="background-color:'+myHex+' !important;">'+myText+ (isRemovable ? ' <a class="selectivity-single-selected-item-remove"><i class="fa fa-remove"></i></a>' : '') + '</span>';
				} else {
					if (myText != placeHolder) {
						return myText + (isRemovable ? ' <a class="selectivity-single-selected-item-remove" style="color: #333;"><i class="fa fa-remove"></i></a>' : '');
					} else {
						return myText;
					}
				}		
			}

			config.editor = 'richselect';
			config.options = field.settings.options.map(function (opt) {
				return {
					id: opt.id,
					value: opt.text,
					hex: opt.hex
				};
			});
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
		// sanity check.
		if (!node) { return }

		options = options || {};

		if (this.settings.isMultiple == true) {
			var placeholder = L('ab.dataField.list.placeholder_multiple', '*Select items');
			var readOnly = false;
			if (options.editable != null && options.editable == false) {
				readOnly = true;
				placeholder = "";
			}

			var domNode = node.querySelector('.list-data-values');

			// get selected values
			var selectedData = [];
			if (row[this.columnName] != null) {
				selectedData = row[this.columnName];

				if (typeof selectedData == 'string')
					selectedData = JSON.parse(selectedData);

			}

			// Render selectivity
			this.selectivityRender(domNode, {
				multiple: true,
				readOnly: readOnly,
				placeholder: placeholder,
				hasColors: this.settings.hasColors,
				items: this.settings.options,
				data: selectedData
			}, App, row);

			// Listen event when selectivity value updates
			if (domNode && row.id && node) {
				domNode.addEventListener('change', (e) => {

					// update just this value on our current object.model
					var values = {};
					values[this.columnName] = this.selectivityGet(domNode);

					// pass null because it could not put empty array in REST api
					if (values[this.columnName].length == 0)
						values[this.columnName] = "";

					this.object.model().update(row.id, values)
						.then(() => {
							// update the client side data object as well so other data changes won't cause this save to be reverted
							if (values[this.columnName] == "")
								values[this.columnName] = [];
							if ($$(node) && $$(node).updateItem)
								$$(node).updateItem(row.id, values);
						})
						.catch((err) => {

							node.classList.add('webix_invalid');
							node.classList.add('webix_invalid_cell');

							OP.Error.log('Error updating our entry.', { error: err, row: row, values: values });
							console.error(err);
						});

				}, false);
			}

		} else {
			if (!node.querySelector)
				return;
			
			var clearButton = node.querySelector('.selectivity-single-selected-item-remove');
			if (clearButton) {
				clearButton.addEventListener("click", (e) => {
					e.stopPropagation();
					var values = {};
					values[this.columnName] = "";
					this.object.model().update(row.id, values)
					.then(() => {
						// update the client side data object as well so other data changes won't cause this save to be reverted
						if ($$(node) && $$(node).updateItem)
							$$(node).updateItem(row.id, values);
					})
					.catch((err) => {

						node.classList.add('webix_invalid');
						node.classList.add('webix_invalid_cell');

						OP.Error.log('Error updating our entry.', { error: err, row: row, values: "" });
					});
				});
			}
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
		if (this.settings.isMultiple == true) {
			var domNode = node.querySelector('.list-data-values');

			if (domNode.selectivity != null) {
				// Open selectivity
				domNode.selectivity.open();
				return false;
			}
			return false;
		}
		else {
			return super.customEdit(row, App, node);
		}
	}


	/**
	 * @method defaultValue
	 * insert a key=>value pair that represent the default value
	 * for this field.
	 * @param {obj} values a key=>value hash of the current values.
	 */
	defaultValue(values) {
		// Multiple select list
		if (this.settings.isMultiple == true) {
			values[this.columnName] = this.settings.multipleDefault || [];
		}
		// Single select list
		else if (this.settings.default && this.settings.default != '') {
			values[this.columnName] = this.settings.default;
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

		// NOTE: what is being returned here needs to mimic an ABView CLASS.
		// primarily the .common() and .newInstance() methods.
		var formComponentSetting = super.formComponent();

		// .common() is used to create the display in the list
		formComponentSetting.common = () => {
			return {
				key: (this.settings.isMultiple ? 'fieldcustom' : 'selectsingle'),
				options: this.settings.options.map(function (opt) {
					return {
						id: opt.id,
						value: opt.text,
						hex: opt.hex
					}
				})
			}
		};

		return formComponentSetting;
	}


	detailComponent() {
		
		var detailComponentSetting = super.detailComponent();

		detailComponentSetting.common = () => {
			return {
				key: (this.settings.isMultiple ? 'detailselectivity' : 'detailtext'),
			}
		};

		return detailComponentSetting;
	}
	
	getValue(item, rowData) {
		var values = {};
		if (this.settings.isMultiple) {
			var domNode = item.$view.querySelector('.list-data-values');
			values = this.selectivityGet(domNode);
		} else {
			values = $$(item).getValue();
		}
		return values;
	}


	setValue(item, rowData) {

		if (this.settings.isMultiple) {
			
			var val = rowData[this.columnName];
			if (typeof val == 'undefined') {
				// assume they just sent us a single value
				val = rowData;
			}
			
			// get selectivity dom
			var domSelectivity = item.$view.querySelector('.list-data-values');
			// set value to selectivity
			this.selectivitySet(domSelectivity, val, this.App);
			
		} else {
			super.setValue(item, rowData);  
		}
	}


	format(rowData) {

		var val = this.dataValue(rowData) || [];

		// Convert to array
		if (!Array.isArray(val))
			val = [val];

		var displayOpts = this.settings.options
							.filter(opt => val.filter(v => v == opt.id).length > 0)
							.map(opt => opt.text);

		return displayOpts.join(', ');

	}


}


export default ABFieldList;