// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessCore = require(path.join(
    __dirname,
    "..",
    "..",
    "assets",
    "opstools",
    "AppBuilder",
    "classes",
    "ABProcessCore.js"
));

const { Engine } = require("bpmn-engine");
const { EventEmitter } = require("events");

function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcess extends ABProcessCore {
    constructor(attributes, application) {
        super(attributes, application);

        // listen
    }

    ///
    /// Static Methods
    ///
    /// Available to the Class level object.  These methods are not dependent
    /// on the instance values of the Application.
    ///

    context(data) {
        return {
            input: data,
            taskState: {}
        };
    }

    /**
     * instanceNew()
     * create a new running Instance of a process.
     * @param {obj} data the context data to send to the process.
     * @return {Promise}
     */
    instanceNew(data) {
        var context = data;

        for (var t in this.tasks) {
            this.tasks[t].initState(context);
        }

        var newInstance = {
            processID: this.id,
            xmlDefinition: this.xmlDefinition,
            context: context,
            status: "created",
            log: ["created"]
        };
        ABProcessInstance.create(newInstance)
            .then((newInstance) => {
                this.run(newInstance);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    run(instance) {
        debugger;
        const engine = Engine({
            name: instance.id,
            source: instance.xmlDefinition,
            variables: instance.context
        });

        const listener = new EventEmitter();
        listener.on("activity.enter", (elementApi, engineApi) => {
            debugger;
            console.log(
                `${elementApi.type} <${elementApi.id}> of ${engineApi.name} is entered`
            );
        });
        listener.on("wait", (elementApi) => {
            elementApi.owner.logger.debug(
                `<${elementApi.executionId} (${elementApi.id})> signal with io`,
                elementApi.content.ioSpecification
            );
            debugger;
            // elementApi.signal({
            //     ioSpecification: {
            //         dataOutputs: [
            //             {
            //                 id: "userInput",
            //                 value: 2
            //             }
            //         ]
            //     }
            // });
        });
        engine.execute({
            listener
        });
        console.log(`${this.id} / ${this.name} : .run()!`);
    }

    /**
     * @method save()
     *
     * persist this instance of ABObject with it's parent ABApplication
     *
     *
     * @return {Promise}
     *						.resolve( {this} )
     */
    save() {
        // if this is an update:
        // if (this.id) {
        // 	return ABDefinition.update(this.id, this.toDefinition());
        // } else {

        // 	return ABDefinition.create(this.toDefinition());
        // }

        return this.toDefinition()
            .save()
            .then((data) => {
                // if I didn't have an .id then this was a create()
                // and I need to update my data with the generated .id

                if (!this.id) {
                    this.id = data.id;
                }
            });
    }

    isValid() {
        /*
        var validator = OP.Validation.validator();

        // label/name must be unique:
        var isNameUnique =
            this.application.processes((o) => {
                return o.name.toLowerCase() == this.name.toLowerCase();
            }).length == 0;
        if (!isNameUnique) {
            validator.addError(
                "name",
                L(
                    "ab.validation.object.name.unique",
                    `Process name must be unique ("${this.name}"" already used in this Application)`
                )
            );
        }

        return validator;
        */

        var isValid =
            this.application.processes((o) => {
                return o.name.toLowerCase() == this.name.toLowerCase();
            }).length == 0;
        return isValid;
    }
};
