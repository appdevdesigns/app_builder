const path = require('path');

const ABModelBase = require('./ABModelBase');
const ABClassApplication = require(path.join('..', 'classes', 'platform', 'ABApplication'));
const ABClassObject = require(path.join('..', 'classes', 'platform', 'ABObject'));
const ABObjectExternal = require(path.join('..', 'classes', 'platform', 'ABObjectExternal'));
const ABObjectImport = require(path.join('..', 'classes', 'platform', 'ABObjectImport'));

module.exports = class ABObject extends ABModelBase {

	static get collectionName() {
		return "object";
	}

	static get relations() {

		return {
			applications: {
				edgeName: "applicationObject",
				linkCollection: "application",
				direction: this.relateDirection.INBOUND
			},

			queries: {
				edgeName: "queryObject",
				linkCollection: "query",
				direction: this.relateDirection.INBOUND
			},

			dataviews: {
				edgeName: "dataviewObject",
				linkCollection: "dataview",
				direction: this.relateDirection.INBOUND
			},

			scopes: {
				edgeName: "scopeObject",
				linkCollection: "scope",
				direction: this.relateDirection.INBOUND
			}

		};

	}

	static afterCreate(newRecord) {

		// Cache in .constructor of ABClassObject
		newRecord.toABClass();

	}

	static afterUpdate(updatedRecord) {

		// Cache in .constructor of ABClassObject
		updatedRecord.toABClass();

		// Broadcast
		sails.sockets.broadcast(updatedRecord.id, "ab.object.update", {
			objectId: updatedRecord.id,
			data: updatedRecord
		});

	}

	static afterDestroy(record) {

		// remove cache
		ABObjectCache.remove(record.id);

	}

	toABClass() {

		// NOTE: Mock ABApplication and pass it into objects
		// because ABObjectCore needs to use .application
		let application = new ABClassApplication({});

		if (this.isExternal == true)
			return new ABObjectExternal(this, application);
		else if (this.isImported == true)
			return new ABObjectImport(this, application);
		else
			return new ABClassObject(this, application);

	}


};