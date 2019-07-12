var Database = require('arangojs').Database;
var fs = require("fs");
var path = require('path');

var conn;

module.exports = {

	database: () => {

		if (conn != null)
			return conn


		let url = sails.config.appbuilder.graphDB.url,
			databaseName = sails.config.appbuilder.graphDB.databaseName,
			user = sails.config.appbuilder.graphDB.user,
			pass = sails.config.appbuilder.graphDB.pass;

		conn = new Database(url);
		conn.useDatabase(databaseName);
		conn.useBasicAuth(user, pass);

		return conn;

	},

	initCollections: () => {

		return new Promise((resolve, reject) => {

			let tasks = [];

			let db = ABGraphDB.database();
			let modelsPath = path.join(__dirname, "..", "graphModels");

			fs.readdirSync(modelsPath).forEach(fileName => {

				if (fileName == "ABModelBase.js")
					return;

				let model = require(path.join(modelsPath, fileName));

				// Initial collections
				tasks.push(new Promise((next, err) => {

					let collection = db.collection(model.collectionName);

					Promise.resolve()
						.then(() => {
							return new Promise((ok, error) => {

								collection.exists()
									.catch(error)
									.then(exists => {
										ok(exists);
									});

							});
						})
						.then(exists => {
							if (exists)
								return Promise.resolve();
							else
								return collection.create();
						}, err)
						.then(next, err);

				}));

				// Initial edges
				Object.keys(model.relations || {}).forEach(relationName => {

					let edgeName = (model.relations || {})[relationName].edgeName;

					tasks.push(new Promise((next, err) => {

						let edge = db.edgeCollection(edgeName);

						Promise.resolve()
							.then(() => {
								return new Promise((ok, error) => {

									edge.exists()
										.catch(error)
										.then(exists => {
											ok(exists);
										});

								});
							})
							.then(exists => {
								if (exists)
									return Promise.resolve();
								else
									return edge.create();
							}, err)
							.then(next, err);

					}));

				});

			});

			// Final task
			tasks.push(() => {
				resolve();
				return Promise.resolve();
			});

			tasks.reduce((promiseChain, currTask) => {
				return promiseChain.then(currTask);
			}, Promise.resolve());

		});

	}

}