
/*
 * ab_work_object_workspace_PopupAddView
 *
 * Manage the Sort Fields popup.
 *
 */


export default class AB_Work_Object_Workspace_PopupAddView extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App, idBase) {

		idBase = idBase || 'ab_work_object_workspace_popupAddView';

        super(App, idBase);
		var L = this.Label;

		var labels = {
			common : App.labels,
			component: {

				addNewSort: 	L('ab.sort_fields.addNewSort', 	"*Add new sort"),

			}
		}


		// internal list of Webix IDs to reference our UI components
		var ids = {
			component: this.unique(idBase + '_popupAddView'),
			form: this.unique(idBase + '_popupAddViewForm')
		}


		// Our webix UI definition:
		var formUI = {
		    view: "form",
		    id: ids.form,
		    visibleBatch: "global",
		    elements: [
		        {
		            view: "text",
		            label: "Name",
		            name: "name",
		            placeholder: "Create a name for the view",
		            required: true
		        },
		        {
		            view: "richselect",
		            label: "Type",
		            name: "type",
		            options:[
				        {"id":1, "value":"Grid"},
		    		    {"id":2, "value":"Kanban"},
		 			],
		            value: 1,
		            required: true,
		            on: {
		            	'onChange': function(id) {
		                    if (id == 2) {
		                  		$$(ids.form).showBatch("kanban");
								$$(ids.component).resize();
		                    } else {
		                  		$$(ids.form).showBatch("global");
								$$(ids.component).resize();
		                    }
		              	}
		            }
		        },
		        {
		            view: "richselect",
		            label: "Columns",
		            placeholder: "Select a field",
		            name: "columns",
		            required: true,
		          	options:[
				        {"id":1, "value":"Field #1"},
		    		    {"id":2, "value":"Field #2"},
		 			],
		            batch: "kanban"
		        },
		        {
		            view: "richselect",
		            label: "Users",
		            placeholder: "Select user field",
		            name: "users",
		         	options:[
				        {"id":1, "value":"Field #1"},
		    		    {"id":2, "value":"Field #2"},
		 			],
		            batch: "kanban"
		        },
		        {
			        min: 0,
			        max: 100,
			        view: "slider",
			        label: "Size",
					name: "size",
		            batch: "kanban"
		        },
		        {
		            margin: 5,
		            cols: [{
		                    view: "button",
		                    value: "Cancel",
		                    type: "danger"
		                },
		                {
		                    view: "button",
		                    value: "Save"
		                }
		            ]
		        }
		    ]
		};

		this.ui = {
			view:"window",
			id: ids.component,
			height: 400,
		    width: 350,
		    head: "View Settings",
		    position: "center",
			body: formUI,
			modal: true,
			on: {
				onShow: function () {
					// _logic.onShow();
				}
			}
		};



		// Our init() function for setting up our UI
		this.init = (options) => {
			// register our callbacks:

			webix.ui(this.ui);
		}


		var CurrentObject = null;
		var CurrentView = null;

		// our internal business logic
		var _logic = this._logic = {

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
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 * @param {ABObject} currView  the custom settings for a view if editing in interface builder
             */
            objectLoad: function(object, currView) {
                CurrentObject = object;
                if (currView != null) CurrentView = currView;
			},


			
			/**
			 * @function objectLoad
			 * Ready the Popup according to the current object
			 * @param {ABObject} object  the currently selected object.
			 */
			onShow: function() {
				var sort_popup = $$(ids.component),
					sort_form = $$(ids.form);

				// clear field options in the form
				webix.ui(formUI, sort_form);
				// var childViews = sort_form.getChildViews();
				// childViews.forEach(function(i, idx, array){
				// 	if (idx !== array.length - 1){ 
				// 		sort_form.removeView(i);
				// 	}
				// });

				// var sorts = CurrentObject.workspaceSortFields;
				// if (sorts && sorts.forEach) {
				// 	sorts.forEach((s) => {
				// 		_logic.clickAddNewSort(s.key, s.dir);
				// 	});
				// }

				// if (sorts == null || sorts.length == 0) {
				// 	_logic.clickAddNewSort();
				// }
			},

            /**
             * @function show()
             *
             * Show this component.
             * @param {obj} $view  the webix.$view to hover the popup around.
			 * @param {uuid} fieldId the fieldId we want to prefill the sort with
             */
            show:function($view, fieldId, options) {
                if (options != null) {
                    $$(ids.component).show($view, options);
                } else {
                    $$(ids.component).show($view);
                }
				if (fieldId) {
					_logic.clickAddNewSort(fieldId);
				}
			},


		}



		// Expose any globally accessible Actions:
		this.actions({


		})


		// 
		// Define our external interface methods:
		// 
		this.objectLoad = _logic.objectLoad;
		this.show = _logic.show;

	}

}
