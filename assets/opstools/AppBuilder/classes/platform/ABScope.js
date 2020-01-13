const ABScopeCore = require("../core/ABScopeCore");

module.exports = class ABScope extends ABScopeCore {

	constructor(values, application) {

		super(values, application);

	}

	save() {

		return this.application.scopeSave(this);

	}

	destroy() {

		return this.application.scopeDestroy(this);

	}

};