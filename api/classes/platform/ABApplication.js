const path = require('path');

const ABApplicationCore = require(path.join(__dirname,  "..", "core", "ABApplicationCore.js"));

const ABClassObject       = require(path.join(__dirname, 'ABObject'));
const ABClassQuery  = require(path.join(__dirname, 'ABObjectQuery'));
const ABView     = require(path.join(__dirname, 'views', 'ABView'));
const ABObjectExternal = require(path.join(__dirname, 'ABObjectExternal'));
const ABObjectImport = require(path.join(__dirname, 'ABObjectImport'));
const ABMobileApp    = require(path.join(__dirname, 'ABMobileApp'));



module.exports =  class ABClassApplication extends ABApplicationCore {

    constructor(attributes) {

    	super(attributes);

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
	objectNew( values ) {

		if (values.isExternal == true)
			return new ABObjectExternal(values, this);
		else if (values.isImported == true)
			return new ABObjectImport(values, this);
		else
			return new ABClassObject(values, this);
	}


	/**
	 * @method viewNew()
	 *
	 *
	 * @return {ABView}
	 */
	pageNew( values ) {
		return new ABView(values, this);
	}


	/**
	 * @method queryNew()
	 *
	 * return an instance of a new (unsaved) ABClassQuery that is tied to this
	 * ABApplication.
	 *
	 * @return {ABClassQuery}
	 */
	queryNew( values ) {

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
	mobileAppNew( values ) {
		return new ABMobileApp(values, this);
	}


}
