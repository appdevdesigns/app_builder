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
						abStubHelper.getFixtureData('ABObject')
							.then(function (objects) {
								appInfo.objects = objects;
								next();
							});
					},
					function (next) {
						// Stub ModelCreator
						sinon.stub(dataCollectionHelper.modelCreator, 'getModel', function (application, objectName) {
							// Stub Object model
							return {
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
							};
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

				it('test', function () {

				});

			});

		});

	}
);