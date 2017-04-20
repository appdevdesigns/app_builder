
/*
 * ab_work_object_list
 *
 * Manage the Object List
 *
 */

import ABApplication from "../classes/ABApplication"
import "./ab_work_object_list_newObject"


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	application: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),

	}
}



OP.Component.extend('ab_work_object_list', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_component'),

		list: App.unique('ab_work_object_list_editlist'),
		buttonNew: App.unique('ab_work_object_list_buttonNew'),

	}


	var PopupNewObjectComponent = OP.Component['ab_work_object_list_newObject'](App);
	var PopupNewObject = webix.ui(PopupNewObjectComponent.ui);
	// PopupNewObject.hide();

	// Our webix UI definition:
	var _ui = {
		id:ids.component,
		rows: [
			{
				view: App.custom.edittree.view,  // "editlist",
				id: ids.list,
				width: 250,
				select: true,
				editaction: 'custom',
				editable: true,
				editor: "text",
				editValue: "label",
				template: function(obj, common) { 
					return _logic.templateListItem(obj, common); 
				},
				type: {
					unsyncNumber: "<span class='ab-object-unsync'><span class='ab-object-unsync-number'></span> unsync</span>",
					iconGear: "<div class='ab-object-list-edit'><span class='webix_icon fa-cog'></span></div>"
				},
				on: {
					onAfterRender: function () {
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
					onAfterSelect: function (id) {
// // Fire select object event
// self.element.trigger(self.options.selectedObjectEvent, id);

// // Refresh unsync number
// self.refreshUnsyncNumber();

// // Show gear icon
// $(this.getItemNode(id)).find('.ab-object-list-edit').show();
					},
					onAfterDelete: function (id) {
// // Fire unselect event 
// self.element.trigger(self.options.selectedObjectEvent, null);
					},
					onBeforeEditStop: function (state, editor) {
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
					onAfterEditStop: function (state, editor, ignoreUpdate) {
// if (state.value != state.old) {
// 	var _this = this;

// 	this.showProgress({ type: 'icon' });

// 	var selectedObject = AD.classes.AppBuilder.currApp.objects.filter(function (item, index, list) { return item.id == editor.id; })[0];
// 	selectedObject.attr('label', state.value);

// 	// Call server to rename
// 	selectedObject.save()
// 		.fail(function () {
// 			_this.hideProgress();

// 			webix.message({
// 				type: "error",
// 				text: self.labels.common.renameErrorMessage.replace("{0}", state.old)
// 			});

// 			AD.error.log('Object List : Error rename object data', { error: err });
// 		})
// 		.then(function () {
// 			_this.hideProgress();

// 			if (selectedObject.translate) selectedObject.translate();

// 			// Show success message
// 			webix.message({
// 				type: "success",
// 				text: self.labels.common.renameSuccessMessage.replace('{0}', state.value)
// 			});

// 			// Show gear icon
// 			$(_this.getItemNode(editor.id)).find('.ab-object-list-edit').show();
// 		});
// }
					}
				},
				onClick: {
					"ab-object-list-edit": function (e, id, trg) {
// // Show menu
// $$(self.webixUiId.objectListMenuPopup).show(trg);

// return false;
					}
				}
			},
			{
				view: 'button',
				id: ids.buttonNew,
				value: labels.application.addNew,
				click: function () {

					App.actions.transitionNewObjectWindow();
// $$(self.webixUiId.addNewPopup).define('selectNewObject', true);
// $$(self.webixUiId.addNewPopup).show();
				}
			}
		]
	};



	// Our init() function for setting up our UI
	var _init = function() {

		webix.extend($$(ids.list), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		listBusy:function() {
			$$(ids.list).showProgress({ type: "icon" });
		},

		listReady:function() {
			$$(ids.list).hideProgress();
		},

		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		},


		syncNumberRefresh:function() {
console.error('TODO: syncNumRefresh()');
// var self = this,
// 	objects = [];

// objects = $$(self.webixUiId.objectList).data.find(function (d) {
// 	return objectName ? d.name == objectName : true;
// }, false, true);

// objects.forEach(function (obj) {
// 	var objectModel = modelCreator.getModel(AD.classes.AppBuilder.currApp, obj.name),
// 		unsyncNumber = (objectModel && objectModel.Cached ? objectModel.Cached.count() : 0),
// 		htmlItem = $($$(self.webixUiId.objectList).getItemNode(obj.id));

// 	if (unsyncNumber > 0) {
// 		htmlItem.find('.ab-object-unsync-number').html(unsyncNumber);
// 		htmlItem.find('.ab-object-unsync').show();
// 	}
// 	else {
// 		htmlItem.find('.ab-object-unsync').hide();
// 	}
// });
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
			"{common.unsyncNumber}",
			"{common.iconGear}",
		"</div>",
	].join('');



	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function populateObjectList()
		 *
		 * Initialize the Object List from the provided ABApplication
		 *
		 * If no ABApplication is provided, then show an empty form. (create operation)
		 *
		 * @param {ABApplication} application  	[optional] The current ABApplication 
		 *										we are working with.
		 */
		populateObjectList : function(application){
			_logic.listBusy();

			var objectList = application.objects();

			var List = $$(ids.list);
			List.clearAll();
			List.data.unsync();
			List.data.sync(objectList);
			List.refresh();
			List.unselectAll();

			_logic.syncNumberRefresh();
			_logic.listReady();

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