
/*
 * ab_work_object_workspace_PopupAddView
 *
 * Manage the Sort Fields popup.
 *
 */

 import ABFieldList from '../classes/dataFields/ABFieldList';
 import ABFieldUser from '../classes/dataFields/ABFieldUser';

export default class AB_Work_Object_Workspace_PopupAddView extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App, idBase) {
		idBase = idBase || 'ab_work_object_workspace_popupAddView';

        super(App, idBase);
		var L = this.Label;

		var _object;

		var labels = {
			common : App.labels,
			component: {
				name: L('ab.add_view.name', '*Name'),
				type: L('ab.add_view.type', '*Type'),
				vGroup: L('ab.add_view.vGroup', '*Vertical Grouping'),
				hGroup: L('ab.add_view.hGroup', '*Horizontal Grouping'),
				owner: L('ab.add_view.owner', '*Card Owner'),
				namePlaceholder: L('ab.add_view.name_placeholder', '* Create a name for the view'),
				groupingPlaceholder: L('ab.add_view.grouping_placeholder', '*Select a field'),
				ownerPlaceholder: L('ab.add_view.owner_placeholder', '*Select user field'),
			}
		}


		// internal list of Webix IDs to reference our UI components
		var ids = {
			component: this.unique('_popupAddView'),
			form: this.unique('_popupAddViewForm'),
			nameInput: this.unique('_popupAddViewName'),
			typeInput: this.unique('_popupAddViewType'),
			vGroupInput: this.unique('_popupAddViewVGroup'),
			hGroupInput: this.unique('_popupAddViewHGroup'),
			ownerInput: this.unique('_popupAddViewOwner'),
			cancelButton: this.unique('_popupAddViewCancelButton'),
			saveButton: this.unique('_popupAddViewSaveButton'),
		}


		// Our webix UI definition:
		var formUI = {
		    view: "form",
		    id: ids.form,
			visibleBatch: "global",
			rules:{
				"name":webix.rules.isNotEmpty
			},
		    elements: [
		        {
		            view: "text",
					label: labels.component.name,
					id: ids.nameInput,
					name: "name",
					labelWidth: App.config.labelWidthXXLarge,
		            placeholder: labels.component.namePlaceholder,
					required: true
		        },
		        {
		            view: "richselect",
					label: labels.component.type,
					id: ids.typeInput,
		            name: "type",
					labelWidth: App.config.labelWidthXXLarge,
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
					label: labels.component.vGroup,
					id: ids.vGroupInput,
		            placeholder: labels.component.groupingPlaceholder,
					labelWidth: App.config.labelWidthXXLarge,
		            name: "vGroup",
		            required: true,
		          	options:[],
		            batch: "kanban"
		        },
		        {
		            view: "richselect",
					label: labels.component.hGroup,
					id: ids.hGroupInput,
		            placeholder: labels.component.groupingPlaceholder,
					labelWidth: App.config.labelWidthXXLarge,
		            name: "hGroup",
		            required: false,
		          	options:[],
		            batch: "kanban"
		        },
		        {
		            view: "richselect",
		            label: labels.component.owner,
					placeholder: labels.component.ownerPlaceholder,
					id: ids.ownerInput,
					labelWidth: App.config.labelWidthXXLarge,
		            name: "owner",
		         	options:[],
		            batch: "kanban"
		        },
		        {
		            margin: 5,
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
							value: labels.common.save,
							autowidth: true,
							type: "form",
							click: function () {
								_logic.buttonSave();
							}
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
					_logic.onShow();
				}
			}
		};



		// Our init() function for setting up our UI
		this.init = (options) => {
			// register our callbacks:

			webix.ui(this.ui);
		}


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

			
            objectLoad: (object) => {
				_object = object;
            },
	
			onShow: function() {
				// clear field options in the form
				$$(ids.form).clear();
				$$(ids.typeInput).define('value', 1);

				const initSelect = (id, filter = f => f.key === ABFieldList.defaults().key) => {
					var options = _object.fields().filter(filter).map(({id, label}) => ({id, value: label}));
					$$(id).define('options', options);
					if (options.length === 1) {
						$$(id).define('value', options[0].id);
					}
					$$(id).refresh();
				};

				const groupingFieldFilter = (field) => [
					ABFieldList.defaults().key, 
					ABFieldUser.defaults().key,
				].includes(field.key);

				initSelect(ids.vGroupInput, groupingFieldFilter);
				initSelect(ids.hGroupInput, groupingFieldFilter);
				initSelect(ids.ownerInput, f => f.key === ABFieldUser.defaults().key);
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
			},

			/**
             * @function hide()
             *
             * hide this component.
             */
            hide:function() {
                $$(ids.component).hide();
			},
			
			buttonCancel: function() {
				this.hide();
			},

			buttonSave: function() {
				if ($$(ids.form).validate()) {
					// save the new view
					this.hide();
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
