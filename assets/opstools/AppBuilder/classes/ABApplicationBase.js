


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

    	if (!attributes.json) {
    		console.error("AppBuilder:ABApplicationBase: received attributes without a .json description.  That seems janky! attributes:", attributes);
    	}
    	attributes.json = attributes.json || {};

    	// ABApplication Attributes
    	this.id    = attributes.id;
    	this.json  = attributes.json || {};
		if (typeof this.json == "string")
			this.json = JSON.parse(this.json);
    	this.name  = attributes.name || this.json.name || "";
		this.role  = attributes.role;
		this.isAdminApp = JSON.parse(attributes.json.isAdminApp || false);


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
		  

		// import all our ABViews
		var newPages = [];
		(attributes.json.pages || []).forEach((page) => {
			newPages.push( this.pageNew(page) );  
		})
		this._pages = newPages;


		// NOTE: keep this after ABObjects are loaded
		// import our ABObjectQueries
		// just like the .objectNew() both ABApplication.js (client and server) need to 
		// implement .queryNew()
		var newQueries = [];
		(attributes.json.queries || []).forEach((query) => {
			// prevent processing of null values.  
			if (query) {
		  		newQueries.push( this.queryNew(query) );  
		  	}
	  	})
		this._queries = newQueries;


		var newDataviews = [];
		(attributes.json.dataviews || []).forEach(dataview => {
			// prevent processing of null values.
			if (dataview) {
				  newDataviews.push( this.dataviewNew(dataview) );
			  }
		  })
		this._dataviews = newDataviews;


		// Mobile Apps
		// an Application can have one or more Mobile Apps registered.
		var newMobileApps = [];
		(attributes.json.mobileApps || []).forEach((ma) => {
			// prevent processing of null values.  
			if (ma) {
		  		newMobileApps.push( this.mobileAppNew(ma) );  
		  	}
	  	})
		this._mobileApps = newMobileApps;



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
		});
		this.json.objects = currObjects;

		this.json.objectListSettings = this.objectListSettings;



		// for each View: compile to json
		var currPages = [];
		this._pages.forEach((page) => {
			currPages.push(page.toObj())
		})
		this.json.pages = currPages;


		// for each MobileApp: compile to json
		var currApps = [];
		this._mobileApps.forEach((app) => {
			currApps.push(app.toObj())
		})
		this.json.mobileApps = currApps;


		return {
			id:this.id,
			name:this.name,
			json:this.json,
			role:this.role,
			isAdminApp: this.isAdminApp
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

		return (this._objects || []).filter(filter);

	}

	/**
	 * @method connectedObjects()
	 *
	 * return an array of all the connected ABObjects for this ABApplication.
	 *
	 * @param {id} id  	an ID of an ABObject
	 *
	 * @return {array} 	array of options for webix select
	 */
	connectedObjects (obj) {
		if (obj == "") return [];

		// Determine the object from the ID
		var myObj = this.objects((o) => o.id == obj);
		
		// Get all the connected Fields for that object
		var connectedFields = myObj[0].fields((f) => f.key == "connectObject");
		// Store the related fields associatively inside their related Objects ID
		var connectedObj = [];
		connectedFields.forEach((f) => {
			connectedObj[f.settings.linkObject] = this.objects((co) => co.id == f.settings.linkObject);
		});
		// Look up the objects by their ID and push them in an options array
		var linkedObjects = [];
		Object.keys(connectedObj).forEach(function(key, index) {
			linkedObjects.push({id:this[key][0].id, value:this[key][0].label});
		}, connectedObj);
		
		return linkedObjects;
	}
	
	
	/**
	 * @method connectedFields()
	 *
	 * return an array of all the connected ABFields for a given ABObject
	 *
	 * @param {currObj} id		an ID of the current ABObject
	 *
	 * @param {linkedObject} id	an ID of the linked ABObject
	 *
	 * @return {array}			array of options for webix select
	 */
	connectedFields (currObj, linkedObject) {
		// Determine the object from the currObj
		var myObj = this.objects((o) => o.id == currObj);
		
		// Get all the connected Fields for our object that match the linkedObject
		var connectedFields = myObj[0].fields((f) => (f.key == "connectObject" && f.settings.linkObject == linkedObject));
		// Build an arry of options for the webix select
		var linkedFields = [];
		connectedFields.forEach((f)=>{
			linkedFields.push({id:f.columnName, value:f.label});
		});

		return linkedFields;
	}

	/**
	 * @method objectByID()
	 * return the specific object requested by the provided id.
	 * @param {string} id
	 * @return {obj}
	 */
	objectByID (id) {

		return this.objects((o)=>{ return o.id == id; })[0];
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


	///
	/// Queries
	///

	/**
	 * @method queries()
	 *
	 * return an array of all the ABObjectQueries for this ABApplication.
	 *
	 * @param {fn} filter  	a filter fn to return a set of ABObjectQueries that 
	 *						this fn returns true for.
	 * @return {array} 	array of ABObjectQueries
	 */
	queries (filter) {

		filter = filter || function() {return true; };

		return (this._queries || []).filter(filter);

	}

	///
	/// Data views
	///

	/**
	 * @method dataviews()
	 *
	 * return an array of all the ABDataview for this ABApplication.
	 *
	 * @param {fn} filter  	a filter fn to return a set of ABDataview that 
	 *						this fn returns true for.
	 * @return {array} 	array of ABDataview
	 */
	dataviews (filter) {

		filter = filter || function() { return true; };

		return (this._dataviews || []).filter(filter);

	}


	///
	/// Pages
	///

	/**
	 * @method pages()
	 *
	 * return an array of all the ABViewPages for this ABApplication.
	 *
	 * @param {fn} filter		a filter fn to return a set of ABViewPages that this fn
	 *							returns true for.
	 * @param {boolean} deep	flag to find in sub pages
	 * 
	 * @return {array}			array of ABViewPages
	 */
	pages(filter, deep) {

		var result = [];

		if (!this._pages || this._pages.length < 1)
			return result;

		// find into sub-pages recursively
		if (filter && deep) {

			result = this._pages.filter(filter);

			if (result.length < 1) {
				this._pages.forEach((p) => {
					var subPages = p.pages(filter, deep);
					if (subPages && subPages.length > 0) {
						result = subPages;
					}
				});
			}

		}
		// find root pages
		else {

			filter = filter || function () { return true; };

			result = this._pages.filter(filter);

		}

		return result;

	}



	///
	/// Mobile Apps
	///



	/**
	 * @method mobileApps()
	 *
	 * return an array of all the ABObjectQueries for this ABApplication.
	 *
	 * @param {fn} filter  	a filter fn to return a set of ABObjectQueries that 
	 *						this fn returns true for.
	 * @return {array} 	array of ABObjectQueries
	 */
	mobileApps (filter) {

		filter = filter || function() {return true; };

		return this._mobileApps.filter(filter);

	}




	/**
	 * @method urlResolve()
	 * given an object pointer, return the specific object referenced.
	 * pointer must start with a '#', use '/' as delimiters, and either 
	 * reference an object's .id, or an object's .property.
	 * for example:
	 * #/_objects   : resolves to the array of ._objects pointed to by this 
	 * 				  application.
	 * #/_objects/[object.id] : reolved to a specific object 
	 * #/_objects/[object.id]/_fields/[field.id] : resolves to a specific data field
	 * 				  refereced by object.id.
	 *
	 * @param {string} pointer : the string url referencing the object you want
	 * 							 to retrieve.
	 * @return {obj} 
	 */
	urlResolve(pointer) {

		var parts = pointer.split('/');

		var parseStep = (obj, steps) => {

			// we're done.  obj is what we are looking for:
			if (steps.length == 0) {
				return obj;
			}

			// pull the next step key:
			var key = steps.shift();

			// special case, "#" makes sure we are talking about the 
			// Application object
			if (key == '#') {
				return parseStep(this, steps);
			}

			// if obj is an [], then key should be an .id reference to
			// lookup:
			if (Array.isArray(obj)) {

				obj = obj.filter(function(o){ return o.id == key;})[0];
				return parseStep(obj, steps);
			}

			// otherwise obj should be an {} and key a property:
			if (obj && obj[key]) {
				return parseStep(obj[key], steps);
			}


			// if we got here, there is an error!
			// console.error('!!! failed to lookup url:'+pointer);
			// console.warn('!!! failed to lookup url:'+pointer);
			return null;

		}

		return parseStep(this, parts)

	}


	/**
	 * @method urlPointer()
	 * return the url pointer for this application.
	 *
	 * @param {boolean} acrossApp - flag to include application id to url
	 * 
	 * @return {string} 
	 */
	urlPointer(acrossApp) {
		// NOTE: if we need to expand this to search across 
		// applications, then add in this application.id here:
		if (acrossApp)
			return '#/'+ this.id + '/'
		else
			return '#/';
	}


	/**
	 * @method urlObject()
	 * return the url pointer for objects in this application.
	 * 
	 * @param {boolean} acrossApp - flag to include application id to url
	 *
	 * @return {string} 
	 */
	urlObject(acrossApp) {
		return this.urlPointer(acrossApp) + '_objects/'
	}

	/**
	 * @method urlView()
	 * return the url pointer for pages in this application.
	 * 
	 * @param {boolean} acrossApp - flag to include application id to url
	 *
	 * @return {string} 
	 */
	urlPage(acrossApp) {
		return this.urlPointer(acrossApp) + '_pages/'
	}

	/**
	 * @method urlQuery()
	 * return the url pointer for queries in this application.
	 * 
	 * @param {boolean} acrossApp - flag to include application id to url
	 *
	 * @return {string} 
	 */
	urlQuery(acrossApp) {
		return this.urlPointer(acrossApp) + '_queries/'
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
