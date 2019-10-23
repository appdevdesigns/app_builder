

// import ABApplication from "./ABApplication"

var ABDefinition = require("./ABDefinition");
var ABMLClass = require("./ABMLClass");

module.exports = class ABProcessCore extends ABMLClass {

    constructor(attributes, application) {

    	super(/* ["label"] */);

		this.fromValues(attributes);
		this.application = application;

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
		this.name = attributes.name || "";
		// this.type = attributes.type || "";
		// this.json = attributes.json || null;


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
	toObj () {

		// default label value
		if (!this.label) {
			this.label = this.name;
		}

		// OP.Multilingual.unTranslate(this, this, ["label"]);
		var data = super.toObj();

		var fieldsToSave = ["id", "name"];
		fieldsToSave.forEach((f)=>{
			data[f] = this[f];
		})

		return data;
	}


	toDefinition () {

		return new ABDefinition({
			id: this.id,
			name: this.name,
			type: "process",
			json: this.toObj()
		});
	}





	/// ABApplication data methods


// 	/**
// 	 * @method destroy()
// 	 *
// 	 * destroy the current instance of ABObject
// 	 *
// 	 * also remove it from our parent application
// 	 *
// 	 * @return {Promise}
// 	 */
// 	destroy () {
// 		return new Promise(
// 			(resolve, reject) => {
// debugger;
// 			}
// 		);
// 	}


// 	/**
// 	 * @method save()
// 	 *
// 	 * persist this instance of ABObject with it's parent ABApplication
// 	 *
// 	 *
// 	 * @return {Promise}
// 	 *						.resolve( {this} )
// 	 */
// 	save () {

// 		return new Promise(
// 			(resolve, reject) => {

// debugger;				
// 			}
// 		)
// 	}


}

