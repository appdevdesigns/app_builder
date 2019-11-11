
/*
 * ab_work_object_list_newObject_blank
 *
 * Display the form for creating a new Application.
 *
 */


module.exports = class AB_Work_Object_List_NewObject_Blank extends OP.Component {   //.extend(idBase, function(App) {

    constructor(App) {
        super(App, 'ab_work_object_list_newObject_blank');
        var L = this.Label;

        var labels = {
            common : App.labels,
            component: {
                placeholderName: L('ab.object.form.placeholderName', "*Object name"),
                addNewObject: L('ab.object.form.addNewObject', "*Add Object")
            }
        }

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique('component'),

            form: this.unique('blank'),
            buttonSave: this.unique('save'),
            buttonCancel: this.unique('cancel')
        }



        // Our webix UI definition:
        this.ui = {
            id: ids.component,
            header: labels.common.create,
            body: {
                view: "form",
                id: ids.form,
                width: 400,
                rules: {

// TODO:
// name: inputValidator.rules.validateObjectName
                },
                elements: [
                    { view: "text", label: labels.common.formName, name: "name", required: true, placeholder: labels.component.placeholderName, labelWidth: 70 },
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
                                click: function () {
                                    _logic.cancel();
                                }
                            },
                            {
                                view: "button",
                                id: ids.buttonSave,
                                value: labels.component.addNewObject,
                                autowidth: true, 
                                type: "form",
                                click: function () {
                                    return _logic.save();
                                }
                            }
                        ]
                    }
                ]
            }
        };



        // Our init() function for setting up our UI
        this.init = ( options ) => {
            // webix.extend($$(ids.form), webix.ProgressBar);

            // load up our callbacks.
            for(var c in _logic.callbacks) {
                _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }

        }



        // our internal business logic 
        var _logic = this._logic = {

            callbacks:{
                onCancel: function() { console.warn('NO onCancel()!') },
                onSave  : function(values, cb) { console.warn('NO onSave()!') },
            },

            
            cancel:function() {

                _logic.formClear();
                _logic.callbacks.onCancel();
            },


            formClear:function() {
                $$(ids.form).clearValidation();
                $$(ids.form).clear();
            },


            /**
             * @function save
             *
             * verify the current info is ok, package it, and return it to be 
             * added to the application.createModel() method.
             */
            save:function() {
                var saveButton = $$(ids.buttonSave);
                saveButton.disable();

                var Form = $$(ids.form);

                Form.clearValidation();

                // if it doesn't pass the basic form validation, return:
                if (!Form.validate()) {
                    saveButton.enable();
                    return false;
                }

                var values = Form.getValues();

                // set uuid to be primary column
                values.primaryColumnName = "uuid";

                // now send data back to be added:
                _logic.callbacks.onSave(values, function(validator) {

                    if (validator) {
                        validator.updateForm(Form);

                        // get notified if there was an error saving.
                        saveButton.enable();
                        return Promise.reject("the enter data is invalid");
                    } 

                    // if there was no error, clear the form for the next
                    // entry:
                    _logic.formClear();
                    saveButton.enable();

                    return Promise.resolve();
                });

            },


            /**
             * @function show()
             *
             * Show this component.
             */
            show:function() {

                if ($$(ids.component))
                    $$(ids.component).show();
            }
        }



        // Expose any globally accessible Actions:
        this.actions({


            /**
             * @function populateApplicationForm()
             *
             * Initialze the Form with the values from the provided ABApplication.
             *
             * If no ABApplication is provided, then show an empty form. (create operation)
             *
             * @param {ABApplication} Application   [optional] The current ABApplication 
             *                                      we are working with.
             */
            // populateApplicationForm:function(Application){
                
            //  _logic.formReset();
            //  if (Application) {
            //      // populate Form here:
            //      _logic.formPopulate(Application);
            //  }
            //  _logic.permissionPopulate(Application);
            //  _logic.show();
            // }

        })



        // 
        // Define our external interface methods:
        // 


    }

}