/*
 * ab_work_object_list_newObject_import
 *
 * Display the form for importing an sails model into the application.
 *
 */

import ABExternal from '../classes/ABExternal.js';
import ABField from '../classes/dataFields/ABField.js';
import ABObject from '../classes/ABObject.js';
import ABFieldManager from '../classes/ABFieldManager.js';

export default class AB_Work_Object_List_NewObject_External extends OP.Component {

    constructor(App) {
        super(App, 'ab_work_object_list_newObject_external');
        var L = this.Label;
        var currentApp = null;

        var labels = {
            common: App.labels,
            component: {
                columns: L('ab.object.columns', "*Columns"),
                external: L('ab.object.external', "*External"),
            }
        };

        // internal list of Webix IDs to reference UI components.
        var ids = {
            component: this.unique('component'),
            form: this.unique('import'),

            filter: this.unique('filter'),
            externalList: this.unique('externalList'),
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

                this.abExternal = new ABExternal(currentApp);

                this.abExternal.tableFind()
                    .then((list) => {

                        $$(ids.externalList).parse(list, 'json');

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
                var filterText = this.getValue().toLowerCase();
                $$(ids.externalList).filter(externalModel => externalModel.value.toLowerCase().indexOf(filterText) > -1);
            },


            externalSelect: () => {
                $$(ids.columnList).clearAll();

                var selectedExternal = $$(ids.externalList).getSelectedItem(false);
                if (selectedExternal) {

                    _logic.busyStart();

                    var colNames = [];

                    // Parse results and update column list
                    this.abExternal.tableColumns(selectedExternal.id)
                        .then((attrs) => {

                            Object.keys(attrs).forEach(attrName => {

                                // filter reserve columns
                                if (ABField.reservedNames.indexOf(attrName) > -1)
                                    return;

                                var att = attrs[attrName];

                                colNames.push({
                                    id: attrName,
                                    label: attrName.replace(/_/g, ' '),
                                    isvisible: true,

                                    icon: att.icon,
                                    disabled: !att.supported
                                });

                            });

                            $$(ids.columnList).parse(colNames);

                            _logic.busyEnd();

                        },
                        // error
                        () => { _logic.busyEnd(); });


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
                $$(ids.externalList).clearAll();
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
            save: () => {

                var selectedExternal = $$(ids.externalList).getSelectedItem();
                if (!selectedExternal) return false;

                var saveButton = $$(ids.buttonSave);
                saveButton.disable();
                _logic.busyStart();

                var columns = $$(ids.columnList)
                    .data
                    .find({ disabled: false })
                    .map((col) => {
                        return {
                            name: col.id,
                            label: col.label,
                            isHidden: !col.isvisible
                        };
                    });

                this.abExternal.tableImport(selectedExternal.id, columns)
                    .then((objValues) => {
                        saveButton.enable();
                        _logic.busyEnd();

                        // Add new object to list
                        var newObj = currentApp.objectNew(objValues);
                        currentApp._objects.push(newObj);

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
            header: labels.component.external,
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
                        id: ids.externalList,
                        select: true,
                        height: 200,
                        minHeight: 250,
                        maxHeight: 250,
                        data: [],
                        on: {
                            onSelectChange: _logic.externalSelect
                        },
                    },

                    // Columns list
                    {
                        view: 'label',
                        label: `<b>${labels.component.columns}</b>`,
                        height: 20
                    },
                    {
                        view: App.custom.activelist.view,
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
                            },
                            label: {
                                view: 'text',
                                width: 260
                            }

                        },
                        template: (obj, common) => {

                            // For disabled columns, display strikethrough text
                            if (obj.disabled) {
                                obj.isvisible = false;
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
                                        <span class="float-left">${common.isvisible(obj, common)}</span>
                                        <span class="float-left webix_icon fa-${obj.icon}" style="line-height: 38px;"></span>
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
        this.onShow = _logic.onShow

    }

}