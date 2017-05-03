
/*
 * ab_work_object_workspace_popupNewDataField
 *
 * Manage the Add New Data Field popup.
 *
 */

import ABApplication from "../classes/ABApplication"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {

		showAll: L('ab.visible_fields.showAll', "*Show All"),
		hideAll: L('ab.visible_fields.hideAll', "*Hide All"),
	}
}


var idBase = 'ab_work_object_workspace_popupHideFields';
OP.Component.extend(idBase, function(App) {

	labels.common = App.labels;


	// internal list of Webix IDs to reference our UI components.
	
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
        body: {
            rows: [
                {
                    cols: [
                        {
                            view: 'button',
                            value: labels.component.showAll,
                            click: function () {
_logic.showAll();
                                // var visible_popup = this.getTopParentView();

                                // visible_popup.dataTable.eachColumn(function (cId) {
                                //     visible_popup.dataTable.showColumn(cId);
                                // }, true);

                                // visible_popup.callChangeEvent();
                            }
                        },
                        {
                            view: 'button',
                            value: labels.component.hideAll,
                            click: function () {
_logic.hideAll()
                                // var visible_popup = this.getTopParentView(),
                                //     columns = [];

                                // visible_popup.dataTable.config.columns.forEach(function (c) {
                                //     if (c.id != 'appbuilder_trash')
                                //         columns.push(c.id);
                                // });

                                // columns.forEach(function (c) {
                                //     visible_popup.dataTable.hideColumn(c);
                                // });

                                // visible_popup.callChangeEvent();
                            }
                        }
                    ]
                },
                {
                    view: 'list',
                    id: ids.list,
                    autoheight: true,
                    select: false,
                    template: '<span style="min-width: 18px; display: inline-block;"><i class="fa fa-circle ab-visible-field-icon"></i>&nbsp;</span> #label#',
                    on: {
                        onItemClick: function (id, e, node) {
_logic.listItemClick(id, e, node);

                            // var visible_popup = this.getTopParentView(),
                            //     item = this.getItem(id);

                            // if (visible_popup.dataTable.isColumnVisible(id))
                            //     visible_popup.dataTable.hideColumn(id);
                            // else
                            //     visible_popup.dataTable.showColumn(id);

                            // visible_popup.callChangeEvent();
                        }
                    }
                }
            ]
        },
        on: {
            onShow: function () {
                _logic.iconsReset();
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
			onChange:function(){}
		},


		listItemClick: function(id, e, node) {
			var newFields = [];
			var isHidden = CurrentObject.workspaceHiddenFields.filter((fID) => { return fID == id;}).length>0;
			if (isHidden) {
				// unhide this field

				// get remaining fields 
				newFields = CurrentObject.workspaceHiddenFields.filter((fID)=>{ return fID != id;});

				// find the icon and display it:
				_logic.iconShow(node);

			} else {
				newFields = CurrentObject.workspaceHiddenFields;
				newFields.push(id);

				_logic.iconHide(node);
			}

			// update our Object with current hidden fields
			CurrentObject.workspaceHiddenFields = newFields;
			CurrentObject.save()
			.then(function(){
				_logic.callbacks.onChange()
			})
			.catch(function(err){
console.error('!!! TODO: catch this error:', err);

			})
		},


		iconHide: function(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').style.visibility = "hidden";
			}
		}, 

		iconShow: function(node) {
			if (node) {
				node.querySelector('.ab-visible-field-icon').style.visibility = "visible";
			}
		},

		iconsReset: function() {

			var List = $$(ids.list);

			// for each item in the List
			var id = List.getFirstId();
			while(id) {

				// find it's HTML Node
				var node = List.getItemNode(id);

				// if this item is not hidden, show it.
				if (CurrentObject.workspaceHiddenFields.indexOf(id) == -1) {
					_logic.iconShow(node);
				} else {
					// else hide it
					_logic.iconHide(node);
				}

				// next item
				id = List.getNextId(id);
			}			

		},

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