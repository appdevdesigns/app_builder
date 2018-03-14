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

		// [where]
		if (cond.where &&
			cond.where.where) {
			newCond.where = cond.where.where;
		}

		// [sort]
		if (cond.where &&
			cond.where.sort) {
			newCond.sort = cond.where.sort;
		}

		// [limit]
		if (cond.limit)
			newCond.limit = cond.limit;

		// [skip]
		if (cond.skip)
			newCond.skip = cond.skip;

		// {
		// 	where: { name: 'mary' },
		// 	skip: 20,
		// 	limit: 10,
		// 	sort: 'createdAt DESC'
		//   }

		return new Promise(
			(resolve, reject) => {

				// OP.Comm.Socket.get({
				OP.Comm.Service.get({
					url: this.modelURL(),
					params: newCond
				})
					.then((data) => {

						this.normalizeData(data);

						resolve({
							data: data,
							pos: newCond.skip || 0,  // specify position of insert new data
							total_count: null // TODO
						});
					})
					.catch(reject);

			}
		)

	}

}