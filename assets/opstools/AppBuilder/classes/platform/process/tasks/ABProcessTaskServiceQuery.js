const ABProcessTaskServiceQueryCore = require("../../../core/process/tasks/ABProcessTaskServiceQueryCore.js");

const ABQLManager = require("../../ql/ABQLManager.js");

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskServiceQuery extends ABProcessTaskServiceQueryCore {
    ////
    //// Process Instance Methods
    ////

    propertyIDs(id) {
        return {
            name: `${id}_name`,
            query: `${id}_query`,
            suggestions: `${id}_suggestions`
        };
    }

    /**
     * propertiesShow()
     * display the properties panel for this Process Element.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesShow(id) {
        var ids = this.propertyIDs(id);

        var ui = {
            id: id,
            view: "form",
            elements: [
                {
                    id: ids.name,
                    view: "text",
                    label: L("ab.process.task.email.name", "*Name"),
                    name: "name",
                    value: this.name
                }
            ]
        };

        // add in the QueryBuilder UI
        var Builder = ABQLManager.builder(this.qlObj, this, this.application);
        ui.elements.push(Builder.ui(ids.query));

        // create the ui on the DOM
        webix.ui(ui, $$(id));

        // initialize any operations
        Builder.init(ids.query);

        $$(id).show();
    }

    /**
     * propertiesStash()
     * pull our values from our property panel.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesStash(id) {
        var ids = this.propertyIDs(id);
        this.name = this.property(ids.name);
        this.qlObj = ABQLManager.parse(ids.query, this, this.application);
    }
};
