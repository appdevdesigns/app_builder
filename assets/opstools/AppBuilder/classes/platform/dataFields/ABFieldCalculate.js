var ABFieldCalculateCore = require("../../core/dataFields/ABFieldCalculateCore");
var ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

var delimiterList = [
    { id: "none", value: L("ab.common.none", "*None") },
    { id: "comma", value: L("ab.dataField.number.comma", "*Comma"), sign: "," },
    {
        id: "period",
        value: L("ab.dataField.number.period", "*Period"),
        sign: "."
    },
    { id: "space", value: L("ab.dataField.number.space", "*Space"), sign: " " }
];

var ids = {
    formula: "ab-field-calculate-field-formula",

    fieldPopup: "ab-field-calculate-field-popup",
    fieldList: "ab-field-calculate-field-list",

    numberOperatorPopup: "ab-field-calculate-number-popup",

    dateOperatorPopup: "ab-field-calculate-date-popup",
    dateFieldList: "ab-field-calculate-date-list",

    decimalPlaces: "ab-field-calculate-decimal-places"
};

/**
 * ABFieldCalculateComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldCalculateComponent = new ABFieldComponent({
    fieldDefaults: ABFieldCalculateCore.defaults(),

    elements: (App, field) => {
        ids = field.idsUnique(ids, App);

        // field popup
        webix.ui({
            id: ids.fieldPopup,
            view: "popup",
            hidden: true,
            width: 200,
            body: {
                id: ids.fieldList,
                view: "list",
                data: [],
                template: field.logic.itemTemplate,
                on: {
                    onItemClick: function(id, e, node) {
                        var component = this.getItem(id),
                            message = "{" + component.columnName + "}";

                        field.logic.insertEquation(message);

                        $$(ids.fieldPopup).hide();
                    }
                }
            },
            on: {
                onBeforeShow: function() {
                    // refresh field list
                    $$(ids.fieldList).clearAll();
                    $$(ids.fieldList).parse(field.logic.getNumberFields());
                }
            }
        });

        webix.ui({
            id: ids.numberOperatorPopup,
            view: "popup",
            hidden: true,
            width: 200,
            body: {
                view: "list",
                template: field.logic.itemTemplate,
                data: [
                    {
                        label: L("ab.dataField.calculate.add", "+ Adds"),
                        symbol: "+"
                    },
                    {
                        label: L(
                            "ab.dataField.calculate.subtract",
                            "- Subtracts"
                        ),
                        symbol: "-"
                    },
                    {
                        label: L(
                            "ab.dataField.calculate.multiple",
                            "* Multiples"
                        ),
                        symbol: "*"
                    },
                    {
                        label: L("ab.dataField.calculate.divide", "/ Divides"),
                        symbol: "/"
                    },
                    {
                        label: L(
                            "ab.dataField.calculate.openBracket",
                            "( Open Bracket"
                        ),
                        symbol: "("
                    },
                    {
                        label: L(
                            "ab.dataField.calculate.closedBracket",
                            ") Closed Bracket"
                        ),
                        symbol: ")"
                    }
                ],
                on: {
                    onItemClick: function(id, e, node) {
                        var component = this.getItem(id);

                        field.logic.insertEquation(component.symbol);

                        $$(ids.numberOperatorPopup).hide();
                    }
                }
            }
        });

        webix.ui({
            id: ids.dateOperatorPopup,
            view: "popup",
            hidden: true,
            width: 280,
            data: [],
            body: {
                id: ids.dateFieldList,
                view: "list",
                template: field.logic.itemTemplate,
                data: [],
                on: {
                    onItemClick: function(id, e, node) {
                        var component = this.getItem(id);

                        field.logic.insertEquation(component.function);

                        $$(ids.dateOperatorPopup).hide();
                    }
                }
            },
            on: {
                onBeforeShow: function() {
                    // refresh field list
                    $$(ids.dateFieldList).clearAll();
                    $$(ids.dateFieldList).parse(field.logic.getDateFields());
                }
            }
        });

        return [
            {
                id: ids.formula,
                name: "formula",
                view: "textarea",
                label: L("ab.dataField.calculate.equation", "*Equation"),
                labelPosition: "top",
                height: 150
            },
            {
                rows: [
                    {
                        cols: [
                            {
                                view: "button",
                                type: "icon",
                                css: "webix_primary",
                                icon: "fa fa-hashtag",
                                label: L(
                                    "ab.dataField.calculate.numberFields",
                                    "*Number Fields"
                                ),
                                width: 185,
                                click: function() {
                                    // show popup
                                    $$(ids.fieldPopup).show(this.$view);
                                }
                            },
                            {
                                view: "button",
                                type: "icon",
                                css: "webix_primary",
                                icon: "fa fa-calendar",
                                label: L(
                                    "ab.dataField.calculate.dateFields",
                                    "*Date Fields"
                                ),
                                click: function() {
                                    // show popup
                                    $$(ids.dateOperatorPopup).show(this.$view);
                                }
                            }
                        ]
                    },

                    {
                        cols: [
                            {
                                view: "button",
                                css: "webix_primary",
                                type: "icon",
                                icon: "fa fa-hashtag",
                                label: L(
                                    "ab.dataField.calculate.numberFn",
                                    "*Number Operators"
                                ),
                                width: 185,
                                click: function() {
                                    // show popup
                                    $$(ids.numberOperatorPopup).show(
                                        this.$view
                                    );
                                }
                            },
                            {}
                        ]
                    },

                    {
                        view: "richselect",
                        name: "decimalSign",
                        label: L(
                            "ab.dataField.calculate.decimalSign",
                            "*Decimals"
                        ),
                        value: "none",
                        labelWidth: App.config.labelWidthXLarge,
                        options: delimiterList,
                        on: {
                            onChange: function(newValue, oldValue) {
                                if (newValue == "none") {
                                    $$(ids.decimalPlaces).disable();
                                } else {
                                    $$(ids.decimalPlaces).enable();
                                }
                            }
                        }
                    },

                    {
                        view: "richselect",
                        id: ids.decimalPlaces,
                        name: "decimalPlaces",
                        label: L(
                            "ab.dataField.calculate.decimalPlaces",
                            "*Places"
                        ),
                        value: "none",
                        labelWidth: App.config.labelWidthXLarge,
                        disabled: true,
                        options: [
                            { id: "none", value: "0" },
                            { id: 1, value: "1" },
                            { id: 2, value: "2" },
                            { id: 3, value: "3" },
                            { id: 4, value: "4" },
                            { id: 5, value: "5" },
                            { id: 10, value: "10" }
                        ]
                    }
                ]
            }
        ];
    },

    // defaultValues: the keys must match a .name of your elements to set it's default value.
    defaultValues: ABFieldCalculateCore.defaultValues(),

    // rules: basic form validation rules for webix form entry.
    // the keys must match a .name of your .elements for it to apply
    rules: {},

    // include additional behavior on default component operations here:
    // The base routines will be processed first, then these.  Any results
    // from the base routine, will be passed on to these:
    logic: {
        objectLoad: (object) => {
            ABFieldCalculateComponent.CurrentObject = object;
        },

        getNumberFields: () => {
            if (ABFieldCalculateComponent.CurrentObject)
                return ABFieldCalculateComponent.CurrentObject.fields(
                    (f) =>
                        f.key == "number" ||
                        f.key == "calculate" ||
                        f.key == "formula"
                );
            else return [];
        },

        getDateFields: () => {
            if (ABFieldCalculateComponent.CurrentObject) {
                var options = [];

                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.minuteToHourCurrent",
                        "*Convert minutes to hours (Format: hours.minutes)"
                    ),
                    function: "MINUTE_TO_HOUR()"
                });

                /** CURRENT DATE */
                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.year",
                        "*Year of [#fieldName#]"
                    ).replace("#fieldName#", "Current"),
                    function: "YEAR(CURRENT)"
                });

                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.month",
                        "*Month of [#fieldName#]"
                    ).replace("#fieldName#", "Current"),
                    function: "MONTH(CURRENT)"
                });

                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.day",
                        "*Day of [#fieldName#]"
                    ).replace("#fieldName#", "Current"),
                    function: "DAY(CURRENT)"
                });

                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.date",
                        "*Get days of [#fieldName#] (since January 1, 1970)"
                    ).replace("#fieldName#", "Current"),
                    function: "DATE(CURRENT)"
                });

                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.hour",
                        "*Get hours of [#fieldName#] (since January 1, 1970)"
                    ).replace("#fieldName#", "Current"),
                    function: "HOUR(CURRENT)"
                });

                options.push({
                    label: L(
                        "ab.dataField.calculate.functions.minute",
                        "*Get minutes of [#fieldName#] (since January 1, 1970)"
                    ).replace("#fieldName#", "Current"),
                    function: "MINUTE(CURRENT)"
                });

                /** DATE FIELDS */
                ABFieldCalculateComponent.CurrentObject.fields(
                    (f) => f.key == "date"
                ).forEach((f) => {
                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.age",
                            "*Calculate age from [#fieldName#]"
                        ).replace("#fieldName#", f.label),
                        function: "AGE({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });

                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.year",
                            "*Year of [#fieldName#]"
                        ).replace("#fieldName#", f.label),
                        function: "YEAR({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });

                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.month",
                            "*Month of [#fieldName#]"
                        ).replace("#fieldName#", f.label),
                        function: "MONTH({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });

                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.day",
                            "*Day of [#fieldName#]"
                        ).replace("#fieldName#", f.label),
                        function: "DAY({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });

                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.date",
                            "*Get days of [#fieldName#] (since January 1, 1970)"
                        ).replace("#fieldName#", f.label),
                        function: "DATE({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });

                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.hour",
                            "*Get hours of [#fieldName#] (since January 1, 1970)"
                        ).replace("#fieldName#", f.label),
                        function: "HOUR({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });

                    options.push({
                        label: L(
                            "ab.dataField.calculate.functions.minute",
                            "*Get minutes of [#fieldName#] (since January 1, 1970)"
                        ).replace("#fieldName#", f.label),
                        function: "MINUTE({#column#})".replace(
                            "#column#",
                            f.columnName
                        )
                    });
                });

                return options;
            } else return [];
        },

        itemTemplate: (item) => {
            var template = "";

            if (item.icon) {
                template += '<i class="fa fa-{icon}" aria-hidden="true"></i> '.replace(
                    "{icon}",
                    item.icon
                );
            }

            if (item.label) {
                template += item.label;
            }

            return template;
        },

        insertEquation: (message) => {
            var formula = $$(ids.formula).getValue();

            $$(ids.formula).setValue(formula + message);
        },

        isValid: function(ids, isValid) {
            $$(ids.component).markInvalid("formula", false);

            var formula = $$(ids.formula).getValue();

            try {
                ABFieldCalculateCore.convertToJs(
                    ABFieldCalculateComponent.CurrentObject,
                    formula,
                    {}
                );

                // correct
                return true;
            } catch (err) {
                $$(ids.component).markInvalid("formula", "");

                // incorrect
                return false;
            }
        }

        // populate: function (base_ids, values) {
        // }
    },

    // perform any additional setup actions here.
    // @param {obj} ids  the hash of id values for all the current form elements.
    //					 it should have your elements + the default Header elements:
    //						.label, .columnName, .fieldDescription, .showIcon
    init: function(ids) {}
});

