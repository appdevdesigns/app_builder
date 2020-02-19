/*
 * formioBuilder
 *
 * Create a custom webix component.
 *
 */

module.exports = class ABCustomFormIOBuilder {
    get key() {
        return "formiobuilder";
    }

    constructor(App) {
        // App 	{obj}	our application instance object.
        // key {string}	the destination key in App.custom[componentKey] for the instance of this component:

        // super(App, key);

        var L = App.Label;

        var labels = {
            common: App.labels,

            component: {}
        };

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: App.unique(this.key)
        };

        // We need to reference this on the save so lets put it in a global var
        var formBuilder;

        // Our webix UI definition:
        var _ui = {
            name: this.key,
            defaults: {
                css: "scrolly forceOpen",
                hidden: false,
                autofit: true
            },
            $init: function(config) {
                var comp = _logic.parseDataObjects(config.dataObjects);
                var formComponents = config.formComponents
                    ? config.formComponents
                    : {};
                Formio.builder(this.$view, formComponents, {
                    builder: {
                        basic: false,
                        advanced: false,
                        // data: false,
                        customBasic: false,
                        premium: false,
                        custom: {
                            title: "Fields",
                            weight: 0,
                            default: true,
                            components: comp
                        },
                        layout: {
                            components: {
                                table: true
                            }
                        }
                    }
                }).then(function(builder) {
                    // now that it is set up we can push it into the global var
                    builder.submission = {
                        data: {
                            Name: "James",
                            "Number Field": 3
                        }
                    };
                    formBuilder = builder;
                });
            },
            // set up a function that can be called to request the form schema
            getFormData: () => {
                return formBuilder.schema;
            }
        };
        this.view = this.key;

        // our internal business logic
        var _logic = {
            /**
             * @method parseDataObjects
             *
             * @param store {webix.TreeCollection}
             * @param elem {Object} the webix element
             * @param parentId {integer - nullable} id of parent id
             */
            parseDataObjects: (objects) => {
                var components = {};
                objects.forEach((obj) => {
                    var fields = obj.fields();
                    console.log(fields);
                    fields.forEach((field) => {
                        switch (field.key) {
                            case "boolean":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "checkbox",
                                        key: field.columnName,
                                        input: true
                                    }
                                };
                                break;
                            case "calculate":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "textfield",
                                        key: field.columnName,
                                        input: true,
                                        inputType: "text",
                                        disabled: true,
                                        calculateValue:
                                            "value = " +
                                            field.settings.formula
                                                .replace(/{/g, "data['")
                                                .replace(/}/g, "']")
                                    }
                                };
                                break;
                            case "date":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "datetime",
                                        key: field.columnName,
                                        input: true,
                                        format:
                                            field.settings.timeFormat == 1
                                                ? "MMMM d, yyyy"
                                                : "MMMM d, yyyy h:mm a"
                                    }
                                };
                                break;
                            case "email":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "email",
                                        key: field.columnName,
                                        input: true
                                    }
                                };
                                break;
                            case "file":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "htmlelement",
                                        tag: "a",
                                        className: "btn btn-primary btn-block",
                                        content:
                                            "<i class='fa fa-paperclip'></i>  " +
                                            "{{JSON.parse(data['" +
                                            field.columnName +
                                            "']).filename}}",
                                        attrs: [
                                            {
                                                attr: "href",
                                                value:
                                                    "/opsportal/file/" +
                                                    field.object.application
                                                        .name +
                                                    "/" +
                                                    "{{JSON.parse(data['" +
                                                    field.columnName +
                                                    "']).uuid}}"
                                            },
                                            {
                                                attr: "target",
                                                value: "_blank"
                                            }
                                        ],
                                        refreshOnChange: true,
                                        key: field.columnName,
                                        input: false
                                    }
                                };
                                break;
                            case "image":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "htmlelement",
                                        tag: "img",
                                        className: "img-thumbnail max100",
                                        content: "",
                                        attrs: [
                                            {
                                                attr: "src",
                                                value:
                                                    "/opsportal/image/" +
                                                    field.object.application
                                                        .name +
                                                    "/" +
                                                    "{{data['" +
                                                    field.columnName +
                                                    "']}}"
                                            }
                                        ],
                                        refreshOnChange: true,
                                        key: field.columnName,
                                        input: false
                                    }
                                };
                                break;
                            case "list":
                                var vals = [];
                                field.settings.options.forEach((opt) => {
                                    vals.push({
                                        label: opt.text,
                                        value: opt.id
                                    });
                                });
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "select",
                                        key: field.columnName,
                                        input: true,
                                        data: {
                                            values: vals
                                        },
                                        multiple: field.settings.isMultiple
                                    }
                                };
                                break;
                            case "LongText":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "textarea",
                                        key: field.columnName,
                                        input: true
                                    }
                                };
                                break;
                            case "number":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "number",
                                        key: field.columnName,
                                        input: true
                                    }
                                };
                                break;
                            case "TextFormula":
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "textfield",
                                        key: field.columnName,
                                        input: true,
                                        inputType: "text",
                                        disabled: true,
                                        calculateValue:
                                            "value = '" +
                                            field.settings.textFormula +
                                            "'"
                                    }
                                };
                                break;
                            default:
                                components[field.columnName] = {
                                    title: field.label,
                                    key: field.columnName,
                                    icon: field.icon,
                                    schema: {
                                        abFieldID: field.id,
                                        label: field.label,
                                        type: "textfield",
                                        key: field.columnName,
                                        input: true
                                    }
                                };
                                break;
                        }
                    });
                });
                return components;
            }
        };
        this._logic = _logic;

        // Tell Webix to create an INSTANCE of our custom component:
        webix.protoUI(_ui, webix.ui.popup);
    }
};
