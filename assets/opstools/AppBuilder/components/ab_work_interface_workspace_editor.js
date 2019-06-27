
/*
 * ab_work_interface_workspace_editor
 *
 * Display the form for creating a new Application.
 *
 */

import ABComponentMenu from "./ab_work_interface_workspace_editor_components"
import ABEditorLayout from "./ab_work_interface_workspace_editor_layout"
import ABEditorData from "./ab_work_interface_workspace_editor_data"

export default class AB_Work_Interface_Workspace_Editor extends OP.Component {
    
    constructor(App) {
        super(App, 'ab_work_interface_workspace_editor');
        var L = this.Label;
        
        var labels = {
            common: App.labels,
            component: {

                editorTipText: L('ab.interface.editorTipText', '*Check "Preview" to see what your layout will look like, Click "Add Widget" to add new items to the page.'),
                editorTipTitle: L('ab.interface.editorTipTitle', '*Tip'),
                viewModeLayout: L('ab.interface.viewModeLayout', '*Layout'),
                viewModeData: L('ab.interface.viewModeData', '*Data'),
                viewModePreview: L('ab.interface.viewModePreview', '*Preview'),
                editorPlaceholder: L('ab.interface.editorPlaceholder', '*Drag and drop components to build interface.'),

                newDataSource: L('ab.interface.newDataSource', '*New Data Source')

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
            toolbarNewDataCollection: this.unique('toolbarNewDataCollection'),
            
            layoutView: this.unique('layoutView'),
            dataView: this.unique('dataView'),

            noContent: this.unique('noContent'),
            editArea: this.unique('editArea')
        };

        var ComponentMenu = new ABComponentMenu(App);
        var EditorLayout = new ABEditorLayout(App);
        var EditorData = new ABEditorData(App);
        
        
        // webix UI definition:
        this.ui = {
            view: 'layout',
            id: ids.component,
            borderless: false,
            rows: [
                {
                    view: 'toolbar',
                    id: ids.toolbar,
                    css: 'ab-data-toolbar webix_dark',
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
                            label:'<span class="webix_icon fa fa-arrow-left"></span>',
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
                                    _logic.pageMap(id);
                                }
                            }
                        },
                        // {
                        //     view:"segmented", 
                        //     value:ids.layoutView, 
                        //     selected: ids.layoutView,
                        //     options:[
                        //         {
                        //             id:ids.layoutView,
                        //             value:L("ab.component.page.layout", "*Layout")
                        //         }, 
                        //         {
                        //             id:ids.dataView,
                        //             value:L("ab.component.page.datacollections", "*Data Collections")
                        //         }
                        //     ],
                        //     on: {
                        //         "onAfterTabClick": function(id, e){
                        //             console.log(id);
                        //             if (id == ids.layoutView) {
                        //                 setTimeout(function() {
                        //                     App.actions.interfaceViewPartChange('layout', 'data')
                        //                 }, 0);
                        //             } else {
                        //                 setTimeout(function() {
                        //                     App.actions.interfaceViewPartChange('data', 'layout')
                        //                 }, 0);
                        //             }
                        //         }
                        //     }
                        // },
                        {
                            view: "icon", 
                            icon: "fa fa-info-circle",
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
                    css: "gray",
                    cols: [
                        // {
                        //     view: "segmented",
                        //     id: ids.toolbarViewPage,
                        //     css: "ab-view-chooser",
                        //     options: [
                        //         { id: "layout", value: labels.component.viewModeLayout },
                        //         { id: "data", value: labels.component.viewModeData }
                        //     ],
                        //     inputWidth: 200,
                        //     align: "left",
                        //     on: {
                        //         onChange: function (newValue, oldValue) {
                        //             _logic.viewPartChange(newValue, oldValue);
                        //         }
                        //     }
                        // },
                        {
                            view: "checkbox",
                            id: ids.toolbarViewMode,
                            labelRight: labels.component.viewModePreview,
                            labelWidth: 0,
                            width: 85,
                            on: {
                                onChange: function (newValue, oldValue) {
                                    _logic.viewModeChange(newValue, oldValue);
                                }
                            }
                        },
                        {},
                        {
                            id: ids.toolbarNewDataCollection,
                            view: "button",
                            type: "iconButton", 
                            icon: "fa fa-plus",
                            label: labels.component.newDataSource,
                            align: "right",
                            autowidth: true,
                            hidden: true,
                            on: {
                                onItemClick: function(id, e) {
                                    _logic.newDataCollection();
                                }
                            }
                        },
                        ComponentMenu.ui
                    ]
                },
                // {
                //     id: ids.noContent,
                //     view: 'label',
                //     align: 'center',
                //     label: labels.component.editorPlaceholder
                // },
                {
                    view: 'multiview',
                    fitBiggest: true,
                    id: ids.editArea,
                    cols: [
                        EditorLayout.ui,
                        EditorData.ui
                    ]
                }
            ],
            on: {
                onViewResize: function() {
                    _logic.onViewResize();
                }
            }
        };
        

