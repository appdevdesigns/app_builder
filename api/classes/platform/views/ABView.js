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


		// now properly handle our sub views.
		let views = [];
		(values.views || []).forEach(v => {
			views.push(this.viewNew(v));
		});
		this._views = views;

		if (values.position)
			this.position = values.position;

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

		let views = [];
		if (this._views && this._views.forEach) {
			this._views.forEach(v => {
				views.push(v.toObj());
			});
		}
		result.views = views;

		if (this.position)
			result.position = this.position;

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