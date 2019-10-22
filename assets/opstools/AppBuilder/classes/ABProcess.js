

// import ABApplication from "./ABApplication"

const ABProcessCore = require("./ABProcessCore");

module.exports = class ABProcess extends ABProcessCore {

    constructor(attributes, application) {
    	super(attributes, application);


		// listen
		AD.comm.hub.subscribe("ab.abprocess.update", (msg, data) => {

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

		// if this is an update:
		// if (this.id) {
		// 	return ABDefinition.update(this.id, this.toDefinition());
		// } else {

		// 	return ABDefinition.create(this.toDefinition());
		// }

		return this.toDefinition().save().then((data)=>{
			// if I didn't have an .id then this was a create()
			// and I need to update my data with the generated .id

			if (!this.id) {
				this.id = data.id;
			}
		})
	}


}
