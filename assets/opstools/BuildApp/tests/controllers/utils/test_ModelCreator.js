steal(
	// Dependencies
	"opstools/BuildApp/tests/stubHelper.js",
	"opstools/BuildApp/controllers/utils/ModelCreator.js",
	function (abStubHelper, modelCreator) {
		// the div to attach the controller to
		var divID = 'test_ModelCreator';

		// add the div to the window
		var buildHTML = function () {
			var html = [
				'<div id="' + divID + '">',
				'</div>'
			].join('\n');

			$('body').append($(html));
		}

		//Define the unit tests
		describe('testing ModelCreator utility ', function () {

			// Mock up application data
			var appInfo = {
				id: 1,
				name: 'TEST_application'
			};

			before(function (done) {

				buildHTML();

				abStubHelper.getMockModel('ABObject').findAll({})
					.then(function (result) {
						appInfo.objects = result;
						done();
					});

			});


			after(function () {
				// remove the div to the window
				$('body').find('#' + divID).remove();

			});


			describe('Object model : get', function () {

				it('should return object model', function () {
					var objModel = modelCreator.getModel(appInfo, 'Owner');

					if (objModel) {
						assert.isOk(objModel);
					}
					else {
						assert.fail(err, undefined, 'should not return any error');
					}
				});


				it('should not return object model', function () {
					var objModel = modelCreator.getModel(appInfo, 'NotExistsModel');

					if (objModel) {
						assert.fail(objModel, undefined, 'should not return');
					}
					else {
						assert.isOk(true);
					}
				});

			});

			describe('Object model : update', function () {

				it('should return a valid base model', function () {
					// Action
					var objModel = modelCreator.updateModel(appInfo, 'Owner');

					// Assert
					if (objModel) {
						assert.isOk(objModel);
					}
					else {
						assert.fail(err, undefined, 'should not return any error');
					}
				});

			});


		});
	}
);