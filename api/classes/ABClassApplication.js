var path = require('path');

var ABApplicationBase = require(path.join(__dirname,  "..", "..", "assets", "opstools", "AppBuilder", "classes",  "ABApplicationBase.js"));
var ABObject = require(path.join(__dirname, 'ABObject'));
var ABViewPage = require(path.join(__dirname, 'ABViewPage'));

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

function toArray(DC) {
	var ary = [];

	var id = DC.getFirstId();
	while(id) {
		var element = DC.getItem(id);
		ary.push(element);
		id = DC.getNextId(id);
	}

	return ary;
}

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


}
