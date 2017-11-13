/*
 * ABViewBase
 *
 * ABViewBase defines the common ABView structure that is shared between 
 * the client and the server.  Mostly how it manages it's internal data, and
 * how it is related to the ABView classes.
 *
 */

// import EventEmitter from "events"
var EventEmitter = require('events').EventEmitter;

var ABViewBaseDefaults = {
	icon: 'window-maximize',
}


module.exports = class ABViewBase extends EventEmitter {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
	constructor(values, application, parent, defaultValues) {

		super();

		this.defaults = defaultValues || ABViewBaseDefaults;

		this.application = application;

		this.parent = parent || null;

		this.fromValues(values);

	}

	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABView instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj() {

		// NOTE: ensure we have a uuid() set:
		if (!this.id) {
			this.id = OP.Util.uuid();
		}

		return {
			id: this.id,
			key: this.key,
			icon: this.icon,

			name: this.name,
			// parent: this.parent,

			settings: this.settings || {},
			translations: this.translations || []

		}


	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		this.id = values.id;			// NOTE: only exists after .save()
		this.icon = values.icon || ABViewBaseDefaults.icon;

		// this.parent = values.parent || null;

		this.name = values.name;

		// if this is being instantiated on a read from the Property UI,
		// .label is coming in under .settings.label
		values.settings = values.settings || {};
		this.label = values.label || values.settings.label || '?label?';

		this.translations = values.translations || [];

		this.settings = values.settings || {};

	}


	/**
	 * @method urlPointer()
	 * return the url pointer that references this view.  This url pointer
	 * should be able to be used by this.application.urlResolve() to return 
	 * this view object.
	 * @return {string} 
	 */
	urlPointer() {
		if (this.parent) {
			return this.parent.urlView() + this.id;
		} else {
			return this.application.urlPage() + this.id;
		}
	}



	/**
	 * @method urlView
	 * return a string pointer to this object's views.
	 * @return {string}
	 */
	urlView() {
		return this.urlPointer() + '/_views/';
	}

}