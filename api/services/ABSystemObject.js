const ABGraphObject = require('../graphModels/ABObject');

const ABRole = require('../systemObjects/role');
const ABScope = require('../systemObjects/scope');

module.exports = {

	initial: () => {

		let systemObjList = [
			new ABRole(),
			new ABScope()
		];

		let tasks = [];

		systemObjList.forEach(obj => {

			tasks.push(() => ABMigration.createObject(obj)); // Create MySQL table without columns
			tasks.push(() => new Promise((next, err) => { // Populate fields
				obj.initFields();
				ABObjectCache.cache(obj);
				next();
			}));
			tasks.push(() => ABGraphObject.upsert(obj.id, obj.toObj())); // Save JSON

		});

		// Create Fields
		// NOTE: this is final step to create columns in the tables
		systemObjList.forEach(obj => {

			tasks.push(() => {

				obj.fields().forEach(f => {
					tasks.push(ABMigration.createField(f));
				});

			});

		});

		return tasks.reduce((promiseChain, currTask) => {
			return promiseChain.then(currTask);
		}, Promise.resolve([]));

	}

};