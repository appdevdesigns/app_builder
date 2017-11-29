/*
 * ab_work_object_list_newObject_import
 *
 * Display the form for importing an existing object into the application.
 *
 */

import ABObject from '../classes/ABObject.js';
import ABFieldManager from '../classes/ABFieldManager.js';

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
            objectList: this.unique('objectList'),
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
            for (var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }
        };



        // internal business logic 
        var _logic = this._logic = {

            callbacks: {
                onCancel: function () { console.warn('NO onCancel()!') },
                //onSave  : function(values, cb) { console.warn('NO onSave()!') },
                onBusyStart: null,
                onBusyEnd: null,
                onDone: null
            },

            onShow: (app) => {

                currentApp = app;
                _logic.formClear();
                _logic.busyStart();
                OP.Comm.Service.get({
                    url: '/app_builder/application/' + app.id + '/findModels'
                })
                    .then((list) => {


                        list.forEach((data) => {

                            // translate label of objects
                            OP.Multilingual.translate(data, data, ['label']);

                            // translate label of application
                            OP.Multilingual.translate(data.application, data.application, ['label']);

                            // translate label of fields
                            if (data.fields && data.fields.forEach) {
                                data.fields.forEach((f) => {
                                    OP.Multilingual.translate(f, f, ['label']);
                                });
                            }

                        });

                        $$(ids.objectList).parse(list, 'json');

                        _logic.busyEnd();

                    })
                    .catch((err) => {
                        _logic.busyEnd();
                    });

            },

            busyStart: function () {
                if (_logic.callbacks.onBusyStart) {
                    _logic.callbacks.onBusyStart();
                }
            },

            busyEnd: function () {
                if (_logic.callbacks.onBusyEnd) {
                    _logic.callbacks.onBusyEnd();
                }
            },


            filter: function () {
                // `this` should be from the Webix event
                var filterText = this.getValue();
                $$(ids.objectList).filter('#id#', filterText);
            },


            objectSelect: function () {
                $$(ids.columnList).clearAll();

                var selectedObj = $$(ids.objectList).getSelectedItem(false);
                if (selectedObj) {

                    _logic.busyStart();

                    var colNames = [];

                    // Parse results and update column list
                    if (selectedObj.fields && selectedObj.fields.forEach) {
                        selectedObj.fields.forEach((f) => {

                            // Skip these columns
                            // TODO : skip connect field
                            // if (col.model) continue;
                            // if (col.collection) continue;

                            var fieldClass = ABFieldManager.allFields().filter((field) => field.defaults().key == f.key)[0];
                            if (fieldClass == null) return;

                            // if the field is not support to import, then it is invisible
                            if (fieldClass.defaults().supportImport == false) return;

                            // // TODO
                            // var supported = true;

                            colNames.push({
                                id: f.id,
                                label: f.label,
                                isvisible: true,
                                // disabled: !supported
                            });

                        });
                    }

                    $$(ids.columnList).parse(colNames);

                    _logic.busyEnd();
                }
            },

            cancel: function () {
                _logic.formClear();
                _logic.callbacks.onCancel();
            },


            formClear: function () {
                // Filter section
                $$(ids.form).clearValidation();
                $$(ids.form).clear();
                // Lists
                $$(ids.objectList).clearAll();
                $$(ids.columnList).clearAll();

            },


            /**
             * @function hide()
             *
             * hide this component.
             */
            hide: function () {
                $$(ids.component).hide();
            },


            /**
             * @function save
             *
             * Send model import request to the server
             */
            save: function () {
                var saveButton = $$(ids.buttonSave);
                var selectedObj = $$(ids.objectList).getSelectedItem();
                if (!selectedObj) return false;

                saveButton.disable();
                _logic.busyStart();

                var columns = $$(ids.columnList)
                    .data
                    .find({})
                    .map((col) => {
                        return {
                            id: col.id,
                            isHidden: !col.isvisible
                        };
                    });

                OP.Comm.Service.post({
                    url: '/app_builder/application/' + currentApp.id + '/importModel',
                    data: {
                        sourceAppId: selectedObj.application.id,
                        objectId: selectedObj.id,
                        columns: columns
                    }
                })
                    .then((objValues) => {
                        saveButton.enable();
                        _logic.busyEnd();

                        var newObj = new ABObject(objValues, currentApp);

                        _logic.callbacks.onDone(newObj);
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
            show: function () {
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
                        id: ids.objectList,
                        select: true,
                        height: 250,
                        minHeight: 250,
                        maxHeight: 250,
                        data: [],
                        template: '<div>#label#</div>',
                        on: {
                            onSelectChange: _logic.objectSelect
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

                            isvisible: {
                                view: 'checkbox',
                                width: 30
                            }

                        },
                        template: (obj, common) => {

                            return `
                                <span class="float-left">${common.isvisible(obj, common)}</span>
                                <span class="float-left">${obj.label}</span>
                            `;

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
        this.onShow = _logic.onShow

    }

}