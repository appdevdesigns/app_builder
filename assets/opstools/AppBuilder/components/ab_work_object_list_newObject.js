
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

import ABBlankObject from "./ab_work_object_list_newObject_blank"




export default class AB_Work_Object_List_NewObject extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App) {
		super(App, 'ab_work_object_list_newObject');
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {
				addNew: L('ab.object.addNew', '*Add new object')
			}
		}

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
		}


		var BlankTab = new ABBlankObject(App);


		// Our webix UI definition:
		this.ui = {
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
		this.init = (options) => {
			webix.ui(this.ui);

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
		var _logic = this._logic = {




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
				var validator = newObject.isValid();
				if (validator.fail()) {
					cb(validator);							// tell current Tab component the errors
					return false;							// stop here.
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


		// Expose any globally accessible Actions:
		this.actions({

		});



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.show = _logic.show;

	}

}
