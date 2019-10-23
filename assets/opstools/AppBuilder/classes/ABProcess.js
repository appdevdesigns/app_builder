

// import ABApplication from "./ABApplication"
import ABApplication from "./ABApplication" // NOTE: change to require()

const ABProcessCore = require("./ABProcessCore");

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

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

				this.toDefinition().destroy()
				// .then(()=>{
				// 	return this.application.processRemove(this)
				// })
				.catch((err)=>{
					reject(err);
				})
				.then(()=>{
					// allow normal processing to contine now:
					resolve();
				})
				.then(()=>{
					// in the background
					// remove this reference from ALL Applications that link
					// to me:
					ABApplication.allCurrentApplications()
					.then((apps)=>{
						var appsWithProcess = apps.find((a)=>{ return a.processIDs.indexOf(this.id) != -1; });
						if (appsWithProcess.length > 0) {
							appsWithProcess.forEach((removeMe)=>{
								console.log(" ABProcess.destroy():additional Apps:"+removeMe.label);
								removeMe.processRemove(this);
							})
							
						}
					})
				})
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


	isValid() {

		var validator = OP.Validation.validator();

		// label/name must be unique:
		var isNameUnique = (this.application.processes((o) => { return o.name.toLowerCase() == this.name.toLowerCase(); }).length == 0);
		if (!isNameUnique) {
			validator.addError('name', L('ab.validation.object.name.unique', `Process name must be unique ("${this.name}"" already used in this Application)`) );
		}

		return validator;
	}


}

