/**
 * Generate data type for AppBuilder apps.
 */

var AD = require('ad-utils'),
	async = require('async');

module.exports = {

	getFieldString: function (column) {
		var dfd = AD.sal.Deferred();

		if (!column.setting.linkType
			|| !column.setting.linkObject
			|| !column.setting.appName) {
			dfd.reject('Parameters is invalid.');
			return dfd;
		}

		// fieldName:[model|collection]:linkObjectName:[viaReference]
		var colString = '';
		colString += column.name;
		colString += ':' + column.setting.linkType; // model, collection

		async.series([
			function (next) {
				ABObject.findOne({ id: column.setting.linkObject })
					.fail(next)
					.then(function (object) {
						colString += ':' + AppBuilder.rules.toObjectNameFormat(column.setting.appName, object.name) // model name

						next();
					});
			},
			function (next) {
				if (!column.setting.linkVia) {
					next();
					return;
				}

				ABColumn.findOne({ id: column.setting.linkVia })
					.fail(next)
					.then(function (linkVia) {
						colString += ':' + linkVia.name; // viaReference

						next();
					});
			}
		], function () {
			dfd.resolve(colString);
		});

		return dfd;
	}

};