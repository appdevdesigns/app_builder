
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

// ready: function () {
// 	console.error('ready() called!!!')
// 	_logic.resetState();
// },

		body: {
			css: 'ab-add-fields-popup',
			borderless: true,
			rows: [
				{
					view: "richselect",
					id: ids.types,
					value: 1,
					options: [
						{"id":1, "value":labels.component.chooseType}
					],
					// data: [{
					// 	value: labels.component.chooseType,
					// 	submenu: ['dataFieldsManager', '.getFieldMenuList()']
					// }],
					// click: function (id, ev, node) {
					// 	_logic.typeClick();
					// 	ev.preventDefault();
					// },
					on: {
						onChange: function (id, ev, node) {
							_logic.onChange(id);
							//ev.preventDefault();
						}
					}
				},
				{
					view:'multiview',
					id: ids.editDefinitions,
					// NOTE: can't leave this an empty []. We redefine this value later.
					cells: [ { id:'del_me', view:'label', label:'edit definition here' } ]
				},
				{ height: 10 },
				{
					cols: [
						{ fillspace: true },
						{
							view: "button",
							value: labels.common.cancel,
							css: "ab-cancel-button",
							autowidth: true,
							click: function () {
								_logic.buttonCancel();
							}
						},
						{
							view: "button",
							id: ids.buttonSave,
							label: labels.component.addNewField,
							autowidth: true,
							type: "form",
							click: function () {
								_logic.buttonSave();
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
	var _componentsByType = {}; // 'type' => ABFieldXXX ui component
	var _currentEditor = null;
	var _currentObject = null;

	var defaultEditorComponent = null;	// the default editor.

	var _editField = null;		// field instance being edited

	// Our init() function for setting up our UI
	var _init = function(options) {

		// register our callbacks:
		for(var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}


		var Fields = ABFieldManager.allFields();


		//// we need to load a submenu entry and an editor definition for each
		//// of our Fields



		var submenus = [{"id":1, "value":labels.component.chooseType}];	// Create the submenus for our Data Fields:
		var newEditorList = {
			view:'multiview',
			id:ids.editDefinitions,
			rows:[]
		}

		Fields.forEach(function(F){

			var menuName = F.defaults().menuName ;
			var type = F.defaults().type;

			// add a submenu for the fields multilingual key
			submenus.push( {"id":menuName, "value":menuName} );


			// Add the Field's definition editor here:
			var editorComponent = F.propertiesComponent(App);
			if (!defaultEditorComponent) {
				defaultEditorComponent = editorComponent;
			}
			newEditorList.rows.push(editorComponent.ui);


			_objectHash[ menuName ] = F;
			_componentHash[ menuName ] = editorComponent;
			_componentsByType[ type ]  = editorComponent;

		})


		// the submenu button has a placeholder we need to remove and update
		// with one that has all our submenus in it.
		// var firstID = $$(ids.types).getFirstId();
		// $$(ids.types).updateItem(firstID, {
		// 	value: labels.component.chooseType,
		// 	submenu: submenus
		// })
		$$(ids.types).define("options",submenus);
		$$(ids.types).setValue(1);
		$$(ids.types).refresh();

		// now remove the 'del_me' definition editor placeholder.
		webix.ui(newEditorList, $$(ids.editDefinitions));

		// hide all the unused editors:
		for (var c in _componentHash){
			_componentHash[c].hide();
		}

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

			$$(ids.buttonSave).disable();


			var editor = _currentEditor;
			if (editor) {

				// the editor can define some basic form validations.
				if (editor.isValid()) {

					var values = editor.values();

					var field = null;
					var oldData = null;

					// if this is an ADD operation, (_editField will be undefined)
					if (!_editField) {

						// get a new instance of a field:
						field = _currentObject.fieldNew(values);

					} else {

						// use our _editField, backup our oldData
						oldData = _editField.toObj();
						_editField.fromValues(values);

						field = _editField;
					}


					var errors = field.isValid();
					if (errors) {
						OP.Form.isValidationError(errors, $$(editor.ui.id));

						// keep our old data
						if (oldData) {
							field.fromValues(oldData);
						}

						$$(ids.buttonSave).enable();
					} else {

						field.save()
						.then(()=>{

							$$(ids.buttonSave).enable();
							_logic.hide();
							_currentEditor.clear();
							_logic.callbacks.onSave(field)
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



		modeAdd:function() {

			// show default editor:
			defaultEditorComponent.show(false, false);
			_currentEditor = defaultEditorComponent;

			// show the ability to switch data types
			$$(ids.types).show();

			// change button text to 'add'
			$$(ids.buttonSave).define('label', labels.component.addNewField);
			$$(ids.buttonSave).refresh();
		},


		modeEdit: function(field) {

			if (_currentEditor) _currentEditor.hide();

			// switch to this field's editor:
			// hide the rest
			for(var c in _componentsByType) {
				if (c == field.type) {
					_componentsByType[c].populate(field);
					_componentsByType[c].show(false, false);
					_currentEditor = _componentsByType[c];
				} else {
					_componentsByType[c].hide();
				}
			}

			// hide the ability to switch data types
			$$(ids.types).hide();

			// change button text to 'save'
			$$(ids.buttonSave).define('label', labels.common.save);
			$$(ids.buttonSave).refresh();
		},


		/**
		 * @function onChange
		 * swap the editor view to match the data field selected in the menu.
		 *
		 * @param {string} name  the menuName() of the submenu that was selected.
		 */
		onChange: function (name) {

			// note, the submenu returns the Field.menuName() values.
			// we use that to lookup the Field here:
			var editor = _componentHash[name];
			if (editor) {
				editor.show();
				_currentEditor = editor;
				$$(ids.types).blur();
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
		 * @param {ABField} field the ABField to edit.  If not provided, then
		 *						  this is an ADD operation.
		 */
		show:function($view, field) {

			_editField = field;

			if (_editField) {

				_logic.modeEdit(field);

			} else {

				_logic.modeAdd();

			}

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


		show:_logic.show,		// {fn} 	fn(node, ABField)


		_logic: _logic			// {obj} 	Unit Testing
	}

})
