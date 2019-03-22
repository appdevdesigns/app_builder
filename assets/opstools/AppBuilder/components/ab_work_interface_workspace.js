
/*
 * ab_work_interface_workspace
 *
 * Display the form for creating a new Application.
 *
 */

import ABWorkspaceEditor from "./ab_work_interface_workspace_editor"
import ABWorkspaceDetails from "./ab_work_interface_workspace_details"

import ABViewPage from "../classes/views/ABViewPage"

export default class AB_Work_Interface_Workspace extends OP.Component {
    
    constructor(App) {
        super(App, 'ab_work_interface_workspace');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {
                // formHeader: L('ab.application.form.header', "*Application Info"),
                selectPage: L('ab.interface.selectPage', "*Select a page to edit"),
                newPage: L('ab.inferface.newPage', "*Add a new page")
            }
        };
        
        
        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique('component'),

            noSelection: this.unique('nada'),

            selectedView: this.unique('selectedView'),

            
        };

        
        var ColumnEditor = new ABWorkspaceEditor(App);
        var ColumnDetails = new ABWorkspaceDetails(App);

        
        // webix UI definition:
        this.ui = {
            view:'multiview',
            id: ids.component,
            scroll: true,
            rows: [
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
                            height: 200,
                            label: "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-file-text-o'></div>"
                        },
                        {
                            view:'label',
                            align: "center",
                            label:labels.component.selectPage
                        },
                        {
                            cols: [
                                {},
                                {
                                    view: "button",
                                    label: labels.component.newPage,
                                    type: "form",
                                    autowidth: true,
                                    click: function() {
                                        App.actions.clickNewView();
                                    }
                                },
                                {}
                            ]
                        },
                        {
                            maxHeight: App.config.xxxLargeSpacer,
                            hidden: App.config.hideMobile
                        }
                    ]
                },
                {
                    id: ids.selectedView,
                    cols: [
                        ColumnEditor.ui,
                        { view: "resizer", css: "bg_gray", width: 10},
                        ColumnDetails.ui
                    ]
                }
            ]
        };
        
        // setting up UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);
            $$(ids.noSelection).show();
            $$(ids.selectedView).hide();

            ColumnEditor.init();
            ColumnDetails.init();

            
        };
        


        var CurrentView = null;     // The current View in the Editor.

        
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
            }
        };

        
        // Expose any globally accessible Actions:
        this.actions({
            

            /**
             * @function clearInterfaceWorkspace()
             *
             * Clear the interface workspace.
             */
            clearInterfaceWorkspace:function(){

                // NOTE: to clear a visual glitch when multiple views are updating
                // at one time ... stop the animation on this one:
                $$(ids.noSelection).show(false, false);
                // $$(ids.selectedView).hide();
            },


            /**
             * @function populateInterfaceWorkspace()
             *
             * Initialize the Interface Workspace with the provided ABView.
             *
             * @param {ABView} view     current ABView instance we are working with.
             */
            populateInterfaceWorkspace: function(view) {
                // $$(ids.noSelection).hide();
                $$(ids.selectedView).show();

                CurrentView = view;

                ColumnEditor.viewLoad(view);
                ColumnDetails.viewLoad(view);

                $$(ids.component).resize();

                // select a page in interface list
                if (view instanceof ABViewPage) {
                    App.actions.selectInterfacePage(view);
                }

            }
            
        });
        
        
        // Interface methods for parent component:
        this.show = _logic.show;
        
    }
}
