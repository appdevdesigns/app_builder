export default class ABExternal {

	constructor(application) {
		this.application = application;
	}

	tableFind() {

		return new Promise((resolve, reject) => {

			OP.Comm.Socket.get({
				url: '/app_builder/external/application/' + this.application.id
			})
				.then((tableNames) => {

					resolve(tableNames);

				})
				.catch(reject);

		});

	}

	tableColumns(tableName) {

		return new Promise((resolve, reject) => {

			// OP.Comm.Socket.get({
			OP.Comm.Service.get({
				url: '/app_builder/external/model/' + tableName + '/columns'
			})
				.then((columnInfos) => {

					resolve(columnInfos);

				})
				.catch(reject);

		});

	}

	tableImport(tableName, columnNames) {

		return new Promise((resolve, reject) => {

			OP.Comm.Service.post({
				url: '/app_builder/external/application/' + this.application.id + '/model/' + tableName,
				params: {
					columns: columnNames
				}
			})
				.then((objectList) => {

					resolve(objectList);

				})
				.catch(reject);

		});

	}


}