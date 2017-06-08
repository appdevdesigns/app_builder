
/*
 * ab_work_interface_workspace_details_components
 *
 * Display the form for creating a new Application.
 *
 */


export default class AB_Work_Interface_Workspace_Details_Components extends OP.Component {
    
    constructor(App) {
        super(App, 'ab_work_interface_workspace_details_components');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                // formHeader: L('ab.application.form.header', "*Application Info"),
            }
        };
        
        
        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique('component'),
            
        };
        
        
        // webix UI definition:
        this.ui = {
            id: ids.component,
            scroll: true,
            rows:[
                {
                    view: 'list',
                    drag: true,
                    select: false,
                    template:function(obj, common) {
                        return _logic.template(obj, common);
                    }

                },
                {
                    maxHeight: App.config.xxxLargeSpacer,
                    hidden: App.config.hideMobile
                }
            ]
        };
        
        var CurrentView = null;

        // setting up UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);
            
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
