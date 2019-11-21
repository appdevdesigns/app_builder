// import ABApplication from "./ABApplication"

var ABDefinition = require("../ABDefinition");
var ABMLClass = require("../ABMLClass");

module.exports = class ABProcessTaskCore extends ABMLClass {
    constructor(attributes, process, application, defaultValues) {
        super(["label"]);

        this.fromValues(attributes);
        this.process = process;
        if (!this.processID) {
            this.processID = process.id;
        }
        this.application = application;

        this.defaults = defaultValues || { key: "core", icon: "core" };

        //// Runtime Values
        //// these are not stored in the Definition, but rather
        //// loaded and used from a running process instance.
        this.state = null;
    }

    ///
    /// Static Methods
    ///
    /// Available to the Class level object.  These methods are not dependent
    /// on the instance values of the Application.
    ///

    fromValues(attributes) {
        /*
        {
            id: uuid(),
            name: 'name',
            type: 'xxxxx',
            json: "{json}"
        }
        */
        this.id = attributes.id;
        this.key = attributes.key || this.defaults.key || "?key?";
        this.name = attributes.name || "";
        this.processID = attributes.processID || null;
        this.type = attributes.type || "process.task.unknown";

        super.fromValues(attributes); // perform translation on this object.
        // NOTE: keep this at the end of .fromValues();

        if (!this.label) {
            this.label = this.name;
        }
    }

    /**
     * @method toObj()
     *
     * properly compile the current state of this ABApplication instance
     * into the values needed for saving to the DB.
     *
     * Most of the instance data is stored in .json field, so be sure to
     * update that from all the current values of our child fields.
     *
     * @return {json}
     */
    toObj() {
        // default label value
        if (!this.label) {
            this.label = this.name;
        }

        // untranslate this object:
        var data = super.toObj();

        var fieldsToSave = ["id", "name", "processID", "type", "key"];
        fieldsToSave.forEach((f) => {
            data[f] = this[f];
        });

        return data;
    }

    toDefinition() {
        return new ABDefinition({
            id: this.id,
            name: this.name,
            type: "process.task",
            json: this.toObj()
        });
    }
};
