


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

module.exports = class ABApplicationBase {

    constructor(attributes) {

    	// ABApplication Attributes
    	this.id    = attributes.id;
    	this.json  = attributes.json || {};
    	this.name  = attributes.name || this.json.name || "";
    	this.role  = attributes.role;


	  	// import all our ABObjects
	  	// NOTE: we work with ABObjects on both the client and server sides.
	  	// So we provide object methods in the base class.  However, each
	  	// ABObject sub class (client and server) needs to implement it's own
	  	// .objectNew() method.
	  	var newObjects = [];
	  	(attributes.json.objects || []).forEach((obj) => {
	  		newObjects.push( this.objectNew(obj) );  
	  	})
	  	this._objects = newObjects;


		// Object List Settings
		attributes.json.objectListSettings 		= attributes.json.objectListSettings || {};
		this.objectListSettings 				= this.objectListSettings || {};
		this.objectListSettings.isOpen 			= JSON.parse(attributes.json.objectListSettings.isOpen || false);
		this.objectListSettings.searchText 		= attributes.json.objectListSettings.searchText || "";
		this.objectListSettings.sortDirection 	= attributes.json.objectListSettings.sortDirection || "asc";
		this.objectListSettings.isGroup 		= JSON.parse(attributes.json.objectListSettings.isGroup || false);

  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///



	/**
	 * @method fieldsMultilingual()
	 *
	 * return an array of fields that are considered Multilingual labels for
	 * an ABApplication
	 *
	 * @return {array}
	 */
	static fieldsMultilingual() {
		return ['label', 'description'];
	}




	///
	/// Instance Methods
	///


	/// ABApplication data methods


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

		this.json.name = this.name;

		// for each Object: compile to json
		var currObjects = [];
		this._objects.forEach((obj) => {
			currObjects.push(obj.toObj())
		})
		this.json.objects = currObjects;

		this.json.objectListSettings = this.objectListSettings;

		return {
			id:this.id,
			name:this.name,
			json:this.json,
			role:this.role
		}
	}



	///
	/// Objects
	///




	/**
	 * @method objects()
	 *
	 * return an array of all the ABObjects for this ABApplication.
	 *
	 * @param {fn} filter  	a filter fn to return a set of ABObjects that this fn
	 *						returns true for.
	 * @return {array} 	array of ABObject
	 */
	objects (filter) {

		filter = filter || function() {return true; };

		return this._objects.filter(filter);

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
	// objectNew( values ) {
	// 	return new ABObject(values, this);
	// }



	/**
	 * @method objectDestroy()
	 *
	 * remove the current ABObject from our list of ._objects.
	 *
	 * @param {ABObject} object
	 * @return {Promise}
	 */
	objectDestroy( object ) {

		var remaininObjects = this.objects(function(o) { return o.id != object.id;})
		this._objects = remaininObjects;
		return this.save();
	}



	/**
	 * @method objectSave()
	 *
	 * persist the current ABObject in our list of ._objects.
	 *
	 * @param {ABObject} object
	 * @return {Promise}
	 */
	objectSave( object ) {
		var isIncluded = (this.objects(function(o){ return o.id == object.id }).length > 0);
		if (!isIncluded) {
			this._objects.push(object);
		}

		return this.save();
	}




	///
	///	Object List Settings
	///
	get objectlistIsOpen() {
		return this.objectListSettings.isOpen;
	}

	set objectlistIsOpen( isOpen ) {
		this.objectListSettings.isOpen = isOpen;
	}

	get objectlistSearchText() {
		return this.objectListSettings.searchText;
	}

	set objectlistSearchText( searchText ) {
		this.objectListSettings.searchText = searchText;
	}

	get objectlistSortDirection() {
		return this.objectListSettings.sortDirection;
	}

	set objectlistSortDirection( sortDirection ) {
		this.objectListSettings.sortDirection = sortDirection;
	}

	get objectlistIsGroup() {
		return this.objectListSettings.isGroup;
	}

	set objectlistIsGroup( isGroup ) {
		this.objectListSettings.isGroup = isGroup;
	}


}
