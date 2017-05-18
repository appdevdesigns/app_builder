
/*
 * ab_work_object_workspace_popupFrozenColumns
 *
 * Manage the Frozen Columns popup.
 *
 */

import ABApplication from "../classes/ABApplication"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {
		clearAll: L('ab.frozen_fields.clearAll', "*Clear All"),
		// hideAll: L('ab.visible_fields.hideAll', "*Hide All"),
	}
}


var idBase = 'ab_work_object_workspace_popupFrozenColumns';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;


	// internal list of Webix IDs to reference our UI components
	var ids = {
		component: App.unique(idBase + '_component'),
		list: App.unique(idBase + "_list"),
	}


	// Our webix UI definition:
	var _ui = {
		view:"popup",
		id: ids.component,
		// modal: true,
		autoheight:true,
		width: 500,
		body: {
			rows: [
				{
					view: 'list',
					id: ids.list,
					width: 250,
					autoheight: true,
					select: false,
					template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle-o ab-frozen-field-icon"></i>&nbsp;</span> #label#',
					on: {
						onItemClick: function (id, e, node) {
							_logic.listItemClick(id, e, node);

							// dataTable.define('leftSplit', dataTable.getColumnIndex(id) + 1);
							// dataTable.refreshColumns();
							//
							// $$(ids.component).refreshShowIcons();
							// $$(ids.component).callChangeEvent();
						}
					}
				},
				{
					view: 'button', value: labels.component.clearAll, click: function () {
						_logic.clickClearAll(id, e, node);

						// dataTable.define('leftSplit', 0);
						// dataTable.refreshColumns();
						//
						// $$(ids.component).refreshShowIcons();
						// $$(ids.component).callChangeEvent();
					}
				}
			]
		},
		on: {
			onShow: function () {
				//$$(ids.frozenPopup).populateList();
			}
		}
    }



	// Our init() function for setting up our UI
	var _init = function(options) {

		// register our callbacks:
		for(var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

	}


	var CurrentObject = null;

	// our internal business logic
	var _logic = {

		callbacks:{

			/**
			 * @function onChange
			 * called when we have made changes to the hidden field settings
			 * of our Current Object.
			 *
			 * this is meant to alert our parent component to respond to the
			 * change.
			 */
			onChange:function(){}
		},


		/**
		 * @function clickClearAll
		 * the user clicked the [clear all] option.  So show unfreeze all our columns.
		 */
		clickClearAll: function () {
			// store empty string to not freeze any columns
			CurrentObject.workspaceFrozenColumnID = "";
			CurrentObject.save()
			.then(function(){
				_logic.iconsReset();
				_logic.callbacks.onChange()
			})
			.catch(function(err){
				OP.Error.log('Error trying to save workspaceFrozenColumnID', {error:err, fields:frozenColumnID });
			})
		},


		/**
		 * @function listItemClick
		 * update the list to show which columns are frozen by showing an icon next to the column name
		 */
		listItemClick: function(id, e, node) {
			// update our Object with current frozen column id
			CurrentObject.workspacefrozenColumnID = id;
			CurrentObject.save()
			.then(function(){
				_logic.iconsReset();
				_logic.callbacks.onChange()
			})
			.catch(function(err){
				OP.Error.log('Error trying to save workspacefrozenColumnID', {error:err, fields:frozenColumnID });
			})
		},

		/**
		 * @function refreshShowIcons
		 * update the list to show which columns are frozen by showing an icon next to the column name
		 */
		populateList: function () {
			var fieldList = [];
			// Get all columns include hidden columns
			if (data.fieldList) {
				data.fieldList.forEach(function (f) {
					fieldList.push({
						id: f.name,
						label: f.label,
					});
				});
			}

			return fieldList;
			// $('.ab-frozen-field-icon').hide();
			//
			// if (dataTable) {
			// 	for (var i = 0; i < dataTable.config.leftSplit; i++) {
			// 		var c = dataTable.config.columns[i];
			// 		$($$(componentIds.fieldsList).getItemNode(c.id)).find('.ab-frozen-field-icon').show();
			// 	}
			// }
		},


		/**
		 * @function iconHide
		 * Hide the icon for the given node
		 * @param {DOM} node  the html dom node of the element that contains our icon
		 */
		iconHide: function(node) {
			// if (node) {
			// 	node.querySelector('.ab-visible-field-icon').style.visibility = "hidden";
			// }
		},


		/**
		 * @function iconShow
		 * Show the icon for the given node
		 * @param {DOM} node  the html dom node of the element that contains our icon
		 */
		iconShow: function(node) {
			// if (node) {
			// 	node.querySelector('.ab-visible-field-icon').style.visibility = "visible";
			// }
		},


		/**
		 * @function iconsReset
		 * Reset the icon displays according to the current values in our Object
		 */
		iconsReset: function() {

			var List = $$(ids.list);

			// for each item in the List
			var id = List.getFirstId();
			while(id) {

				// find it's HTML Node
				var node = List.getItemNode(id);

				// if this item is not hidden, show it.
				if (CurrentObject.workspacefrozenColumnID <= id) {
					_logic.iconShow(node);
				} else {
					// else hide it
					_logic.iconHide(node);
				}

				// next item
				id = List.getNextId(id);
			}

		},


		/**
		 * @function objectLoad
		 * Ready the Popup according to the current object
		 * @param {ABObject} object  the currently selected object.
		 */
		objectLoad: function(object) {
			CurrentObject = object;

			// refresh list
			var allFields = CurrentObject.fields();
			var listFields = [];
			allFields.forEach((f) => {
				listFields.push({
					id: f.id,
					label: f.label
				})
			})

			$$(ids.list).parse(allFields);
		}

	}



	// Expose any globally accessible Actions:
	var _actions = {


	}



	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


		// interface methods for parent component:
		objectLoad: _logic.objectLoad,


		_logic: _logic			// {obj} 	Unit Testing
	}

})
