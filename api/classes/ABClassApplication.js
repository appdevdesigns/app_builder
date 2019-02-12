var path = require('path');

var ABApplicationBase = require(path.join(__dirname,  "..", "..", "assets", "opstools", "AppBuilder", "classes",  "ABApplicationBase.js"));

var ABObject       = require(path.join(__dirname, 'ABObject'));
var ABViewPage     = require(path.join(__dirname, 'ABViewPage'));
var ABObjectExternal = require(path.join(__dirname, 'ABObjectExternal'));
var ABObjectImport = require(path.join(__dirname, 'ABObjectImport'));
var ABObjectQuery  = require(path.join(__dirname, 'ABObjectQuery'));
var ABObjectQueryV1  = require(path.join(__dirname, 'ABObjectQueryV1'));
var ABMobileApp    = require(path.join(__dirname, 'ABMobileApp'));
var ABFieldManager = require(path.join(__dirname, 'ABFieldManager'));



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
	 * @method fieldNew()
	 *
	 * return an instance of a new (unsaved) ABField that is tied to a given
	 * ABObject.
	 *
	 * NOTE: this new field is not included in our this.fields until a .save()
	 * is performed on the field.
	 *
	 * @param {obj} values  the initial values for this field.  
	 *						{ key:'{string}'} is required 
	 * @param {ABObject} object  the parent object this field belongs to.
	 * @return {ABField}
	 */
	fieldNew ( values, object ) {
		// NOTE: ABFieldManager returns the proper ABFieldXXXX instance.
		return ABFieldManager.newField( values, object );
	}


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
			return new ABObject(values, this);
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
	 * return an instance of a new (unsaved) ABObjectQuery that is tied to this
	 * ABApplication.
	 *
	 * @return {ABObjectQuery}
	 */
	queryNew( values ) {

		if (Array.isArray(values.joins))
			return new ABObjectQueryV1(values, this);
		else 
			return new ABObjectQuery(values, this);
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
