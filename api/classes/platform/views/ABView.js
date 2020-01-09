const path = require('path');

const ABViewCore = require(path.join(__dirname, "..", "..", "core", "views", "ABViewCore.js"));

module.exports = class ABView extends ABViewCore {

	constructor(attributes, application, parent) {
		super(attributes, application, parent);

		this.fromValues(attributes);

	}

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		// now properly handle our sub pages.
		let pages = [];
		(values.pages || []).forEach((child) => {
			pages.push(this.viewNew(child));
		})
		this._pages = pages;

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

		let result = super.toObj();

		// compile our pages
		let pages = [];
		if (this._pages && this._pages.forEach) {
			this._pages.forEach((page) => {
				pages.push(page.toObj());
			});
		}
		result.pages = pages;

		return result;
	}

	/**
	 * @method viewNew()
	 *
	 *
	 * @return {ABView}
	 */
	viewNew(values) {
		return new ABView(values, this.application, this);
	}

}