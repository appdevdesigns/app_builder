
/*
 * ab_work_query_workspace
 *
 * Manage the Query Workspace area.
 *
 */


export default class ABWorkQueryWorkspace extends OP.Component {
    
    /**
     * @param {object} ??
     */
    constructor(App) {
        super(App, 'ab_work_query_workspace');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                selectQuery: L('ab.query.selectQuery', "*Select an query to work with."),


                // formHeader: L('ab.application.form.header', "*Application Info"),
                deleteSelected: L('ab.object.toolbar.deleteRecords', "*Delete records"),
                hideFields: L('ab.object.toolbar.hideFields', "*Hide fields"),
                massUpdate: L('ab.object.toolbar.massUpdate', "*Edit records"),
                filterFields: L('ab.object.toolbar.filterFields', "*Add filters"),
                sortFields: L('ab.object.toolbar.sortFields', "*Apply sort"),
                frozenColumns: L('ab.object.toolbar.frozenColumns', "*Frozen fields"),
                defineLabel: L('ab.object.toolbar.defineLabel', "*Define label"),
                permission: L('ab.object.toolbar.permission', "*Permission"),
                addFields: L('ab.object.toolbar.addFields', "*Add field"),
                "export": L('ab.object.toolbar.export', "*Export"),
                confirmDeleteTitle : L('ab.object.delete.title', "*Delete data field"),
                confirmDeleteMessage : L('ab.object.delete.message', "*Do you want to delete <b>{0}</b>?")
            }
        };



    	// internal list of Webix IDs to reference our UI components.
    	var ids = {
    		component: this.unique('component'),

// buttonAddField: this.unique('buttonAddField'),
//       buttonDeleteSelected: this.unique('deleteSelected'),
// buttonExport: this.unique('buttonExport'),
// buttonFieldsVisible: this.unique('buttonFieldsVisible'),
// buttonFilter: this.unique('buttonFilter'),
// buttonFrozen: this.unique('buttonFrozen'),
// buttonLabel: this.unique('buttonLabel'),
//       buttonMassUpdate: this.unique('buttonMassUpdate'),
// buttonRowNew: this.unique('buttonRowNew'),
// buttonSort: this.unique('buttonSort'),

    		datatable: this.unique('datatable'),

// // Toolbar:
// toolbar: this.unique('toolbar'),

    		noSelection: this.unique('noSelection'),
    		selectedObject: this.unique('selectedObject'),

    	}


        // The DataTable that displays our object:
        // var DataTable = new ABWorkspaceDatatable(App);

        
        var view = "button";

    	// Our webix UI definition:
    	this.ui = {
    		view:'multiview',
    		id: ids.component,
    		rows:[
    			{
    				id: ids.noSelection,
    				rows:[
    					{
    						maxHeight: App.config.xxxLargeSpacer,
    						hidden: App.config.hideMobile
    					},
    					{
    						view:'label',
    						align: "center",
    						label:labels.component.selectQuery
    					},
    					{
    						maxHeight: App.config.xxxLargeSpacer,
    						hidden: App.config.hideMobile
    					}
    				]
    			},
    			{
    				id: ids.selectedObject,
                    rows:[
                        {
                            fillspace:true
                        },
                        {
                            id: ids.datatable,
                            view:'datatable',
                            columns:[],
                            data:[]
                        },
                        {
                            fillspace:true
                        }
                    ]
    
    			}
    		]
    	}




    	// Our init() function for setting up our UI
    	this.init = function() {
    		// webix.extend($$(ids.form), webix.ProgressBar);

    		$$(ids.noSelection).show();
    	}

        

        var CurrentApplication = null;
        var CurrentQuery = null;


    	// our internal business logic
    	var _logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Object Workspace with the given ABApplication.
			 *
			 * @param {ABApplication} application
			 */
			applicationLoad: (application) => {
				CurrentApplication = application;

			},

         
            /**
             * @function clearWorkspace()
             *
             * Clear the query workspace.
             */
            clearWorkspace:function(){

                // NOTE: to clear a visual glitch when multiple views are updating
                // at one time ... stop the animation on this one:
                $$(ids.noSelection).show(false, false);
            },


            /**
             * @function populateObjectWorkspace()
             *
             * Initialize the Object Workspace with the provided ABObject.
             *
             * @param {ABObject} object     current ABObject instance we are working with.
             */
            populateQueryWorkspace: function(query) {


                $$(ids.selectedObject).show();

                CurrentQuery = query;

                var DataTable = $$(ids.datatable);
                DataTable.clearAll();


                // set columns:
                var columns = query.columnHeaders(false, false);
                DataTable.refreshColumns(columns);


                // set data:
                query.model().findAll()
                .then((response)=>{
                    response.data.forEach((d)=>{
                        DataTable.add(d);
                    })
                })
                .catch((err)=>{
                    OP.Error.log('Error running Query:', {error:err, query:query});
                })

            },


    		/**
    		 * @function rowAdd()
    		 *
    		 * When our [add row] button is pressed, alert our DataTable
    		 * component to add a row.
    		 */
    		rowAdd:function() {
    			// DataTable.addRow();
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
        this._logic = _logic;



		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = this._logic.applicationLoad;
        this.clearWorkspace = this._logic.clearWorkspace;
        this.populateQueryWorkspace = this._logic.populateQueryWorkspace;

    }

}
