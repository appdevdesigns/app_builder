// import ABApplication from "./ABApplication"

var ABDefinitionCore = require("../core/ABDefinitionCore");

// var ABDefinitionModel = require("../data/ABDefinition");

var __AllDefinitions = {};

module.exports = class ABDefinition extends ABDefinitionCore {
    constructor(attributes, application) {
        super(attributes, application);

        this.fromValues(attributes);

        // listen
        AD.comm.hub.subscribe("ab.abdefinition.update", (msg, data) => {
            if (this.id == data.objectId) this.fromValues(data.data);
        });
    }

    ///
    /// Static Methods
    ///
    /// Available to the Class level object.  These methods are not dependent
    /// on the instance values of the Application.
    ///

    /**
     * @method all()
     *
     * return the current definitions.
     *
     * @param {fn} filter   an optional filter that works on the ABDefinition 
     * @return [array] of ABDefinition
     */
    static all(filter) {
        if (!filter) filter = function () { return true; }

        return Object.keys(__AllDefinitions).map((k)=>{ return __AllDefinitions[k];}).filter(filter).map((d)=>{return d.json;})
    }

    static allObjects(f) {
        if (!f) f = function() { return true; };
        var allObjs = ABDefinition.all((d)=>{ return d.type == "object"; });
        return allObjs.filter(f);
    }

    /**
     * @method create()
     *
     * create a given ABDefinition
     *
     * @param {obj} data   the values of the ABDefinition obj
     * @return {Promise}   the updated value of the ABDefinition entry from the server.
     */
    static create(data) {
        return OP.Comm.Service.post({
            url: `/app_builder/abdefinitionmodel`,
            data: data
        }).then((serverDef) => {
            return (__AllDefinitions[serverDef.id] = serverDef);
        });
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
        return OP.Comm.Service.delete({
            url: `/app_builder/abdefinitionmodel/${id}`
        }).then((serverDef) => {
            delete __AllDefinitions[id];
        });
    }

    /**
     * @method loadAll()
     *
     * load all the Definitions for The current AppBuilder:
     *
     * @return {array}
     */
    static loadAll() {
        return OP.Comm.Socket.get({
            url: `/app_builder/abdefinitionmodel`
        }).then((allDefinitions) => {
            (allDefinitions || []).forEach((def) => {
                __AllDefinitions[def.id] = def;
            });
            return allDefinitions;
        });
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
        return OP.Comm.Service.put({
            url: `/app_builder/abdefinitionmodel/${id}`,
            data: data
        }).then((serverDef) => {
            return (__AllDefinitions[serverDef.id] = serverDef);
        })
        .catch((err)=>{
            debugger;
            if (err.toString().indexOf("Not Found") > -1) {
                return this.create(data)
            }
        })
    }

    static definition(id) {
        var def = __AllDefinitions[id];
        if (def) {
            return def.json;
        }
        return null;
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
        // OP.Multilingual.unTranslate(this, this, ["label"]);

        var result = super.toObj();

        return result;
    }

    /// ABApplication data methods

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
     *						.resolve( {this} )
     */
    save() {
        if (this.id) {
            return ABDefinition.update(this.id, this.toObj());
        } else {
            return ABDefinition.create(this.toObj());
        }
    }
};
