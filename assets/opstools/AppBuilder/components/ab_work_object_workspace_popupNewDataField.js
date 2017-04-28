
/*
 * ab_work_object_workspace_popupNewDataField
 *
 * Manage the Add New Data Field popup.
 *
 */

import ABApplication from "../classes/ABApplication"
import ABFieldManager from "../classes/ABFieldManager"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		chooseType: L('ab.add_fields.chooseType', "*Choose field type..."),
		label: L('ab.add_fields.label', "*Label"),
		addNewField: L('ab.add_fields.addNewField', "*Add Column"),


	}
}


var idBase = 'ab_work_object_workspace_popupNewDataField';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;


	// internal list of Webix IDs to reference our UI components.
	
	var ids = {
		component: App.unique(idBase + '_component'),
		types: App.unique(idBase + '_types'),
		editDefinitions: App.unique(idBase+'_editDefinitions'),

		buttonSave: App.unique(idBase+'_buttonSave'),
		buttonCancel: App.unique(idBase+'_buttonCancel')
	}





	// Our webix UI definition:
	var _ui = {
		view:"popup",
		id: ids.component,
		modal: true,
		autoheight:true,
		// maxHeight: 420,
ready: function () {
	console.error('ready() called!!!')
	_logic.resetState();
},
		body: {
			css: 'ab-add-fields-popup',
			borderless: true,
			width: 380,
			paddingX: 17,
			rows: [
				{
					view: "menu",
					id: ids.types,
					minWidth: 500,
					autowidth: true,
					data: [{
						value: labels.component.chooseType,
submenu: ['dataFieldsManager', '.getFieldMenuList()']
					}],
					click: function (id, ev, node) {
						_logic.typeClick();
						ev.preventDefault();
					},
					on: {
						onMenuItemClick: function (id, ev, node) {
							_logic.onMenuItemClick(id);
							ev.preventDefault();
						}
					}
				},
				{ height: 10 },
				{ 
					view:'multiview',
					id: ids.editDefinitions,
					// NOTE: can't leave this an empty []. We redefine this value later.
					cells: [ { id:'del_me', view:'label', label:'edit definition here' } ] 
				},
				{ height: 10 },
				{
					cols: [
						{
							view: "button", 
							id: ids.buttonSave, 
							label: labels.component.addNewField, 
							type: "form", width: 120, click: function () {
								_logic.buttonSave();
							}
						},
						{
							view: "button", 
							value: labels.common.cancel, 
							width: 100, click: function () {
								_logic.buttonCancel();
							}
						}
					]
				}
			]
		},
		on: {
			onBeforeShow: function () {
				_logic.resetState();
			},
			onShow: function () {
				_logic.onShow();
			},
			onHide: function () {
				_logic.resetState();
			}
		}
	}
		

	var _objectHash = {};		// 'name' => ABFieldXXX object
	var _componentHash = {};	// 'name' => ABFieldXXX ui component
	var _currentEditor = null;
	var _currentObject = null;

	// Our init() function for setting up our UI
	var _init = function() {
		var Fields = ABFieldManager.allFields();


		//// we need to load a submenu entry and an editor definition for each 
		//// of our Fields
		

		
		var submenus = [];	// Create the submenus for our Data Fields:
		var defaultEditorComponent = null;	// choose the 1st entry for the default editor.
		var newEditorList = {
			id:ids.editDefinitions,
			rows:[]
		}

		Fields.forEach(function(F){

			// add a submenu for the fields multilingual key
			submenus.push( F.menuName() );


			// Add the Field's definition editor here:
			var editorComponent = F.propertiesComponent(App);
			if (!defaultEditorComponent) {
				defaultEditorComponent = editorComponent;
			}
			newEditorList.rows.push(editorComponent.ui);


			_objectHash[F.menuName()] = F;
			_componentHash[F.menuName()] = editorComponent;

		})


		// the submenu button has a placeholder we need to remove and update
		// with one that has all our submenus in it.
		var firstID = $$(ids.types).getFirstId();
		$$(ids.types).updateItem(firstID, {
			value: labels.component.chooseType,
			submenu: submenus
		}) 

		// now remove the 'del_me' definition editor placeholder.
		webix.ui(newEditorList, $$(ids.editDefinitions));


		defaultEditorComponent.show(); // show the default editor
		_currentEditor = defaultEditorComponent;
		

		// $$(ids.editDefinitions).show();

// $$(ids.editDefinitions).cells() // define the edit Definitions here.
	}



	// our internal business logic 
	var _logic = {

		
		buttonCancel:function() {

			_logic.resetState();

			// clear all editors:
			for (var c in _componentHash) {
				_componentHash[c].clear();
			}

			// hide this popup.
			$$(ids.component).hide();
		},


		buttonSave:function() {

// var self = this;

			$$(ids.buttonSave).disable();

// var base = self.getTopParentView(),
// 	dataTable = base.dataTable,
// 	fieldInfo = dataFieldsManager.getSettings(base.fieldName);

// if (!dataTable) {
// 	webix.message({ type: "error", text: labels.add_fields.registerTableWarning });
// 	self.enable();
// 	return;
// }

// if (!fieldInfo) {
// 	webix.alert({
// 		title: 'Field info error',
// 		text: 'System could not get this field information ',
// 		ok: labels.common.ok
// 	});
// 	self.enable();
// 	return;
// }



			var editor = _currentEditor;
			if (editor) {

				// the editor can define some basic form validations.
				if (editor.isValid()) {

					var values = editor.values();
					var newField = _currentObject.fieldNew(values);


					// newField can check for more validations:
					var errors = newField.isValid();
					if (errors) {
						OP.Form.isValidationError(errors, $$(editor.ui.id));
						$$(ids.buttonSave).enable();
					} else {

						newField.save()
						.then(()=>{

							$$(ids.buttonSave).enable();
							_logic.hide();
							_logic.callbacks.onSave(newField)
						})
						.catch((err) => {
							$$(ids.buttonSave).enable();
						})
					}

				} else {
					$$(ids.buttonSave).enable();
				}

			}  else {

				OP.Dialog.Alert({
					title: '! Could not find the current editor.',
					text: 'go tell a developer about this.'
				})
				$$(ids.buttonSave).enable();
			}
			
// if (!inputValidator.validateFormat(fieldInfo.name)) {
// 	self.enable();
// 	return;
// }

// // Validate duplicate field name
// var existsColumn = $.grep(dataTable.config.columns, function (c) { return c.id == fieldInfo.name.replace(/ /g, '_'); });
// if (existsColumn && existsColumn.length > 0 && !data.editFieldId) {
// 	webix.alert({
// 		title: labels.add_fields.duplicateFieldTitle,
// 		text: labels.add_fields.duplicateFieldDescription,
// 		ok: labels.common.ok
// 	});
// 	this.enable();
// 	return;
// }

// if (fieldInfo.weight == null)
// 	fieldInfo.weight = dataTable.config.columns.length;

// // Call callback function
// if (base.saveFieldCallback && base.fieldName) {
// 	base.saveFieldCallback(base.fieldName, fieldInfo)
// 		.then(function () {
// 			self.enable();
// 			base.resetState();
// 			base.hide();
// 		});
// }


		},


		callbacks:{
			onCancel: function() { console.warn('NO onCancel()!') },
			onSave  : function(field) { console.warn('NO onSave()!') },
		},



		hide:function() {
			$$(ids.component).hide();
		},


		/**
		 * @function onMenuItemClick
		 * swap the editor view to match the data field selected in the menu.
		 *
		 * @param {string} name  the menuName() of the submenu that was selected.
		 */ 
		onMenuItemClick: function (name) {

			// note, the submenu returns the Field.menuName() values.
			// we use that to lookup the Field here:
			var editor = _componentHash[name];
			if (editor) {
				editor.show();
				_currentEditor = editor;
			} else {

				// most likely they clicked on the menu button itself.
				// do nothing.

				// OP.Error.log("App Builder:Workspace:Object:NewDataField: could not find editor for submenu item:"+name, { name:name });
			}

		},



		onShow: function() {
// if (!AD.comm.isServerReady()) {
// 	this.getTopParentView().hide();

// 	webix.alert({
// 		title: labels.add_fields.cannotUpdateFields,
// 		text: labels.add_fields.waitRestructureObjects,
// 		ok: labels.common.ok
// 	});
// }
// else { // Set default field type
// 	this.showFieldData('string');
// }
console.error('TODO: onShow();')
		},



		resetState: function() {

			// add mode :  change button text to 'Add'
			// show the default editor
console.error('TODO: resetState()');
		},



		/**
		 * @function show()
		 *
		 * Show this component.
		 * @param {obj} $view  the webix.$view to hover the popup around.
		 */
		show:function($view) {

			$$(ids.component).show($view);
		},



		typeClick:function() {
			// NOTE: for functional testing we need a way to display the submenu 
			// (functional tests don't do .hover very well)
			// so this routine is to enable .click() to show the submenu.

			var subMenuId = $$(ids.types).config.data[0].submenu;

			// #HACK Sub-menu popup does not render on initial
			// Force it to render popup by use .getSubMenu()
			if (typeof subMenuId != 'string') {
				$$(ids.types).getSubMenu($$(ids.types).config.data[0].id);
				subMenuId = $$(ids.types).config.data[0].submenu;
			}

			if ($$(subMenuId))
				$$(subMenuId).show();
		}
	}



	// Expose any globally accessible Actions:
	var _actions = {

		populateObjectPopupAddDataField: function(object) {
			_currentObject = object;
		}

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component  
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		_logic: _logic			// {obj} 	Unit Testing
	}

})