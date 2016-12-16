steal(
	// Dependencies
	"opstools/BuildApp/tests/stubHelper.js",
	"opstools/BuildApp/controllers/utils/DataHelper.js",
	function (abStubHelper, dataHelper) {

		//Define the unit tests
		describe('testing DataHelper utility ', function () {

			var appInfo = {
				id: 1,
				name: 'TEST_application'
			};

			before(function (done) {
				async.series([
					function (next) {
						abStubHelper.getMockModel('ABObject').findAll({})
							.then(function (result) {
								appInfo.objects = result;
								next();
							});
					},
					function (next) {
						// Stub ModelCreator
						sinon.stub(dataHelper.modelCreator, 'getModel', function (application, objectName) {
							// get Mock model
							return abStubHelper.getMockModel(objectName);
						});

						next();
					}
				], done);
			});

			after(function () {
				dataHelper.modelCreator.getModel.restore();
			})

			it('test populate data label to children data', function (done) {
				var objectId = 1;

				async.waterfall([
					// Get columns data
					function (next) {
						abStubHelper.getMockModel('ABColumn').findAll({ object: objectId }).fail(next)
							.then(function (result) {
								next(null, result);
							});
					},
					function (columns, next) {
						abStubHelper.getMockModel('Owner').findAll({}).fail(next)
							.then(function (result) {
								next(null, columns, result);
							});
					},
					function (columns, rowData, next) {
						// Assert
						rowData.forEach(function (data) {
							data.Pet.forEach(function (pet) {
								assert.isUndefined(pet._dataLabel, 'this pet should not have _dataLabel');
							});
						});

						dataHelper.normalizeData(appInfo, objectId, columns, rowData, true).fail(next)
							.then(function (result) {
								// Assert
								result.forEach(function (data) {
									data.Pet.forEach(function (pet) {
										assert.isNotNull(pet._dataLabel, 'this pet should have _dataLabel');
										assert.equal(pet._dataLabel, 'Label ID: #id#'.replace('#id#', pet.id));
									});
								});

								next();
							});

					}
				], done);
			});

		});

	}
);