

// import ABApplication from "./ABApplication"


module.exports = class ABProcessCore  {

    constructor(attributes, application) {

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
		this.type = attributes.type || "";
		this.json = attributes.json || null;
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


		return {
			id: this.id,
			name: this.name,
			type: this.type,
			json: this.json
		};

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

