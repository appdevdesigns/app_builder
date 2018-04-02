
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
            tree: this.unique('tree'),

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
                    type: "space",
                    rows:[
                        {
                            cols: [
                                {
                                    rows: [
                                        { 
                                            view:"label", 
                                            label: "Manage Objects",
                                            css: "ab-query-label",
                                            height: 50
                                        },
                                        {
                                            view:"tree",
                                            id: ids.tree,
                                            css: "ab-tree",
                                            template:"{common.icon()} {common.checkbox()} #value#",
                                            data: [
                                                {id:"root", value:"Cars", open:true, data:[
                                                    { id:"1", open:true, value:"Toyota", data:[
                                                        { id:"1.1", value:"Avalon" },
                                                        { id:"1.2", value:"Corolla" },
                                                        { id:"1.3", value:"Camry" }
                                                    ]},
                                                    { id:"2", value:"Skoda", open:true, data:[
                                                        { id:"2.1", value:"Octavia" },
                                                        { id:"2.2", value:"Superb" }
                                                    ]}
                                                ]}
                                            ],
                                            on: {
                                                onItemClick: function(id, event, item) {
                                                    if (this.isChecked(id)) {
                                                        this.uncheckItem(id);
                                                    } else {
                                                        this.checkItem(id);
                                                    }
                                                },
                                                onItemCheck: function(id, value, event) {
                                                    var tree = this;
                                                    tree.blockEvent(); // prevents endless loop

                                                    var rootid = id;
                                                    if (value) {
                                                        // If check we want to check all of the parents as well
                                                        while (this.getParentId(rootid)) {
                                                            rootid = this.getParentId(rootid);
                                                            if (rootid != id)
                                                                tree.checkItem(rootid);
                                                        }                                                            
                                                    } else {
                                                        // If uncheck we want to uncheck all of the child items as well.
                                                        this.data.eachSubItem(rootid, function(item) {
                                                            if (item.id != id)
                                                                tree.uncheckItem(item.id);
                                                        });
                                                    }

                                                    tree.unblockEvent();
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    width: 10
                                },
                                {
                                    gravity:2,
                                    rows: [
                                        { 
                                            view:"label", 
                                            label: "Manage Fields", 
                                            css: "ab-query-label",
                                            height: 50
                                        },
                                        { 
                                            view:"tabview",
                                            tabMinWidth: 200,
                                            cells: [
                                                {
                                                    header: "Main Object",
                                                    body: {
                                                        type: "space",
                                                        rows: [
                                                            {
                                                                view: "select", 
                                                                label: "Join records by:",
                                                                labelWidth: 200,
                                                                placeholder: "Choose a type of table join",
                                                                options: [
                                                                    { id: 'innerjoin', value: 'Returns records that have matching values in both tables (INNER JOIN).'},
                                                                    { id: 'left', value: 'Return all records from the left table, and the matched records from the right table (LEFT JOIN).'},
                                                    				{ id: 'right', value: 'Return all records from the right table, and the matched records from the left table (RIGHT JOIN).'},
                                                    				{ id: 'fullouterjoin', value: 'Return all records when there is a match in either left or right table (FULL JOIN)'}
                                                                ]
                                                            },
                                                            {
                                                                view:"dbllist", 
                                                                list: {
                                                                    height: 300
                                                                },
                                                                labelLeft:"Available Fields",
                                                                labelRight:"Included Fields",
                                                                labelBottomLeft:"Move these fields to the right to include in data set.",
                                                                labelBottomRight:"These fields will display in your final data set.",
                                                                data:[
                                                                    {id:"1", value:"Contacts"},
                                                                    {id:"2", value:"Products"},
                                                                    {id:"3", value:"Reports"},
                                                                    {id:"4", value:"Customers"},
                                                                    {id:"5", value:"Deals"}
                                                                ]
                                                            },
                                                            { fillspace: true }
                                                        ]
                                                    }
                                                },
                                                {
                                                    header: "Connected Object",
                                                    body: {
                                                        type: "space",
                                                        rows: [
                                                            {
                                                                view: "select", 
                                                                label: "Join records by:",
                                                                labelWidth: 200,
                                                                placeholder: "Choose a type of table join",
                                                                options: [
                                                                    { id: 'innerjoin', value: 'Returns records that have matching values in both tables (INNER JOIN).'},
                                                                    { id: 'left', value: 'Return all records from the left table, and the matched records from the right table (LEFT JOIN).'},
                                                    				{ id: 'right', value: 'Return all records from the right table, and the matched records from the left table (RIGHT JOIN).'},
                                                    				{ id: 'fullouterjoin', value: 'Return all records when there is a match in either left or right table (FULL JOIN)'}
                                                                ]
                                                            },
                                                            {
                                                                view:"dbllist", 
                                                                list: {
                                                                    height: 300
                                                                },
                                                                labelLeft:"Available Fields",
                                                                labelRight:"Included Fields",
                                                                labelBottomLeft:"Move these fields to the right to include in data set.",
                                                                labelBottomRight:"These fields will display in your final data set.",
                                                                data:[
                                                                    {id:"1", value:"Contacts"},
                                                                    {id:"2", value:"Products"},
                                                                    {id:"3", value:"Reports"},
                                                                    {id:"4", value:"Customers"},
                                                                    {id:"5", value:"Deals"}
                                                                ]
                                                            },
                                                            { fillspace: true }
                                                        ]
                                                    }
                                                }
                                            ]
                                        }
                                    ]
                                }
                            ]
                        },
                        { 
                            view:"label", 
                            label: "Manage Field Order",
                            css: "ab-query-label",
                            height: 50 
                        },
                        {
                            type: "space",
                            rows: [
                                {
                                    view:"menu", 
                                    data:["Field #1", "Field #2", "Field #3", "Field #4", "Field #5", "Field #6", "Field #7", "Field #8"],
                                    drag: true,
                                    dragscroll: true
                                }
                            ]
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
