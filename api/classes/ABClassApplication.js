var path = require('path');

var ABApplicationBase = require(path.join(__dirname,  "..", "..", "assets", "opstools", "AppBuilder", "classes",  "ABApplicationBase.js"));

var ABClassObject       = require(path.join(__dirname, 'ABClassObject'));
var ABClassQuery  = require(path.join(__dirname, 'ABClassQuery'));
var ABViewPage     = require(path.join(__dirname, 'ABViewPage'));
var ABObjectExternal = require(path.join(__dirname, 'ABObjectExternal'));
var ABObjectImport = require(path.join(__dirname, 'ABObjectImport'));
var ABMobileApp    = require(path.join(__dirname, 'ABMobileApp'));



module.exports =  class ABClassApplication extends ABApplicationBase {

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
			return new ABClassObject(values);
	}


	/**
	 * @method pageNew()
	 *
	 *
	 * @return {ABViewPage}
	 */
	pageNew( values ) {
		return new ABViewPage(values, this);
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

		return new ABClassQuery(values);

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
