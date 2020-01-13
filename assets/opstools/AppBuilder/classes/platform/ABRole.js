const ABRoleCore = require("../core/ABRoleCore");

module.exports = class ABRole extends ABRoleCore {

	constructor(values, application) {

		super(values, application);

	}

	save() {

		return this.application.roleSave(this);

	}

	destroy() {

		return this.application.roleDestroy(this);

	}

	getUsers() {

		return this.application.roleUsers(this);

	}

};