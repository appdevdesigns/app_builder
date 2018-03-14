import ABModel from "./ABModel"

export default class ABModelExternal extends ABModel {

	constructor(object) {

		super(object);

	}


	///
	/// Instance Methods
	///
	modelURL() {
		return '/' + this.object.urlPath;
	}

	/**
	 * @method findAll
	 * performs a data find with the provided condition.
	 */
	findAll(cond) {

		cond = cond || {};


		// prepare our condition:
		var newCond = {};

		// if the provided cond looks like our { where:{}, skip:xx, limit:xx } format,
		// just use this one.
		if (cond.where) {
			newCond = cond;
		} else {

			// else, assume the provided condition is the .where clause.
			newCond.where = {
				where: [cond]
			};
		}

		// WORKAROUND
		newCond = {};

		return new Promise(
			(resolve, reject) => {

				OP.Comm.Socket.get({
					url: this.modelURL(),
					params: newCond
				})
					.then((data) => {

						this.normalizeData(data);

						// TODO: position of data
						resolve({
							data: data
						});
					})
					.catch(reject);

			}
		)

	}

}