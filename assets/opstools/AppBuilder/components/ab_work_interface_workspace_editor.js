
/*
 * ab_work_interface_workspace_editor
 *
 * Display the form for creating a new Application.
 *
 */


export default class AB_Work_Interface_Workspace_Editor extends OP.Component {
    
    constructor(App) {
        super(App, 'ab_work_interface_workspace_editor');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {

                editorTipText: L('ab.interface.editorTipText', '*Choose Layout or Preview mode. Drag and drop componenents to reorder.'),
                editorTipTitle: L('ab.interface.editorTipTitle', '*Tip'),
                viewModeLayout: L('ab.interface.viewModeLayout', '*Layout'),
                viewModeData: L('ab.interface.viewModeData', '*Data'),
                viewModePreview: L('ab.interface.viewModePreview', '*Preview'),
                editorPlaceholder: L('ab.interface.editorPlaceholder', '*Drag and drop components to build interface.')

                // formHeader: L('ab.application.form.header', "*Application Info"),
            }
        };
        
        
        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique('component'),
            
            toolbar: this.unique('toolbar'),
            toolbarMap: this.unique('toolbarMap'),
            toolbarViewMode: this.unique('toolbarViewMode'),
            toolbarViewPage: this.unique('toolbarViewPage'),

            editArea: this.unique('editArea'),
            noContent: this.unique('noContent')
        };
        
        
        // webix UI definition:
        this.ui = {
            view: 'layout',
            id: ids.component,
            borderless: false,
            rows: [
                {
                    view: 'toolbar',
                    id: ids.toolbar,
                    css: 'ab-data-toolbar',
                    cols: [
                        // {
                        //     view: 'label',
                        //     id: ids.toolbarMap,
                        //     label: '[view map]'
                        // },
                        {
                            view:'button',
                            type:'htmlbutton',
                            css:'marginLeft10',
                            label:'<span class="webix_icon fa-arrow-left"></span>',
                            autowidth: true,
                            click:function(){
                                _logic.buttonBack();
                            }
                        },
                        {
                            view: 'list',
                            layout: 'x',
                            id: ids.toolbarMap,
                            borderless: true,
                            multiselect: false,
                            select: false,
                            scroll: false,
                            padding: 0,
                            css: 'ab_breadcrumb',
                            template: function(item) {
                                return '<span class="fa fa-chevron-right" aria-hidden="true"></span> ' + 
                                    // '<i class="fa fa-#icon#" aria-hidden="true"></i> '.replace('#icon#', item.icon) +
                                    item.label;
                            },
                            on: {
                                onItemClick: function(id, e, node){
                                    var clickedView = this.getItem(id);

                                    App.actions.populateInterfaceWorkspace(clickedView);
                                }
                            }
                        },
                        {
                            view: "icon", 
                            icon: "info-circle",
                            tooltip: labels.component.editorTipText,
                            on: {
                                onItemClick: function() {
                                    _logic.infoAlert();
                                }
                            }
                        }
                        // {
                        //     view: 'button',
                        //     id: ids.toolbarButtonSave,
                        //     label: labels.common.save,
                        //     width: 100,
                        //     click: function () {
                        //         _logic.buttonSave();
                        //     }
                        // },
                        // {
                        //     view: 'button',
                        //     id: ids.toolbarButtonCancel,
                        //     label: labels.common.cancel,
                        //     width: 100,
                        //     click: function () {
                        //         _logic.buttonCancel();
                        //     }
                        // }
                    ]
                },
                // {
                //     maxHeight: App.config.xSmallSpacer,
                //     hidden: App.config.hideMobile
                // },
                {
                    view: "layout",
                    type: "space",
                    cols: [
                        {
                            view: "segmented",
                            id: ids.toolbarViewPage,
                            css: "ab-view-chooser",
                            options: [
                                { id: "layout", value: labels.component.viewModeLayout },
                                { id: "data", value: labels.component.viewModeData }
                            ],
                            inputWidth: 200,
                            align: "left",
                            on: {
                                onChange: function (newValue, oldValue) {
                                    // _logic.viewModeChange(newValue, oldValue);
                                }
                            }
                        },
                        {
                            view: "checkbox",
                            id: ids.toolbarViewMode,
                            labelRight: labels.component.viewModePreview,
                            labelWidth: App.config.labelWidthCheckbox,
                            align: "right",
                            autowidth: true,
                            on: {
                                onChange: function (newValue, oldValue) {
                                    _logic.viewModeChange(newValue, oldValue);
                                }
                            }
                        }                        
                    ]
                },
                // {
                //     id: ids.noContent,
                //     view: 'label',
                //     align: 'center',
                //     label: labels.component.editorPlaceholder
                // },
                {
                    // view:'template',
                    view: 'layout',
                    id:ids.editArea,
                    rows: []
                    // template:'[edit Area]'
                }
            ],
            on: {
                onViewResize: function() {
                    _logic.onViewResize();
                }
            }
        };
        

        var CurrentView = null;
        var CurrentViewMode = 1; // preview mode by default
        var PreviousViews = [];

        // setting up UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);

//// TODO: save the last CurrentViewMode in the workspace data and use that here:
            $$(ids.toolbarViewMode).setValue(CurrentViewMode);
        };
        
        
        // internal business logic 
        var _logic = this.logic = {
            

            buttonBack:function() {
                if (PreviousViews.length > 0) {
                    var view = PreviousViews.pop();

                    // reset current view so it doesn't get added.
                    CurrentView = null; 

                    App.actions.populateInterfaceWorkspace(view);
                }
            },

            buttonCancel:function() {

            },

            buttonSave: function() {

            },
            
            
            infoAlert: function() {
                OP.Dialog.Alert({
                    title: labels.component.editorTipTitle,
                    text: labels.component.editorTipText
                });
            },            
            
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
                
                // store the current view to return here on [back] button.
                if (CurrentView) {

                    // don't keep storing the same view over and over:
                    if (view.id != CurrentView.id) {
                        PreviousViews.push(CurrentView);

// TODO: make this a setting?
                        // limit the number of views we store in our list.
                        // ## lets not be memory hogs.
                        if (PreviousViews.length > 50) {
                            PreviousViews.shift();
                        }
                    }
                }
                

                CurrentView = view;

                // try to make sure we don't continually add up listeners.
                CurrentView.removeListener('properties.updated', _logic.viewUpdate)
                .once('properties.updated', _logic.viewUpdate)

                // update the toolbar navigation map
                // var mapLabel = view.mapLabel();
                // $$(ids.toolbarMap).define('label', mapLabel);
                $$(ids.toolbarMap).clearAll();
                $$(ids.toolbarMap).parse(view.allParents());
                $$(ids.toolbarMap).refresh();

                // clear edit area
                $$(ids.editArea).getChildViews().forEach((childView) => {
                    $$(ids.editArea).removeView(childView);
                });

                // load the component's editor in our editArea
                var editorComponent = view.editorComponent(App, CurrentViewMode);
                // editorComponent.ui.id = ids.editArea;
                // webix.ui(editorComponent.ui, $$(ids.editArea));
                $$(ids.editArea).addView(editorComponent.ui);
                editorComponent.init();

            },

            viewModeChange: function(newV, oldV) {
                if (newV == oldV) return;

                if (newV == 1) {
                    newV = "preview";
                } else {
                    newV = "block";
                }
                CurrentViewMode = newV;
                if (CurrentView) {
                    this.viewLoad(CurrentView);  
                }
                  
            },

            viewUpdate: function () {
                _logic.viewLoad(CurrentView);
            },

            onViewResize: function() {
                $$(ids.editArea).resizeChildren();
            }
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
