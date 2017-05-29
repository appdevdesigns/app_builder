
/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object_list_newObject"
import "./ab_common_popupEditMenu"   // "./ab_work_object_list_popupEditMenu"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),

		confirmDeleteTitle: L('ab.object.delete.title', "*Delete object"),
		confirmDeleteMessage: L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")

	}
}


var idBase = 'ab_work_object_list';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase+ '_component'),

		list: App.unique(idBase+ '_editlist'),
		buttonNew: App.unique(idBase+ '_buttonNew'),

	}


	// Our webix UI definition:
	var _ui = {
		id:ids.component,
		rows: [
			{
				view: App.custom.editlist.view,  // "editlist",
				id: ids.list,
				width: 250,	// TODO: @James

				select: true,

				editaction: 'custom',
				editable: true,
				editor: "text",
				editValue: "label",

				template: function(obj, common) {
					return _logic.templateListItem(obj, common);
				},
				type: {
					height: 35,
					iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
				},
				on: {
					onAfterRender: function () {
						_logic.onAfterRender();
					},
					onAfterSelect: function (id) {
						_logic.selectObject(id);
					},
					onBeforeEditStop: function (state, editor) {
						_logic.onBeforeEditStop(state, editor);
					},
					onAfterEditStop: function (state, editor, ignoreUpdate) {
						_logic.onAfterEditStop(state, editor, ignoreUpdate);
					}
				},
				onClick: {
					"ab-object-list-edit": function (e, id, trg) {
						_logic.clickEditMenu(e, id, trg);
					}
				}
			},
			{
				view: 'button',
				id: ids.buttonNew,
				value: labels.component.addNew,
				click: function () {
					_logic.clickNewObject();
				}
			}
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {

		if ($$(ids.component))
			$$(ids.component).adjust();

		if ($$(ids.list)) {
			webix.extend($$(ids.list), webix.ProgressBar);
			$$(ids.list).adjust();
		}

		PopupNewObjectComponent.init({
			onDone: _logic.callbackNewObject
		});

		PopupEditObjectComponent.init({
			onClick: _logic.callbackObjectEditorMenu
		})
	}



	// our internal business logic
	var _logic = {


		/**
		 * @function applicationLoad
		 *
		 * Initialize the Object List from the provided ABApplication
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} application  	[optional] The current ABApplication
		 *										we are working with.
		 */
		applicationLoad : function(application){
			_logic.listBusy();

			CurrentApplication = application;

			// get a DataCollection of all our objects
			objectList = new webix.DataCollection({
				data: application.objects(),
			});

			// clear our list and display our objects:
			var List = $$(ids.list);
			List.clearAll();
			List.data.unsync();
			List.data.sync(objectList);
			List.refresh();
			List.unselectAll();



			//
			_logic.listReady();


			// prepare our Popup with the current Application
			PopupNewObjectComponent.applicationLoad(application);

		},


		clickEditMenu: function(e, id, trg) {
			// Show menu
			PopupEditObjectComponent.show(trg);

			return false;
		},


		listBusy:function() {
			$$(ids.list).showProgress({ type: "icon" });
		},

		listReady:function() {
			$$(ids.list).hideProgress();
		},

		onAfterRender: function() {
console.error('!! todo: onAfterRender() editing');
			// webix.once(function () {
			// 	$$(self.webixUiId.objectList).data.each(function (d) {
			// 		$($$(self.webixUiId.objectList).getItemNode(d.id)).find('.ab-object-unsync-number').html(99);
			// 	});
			// });

			// // Show gear icon
			// if (this.getSelectedId(true).length > 0) {
			// 	$(this.getItemNode(this.getSelectedId(false))).find('.ab-object-list-edit').show();
			// 	self.refreshUnsyncNumber();
			// }
		},

		onAfterEditStop: function(state, editor, ignoreUpdate) {

			_logic.showGear(editor.id);

			if (state.value != state.old) {
				_logic.listBusy();

				var selectedObject = $$(ids.list).getSelectedItem(false);
				selectedObject.label = state.value;

				// Call server to rename
				selectedObject.save()
					.catch(function () {
						_logic.listReady();

						OP.Dialog.Alert({
							text: labels.common.renameErrorMessage.replace("{0}", state.old)
						});

					})
					.then(function () {
						_logic.listReady();

						// TODO : should use message box
						OP.Dialog.Alert({
							text: labels.common.renameSuccessMessage.replace("{0}", state.value)
						});

					});
			}
		},

		onBeforeEditStop: function(state, editor) {
console.error('!! todo: onBeforeEditStop() editing');
			// if (!inputValidator.validateFormat(state.value)) {
			// 	return false;
			// }

			// // Validation - check duplicate
			// if (!inputValidator.rules.preventDuplicateObjectName(state.value, editor.id) && state.value != state.old) {
			// 	webix.alert({
			// 		title: self.labels.object.invalidName,
			// 		ok: self.labels.common.ok,
			// 		text: self.labels.object.duplicateName.replace("{0}", state.value)
			// 	});

			// 	return false;
			// }
		},


		/**
		 * @function selectObject()
		 *
		 * Perform these actions when an Object is selected in the List.
		 */
		selectObject: function (id) {

			var object = $$(ids.list).getItem(id);
			App.actions.populateObjectWorkspace(object);

//// TODO: do we need these?

			// // Refresh unsync number
			// self.refreshUnsyncNumber();

			_logic.showGear(id);
		},

		showGear: function(id) {
			var gearIcon = $$(ids.list).getItemNode(id).querySelector('.ab-object-list-edit');
			gearIcon.style.visibility = "visible";
			gearIcon.style.display = "block";
		},

		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},



		/**
		 * @function templateListItem
		 *
		 * Defines the template for each row of our ObjectList.
		 *
		 * @param {obj} obj the current instance of ABObject for the row.
		 * @param {?} common the webix.common icon data structure
		 * @return {string}
		 */
		templateListItem: function(obj, common) {
			return _templateListItem
				.replace('#label#', obj.label || '??label??')
				.replace('{common.iconGear}', common.iconGear);
		},


		/**
		 * @function callbackNewObject
		 *
		 * Once a New Object was created in the Popup, follow up with it here.
		 */
		callbackNewObject:function(err, object){

			if (err) {
				OP.Error.log('Error creating New Object', {error: err});
				return;
			}

			$$(ids.list).add(object);
			$$(ids.list).select(object.id);

		},


		/**
		 * @function clickNewObject
		 *
		 * Manages initiating the transition to the new Object Popup window
		 */
		clickNewObject:function() {

			// show the new popup
			PopupNewObjectComponent.show();
		},

		rename: function () {
			var objectId = $$(ids.list).getSelectedId(false);
			$$(ids.list).edit(objectId);
		},

		remove: function () {

			var selectedObject = $$(ids.list).getSelectedItem(false);

			// verify they mean to do this:
			OP.Dialog.Confirm({
				title: labels.component.confirmDeleteTitle,
				message: labels.component.confirmDeleteMessage.replace('{0}', selectedObject.label),
				callback: (isOK) => {

					if (isOK) {
						_logic.listBusy();

						selectedObject.destroy()
							.then(() => {
								_logic.listReady();

								$$(ids.list).remove(selectedObject.id);
								App.actions.clearObjectWorkspace();
							});

					}
				}
			})
		},

		callbackObjectEditorMenu: function (action) {
			switch (action) {
				case 'rename':
					_logic.rename();
					break;
				case 'delete':
					_logic.remove();
					break;
			}
		}
	}


	/*
	 * _templateListItem
	 *
	 * The Object Row template definition.
	 */
	var _templateListItem = [
		"<div class='ab-object-list-item'>",
			"#label#",
			// "{common.unsyncNumber}",
			"{common.iconGear}",
		"</div>",
	].join('');


	// Note: put these here so _logic is defined:
	// There is a Popup for adding a new Object:
	var PopupNewObjectComponent = OP.Component['ab_work_object_list_newObject'](App);
	var PopupEditObjectComponent = OP.Component['ab_common_popupEditMenu'](App);



	var CurrentApplication = null;
	var objectList = null;



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function getSelectedObject
		 *
		 * returns which ABObject is currently selected.
		 * @return {ABObject}  or {null} if nothing selected.
		 */
		getSelectedObject:function() {
			return $$(ids.list).getSelectedItem();
		},

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		applicationLoad:_logic.applicationLoad,

		_logic: _logic			// {obj} 	Unit Testing
	}

})
