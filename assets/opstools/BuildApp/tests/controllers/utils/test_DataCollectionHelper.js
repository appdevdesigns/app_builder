steal(
	// Dependencies
	"opstools/BuildApp/controllers/utils/DataCollectionHelper.js",
	"opstools/BuildApp/tests/stubHelper.js",
	function (dataCollectionHelper) {
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
			},
				objectList;

			before(function (done) {

				buildHTML();

				abStubHelper.convertToStub(dataCollectionHelper.Model.ABObject, 'ABObject');

				// Stub ModelCreator
				sinon.stub(dataCollectionHelper.controllers.ModelCreator, 'getModel', function (objectName) {
					var q = $.Deferred();

					// Stub Object model
					q.resolve({
						findAll: function (cond) {
							var q = $.Deferred();

							$.ajax({
								url: '/opstools/BuildApp/tests/fixtures/' + objectName + '.json',
								type: 'GET',
								dataType: "json"
							})
								.fail(q.reject)
								.then(function (result) {
									q.resolve(new can.List(result));
								});

							return q;
						}
					});

					return q;
				});

				sinon.stub(dataCollectionHelper.controllers.DataHelper.controllers.ModelCreator, 'getModel', function (objectName) {
					var q = $.Deferred();

					// Stub Object model
					q.resolve({
						findAll: function (cond) {
							var q = $.Deferred();

							$.ajax({
								url: '/opstools/BuildApp/tests/fixtures/' + objectName + '.json',
								type: 'GET',
								dataType: "json"
							})
								.fail(q.reject)
								.then(function (result) {
									q.resolve(new can.List(result));
								});

							return q;
						}
					});

					return q;
				});

				// Set object list to data collection helper
				dataCollectionHelper.Model.ABObject.findAll().then(function (objects) {
					objectList = objects;
					appInfo.objects = objects;

					done();
				});
			});

			afterEach(function () {
				abStubHelper.clearLocalData('ABObject');
			});

			it('should return data collection of object data', function (done) {
				var objectId = objectList[0].id;

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

		});

	}
);