module.exports = class ABScope {

	constructor(values, application) {

		this.application = application;

		this.fromValues(values);

	}

	fromValues(values) {

		this.id = values.id;
		this.name = values.name;
		this.description = values.description;
		this.usernames = values.usernames || [];

	}

	toObj() {

		return {
			id: this.id,
			name: this.name,
			description: this.description,
			usernames: this.usernames
		};

	}

	save() {

		return this.application.scopeSave(this);

	}

	destroy() {

		return this.application.scopeDestroy(this);

	}

};