
/*
 * ab_work_object_list_newObject
 *
 * Display the form for creating a new Object.  This Popup will manage several
 * different sub components for gathering Object data for saving.
 *
 * The sub components will gather the data for the object and do basic form
 * validations on their interface.
 *
 * when ready, the sub component will call onSave(values, cb)  to allow this
 * component to manage the actual final object validation, and saving to this
 * application.  On success, cb(null) will be called.  on error cb(err) will
 * be called.
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


var idBase = 'ab_work_object_list_newObject';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique(idBase + '_component'),
	}


	var BlankTab = OP.Component['ab_work_object_list_newObject_blank'](App);


	// Our webix UI definition:
	var _ui = {
		view: "window",
		id: ids.component,
		// width: 400,
		position: "center",
		modal: true,
		head: labels.component.addNew,
		selectNewObject: true,
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
	var _init = function(options) {
		webix.ui(_ui);

		// register our callbacks:
		for(var c in _logic.callbacks) {
			_logic.callbacks[c] = options[c] || _logic.callbacks[c];
		}


		var ourCBs = {
			onCancel: _logic.hide,
			onSave: _logic.save
		}

		BlankTab.init(ourCBs);

	}



	// our internal business logic
	var _logic = {




		/**
		 * @function applicationLoad()
		 *
		 * prepare ourself with the current application
		 */
		applicationLoad:function(application) {
			// _logic.show();
			currentApplication = application;	// remember our current Application.
		},


		callbacks:{
			onDone:function(){}
		},


		/**
		 * @function hide()
		 *
		 * remove the busy indicator from the form.
		 */
		hide: function() {
			if ($$(ids.component))
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

			// create a new (unsaved) instance of our object:
			var newObject = currentApplication.objectNew(values);


			// have newObject validate it's values.
			var validationErrors = newObject.isValid();
			if (validationErrors) {
				cb(validationErrors);						// tell current Tab component the errors
				return false;								// stop here.
			}


			// if we get here, save the new Object
			newObject.save()
				.then(function(obj){

					// successfully done:
					cb();									// tell current tab component save successful
					_logic.hide();							// hide our popup
					_logic.callbacks.onDone(null, obj);		// tell parent component we're done
				})
				.catch(function(err){
					cb(err);								// tell current Tab component there was an error
				})
		},


		/**
		 * @function show()
		 *
		 * Show this component.
		 */
		show:function() {

			if ($$(ids.component))
				$$(ids.component).show();
		}
	}


	var currentApplication = null;
	// var currentCallBack = null;


	// Expose any globally accessible Actions:
	var _actions = {

	}


	// return the current instance of this component:
	return {
		ui:_ui,					// {obj} 	the webix ui definition for this component
		init:_init,				// {fn} 	init() to setup this component
		actions:_actions,		// {ob}		hash of fn() to expose so other components can access.

		// interface methods for parent component:
		applicationLoad:_logic.applicationLoad,
		show: _logic.show,

		_logic: _logic			// {obj} 	Unit Testing
	}

})