module.exports = class ABFieldCalculate extends ABFieldCalculateCore {
    constructor(values, object) {
        super(values, object);
    }

    /*
     * @function propertiesComponent
     *
     * return a UI Component that contains the property definitions for this Field.
     *
     * @param {App} App the UI App instance passed around the Components.
     * @param {stirng} idBase
     * @return {Component}
     */
    static propertiesComponent(App, idBase) {
        return ABFieldCalculateComponent.component(App, idBase);
    }

    isValid() {
        var validator = super.isValid();

        // validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

        return validator;
    }

    ///
    /// Working with Actual Object Values:
    ///

    // return the grid column header definition for this instance of ABFieldCalculate
    columnHeader(options) {
        var config = super.columnHeader(options);

        config.editor = null; // read only
        config.css = "textCell";
        config.template = (rowData) => {
            if (rowData.$group) return rowData[this.columnName];

            return this.format(rowData);
        };

        return config;
    }

    /*
     * @funciton formComponent
     * returns a drag and droppable component that is used on the UI
     * interface builder to place form components related to this ABField.
     *
     * an ABField defines which form component is used to edit it's contents.
     * However, what is returned here, needs to be able to create an instance of
     * the component that will be stored with the ABViewForm.
     */
    formComponent() {
        return super.formComponent("fieldreadonly");
    }

    detailComponent() {
        var detailComponentSetting = super.detailComponent();

        detailComponentSetting.common = () => {
            return {
                key: "detailtext"
            };
        };

        return detailComponentSetting;
    }
};
