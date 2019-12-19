// import ABApplication from "./ABApplication"

var ABDefinitionCore = require("../core/ABDefinitionCore");

module.exports = class ABDefinition extends ABDefinitionCore {
    ///
    /// Static Methods
    ///
    /// Available to the Class level object.  These methods are not dependent
    /// on the instance values of the Application.
    ///

    /**
     * @method create()
     *
     * create a given ABDefinition
     *
     * @param {obj} data   the values of the ABDefinition obj
     * @return {Promise}   the updated value of the ABDefinition entry from the server.
     */
    static create(data) {
        return ABDefinitionModel.create(data);
    }

    /**
     * @method destroy()
     *
     * remove a given ABDefinition
     *
     * @param {obj} data   the values of the ABDefinition obj
     * @return {Promise}   the updated value of the ABDefinition entry from the server.
     */
    static destroy(id) {
        return ABDefinitionModel.destroy(id);
    }

    /**
     * @method loadAll()
     *
     * load all the Definitions for The current AppBuilder:
     *
     * @return {array}
     */
    static loadAll() {
        return ABDefinitionModel.refresh();
    }

    /**
     * @method update()
     *
     * update a given ABDefinition
     *
     * @param {string} id  the id of the definition to update
     * @param {obj} data   the values of the ABDefinition obj
     * @return {Promise}   the updated value of the ABDefinition entry from the server.
     */
    static update(id, data) {
        return ABDefinitionModel.update({ id: id }, data);
    }

    static definition(id) {
        return ABDefinitionModel.definitionForID(id);
    }

    //
    // Instance Methods
    //

    /**
     * @method destroy()
     *
     * destroy the current instance of ABObject
     *
     * also remove it from our parent application
     *
     * @return {Promise}
     */
    destroy() {
        return ABDefinition.destroy(this.id);
    }

    /**
     * @method save()
     *
     * persist this instance of ABObject with it's parent ABApplication
     *
     *
     * @return {Promise}
     *                      .resolve( {this} )
     */
    save() {
        if (this.id) {
            return ABDefinition.update(this.id, this.toObj());
        } else {
            return ABDefinition.create(this.toObj());
        }
    }
};
