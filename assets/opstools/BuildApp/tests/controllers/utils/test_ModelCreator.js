steal(
	// Dependencies
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
					id: 999,
					name: 'TEST app'
				},
				objectName = 'TEST object';

			before(function () {

				buildHTML();

				// Initialize the controller
				modelCreator = new AD.controllers.opstools.BuildApp.ModelCreator($('#' + divID), {});
				modelCreator.setApp(appInfo);
			});

			afterEach(function () {
				// Restore jQuery's ajax method to its original state
				if ($.ajax.restore)
					$.ajax.restore();
			});

			after(function () {
				// remove the div to the window
				$('body').find('#' + divID).remove();
			});

			it('test get model', function (done) {
				// Use Sinon to replace jQuery's ajax method with a stub.
				sinon.stub($, 'ajax').yieldsTo('success', [1, 2, 3]);

				modelCreator.getModel(objectName)
					.fail(function (err) {
						assert.fail(err, undefined, 'should not return any error.');

						done(err);
					})
					.then(function (objModel) {
						assert.isOk(objModel);

						done();
					});
			});


		});
	}
);