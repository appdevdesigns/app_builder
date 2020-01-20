const path = require("path");

const ABApplicationCore = require(path.join(
    __dirname,
    "..",
    "core",
    "ABApplicationCore.js"
));

const ABClassObject = require(path.join(__dirname, "ABObject"));
const ABClassQuery = require(path.join(__dirname, "ABObjectQuery"));
const ABView = require(path.join(__dirname, "views", "ABView"));
const ABObjectExternal = require(path.join(__dirname, "ABObjectExternal"));
const ABObjectImport = require(path.join(__dirname, "ABObjectImport"));
const ABMobileApp = require(path.join(__dirname, "ABMobileApp"));
const ABProcess = require(path.join(__dirname, "ABProcess"));
const ABProcessParticipant = require(path.join(
    __dirname,
    "process",
    "ABProcessParticipant"
));
const ABProcessLane = require(path.join(__dirname, "process", "ABProcessLane"));
const ABProcessTaskManager = require(path.join(
    __dirname,
    "..",
    "core",
    "process",
    "ABProcessTaskManager"
));

module.exports = class ABClassApplication extends ABApplicationCore {
    constructor(attributes) {
        super(attributes);
    }

    cloneDeep(value) {
        return _.cloneDeep(value);
    }

    ////
    //// DB Related
    ////

    dbApplicationName() {
        return AppBuilder.rules.toApplicationNameFormat(this.name);
    }

    ///
    /// Objects
    ///

    /**
     * @method objectNew()
     *
     * return an instance of a new (unsaved) ABObject that is tied to this
     * ABApplication.
     *
     * NOTE: this new object is not included in our this.objects until a .save()
     * is performed on the object.
     *
     * @return {ABObject}
     */
    objectNew(values) {
        if (values.isExternal == true)
            return new ABObjectExternal(values, this);
        else if (values.isImported == true)
            return new ABObjectImport(values, this);
        else return new ABClassObject(values, this);
    }

    /**
     * @method viewNew()
     *
     *
     * @return {ABView}
     */
    pageNew(values) {
        return new ABView(values, this);
    }

    processNew(id) {
        var processDef = ABDefinitionModel.definitionForID(id);
        if (processDef) {
            return new ABProcess(processDef, this);
        }
        return null;
    }

    /**
     * @method processElementNew(id)
     *
     * return an instance of a new ABProcessOBJ that is tied to this
     * ABApplication->ABProcess.
     *
     * @param {string} id the ABDefinition.id of the element we are creating
     * @param {ABProcess} process the process this task is a part of.
     * @return {ABProcessTask}
     */
    processElementNew(id, process) {
        var taskDef = ABDefinitionModel.definitionForID(id);
        // var taskDef = ABDefinition.definition(id);
        if (taskDef) {
            switch (taskDef.type) {
                case ABProcessParticipant.defaults().type:
                    return new ABProcessParticipant(taskDef, process, this);
                    break;

                case ABProcessLane.defaults().type:
                    return new ABProcessLane(taskDef, process, this);
                    break;

                default:
                    // default to a Task
                    return ABProcessTaskManager.newTask(taskDef, process, this);
                    break;
            }
        }
        return null;
    }

    /**
     * @method queryNew()
     *
     * return an instance of a new (unsaved) ABClassQuery that is tied to this
     * ABApplication.
     *
     * @return {ABClassQuery}
     */
    queryNew(values) {
        return new ABClassQuery(values, this);
    }

    /**
     * @method mobileAppNew()
     *
     * return an instance of a new (unsaved) ABMobileApp that is tied to this
     * ABApplication.
     *
     * @return {ABMobileApp}
     */
    mobileAppNew(values) {
        return new ABMobileApp(values, this);
    }
};
