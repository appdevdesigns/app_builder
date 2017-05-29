/*
 * ABView
 *
 * An ABView defines a UI display container.
 *
 */

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABView  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 * @param {obj} defaultValues special sub class defined default values.
	 */
    constructor(values, application, parent, defaultValues) {

    	this.defaults = defaultValues;
    	
  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'viewKey',				// unique key for this View Type
  	// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
  	// 		label:'',					// pulled from translation

	//		settings: {					// unique settings for the type of field
	//		},

	// 		children:[],				// the child views contained by this view.

	//		translations:[]
  	// 	}
  		
  		this.fromValues(values);


    	// label is a multilingual value:
    	OP.Multilingual.translate(this, this, ['label']);

    	this.application = application;

    	this.parent = parent || null;
  	}



  	viewKey() {
  		return this.defaults.key;
  	}


  	viewIcon() {
  		return this.defaults.icon;
  	}


  	/*
  	 * @method isValid
  	 * check the current values to make sure they are valid.
  	 * Here we check the default values provided by ABView.
  	 *
  	 * @return {OP.Validation.validator()}
  	 */
	isValid() {

		var validator = OP.Validation.validator();

		// // labels must be unique among views on the same parent
		var parent = this.parent;
		if (!parent) { parent = this.application; }


		var isNameUnique = (parent.views((v)=>{
			return (v.id != this.id)
					&& (v.label.toLowerCase() == this.label.toLowerCase() );
		}).length == 0);
		if (!isNameUnique) {
			validator.addError('label', L('ab.validation.view.label.unique', '*View label must be unique among peers.'));
		}

		return validator;
	}



	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 *
	 * @return {Promise}
	 */
	destroy () {
		return new Promise(
			(resolve, reject) => {

				// verify we have been .save()d before:
				if (this.id) {

					if (!this.parent) {

						this.application.viewDestroy(this)
						.then(resolve)
						.catch(reject);

					} else {

					}

				} else {

					resolve();  // nothing to do really
				}

			}
		)

	}


	/**
	 * @method save()
	 *
	 * persist this instance of ABField with it's parent ABObject
	 *
	 *
	 * @return {Promise}
	 *						.resolve( {this} )
	 */
	save () {
		return new Promise(
			(resolve, reject) => {

				// if this is our initial save()
				if (!this.id) {
					this.id = OP.Util.uuid();	// setup default .id
				}

				// if this is not a child of another view then store under
				// application.
				var parent = this.parent;
				if (!parent) parent = this.application;

				parent.viewSave(this)
				.then(resolve)
				.catch(reject)
			}
		)
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABField instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj () {

		OP.Multilingual.unTranslate(this, this, ['label']);

		// // for each Object: compile to json
		var currChildren = [];
		this._children.forEach((child) => {
			currChildren.push(child.toObj())
		})

		return {
			id : this.id,
			key : this.key,
			icon : this.icon,

// parent: this.parent,

			settings: this.settings || {},
			translations:this.translations || [],
			children:currChildren

		}
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

 		this.id = values.id;			// NOTE: only exists after .save()
    	this.key = values.key || this.viewKey();
    	this.icon = values.icon || this.viewIcon();

// this.parent = values.parent || null;

		values.settings = values.settings || {};

    	// if this is being instantiated on a read from the Property UI,
    	// .label is coming in under .settings.label
    	this.label = values.label || values.settings.label || '?label?';


    	this.translations = values.translations || [];

    	this.settings = values.settings || {};


    	var children = [];
    	// (values.children || []).forEach((child) => {
    	// 	children.push(this.newChild(child));
    	// })
    	this._children = children;

    	// convert from "0" => 0

	}



	isRoot() {
		return this.parent == null;
	}



}
