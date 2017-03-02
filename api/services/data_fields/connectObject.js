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

		var formatAppName = AppBuilder.rules.toApplicationNameFormat(column.setting.appName);

		// fieldName:[model|collection]:linkObjectName:[viaReference]
		var colString = '';
		colString += column.name;
		colString += ':' + column.setting.linkType; // model, collection

		async.series([
			function (next) {
				ABObject.findOne({ id: column.setting.linkObject })
					.fail(next)
					.then(function (object) {
					    if (!object) {
					        console.log('Object not found');
					        console.log('id: ' + column.setting.linkObject);
					        console.log(column.setting);
					        next(new Error('object not found'));
					        return;
					    }
						colString += ':' + AppBuilder.rules.toObjectNameFormat(formatAppName, object.name) // model name

						next();
						return null;
					});
			},
			function (next) {
				if (!column.setting.linkVia) {
				    if (column.setting.linkType == 'collection') {
				        colString += ':id';
				    }
					next();
					return;
				}
                
                var linkViaColID = parseInt(column.setting.linkVia);
                if (!linkViaColID || linkViaColID != column.setting.linkVia) {
                    AD.log.error('Warning! `setting.linkVia` is invalid!');
                    AD.log.error('in connectObject.js :: getFieldString()');
                }
                
				ABColumn.findOne({ id: linkViaColID })
					.then(function (linkVia) {
						if (linkVia)
							colString += ':' + linkVia.name; // viaReference

						next();
						return null;
					})
					.catch(function(err) {
					   next(err);
					   return null;
					});
			}
		], function (err) {
			if (err)
				dfd.reject(err);
			else
				dfd.resolve(colString);
		});

		return dfd;
	},

    defaults: {
        type: 'connectObject',
        fieldName: 'connectObject',
        setting: {
            //appName: {string},
            //linkType: 'model' or 'collection',
            //linkObject: {integer},
            //linkViaType: 'model' or 'collection',
            //linkVia: {integer},
            icon: 'external-link',
            template: '<div class="connect-data-values"></div>'
        }
    }
};