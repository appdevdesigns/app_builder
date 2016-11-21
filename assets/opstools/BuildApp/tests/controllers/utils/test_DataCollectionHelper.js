steal(
	// Dependencies
	"opstools/BuildApp/tests/stubHelper.js",
	"opstools/BuildApp/controllers/utils/DataCollectionHelper.js",
	function (abStubHelper, dataCollectionHelper) {

		// the div to attach the controller to
		var divID = 'test_DataCollectionHelper';

		// add the div to the window
		var buildHTML = function () {
			var html = [
				'<div id="' + divID + '">',
				'</div>'
			].join('\n');

			$('body').append($(html));
		}

		//Define the unit tests
		describe('testing DataCollectionHelper utility ', function () {

			var appInfo = {
				id: 1,
				name: 'TEST_application'
			};

			before(function (done) {

				buildHTML();

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
						sinon.stub(dataCollectionHelper.modelCreator, 'getModel', function (application, objectName) {
							// get Mock model
							return abStubHelper.getMockModel(objectName);
						});

						next();
					}
				], done);
			});

			it('should return data collection of object data', function (done) {
				var objectId = appInfo.objects[0].id;

				dataCollectionHelper.getDataCollection(appInfo, objectId)
					.fail(function (err) {
						assert.fail(err, undefined, 'should not return any error');

						done();
					})
					.then(function (dataCollection) {
						assert.isOk(dataCollection);

						done();
					});
			});

			describe('test update connect data', function () {

				it('should remove data in parent when child data is deleted', function (done) {
					var ownerObjectId = 1,
						petObjectId = 2,
						ownerDC, petDC;

					async.series([
						// Get parent data collection
						function (next) {
							dataCollectionHelper.getDataCollection(appInfo, ownerObjectId)
								.fail(next)
								.then(function (result) {
									ownerDC = result;
console.log('ownerDC: ', ownerDC);
									next();
								});
						},
						// Get child data collection
						function (next) {
							dataCollectionHelper.getDataCollection(appInfo, petObjectId)
								.fail(next)
								.then(function (result) {
									petDC = result;
console.log('petDC: ', petDC);
									next();
								});
						}
						// ,
						// // Delete data of child
						// function (next) {
						// 	var deleteTasks = [];

						// 	ownerDC.find({}).forEach(function (owner) {
						// 		owner.Pet.forEach(function (pet) {

						// 			deleteTasks.push(function (ok) {
						// 				petDC.AD.destroyModel(pet.id)
						// 					.fail(ok)
						// 					.then(function () {
						// 						ok();

						// 						console.log('PET: ', petDC.AD.__list);
						// 					});
						// 			});

						// 		});
						// 	});

						// 	async.series(deleteTasks, next);
						// }
					], done);

				});

			});

		});

	}
);