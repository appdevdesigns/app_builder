
/*
 * ab_work_process_list_newProcess
 *
 * Display the form for creating a new Application.
 *
 */


export default class ab_work_process_list_newProcess extends OP.Component {   //.extend(idBase, function(App) {

    constructor(App) {
        super(App, 'ab_work_process_list_newProcess');
        var L = this.Label;

        var labels = {
            common : App.labels,
            component: {
                placeholderName: L('ab.process.list.search.placeholder', "*Process name"),
                addNewProcess: L('ab.process.form.addNewProcess', "*Add Process")
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
            view: "window",
            id: ids.component,
            position: "center",
            modal: true,
            head: labels.common.create,
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
                                value: labels.component.addNewProcess,
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
            // this is a popup, so create our UI here:
            webix.ui(this.ui);
            webix.extend($$(ids.component), webix.ProgressBar);

            this.hide();
        }



        // our internal business logic 
        var _logic = this._logic = {

            callbacks:{
                onCancel: function() { console.warn('NO onCancel()!') },
                onSave  : function(values, cb) { console.warn('NO onSave()!') },
            },

            busy:()=>{
                if ($$(ids.component) &&
                    $$(ids.component).showProgress)
                    $$(ids.component).showProgress({ type: "icon" });
            },

            cancel:()=>{
                _logic.formClear();
                this.emit("cancel");
            },


            formClear:function() {
                $$(ids.form).clearValidation();
                $$(ids.form).clear();
                $$(ids.buttonSave).enable();
            },


            formErrors:function(validator) {

                validator.updateForm(Form);

                // get notified if there was an error saving.
                $$(ids.buttonSave).enable();
            },


            /**
             * @function hide()
             *
             * Hide this component.
             */
            hide:function() {

                if ($$(ids.component))
                    $$(ids.component).hide();
            },

            ready:()=>{
                if ($$(ids.component) &&
                    $$(ids.component).hideProgress)
                    $$(ids.component).hideProgress();
            },


            /**
             * @function save
             *
             * verify the current info is ok, package it, and return it to be 
             * added to the application.createModel() method.
             */
            save:()=>{
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

                this.emit("save", values);

                return;

                // now send data back to be added:
                // _logic.callbacks.onSave(values, function(validator) {

                //     if (validator) {
                //         validator.updateForm(Form);

                //         // get notified if there was an error saving.
                //         saveButton.enable();
                //         return Promise.reject("the enter data is invalid");
                //     } 

                //     // if there was no error, clear the form for the next
                //     // entry:
                //     _logic.formClear();
                    

                //     return Promise.resolve();
                // });

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
        this.busy = _logic.busy;
        this.clear = _logic.formClear;
        this.errors = _logic.formErrors;
        this.hide = _logic.hide;
        this.ready = _logic.ready;
        this.show = _logic.show;

    }

}