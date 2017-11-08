var path = require('path');

var ABViewBase = require(path.join(__dirname, "..", "..", "assets", "opstools", "AppBuilder", "classes", "views", "ABViewBase.js"));

module.exports = class ABViewPage extends ABViewBase {

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
		var pages = [];
		(values.pages || []).forEach((child) => {
			pages.push(this.pageNew(child));
		})
		this._pages = pages;


		this.views = values.views || [];

		// now properly handle our data collections.
		this.dataCollections = values.dataCollections || [];

	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABViewPage instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj() {

		var result = super.toObj();

		// compile our pages
		var pages = [];
		if (this._pages && this._pages.forEach) {
			this._pages.forEach((page) => {
				pages.push(page.toObj());
			});
		}
		result.pages = pages;

		result.views = this.views;
		result.dataCollections = this.dataCollections;


		return result;
	}

	/**
	 * @method pageNew()
	 *
	 *
	 * @return {ABViewPage}
	 */
	pageNew(values) {
		return new ABViewPage(values, this.application, this);
	}

}