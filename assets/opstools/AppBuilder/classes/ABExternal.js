export default class ABExternal {

	constructor(application) {
		this.application = application;
	}

	modelFind() {

		return new Promise((resolve, reject) => {

			OP.Comm.Service.get({
				url: '/app_builder/external/application/' + this.application.id
			})
				.then((modelNames) => {

					resolve(modelNames);

				})
				.catch(reject);

		});

	}

	modelAttributes(modelName) {

		return new Promise((resolve, reject) => {

			OP.Comm.Service.get({
				url: '/app_builder/external/model/' + modelName + '/attributes'
			})
				.then((attributes) => {

					resolve(attributes);

				})
				.catch(reject);

		});

	}

	modelImport(modelName, columnNames) {

		return new Promise((resolve, reject) => {

			OP.Comm.Service.post({
				url: '/app_builder/external/application/' + this.application.id + '/model/' + modelName,
				params: {
					columns: columnNames
				}
			})
				.then((objectData) => {

					resolve(objectData);

				})
				.catch(reject);

		});

	}


}