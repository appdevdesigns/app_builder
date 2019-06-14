var path = require('path');

var ABModelBase = require('./ABModelBase');
var ABClassObject = require(path.join('..', 'classes', 'ABClassObject'));

class ABObject extends ABModelBase {

	static get collectionName() {
		return "object";
	}

	static get relations() {

		return {
			applications: {
				edgeName: "applicationHasObjects",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			}
		};

	}

	toABClass() {

		return new ABClassObject(this);

	}

	toValidJsonFormat(objects) {

		// // remove connected fields that does not link to objects in application
		// this.json.fields = this.json.fields.filter(f => {

		// 	if (f.key == 'connectObject' &&
		// 		f.settings &&
		// 		!objects.filter(o => o.id == f.settings.linkObject).length) {
		// 		return false;
		// 	}
		// 	else {
		// 		return true;
		// 	}

		// });

		return this;

	}


}

module.exports = ABObject;