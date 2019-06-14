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
				edgeName: "applicationHasObjects",
				linkCollection: "object",
				direction: this.relateDirection.OUTBOUND
			}
		};

	}

	areaKey() {
		return _.kebabCase('ab-' + this.name);
	}

	actionKeyName() {
		return actionKeyName(this.validAppName()); // 'opstools.' + this.validAppName() + '.view'; 
	}

	toABClass() {

		let app = this.toValidJsonFormat();

		return new ABClassApplication(app);

	}

	toValidJsonFormat() {

		// this.json.objects = (objects || []).map(obj => obj.toValidJsonFormat(objects).json);
		this.json.objects = (this.objects || []);
		this.json.queries = (this.queries || []);

		delete this.objects;

		return this;

	}

	validAppName() {
		return validAppName(this.name);
	}

}

function actionKeyName(name) {
	return 'opstools.' + name + '.view';
}

function validAppName(name) {
	return AppBuilder.rules.toApplicationNameFormat(name);
}


module.exports = ABApplication;