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

    //// LEFT OFF HERE:
    // ABQLObject.needs to verify given Object exists before allowing next op
    // ABQLField conditions need to be enclosed in ""

    /**
     * propertiesShow()
     * display the properties panel for this Process Element.
     * @param {string} id
     *        the webix $$(id) of the properties panel area.
     */
    propertiesShow(id) {
        var ids = this.propertyIDs(id);

        var ignoreKeys = [
            16 // shift
        ];

        var ParseInput = (code, e) => {
            var currText = $$(ids.query).getValue() + e.key;
            if (code == 8) {
                currText = $$(ids.query).getValue();
            }

            /// LEFT OFF HERE:
            //  - ABProcessTriggerLifecycleCore : adding of .uuid to list is janky! revamp.
            //  - refactor ABQLObject & ABQLFind to share common class
            //  - .find() -> .first()

            var parser = ABQLManager.currentParser(
                currText,
                this,
                this.application
            );

            // let the parser fill in the query as we go:
            var bestGuess = parser.toQuery();
            $$(ids.query).setValue(bestGuess);
            $$(ids.suggestions).setValue(parser.suggestions());

            // prevent pressed key from appearing as well.
            e.preventDefault();
        };

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
                },
                {
                    cols: [
                        {
                            id: ids.query,
                            view: "textarea",
                            label: "Query",
                            labelPosition: "top",
                            placeholder: "(enter your query)",
                            height: 400,
                            gravity: 2,
                            on: {
                                onKeyPress: (code, e) => {
                                    console.log(`${e.key}:${code}`);
                                    if (ignoreKeys.indexOf(code) != -1) {
                                        return;
                                    }

                                    // if they pressed backspace, then process
                                    // current value minus last
                                    if (code == 8) {
                                        // parse after text has been updated in control
                                        setImmediate(() => {
                                            ParseInput(code, e);
                                        });
                                    } else {
                                        // parse now
                                        ParseInput(code, e);
                                    }
                                }
                            }
                        },
                        {
                            id: ids.suggestions,
                            view: "textarea",
                            label: "options:",
                            labelPosition: "top",
                            height: 400,
                            gravity: 1
                        }
                    ]
                }
            ]
        };

        webix.ui(ui, $$(id));

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
    }
};
