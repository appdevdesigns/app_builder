// ABObjectWorkspaceView.js
//
// Manages the settings for a view in the AppBuilder Object Workspace


export default class ABObjectWorkspaceView {

	constructor(attributes, object, defaultLabel) {
		this.defaultLabel = defaultLabel || 'default view';
/*
	{
		id:uuid(),

	}

*/
		this.fromObj(attributes || {});

    	// multilingual fields: label
    	OP.Multilingual.translate(this, this, ['label']);

    	this.object = object;


    	// user ids.  if has user id, then only those users can see this.
    	// this.users = [];  
	}


	/**
	 * unique key describing this View.
	 * @return {string}
	 */
	static type() {
		return 'view';
	}


	/**
	 * @method fromObj
	 * take our persisted data, and properly load it
	 * into this object instance.
	 * @param {json} data  the persisted data
	 */
	fromObj(data) {

		this.id = data.id || OP.Util.uuid();
		this.isReadOnly = JSON.parse(data.isReadOnly || false);
		this.translations = data.translations || OP.Multilingual.defaultTranslations(['label'], {label:this.defaultLabel});

	}


	/**
	 * @method toObj()
	 * compile our current state into a {json} object
	 * that can be persisted.
	 */
	toObj () {

		OP.Multilingual.unTranslate(this, this, ['label']);
		return {
			id: this.id,
			translations:this.translations,
			isReadOnly: this.isReadOnly,
		}
	}
}

