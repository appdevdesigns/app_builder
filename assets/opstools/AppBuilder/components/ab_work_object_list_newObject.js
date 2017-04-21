
/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Application.
 *
 */

import "./ab_work_object_list_newObject_blank"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		// formHeader: L('ab.application.form.header', "*Application Info"),
		addNew: L('ab.object.addNew', '*Add new object'),
							
	}
}



OP.Component.extend('ab_work_object_list_newObject', function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('ab_work_object_list_newObject_component'),

	}


	var BlankTab = OP.Component['ab_work_object_list_newObject_blank'](App);


	// Our webix UI definition:
	var _ui = {
		view: "window",
		id: ids.component,
		width: 400,
		position: "center",
		modal: true,
		head: labels.component.addNew,
		selectNewObject: true,
		on: {
			"onBeforeShow": function () {
				// blankObjectCreator.onInit();
				// importObjectCreator.onInit();
				// importCsvCreator.onInit();
			}
		},
		body: {
			view: "tabview",
			cells: [
				BlankTab.ui,
				// importObjectCreator.getCreateView(),
				// importCsvCreator.getCreateView()
			]
		}
	};



	// Our init() function for setting up our UI
	var _init = function() {

		var ourCBs = {
			onCancel: _logic.hide,
			onSave: _logic.save
		}

		BlankTab.init(ourCBs);

		// webix.extend($$(ids.form), webix.ProgressBar);

	}



	// our internal business logic 
	var _logic = {

		
		// *
		//  * @function cancel
		//  *
		//  * The Model Creator was canceled.
		 
		// cancel: function() {

		// 	_logic.hide();
		// },


		/**
		 * @function hide()
		 *
		 * remove the busy indicator from the form.
		 */
		hide: function() {
			$$(ids.component).hide();
		},


		/**
		 * @function save
		 *
		 * take the data gathered by our child creation tabs, and 
		 * add it to our current application.
		 *
		 * @param {obj} values  key=>value hash of model values.
		 * @param {fn}  cb 		node style callback to indicate success/failure
		 */
		save:function (values, cb) {

			// must have an application set.
			if (!currentApplication) {
				OP.Dialog.Alert({
					title:'Shoot!',
					test:'No Application Set!  Why?'
				});
				cb(true);	// there was an error.
				return false;
			}


			var newObject = currentApplication.objectNew(values);

			var validationErrors = newObject.isValid();
			if (validationErrors) {
				cb(validationErrors);
				return false;
			}


			// if we get here, save the new Object
			newObject.save()
				.then(function(obj){

					// successfully done:
					cb();
					_logic.hide();
					currentCallBack(null, obj);
				})
				.catch(function(err){

					cb(err);				// the current Tab
					// currentCallBack(err);	// the calling Component
				})

		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			$$(ids.component).show();
		}
	}


	var currentApplication = null;
	var currentCallBack = null;


	// Expose any globally accessible Actions:
	var _actions = {


		/**
		 * @function transitionNewObjectWindow()
		 *
		 * Show our Create New Object window.
		 *
		 * @param {ABApplication} Application  	The current ABApplication 
		 *										we are working with.
		 */
		transitionNewObjectWindow:function(Application, cb){
			
			_logic.show();
			currentApplication = Application;	// remember our current Application.
			currentCallBack = cb;
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