/**
 * ABMLClassCore
 * manage the multilingual information of an instance of a AB Defined Class.
 *
 * these classes have certain fields ("label", "description"), that can be
 * represented in different language options as defined by our platform.
 *
 * This core ABMLClass will internally track the multilingual fields
 * (this.mlFields) and auto 
 */
module.exports =  class ABMLClassCore {

    constructor(fieldList) {

    	this.mlFields = fieldList || ["label"];
	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
	///
	  

	/**
	 * @method fromValues
	 * called during the .fromValues() work chain.  Should be called
	 * AFTER all the current data is already populated.  
	 */
	fromValues(attributes) {

		this.translations = attributes.translations;
		
		// multilingual fields: label, description
		this.translate();

	}





	/**
	 * @method toObj()
	 *
	 * called during the .toObj() work chain.  Should be called 
	 * BEFORE the current data is populated.
	 */
	toObj () {

		this.unTranslate();

		return {
			translations: this.translations
		}
	}

}

