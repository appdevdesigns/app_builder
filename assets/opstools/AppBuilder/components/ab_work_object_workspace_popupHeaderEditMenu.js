
/*
 * ab_work_object_workspace_popupHeaderEditMenu
 *
 * Manage the Add New Data Field popup.
 *
 */

// import ABApplication from "../classes/ABApplication"
// import ABFieldManager from "../classes/ABFieldManager"


export default class ABWorkObjectPopupHeaderEditMenu extends OP.Component {

    constructor(App) {
        super(App, 'ab_work_object_workspace_popupHeaderEditMenu');
        var L = this.Label;
        
        var labels = {
            common: AB.labels,
            component: {
                hideField: L('ab.object.hideField', "*Hide field"),
                filterField: L('ab.object.filterField', "*Filter field"),
                sortField: L('ab.object.sortField', "*Sort field"),
                editField: L('ab.object.editField', "*Edit field"),
                deleteField: L('ab.object.deleteField', "*Delete field")
            }
        };
        
        var ids = {
            component: this.unique('_component'),
            list: this.unique('_list')
        };

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
        
        // internal business logic
        var _logic = this.logic = {
            callbacks: {
                /**
                 * @function onClick
                 * report back which menu action was clicked.
                 * possible actions: 
                 *      [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
                 */
                onClick: function(action) {  }
            },
    
            hide: function() {
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
                // check if object is imported, if so, then switch the 
                // shown fields to the imported menu:
    
                var listItems = menuItems['default'];
                var List = $$(ids.list);
                List.clearAll();
                List.parse(listItems);
            },
    
            /**
             * @function onItemClick
             * when an entry in our popup menu is selected, make sure our
             * parent component is alerted to the action requested.
             *
             * possible return action values: 
             *      [ 'hide', 'filter', 'sort', 'edit', 'delete' ]
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
        };
    
        
        // webix UI definition:
        this.ui = {
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
        };
        
        
        var CurrentObject = null;
        
        
        // setting up UI
        this.init = function(options) {
            // register callbacks:
            for(var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }
        }
        
            
        // Expose any globally accessible Actions:
        this.actions({
            // populateObjectPopupAddDataField: function(object) {
            // 	_currentObject = object;
            // }
        });
        
        this.hide = _logic.hide;
        this.show = _logic.show;
        this.objectLoad = _logic.objectLoad;
        
    }
}