        var CurrentView = null;
        var CurrentViewPart = 'layout';
        var CurrentViewMode = 0; // preview mode by default
        var PreviousViews = [];

        // setting up UI
        this.init = function() {
            // webix.extend($$(ids.form), webix.ProgressBar);

//// TODO: save the last CurrentViewMode in the workspace data and use that here:
            $$(ids.toolbarViewMode).setValue(CurrentViewMode);

            EditorLayout.init();

            ComponentMenu.init({
                onAddingWidget: () => {

                    // show loading cursor
                    EditorLayout.busy();

                },
                onAddWidget: () => {

                    // refresh editor page when a widget is added
                    _logic.viewLoad(CurrentView);

                    // hide loading cursor
                    EditorLayout.ready();

                }
            });
        };
        
        
        // internal business logic 
        var _logic = this.logic = {
            

            buttonBack:function() {
                if (PreviousViews.length > 0) {
                    var view = PreviousViews.pop();

                    // reset current view so it doesn't get added.
                    CurrentView = null; 

                    // reset view part to 'layout'
                    CurrentViewPart = 'layout';

                    App.actions.populateInterfaceWorkspace(view);
                }
                // Switch from 'data' to 'layout' mode
                else if (CurrentViewPart == 'data') {

                    // reset view part to 'layout'
                    CurrentViewPart = 'layout';

                    App.actions.populateInterfaceWorkspace(CurrentView);
                }
            },

            pageMap: function(pageId) {

                var clickedView = $$(ids.toolbarMap).getItem(pageId);

                // reset view part to 'layout'
                CurrentViewPart = 'layout';

                App.actions.populateInterfaceWorkspace(clickedView);

            },

            // buttonCancel:function() {

            // },

            // buttonSave: function() {

            // },
            
            
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
                    if (view && view.id != CurrentView.id) {
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

                // 
                // if (CurrentViewPart == 'data' &&
                //     (CurrentView.isRoot() || 
                //     CurrentView instanceof ABViewDataCollection)) {

                //     _logic.showDataPart();
                //     EditorData.viewLoad(view);
                // }
                // else {

                _logic.showLayoutPart();
                EditorLayout.viewLoad(view);
                ComponentMenu.viewLoad(view);
                // }

                _logic.onViewResize();

            },

            viewPartChange: function(newV, oldV) {
                if (newV == oldV) return;

                CurrentViewPart = newV;

                // data
                if (CurrentViewPart == 'data') {
                    _logic.showDataPart();
                }
                // layout
                else {
                    _logic.showLayoutPart();
                }

                App.actions.populateInterfaceWorkspace(CurrentView);

            },

            showDataPart: function() {

                EditorData.show();
                
                _logic.hideLayoutButtons();
                _logic.showNewDataCollection();
                
            },

            showLayoutPart: function() {

                // Change view part to 'layout'
                CurrentViewPart = 'layout';

                EditorLayout.show();
                _logic.showLayoutButtons();
                _logic.hideNewDataCollection();

            },

            viewModeChange: function(newV, oldV) {
                if (newV == oldV) return;

                if (newV == 1) {
                    newV = "preview";
                } else {
                    newV = "block";
                }
                CurrentViewMode = newV;

                // pass view mode to the 'layout' view
                EditorLayout.viewModeChange(CurrentViewMode);

                if (CurrentView) {
                    this.viewLoad(CurrentView);
                }

            },

            viewUpdate: function () {
                _logic.viewLoad(CurrentView);
            },

            newDataCollection: function() {
                EditorData.newDataCollection();
            },

            onViewResize: function() {
                $$(ids.editArea).adjust();
                $$(ids.editArea).resizeChildren();
            },

            showLayoutButtons: function() {
                $$(ids.toolbarViewMode).show();
                ComponentMenu.show();
            },

            hideLayoutButtons: function() {
                $$(ids.toolbarViewMode).hide();
                ComponentMenu.hide();
            },

            showNewDataCollection: function() {
                $$(ids.toolbarNewDataCollection).show();
            },

            hideNewDataCollection: function() {
                $$(ids.toolbarNewDataCollection).hide();
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

            interfaceViewPartChange: _logic.viewPartChange

        });
        
        
        // Interface methods for parent component:
        this.show = _logic.show;
        this.viewLoad = _logic.viewLoad;

    }
}
