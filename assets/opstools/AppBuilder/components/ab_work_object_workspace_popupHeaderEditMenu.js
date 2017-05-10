
/*
 * ab_work_object_workspace_popupHeaderEditMenu
 *
 * Manage the Add New Data Field popup.
 *
 */

// import ABApplication from "../classes/ABApplication"
// import ABFieldManager from "../classes/ABFieldManager"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		hideField: L('ab.object.hideField', "*Hide field"),
		filterField: L('ab.object.filterField', "*Filter field"),
		sortField: L('ab.object.sortField', "*Sort field"),
		editField: L('ab.object.editField', "*Edit field"),
		deleteField: L('ab.object.deleteField', "*Delete field")
	}
}


var idBase = 'ab_work_object_workspace_popupHeaderEditMenu';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;


	// internal list of Webix IDs to reference our UI components.

	var ids = {
		component: App.unique(idBase + '_component'),
		
		list: App.unique(idBase + '_list')
	}


	// the list of options shown in the popup menu:
	var menuItems = {

		// Normally all items are available
		'default': [
			{ command: labels.component.hideField, icon: "fa-columns" },
			{ command: labels.component.filterField, icon: "fa-filter" },
			{ command: labels.component.sortField, icon: "fa-sort" },
			{ command: labels.component.editField, icon: "fa-pencil-square-o" },
			{ command: labels.component.deleteField, icon: "fa-trash" }
		],
		// But for imported objects, edit & delete are disabled
		'imported': [
			{ command: labels.component.hideField, icon: "fa-columns" },
			{ command: labels.component.filterField, icon: "fa-filter" },
			{ command: labels.component.sortField, icon: "fa-sort" },
			//{ command: labels.editField, icon: "fa-pencil-square-o" },
		]
	};



	// Our webix UI definition:
	var _ui = {
		view:"popup",
		id: ids.component,
		modal: false,
		autoheight:true,


		width: 180,
		body: {
			id: ids.list,
			view: 'list',
			datatype: "json",
			autoheight: true,
			select: false,
			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			data: menuItems['default'],	// start with the default set:
			on: {
				'onItemClick': function (timestamp, e, node) {
					_logic.onItemClick(timestamp, e, node);
				}
			}
		}
	}


	var CurrentObject = null;


	// Our init() function for setting up our UI
	var _init = function(options) {

		// register our callbacks:
		for(var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}

// $$(ids.editDefinitions).cells() // define the edit Definitions here.
	}



	// our internal business logic
	var _logic = {



		callbacks:{
			/**
			 * @function onClick
			 * report back which menu action was clicked.
			 * possible actions: [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
			 */
			onClick: function(action) {  }
		},



		hide:function() {
			$$(ids.component).hide();
		},


		/**
		 * @function objectLoad
		 * Ready the Popup according to the current object
		 * @param {ABObject} object  the currently selected object.
		 */
		objectLoad: function(object) {
			CurrentObject = object;

// TODO:
// check if object is imported, if so, then switch the shown fields to the imported menu:

			var listItems = menuItems['default'];
// if (object.isImported) {
// 	listItems = menuItems['imported'];
// }
			var List = $$(ids.list);
			List.clearAll();
			List.parse(listItems);
		},


		/**
		 * @function onItemClick
		 * when an entry in our popup menu is selected, make sure our parent component is
		 * alerted to the action requested.
		 *
		 * possible return action values: [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
		 *
		 */
		onItemClick: function(timestamp, e, node) {

			var action = null;
			var menu = node.textContent.trim();
			switch(menu) {
				case labels.component.hideField:
					action = 'hide';
					break;
				case labels.component.filterField:
					action = 'filter';
					break;
				case labels.component.sortField:
					action = 'sort';
					break;
				case labels.component.editField:
					action = 'edit';
					break;
				case labels.component.deleteField:
					action = 'delete';
					break;
			}

			_logic.callbacks.onClick(action);
		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 * @param {obj} $view  the webix.$view to hover the popup around.
		 */
		show:function($view) {

			$$(ids.component).show($view);
		}

	}



	// Expose any globally accessible Actions:
	var _actions = {

		// populateObjectPopupAddDataField: function(object) {
		// 	_currentObject = object;
		// }

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.


		hide: _logic.hide,
		objectLoad: _logic.objectLoad, 
		show:_logic.show,		// function($view, field_id) 


		_logic: _logic			// {obj} 	Unit Testing
	}

})
