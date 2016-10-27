steal(
	// Dependencies
	"opstools/BuildApp/controllers/utils/ModelCreator.js",
	"opstools/BuildApp/tests/stubHelper.js",
	function (modelCreator) {
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

			var appInfo = {
				id: 1,
				name: 'TEST_application'
			};

			before(function () {

				buildHTML();

				// Initialize the controller
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

				it('should return object model', function () {
					var objModel = modelCreator.getModel('One');

					if (objModel) {
						assert.isOk(objModel);
					}
					else {
						assert.fail(err, undefined, 'should not return any error');
					}
				});


				it('should not return object model', function () {
					var objModel = modelCreator.getModel('NotExistsModel');

					if (objModel) {
						assert.fail(objModel, undefined, 'should not return');
					}
					else {
						assert.isOk(true);
					}
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

					try {
						// Action
						result = modelCreator.defineBaseModel('New Object', describe, multilingualFields, associations);
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