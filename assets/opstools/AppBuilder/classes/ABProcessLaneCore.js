/**
 * ABProcessLane
 * manages the lanes in a Process Diagram.
 *
 * Lanes manage users in the system, and provide a way to lookup a SiteUser.
 */
const ABProcessParticipant = require("./ABProcessParticipant");

const ABProcessLaneDefaults = {
    type: "process.lane" // unique key to reference this specific object
    // icon: "key" // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'
};

module.exports = class ABProcessLaneCore extends ABProcessParticipant {
    constructor(attributes, process, application) {
        super(attributes, process, application);

        //// Runtime Values
        //// these are not stored in the Definition, but rather
        //// loaded and used from a running process instance.
    }

    static defaults() {
        return ABProcessLaneDefaults;
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
        super.fromValues(attributes);

        this.type = attributes.type || ABProcessLaneDefaults.type;
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
    // toObj() {
    //     // default label value
    //     if (!this.label && this.name && this.name != "") {
    //         this.label = this.name;
    //     }

    //     // untranslate this object:
    //     var data = super.toObj();

    //     var fieldsToSave = [
    //         "id",
    //         "name",
    //         "type",
    //         "processID",
    //         "diagramID",
    //         "where"
    //     ];
    //     fieldsToSave.forEach((f) => {
    //         data[f] = this[f];
    //     });

    //     return data;
    // }
};
