
/*
 * ab_work_interface_workspace_details_properties
 *
 * Display the properties available for the current view.
 *
 */
import ABViewManager from "../classes/ABViewManager"

export default class AB_Work_Interface_Workspace_Details_Properties extends OP.Component {
    
    constructor(App) {
        super(App, 'ab_work_interface_workspace_details_properties');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                properties: L('ab.interface.properties', "*Properties"),
            }
        };
        
        
        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique('component'),
            
            editors:this.unique('editors'),
            form:this.unique('propertyList')
        };
        
        
        // webix UI definition:
        this.ui = {
            id: ids.component,
            scroll: true,
            rows:[
                {
                    view:'label',
                    align: "left",
                    label:labels.component.properties
                },
                {
                    view:'multiview',
                    id:ids.editors,
                    rows:[
                        {id:'delme', view:'label',  label:'delme'}
                    ]
                },
                {
                    maxHeight: App.config.xxxLargeSpacer,
                    hidden: App.config.hideMobile
                }
            ]
        };
        
        var CurrentView = null;
        var _editorsByType = {};
        
        // setting up UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);

            var newEditorList = {
                view:'multiview',
                id:ids.editors,
                rows:[
                ]
            }

            // Load in ALL the property editors for our known Views:
            var allViews = ABViewManager.allViews();
            allViews.forEach((view)=>{

                var propertyComponent = view.propertyEditorComponent(App);

                var key = view.defaults().key;
                _editorsByType[key] = propertyComponent;

                newEditorList.rows.push(propertyComponent.ui);

            })


            // now remove the 'del_me' definition editor placeholder.
            webix.ui(newEditorList, $$(ids.editors));
            
        };


        // internal business logic 
        var _logic = this.logic = {
            
            // /**
            //  * @function formBusy
            //  *
            //  * Show the progress indicator to indicate a Form operation is in 
            //  * progress.
            //  */
            // formBusy: function() {
    
            //  $$(ids.form).showProgress({ type: 'icon' });
            // },
            
            
            // /**
            //  * @function formReady()
            //  *
            //  * remove the busy indicator from the form.
            //  */
            // formReady: function() {
            //  $$(ids.form).hideProgress();
            // },
            
            
            /**
             * @function show()
             *
             * Show this component.
             */
            show: function() {
                $$(ids.component).show();
            },


            /* 
             * @method viewLoad
             * A new View has been selected for editing, so update
             * our interface with the details for this View.
             * @param {ABView} view  current view instance.
             */
            viewLoad: function(view) {
                CurrentView = view;

                for(var e in _editorsByType) {

                    if (e == view.key) {
                        _editorsByType[e].populate(view);
                        _editorsByType[e].show(false, false);
                    } else {
                        _editorsByType[e].hide();
                    }
                }

            },
        };
        
        
        // Expose any globally accessible Actions:
        this.actions({
            
            /**
             * @function populateApplicationForm()
             *
             * Initialze the Form with the values from the provided 
             * ABApplication.
             *
             * If no ABApplication is provided, then show an empty form. 
             * (create operation)
             *
             * @param {ABApplication} Application
             *      [optional] The current ABApplication we are working with.
             */
            // populateApplicationForm: function(Application){
                
            // 	_logic.formReset();
            // 	if (Application) {
            // 		// populate Form here:
            // 		_logic.formPopulate(Application);
            // 	}
            // 	_logic.permissionPopulate(Application);
            // 	_logic.show();
            // }
            
        });
        
        
        // Interface methods for parent component:
        this.show = _logic.show;
        this.viewLoad = _logic.viewLoad;
        
    }
}
