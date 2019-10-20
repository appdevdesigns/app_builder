

// import ABApplication from "./ABApplication"

var ABDefinitionCore = require("./ABDefinitionCore");

// var ABDefinitionModel = require("../data/ABDefinition");


var __AllDefinitions = {};


module.exports = class ABDefinition extends ABDefinitionCore {

    constructor(attributes, application) {
    	super(attributes, application);

		this.fromValues(attributes);

		// listen
		AD.comm.hub.subscribe("ab.abdefinition.update", (msg, data) => {

			if (this.id == data.objectId)
				this.fromValues(data.data);

		});

	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
	///
	  
	/**
	 * @method loadAll()
	 *
	 * load all the Definitions for The current AppBuilder:
	 *
	 * @return {array}
	 */
	static loadAll() {

		return OP.Comm.Socket.get({
				url: `/app_builder/abdefinition`
			})
			.then((allDefinitions)=>{
				(allDefinitions || []).forEach((def)=>{
					__AllDefinitions[def.id] = def;
				})
			});
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
	toObj () {

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
	destroy () {
		return new Promise(
			(resolve, reject) => {
debugger;
			}
		);
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
	save () {

		return new Promise(
			(resolve, reject) => {

debugger;				
			}
		)
	}


}

