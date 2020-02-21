const ABProcessTaskServiceCore = require("../../../core/process/tasks/ABProcessTaskServiceCore.js");

const ABProcessTaskServiceQuery = require("./ABProcessTaskServiceQuery.js");

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTaskService extends ABProcessTaskServiceCore {
    ////
    //// Process Instance Methods
    ////

    propertyIDs(id) {
        return {
            name: `${id}_name`
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
                    view: "button",
                    label: L("ab.process.task.service.query", "*Query Task"),
                    click: () => {
                        this.switchTo("query", id);
                    }
                }
            ]
        };

        webix.ui(ui, $$(id));

        $$(id).show();
    }

    /**
     * switchTo()
     * replace this object with an instance of one of our child classes:
     * @param {string} classType
     *        a key representing with subObject to create an instance of.
     * @param {string} propertiesID
     *        the webix ui.id container for the properties panel.
     */
    switchTo(classType, propertiesID) {
        // get a copy of my values, but don't pass on .key and .type
        var myValues = this.toObj();
        delete myValues.key;
        delete myValues.type;

        // create an instance of the desired child
        var child = null;
        switch (classType) {
            case "query":
                child = new ABProcessTaskServiceQuery(
                    myValues,
                    this.process,
                    this.application
                );
                break;
        }

        super.switchTo(child, propertiesID);
    }
};
