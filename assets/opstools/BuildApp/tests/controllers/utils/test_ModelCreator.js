steal(
	// Dependencies
	"opstools/BuildApp/tests/stubHelper.js",
	"opstools/BuildApp/controllers/utils/ModelCreator.js",
	function () {
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

			var modelCreator = null,
				appInfo = {
					id: 1,
					name: 'TEST_application'
				};

			before(function () {

				buildHTML();

				// Initialize the controller
				modelCreator = new AD.controllers.opstools.BuildApp.ModelCreator($('#' + divID), {});
				modelCreator.setApp(appInfo);

				abStubHelper.convertToStub(modelCreator.Model.ABObject, 'ABObject');
				abStubHelper.convertToStub(modelCreator.Model.ABColumn, 'ABColumn');
			});


			after(function () {
				// remove the div to the window
				$('body').find('#' + divID).remove();

				// Restore to their original state
				abStubHelper.restore(modelCreator.Model.ABObject);
				abStubHelper.restore(modelCreator.Model.ABColumn);
			});


			afterEach(function () {
				abStubHelper.clearLocalData('ABObject');
				abStubHelper.clearLocalData('ABColumn');
			});


			it('should have application id & name', function () {
				assert.equal(modelCreator.data.appId, appInfo.id);
				assert.equal(modelCreator.data.appName, appInfo.name);
			});

			describe('Object model', function () {

				it('should return object model', function (done) {
					modelCreator.getModel('One')
						.fail(function (err) {
							assert.fail(err, undefined, 'should not return any error');

							done(err);
						})
						.then(function (objModel) {
							assert.isOk(objModel);

							done();
						});
				});


				it('should not return object model', function (done) {
					modelCreator.getModel('NotExistsModel')
						.fail(function (err) {
							assert.isOk(true);

							done();
						})
						.then(function (objModel) {
							assert.fail(objModel, undefined, 'should not return');

							done();
						});
				});

			});

			describe('Base model', function () {

				it('should return a valid base model', function () {
					// Assign
					var objectName = 'New Base Object model',
						describe = { 'field1': 'string', 'field2': 'text', 'field3': 'number', 'link': 'anotherModel' },
						multilingualFields = ['field1', 'field2'],
						associations = { 'link': 'anotherModelFullName' };

					// Action
					var result = modelCreator.defineBaseModel('New Object', describe, multilingualFields, associations);

					// Assert
					assert.equal(describe, result.describe());
					assert.equal(multilingualFields, result.multilingualFields);
					assert.equal(associations, result.associations);
				});

				it('should error when required params are missing', function () {
					// Assign
					var result,
						objectName = 'New Base Object model',
						describe = null,
						multilingualFields = null,
						associations = null;

					// Action
					try {
						result = modelCreator.defineBaseModel('New Object', describe, multilingualFields, associations);
						// Assert
						assert.fail(result, undefined, 'should not return');
					}
					catch (err) {
						// Assert
						assert.isOk(err, 'should throw a error');
					}
				});

			});


		});
	}
);