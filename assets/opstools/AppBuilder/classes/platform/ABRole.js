const ABRoleCore = require("../core/ABRoleCore");

module.exports = class ABRole extends ABRoleCore {

	constructor(values, application) {

		super(values, application);

	}

	fromValues(values) {

		super.fromValues(values);

		// multilingual fields: name, description
		OP.Multilingual.translate(this, this, ['name', 'description']);

	}

	toObj() {

		OP.Multilingual.unTranslate(this, this, ['name', 'description']);

		var result = super.toObj();
		return result;

	}

};