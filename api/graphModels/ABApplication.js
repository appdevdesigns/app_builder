var _ = require('lodash');
var path = require('path');

var ABModelBase = require('./ABModelBase');
var ABClassApplication = require(path.join('..', 'classes', 'ABClassApplication'));

class ABApplication extends ABModelBase {

	static get collectionName() {
		return "application";
	}

	static get relations() {

		return {
			objects: {
				edgeName: "applicationObject",
				linkCollection: "object",
				direction: this.relateDirection.OUTBOUND
			},

			queries: {
				edgeName: "applicationQuery",
				linkCollection: "query",
				direction: this.relateDirection.OUTBOUND
			}
		};

	}

	static beforeCreate(values) {
		if (values.name)
			values.name = values.name.replace(/ /g, '_');

		return Promise.resolve();
	}

	static beforeUpdate(values) {
		if (values.name)
			values.name = values.name.replace(/ /g, '_');

		return Promise.resolve();
	}

	static afterCreate(newRecord) {

		// if we have a proper ABApplication.id given:
		if (newRecord && newRecord.id) {

			sails.log.info('ABApplication:afterCreate() triggering registerNavBarArea(' + newRecord.id + ')');
			AppBuilder.registerNavBarArea(newRecord.id);
		}

		// don't wait around:
		return Promise.resolve();
	}

	static afterUpdate(updatedRecord) {

		if (updatedRecord && updatedRecord.id) {

			sails.log.info('ABApplication:afterUpdate() triggering updateNavBarArea(' + updatedRecord.id + ')');
			AppBuilder.updateNavBarArea(updatedRecord.id)
		}

		return Promise.resolve();
	}

	static beforeDestroy(id) {

		return Promise.resolve()

			// Pull application model
			.then(() => {

				return new Promise((next, err) => {

					this.findOne(id)
						.catch(err)
						.then(next);

				});

			})

			// Remove application's permissions
			.then(app => {

				return new Promise((next, err) => {

					var actionKeys = [app.actionKeyName()];

					Permissions.action.destroyKeys(actionKeys)
						.then((data) => {
							next(app);
						}, err);

				});

			})

			// Remove navigation area
			.then(app => {

				return new Promise((next, err) => {

					OPSPortal.NavBar.Area.remove(app.areaKey())
						.then(() => {
							next();
						}, err);

				});

			});

	}


	areaKey() {
		return _.kebabCase(`ab-${this.name}`);
	}

	actionKeyName() {
		return `opstools.${this.validAppName()}.view`
	}

	toABClass() {

		let app = this.toValidJsonFormat();

		return new ABClassApplication(app);

	}

	toValidJsonFormat() {

		this.json.objects = (this.objects || []);
		this.json.queries = (this.queries || []);

		delete this.objects;
		delete this.queries;

		return this;

	}

	validAppName() {
		return AppBuilder.rules.toApplicationNameFormat(this.name);
	}

}

module.exports = ABApplication;