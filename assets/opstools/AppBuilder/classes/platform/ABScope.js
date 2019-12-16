module.exports = class ABScope {

	constructor(values, application) {

		this.application = application;

		this.fromValues(values);

	}

	fromValues(values) {

		this.name = values.name;
		this.description = values.description;

	}

	toObj() {

		return {
			name: this.name,
			description: this.description
		};

	}

	save() {

		return this.application.scopeSave(this);

	}

	destroy() {

		return this.application.scopeDestroy(this);

	}

};