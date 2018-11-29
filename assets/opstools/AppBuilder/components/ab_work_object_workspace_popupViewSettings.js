
/*
 * ab_work_object_workspace_PopupAddView
 *
 * Manage the Sort Fields popup.
 *
 */

import ABFieldList from '../classes/dataFields/ABFieldList';
import ABFieldUser from '../classes/dataFields/ABFieldUser';

import ABObjectWorkspaceViewGrid from "../classes/ABObjectWorkspaceViewGrid"
import ABObjectWorkspaceViewKanban from "../classes/ABObjectWorkspaceViewKanban"

export default class AB_Work_Object_Workspace_PopupAddView extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App, idBase) {
		idBase = idBase || 'ab_work_object_workspace_popupAddView';

        super(App, idBase);
		var L = this.Label;

		var _object;
		var _view;

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
				"hGroup": (value, { vGroup }) => {
					return !value || (value !== vGroup);
				},
			},
		    elements: [
		        {
		            view: "text",
					label: labels.component.name,
					id: ids.nameInput,
					name: "name",
					labelWidth: App.config.labelWidthXXLarge,
		            placeholder: labels.component.namePlaceholder,
					required: true,
					invalidMessage: labels.common.invalidMessage.required,
					on: {
		            	'onChange': function(id) {
							$$(ids.nameInput).validate();
						},
					},
		        },
		        {
		            view: "richselect",
					label: labels.component.type,
					id: ids.typeInput,
		            name: "type",
					labelWidth: App.config.labelWidthXXLarge,
		            options:[
				        { id: ABObjectWorkspaceViewGrid.type(), value: "Grid" },
		    		    { id: ABObjectWorkspaceViewKanban.type(), value: "Kanban" },
		 			],
		            value: ABObjectWorkspaceViewGrid.type(),
		            required: true,
		            on: {
		            	'onChange': function(id) {
		                    if (id === ABObjectWorkspaceViewKanban.type()) {
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
					batch: "kanban",
					on: {
		            	'onChange': function(id) {
							$$(ids.vGroupInput).validate();
							$$(ids.hGroupInput).validate();
						},
					},
					invalidMessage: labels.common.invalidMessage.required,
		        },
		        {
		            view: "richselect",
					label: labels.component.hGroup,
					id: ids.hGroupInput,
		            placeholder: labels.component.groupingPlaceholder,
					labelWidth: App.config.labelWidthXXLarge,
		            name: "hGroup",
		            required: false,
					options: [],
					batch: "kanban",
					invalidMessage: "Cannot be the same as vertical grouping field",
					validate: (value) => {
						var vGroupValue = $$(ids.vGroupInput).getValue();
						return !vGroupValue || !value || (vGroupValue !== value);
					},
					on: {
		            	'onChange': function(id) {
							$$(ids.hGroupInput).validate();
						},
					},
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
		    width: 450,
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
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);
		}


		// our internal business logic
		var _logic = this._logic = {

			callbacks:{

				/**
				 * @function onViewAdded
				 * called when we have added a new workspace view to our Current Object.
				 *
				 * this is meant to alert our parent component to respond to the
				 * change.
				 */
				onViewAdded:function(view){},

				/**
				 * @function onViewUpdated
				 * called when we have updated a workspace view in our Current Object.
				 *
				 * this is meant to alert our parent component to respond to the
				 * change.
				 */
				onViewUpdated:function(view){},
			},

			
            objectLoad: (object) => {
				_object = object;
            },
	
			onShow: function() {
				// clear field options in the form
				console.log('View object', _view);
				$$(ids.form).clear();
				$$(ids.form).clearValidation();
				if (_view) {
					$$(ids.nameInput).setValue(_view.name);
				} 
				$$(ids.typeInput).setValue(_view ? _view.type : ABObjectWorkspaceViewGrid.type());

				const initSelect = (id, attribute, filter = f => f.key === ABFieldList.defaults().key) => {
					var options = _object.fields().filter(filter).map(({id, label}) => ({id, value: label}));
					$$(id).define('options', options);
					if (_view) {
						if (_view[attribute]) {
							$$(id).define('value', _view[attribute]);
						}
					} else if (options.length === 1) {
						$$(id).define('value', options[0].id);
					}
					$$(id).refresh();
				};

				const groupingFieldFilter = (field) => [
					ABFieldList.defaults().key, 
					ABFieldUser.defaults().key,
				].includes(field.key);

				initSelect(ids.vGroupInput, 'verticalGroupingField', groupingFieldFilter);
				initSelect(ids.hGroupInput, 'horizontalGroupingField', groupingFieldFilter);
				initSelect(ids.ownerInput, 'ownerField', f => f.key === ABFieldUser.defaults().key);
			},

            /**
             * @function show()
             *
             * Show this component.
             */
            show:function(viewObj) {
				_view = viewObj;
                $$(ids.component).show();
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
				// if ($$(ids.vGroupInput).getValue() === $$(ids.hGroupInput).getValue()) {
				// 	// TODO: Show error 
				// 	return;
				// }
				if ($$(ids.form).validate()) {
					// save the new/updated view
					var view = {
						name: $$(ids.nameInput).getValue(),
						type: $$(ids.typeInput).getValue(),
						verticalGroupingField: $$(ids.vGroupInput).getValue() || null,
						horizontalGroupingField: $$(ids.hGroupInput).getValue() || null,
						ownerField: $$(ids.ownerInput).getValue() || null,
					};
					var viewObj = _view ? _object.updateView(_view.id, view) : _object.addView(view);
					if (_view) {
						this.callbacks.onViewUpdated(viewObj);
					} else {
						this.callbacks.onViewAdded(viewObj);
					}
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
