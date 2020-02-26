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

        var ignoreKeys = [
            16 // shift
        ];

        var ParseInput = (code, e) => {
            var currText = $$(ids.query).getValue() + e.key;
            if (code == 8 || code == 9) {
                currText = $$(ids.query).getValue();
            }

            var parser = ABQLManager.currentParser(
                currText,
                this,
                this.application
            );

            // if they pressed [tab]
            if (code == 9) {
                parser.tabComplete();
            }

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
                                    // the text after the delete was applied:
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

        // prevent the normal tab switch to next component
        // when in our query editor
        let nodeQuery = $$(ids.query).getNode();
        webix.event(nodeQuery, "keydown", function(e) {
            if (e.which === 9) {
                e.preventDefault();
            }
        });

        // initialize the Query
        if (this.qlObj) {
            var initialParser = ABQLManager.fromAttributes(
                this.qlObj,
                this,
                this.application
            );
            $$(ids.query).setValue(initialParser.toQuery());
            $$(ids.suggestions).setValue(initialParser.suggestions());
        }

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

        var currText = $$(ids.query).getValue();
        var parser = ABQLManager.currentParser(
            currText,
            this,
            this.application
        );

        if (parser && parser.firstOP) {
            this.qlObj = parser.firstOP().toObj();
        }
    }
};
