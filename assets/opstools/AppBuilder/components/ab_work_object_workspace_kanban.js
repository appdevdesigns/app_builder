
/*
 * ab_work_object_workspace_kanban
 *
 * Manage the Object Workspace KanBan area.
 *
 */



export default class ABWorkObjectKanBan extends OP.Component {
    
    /**
     * 
     * @param {*} App 
     * @param {*} idBase 
     */

    constructor(App, idBase) {

        idBase = idBase || 'ab_work_object_workspace_kanban';
        super(App, idBase);
                
        var L = this.Label;
        var labels = {
            common: App.labels,
            component: {

                confirmDeleteRowTitle : L('ab.object.deleteRow.title', "*Delete data"),

            }
        };

    	// internal list of Webix IDs to reference our UI components.
    	var ids = {
    		component: this.unique(idBase + '_kanban'),
    	}


    	// Our webix UI definition:
    	this.ui = {
    		view: "label",
    		id: ids.component,
            label:" My KanBan View Here",
            
        };



    	// Our init() function for setting up our UI
    	this.init = (options) => {

			
    	}



    	var CurrentObject = null;		// current ABObject being displayed


    	// our internal business logic
    	var _logic = this._logic = {


            /**
             * @function hide()
             *
             * hide this component.
             */
            hide:function() {
                $$(ids.component).hide();
            },


    		/**
    		 * @function show()
    		 *
    		 * Show this component.
    		 */
    		show:function() {

    			$$(ids.component).show();
    		},
            
          
    	}



        // 
        // Define our external interface methods:
        // 

        this.hide = _logic.hide;
        this.show = _logic.show;

    }

}


