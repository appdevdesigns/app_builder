/**
 * ABProcessParticipant
 * manages the participant lanes in a Process Diagram.
 *
 * Participants manage users in the system, and provide a way to lookup a SiteUser.
 */
const ABMLClass = require("./ABMLClass");

const ABProcessParticipantDefaults = {
    type: "process.participant" // unique key to reference this specific Task
    // icon: "key" // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
};

module.exports = class ABProcessParticipantCore extends ABMLClass {
    constructor(attributes, process, application) {
        super(["label"]);

        this.process = process;
        if (!this.processID) {
            this.processID = process.id;
        }
        this.application = application;

        this.fromValues(attributes);

        //// Runtime Values
        //// these are not stored in the Definition, but rather
        //// loaded and used from a running process instance.
    }

    static defaults() {
        return ABProcessParticipantDefaults;
    }

    fromValues(attributes) {
        /*
        {
            id: uuid(),
            name: 'name',
            type: 'xxxxx',
            json: "{json}"
        }
        */
        // These Values are needed By ABDefinition:
        this.id = attributes.id;
        this.name = attributes.name || "";
        this.type = attributes.type || ABProcessParticipantDefaults.type;

        // Process Values:
        this.processID = attributes.processID || null;
        this.diagramID = attributes.diagramID || "?diagramID?";
        this.laneIDs = attributes.laneIDs || [];
        this.where = null;
        if (attributes.where && attributes.where != "") {
            this.where = attributes.where;
        }

        this.useRole = 0;
        if (typeof attributes.useRole != "undefined") {
            this.useRole = parseInt(attributes.useRole);
        }

        this.role = 0;
        if (typeof attributes.role != "undefined") {
            this.role = attributes.role;
        }

        this.useAccount = 0;
        if (typeof attributes.useAccount != "undefined") {
            this.useAccount = parseInt(attributes.useAccount);
        }

        this.account = 0;
        if (typeof attributes.account != "undefined") {
            this.account = attributes.account;
        }

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
        if (!this.label && this.name && this.name != "") {
            this.label = this.name;
        }

        // untranslate this object:
        var data = super.toObj();

        var fieldsToSave = [
            "id",
            "name",
            "type",
            "processID",
            "diagramID",
            "laneIDs",
            "where",
            "useRole",
            "role",
            "useAccount",
            "account"
        ];
        fieldsToSave.forEach((f) => {
            data[f] = this[f];
        });

        return data;
    }
};
