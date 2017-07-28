/*
 * ab_work_object_list_newObject_import
 *
 * Display the form for importing an existing object into the application.
 *
 */

import ABObject from '../classes/ABObject.js';

export default class AB_Work_Object_List_NewObject_Import extends OP.Component {

    constructor(App) {
        super(App, 'ab_work_object_list_newObject_import');
        var L = this.Label;
        var currentApp = null;

        var labels = {
            common: App.labels,
            component: {
                columns: L('ab.object.columns', "Columns"),
                existing: L('ab.object.existing', "Existing"),
            }
        };

        // internal list of Webix IDs to reference UI components.
        var ids = {
            component: this.unique('component'),
            form: this.unique('import'),
            
            filter: this.unique('filter'),
            modelList: this.unique('modelList'),
            columnList: this.unique('columnList'),
            
            buttonSave: this.unique('save'),
            buttonCancel: this.unique('cancel')
        };


        /**
         * @param {object} options
         * @param {function} options.onBusyStart
         * @param {function} options.onBusyEnd
         * @param {function} options.onDone
         * @param {function} options.onCancel
         */
        this.init = (options) => {
            // webix.extend($$(ids.form), webix.ProgressBar);
            
            // load callbacks.
            for(var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }
        };



        // internal business logic 
        var _logic = this._logic = {

            callbacks: {
                onCancel: function() { console.warn('NO onCancel()!') },
                //onSave  : function(values, cb) { console.warn('NO onSave()!') },
                onBusyStart: null,
                onBusyEnd: null,
                onDone: null
            },
            
            
            busyStart: function() {
                if (_logic.callbacks.onBusyStart) {
                    _logic.callbacks.onBusyStart();
                }
            },
            
            busyEnd: function() {
                if (_logic.callbacks.onBusyEnd) {
                    _logic.callbacks.onBusyEnd();
                }
            },
            
            
            filter: function() {
                // `this` should be from the Webix event
                var filterText = this.getValue();
                $$(ids.modelList).filter('#id#', filterText);
            },
            
            
            initModelList: function(app) {
                currentApp = app;
                _logic.formClear();
                _logic.busyStart();
                OP.Comm.Service.get({ 
                    url: '/app_builder/application/' + app.id + '/findModels'
                })
                .then((list) => {
                    // Convert server results into Webix list format
                    var listData = [];
                    for (var i=0; i<list.length; i++) {
                        listData.push({
                            id: list[i].objectId || list[i].modelName,
                            modelName: list[i].modelName
                        });
                    }
                    $$(ids.modelList).parse(listData, 'json');
                    _logic.busyEnd();
                })
                .catch((err) => {
                    _logic.busyEnd();
                });
            },
            
            
            modelSelect: function(selectedIDs) {
                $$(ids.columnList).clearAll();
                
                if (selectedIDs && selectedIDs.length > 0) {
                    var ignore = ['id', 'createdAt', 'updatedAt'];
                    _logic.busyStart();
                    
                    var modelItem = $$(ids.modelList).data.find({ 
                        id: selectedIDs[0] 
                    })[0];
                    
                    // Fetch model's columns from server
                    OP.Comm.Service.get({
                        url: '/app_builder/application/findModelAttributes',
                        data: {
                            model: modelItem.modelName
                        }
                    })
                    .then((cols) => {
                        var colNames = [];
                        
                        // Parse results and update column list
                        for (var colName in cols) {
                            var col = cols[colName];
                            
                            // Skip these columns
                            if (ignore.indexOf(colName) >= 0) continue;
                            if (col.model) continue;
                            if (col.collection) continue;
                            
                            colNames.push({
                                include: col.supported,
                                id: colName,
                                label: colName,
                                disabled: !col.supported
                            });
                        }
                        
                        $$(ids.columnList).parse(colNames);
                        _logic.busyEnd();
                    })
                    .catch((err) => {
                        _logic.busyEnd();
                    });
                }
            },
            
            cancel: function() {
                _logic.formClear();
                _logic.callbacks.onCancel();
            },


            formClear: function() {
                // Filter section
                $$(ids.form).clearValidation();
                $$(ids.form).clear();
                // Lists
                $$(ids.modelList).clearAll();
                $$(ids.columnList).clearAll();
            },


            /**
             * @function hide()
             *
             * hide this component.
             */
            hide: function() {
                $$(ids.component).hide();
            },


            /**
             * @function save
             *
             * Send model import request to the server
             */
            save: function() {
                var saveButton = $$(ids.buttonSave);
                var selectedModel = $$(ids.modelList).getSelectedItem();
                if (!selectedModel) return false;
                
                saveButton.disable();
                _logic.busyStart();
                
                var columns = $$(ids.columnList)
                        .data
                        .find({ include: true })
                        .map((col) => {
                            return {
                                name: col.id,
                                label: col.label
                            };
                        });
                var objectID = null;
                if (typeof selectedModel.id == 'number') {
                    objectID = selectedModel.id;
                }
                
                OP.Comm.Service.post({
                    url: '/app_builder/application/' + currentApp.id + '/importModel',
                    data: {
                        objectID,
                        columns,
                        model: selectedModel.modelName
                    }
                })
                .then((objValues) => {
                    saveButton.enable();
                    _logic.busyEnd();
                    
                    var object = new ABObject(currentApp, objValues);
                    _logic.callbacks.onDone(object);
                })
                .catch((err) => {
                    console.log('ERROR:', err);
                    saveButton.enable();
                    _logic.busyEnd();
                });
                
            },


            /**
             * @function show()
             *
             * Show this component.
             */
            show: function() {
                if ($$(ids.component))
                    $$(ids.component).show();
            }
        };
        
        
        // webix UI definition
        // (it references _logic functions defined above)
        this.ui = {
            id: ids.component,
            header: labels.component.existing,
            body: {
                view: "form",
                id: ids.form,
                width: 400,
                elements: [
                    
                    // Filter
                    {
                        cols: [
                            { view: 'icon', icon: 'filter', align: 'left' },
                            {
                                view: 'text',
                                id: ids.filter,
                                on: {
                                    onTimedKeyPress: _logic.filter
                                }
                            }
                        ]
                    },
                    
                    // Model list
                    {
                        view: 'list',
                        id: ids.modelList,
                        select: true,
                        height: 250,
                        minHeight: 250,
                        maxHeight: 250,
                        data: [],
                        template: '<div>#modelName#</div>',
                        on: {
                            onSelectChange: _logic.modelSelect
                        },
                    },
                    
                    // Columns list
                    {
                        view: 'label',
                        label: `<b>${labels.component.columns}</b>`,
                        height: 20
                    },
                    {
                        view: 'ab_custom_activelist',
                        id: ids.columnList,
                        datatype: 'json',
                        multiselect: false,
                        select: false,
                        height: 200,
                        minHeight: 200,
                        maxHeight: 200,
                        type: {
                            height: 40
                        },
                        activeContent: {
                            include: {
                                view: 'checkbox',
                                width: 30
                            },
                            label: {
                                view: 'text',
                                width: 280
                            }
                        },
                        template: (obj, common) => {
                            // For disabled columns, display strikethrough text
                            if (obj.disabled) {
                                obj.include = false;
                                return `
                                    <span style="float:left; margin:8px 15px 7px 4px;">
                                        <span class="glyphicon glyphicon-remove">
                                        </span>
                                    </span>
                                    <span style="float:left; pading-left:1em; text-decoration:line-through;">
                                        ${obj.label}
                                    </span>
                                `;
                            }
                            // For normal columns, display checkbox and text
                            else {
                                return `
                                    <span class="float-left">${common.include(obj, common)}</span>
                                    <span class="float-left">${common.label(obj, common)}</span>
                                `;
                            }
                        }
                    },
                    
                    // Import & Cancel buttons
                    {
                        margin: 5,
                        cols: [
                            { fillspace: true },
                            {
                                view: "button",
                                id: ids.buttonCancel,
                                value: labels.common.cancel, 
                                css: "ab-cancel-button",
                                autowidth: true,
                                click: _logic.cancel
                            },
                            {
                                view: "button",
                                id: ids.buttonSave,
                                value: labels.common.import,
                                autowidth: true, 
                                type: "form",
                                click: _logic.save
                            }
                        ]
                    }
                ]
            }
        };


        // Expose any globally accessible Actions:
        this.actions({

        });



        // 
        // Define external interface methods:
        // 

    }

}