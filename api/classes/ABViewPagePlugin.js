var path = require('path');

var ABViewPage = require(path.join(__dirname, "ABViewPage.js"));

module.exports = class ABViewPagePlugin extends ABViewPage {

	constructor(attributes, application, parent) {
		super(attributes, application, parent);

		// this.fromValues(attributes);

	}

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues(values) {

		super.fromValues(values);

		this.plugin = values.plugin;

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

		result.plugin = this.plugin;
		if (this.plugin.id) {
			result.plugin = this.plugin.id;
		}


		return result;
	}

}