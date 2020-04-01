// ABObjectWorkspaceViewKanban.js
//
// Manages the settings for a Data Grid View in the AppBuilder Object Workspace

const ABObjectWorkspaceView = require("./ABObjectWorkspaceView");
const ABObjectWorkspaceViewComponent = require("./ABObjectWorkspaceViewComponent");

const ABPopupNewDataField = require("../../../components/ab_work_object_workspace_popupNewDataField");

const ABFieldConnect = require("../dataFields/ABFieldConnect");
const ABFieldList = require("../dataFields/ABFieldList");
const ABFieldUser = require("../dataFields/ABFieldUser");

var defaultValues = {
    name: "Default Kanban",
    filterConditions: [], // array of filters to apply to the data table
    sortFields: [],
    verticalGroupingField: null,
    horizontalGroupingField: null,
    ownerField: null
};

module.exports = class ABObjectWorkspaceViewKanban extends ABObjectWorkspaceView {
    constructor(attributes, object) {
        super(attributes, object, "kanban");

        /*
			{
				id:uuid(),
				type:'kanban',  
				filterConditions:[],
			}
		
		*/
    }

    /**
     * unique key describing this View.
     * @return {string}
     */
    static type() {
        return "kanban";
    }

    /**
     * @return {string}
     */
    static icon() {
        return "fa fa-columns";
    }

    static component(App, idBase) {
        let ids = {
            vGroupInput: App.unique(idBase + "_popupAddViewVGroup"),
            hGroupInput: App.unique(idBase + "_popupAddViewHGroup"),
            ownerInput: App.unique(idBase + "_popupAddViewOwner")
        };

        let L = (key, altText) => {
            return AD.lang.label.getLabel(key) || altText;
        };

        let labels = {
            common: App.labels,
            component: {
                vGroup: L("ab.add_view.kanban.vGroup", "*Vertical Grouping"),
                hGroup: L("ab.add_view.kanban.hGroup", "*Horizontal Grouping"),
                owner: L("ab.add_view.kanban.owner", "*Card Owner"),
                groupingPlaceholder: L(
                    "ab.add_view.kanban.grouping_placeholder",
                    "*Select a field"
                ),
                ownerPlaceholder: L(
                    "ab.add_view.kanban.owner_placeholder",
                    "*Select a user field"
                ),
                noneOption: L("ab.add_view.kanban.none_option", "*None")
            }
        };

        let refreshOptions = (object, view, options = {}) => {
            // Utility function to initialize the options for a field select input
            const initSelect = (
                $option,
                attribute,
                filter = (f) => f.key === ABFieldList.defaults().key,
                isRequired
            ) => {
                if ($option == null || object == null) return;

                // populate options
                var options = object
                    .fields()
                    .filter(filter)
                    .map(({ id, label }) => ({ id, value: label }));
                if (!isRequired && options.length) {
                    options.unshift({
                        id: 0,
                        value: labels.component.noneOption
                    });
                }
                $option.define("options", options);

                // select a value
                if (view) {
                    if (view[attribute]) {
                        $option.define("value", view[attribute]);
                    } else if (!isRequired && options[0]) {
                        $option.define("value", options[0].id);
                    }
                } else if (options.filter((o) => o.id).length === 1) {
                    // If there's just one (real) option, default to the first one
                    $option.define("value", options[0].id);
                }

                $option.refresh();
            };

            const verticalGroupingFieldFilter = (field) =>
                [
                    ABFieldList.defaults().key,
                    ABFieldUser.defaults().key
                ].includes(field.key);

            const horizontalGroupingFieldFilter = (field) =>
                [
                    ABFieldConnect.defaults().key,
                    ABFieldList.defaults().key,
                    ABFieldUser.defaults().key
                ].includes(field.key);

            initSelect(
                options.vGroupInput || $$(ids.vGroupInput),
                "verticalGroupingField",
                verticalGroupingFieldFilter,
                true
            );
            initSelect(
                options.hGroupInput || $$(ids.hGroupInput),
                "horizontalGroupingField",
                horizontalGroupingFieldFilter,
                false
            );
            initSelect(
                options.ownerInput || $$(ids.ownerInput),
                "ownerField",
                (f) => {
                    // User field
                    return (
                        f.key === ABFieldUser.defaults().key ||
                        // Connected field : type 1:M
                        (f.key === ABFieldConnect.defaults().key &&
                            f.settings.linkType == "one" &&
                            f.settings.linkViaType == "many")
                    );
                },
                false
            );
        };

        var PopupNewDataFieldComponent = new ABPopupNewDataField(
            App,
            idBase + "_kanban"
        );

        return new ABObjectWorkspaceViewComponent({
            elements: () => {
                return {
                    batch: "kanban",
                    rows: [
                        {
                            cols: [
                                {
                                    view: "richselect",
                                    label: `<span class='webix_icon fa fa-columns'></span> ${labels.component.vGroup}`,
                                    id: ids.vGroupInput,
                                    placeholder:
                                        labels.component.groupingPlaceholder,
                                    labelWidth: 180,
                                    name: "vGroup",
                                    required: true,
                                    options: [],
                                    on: {
                                        onChange: function(id) {
                                            $$(ids.vGroupInput).validate();
                                            $$(ids.hGroupInput).validate();
                                        }
                                    },
                                    invalidMessage:
                                        labels.common.invalidMessage.required
                                },
                                {
                                    view: "button",
                                    css: "webix_primary",
                                    type: "icon",
                                    icon: "fa fa-plus",
                                    label: "",
                                    width: 20,
                                    click: () => {
                                        PopupNewDataFieldComponent.show(
                                            null,
                                            ABFieldList.defaults().key
                                        );
                                    }
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "richselect",
                                    label: `<span class='webix_icon fa fa-list'></span> ${labels.component.hGroup}`,
                                    id: ids.hGroupInput,
                                    placeholder:
                                        labels.component.groupingPlaceholder,
                                    labelWidth: 180,
                                    name: "hGroup",
                                    required: false,
                                    options: [],
                                    invalidMessage:
                                        "Cannot be the same as vertical grouping field",
                                    validate: (value) => {
                                        var vGroupValue = $$(
                                            ids.vGroupInput
                                        ).getValue();
                                        return (
                                            !vGroupValue ||
                                            !value ||
                                            vGroupValue !== value
                                        );
                                    },
                                    on: {
                                        onChange: function(id) {
                                            $$(ids.hGroupInput).validate();
                                        }
                                    }
                                },
                                {
                                    view: "button",
                                    css: "webix_primary",
                                    type: "icon",
                                    icon: "fa fa-plus",
                                    label: "",
                                    width: 20,
                                    click: () => {
                                        PopupNewDataFieldComponent.show(
                                            null,
                                            ABFieldList.defaults().key
                                        );
                                    }
                                }
                            ]
                        },
                        {
                            cols: [
                                {
                                    view: "richselect",
                                    label: `<span class='webix_icon fa fa-user-circle'></span> ${labels.component.owner}`,
                                    placeholder:
                                        labels.component.ownerPlaceholder,
                                    id: ids.ownerInput,
                                    labelWidth: 180,
                                    name: "owner",
                                    options: []
                                },
                                {
                                    view: "button",
                                    css: "webix_primary",
                                    type: "icon",
                                    icon: "fa fa-plus",
                                    label: "",
                                    width: 20,
                                    click: () => {
                                        PopupNewDataFieldComponent.show(
                                            null,
                                            ABFieldConnect.defaults().key
                                        );
                                    }
                                }
                            ]
                        }
                    ]
                };
            },

            init: (object, view) => {
                refreshOptions(object, view);

                PopupNewDataFieldComponent.applicationLoad(object.application);
                PopupNewDataFieldComponent.objectLoad(object);
                PopupNewDataFieldComponent.init({
                    onSave: () => {
                        // be notified when a new Field is created & saved

                        refreshOptions(object, view);
                    }
                });
            },

            values: function() {
                let result = {};

                result.verticalGroupingField =
                    $$(ids.vGroupInput).getValue() || null;
                result.horizontalGroupingField =
                    $$(ids.hGroupInput).getValue() || null;
                result.ownerField = $$(ids.ownerInput).getValue() || null;

                return result;
            },

            logic: {
                refreshOptions: refreshOptions
            }
        });
    }

    /**
     * @method fromObj
     * take our persisted data, and properly load it
     * into this object instance.
     * @param {json} data  the persisted data
     */
    fromObj(data) {
        super.fromObj(data);

        for (var v in defaultValues) {
            this[v] = data[v] || defaultValues[v];
        }

        this.type = ABObjectWorkspaceViewKanban.type();
    }

    /**
     * @method toObj()
     * compile our current state into a {json} object
     * that can be persisted.
     */
    toObj() {
        var obj = super.toObj();

        for (var v in defaultValues) {
            obj[v] = this[v];
        }

        obj.type = ABObjectWorkspaceViewKanban.type();
        return obj;
    }

    getHorizontalGroupingField() {
        let viewCollection = this.object, // Should use another name property ?
            object = viewCollection.object;

        return object.fields((f) => f.id == this.horizontalGroupingField)[0];
    }

    getVerticalGroupingField() {
        let viewCollection = this.object, // Should use another name property ?
            object = viewCollection.object;

        return object.fields((f) => f.id == this.verticalGroupingField)[0];
    }

    getOwnerField() {
        let viewCollection = this.object, // Should use another name property ?
            object = viewCollection.object;

        return object.fields((f) => f.id == this.ownerField)[0];
    }
};
