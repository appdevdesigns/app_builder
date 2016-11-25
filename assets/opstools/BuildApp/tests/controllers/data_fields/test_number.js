steal(
	// Dependencies
	"opstools/BuildApp/controllers/data_fields/number.js",
	function (target) {
		//Define the unit tests
		describe('testing data field: number', function () {

			var divID = "testNumberDataField";
			var application, object, rowId, options;

			before(function () {
				application = {};
				object = {};
				rowId = 999;
				options = {};

				var html = [
					'<div id="' + divID + '">',
					'<div class="ab-number-format-show"></div>',
					'</div>'
				].join('\n');

				$('body').append($(html));
			});

			after(function () {
				$('#' + divID).find('.ab-number-format-show').html('');
			});

			it('should show integer without format', function () {
				var expectedValue = 654321;
				var data = 654321.33663;

				// Assign
				var fieldData = {
					setting: {
						typeDecimalPlaces: 'none',
						typeDecimalPlacesText: 'none',
						typeDecimals: 'none',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, expectedValue, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show integer with dollar format', function () {
				var expectedValue = "$ 654321";
				var data = 654321;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'none',
						typeDecimalPlaces: 'none',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'dollar'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show integer with pound format', function () {
				var expectedValue = "£ 654321";
				var data = 654321;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'none',
						typeDecimalPlaces: 'none',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'pound'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show integer with euro(before) format', function () {
				var expectedValue = "€ 654321";
				var data = 654321;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'none',
						typeDecimalPlaces: 'none',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'euroBefore'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show integer with euro(after) format', function () {
				var expectedValue = "654321 €";
				var data = 654321;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'none',
						typeDecimalPlaces: 'none',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'euroAfter'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show integer with percent format', function () {
				var expectedValue = "654321 %";
				var data = 654321;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'none',
						typeDecimalPlaces: 'none',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'percent'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show 3 decimal places', function () {
				var expectedValue = "654321.659";
				var data = 654321.65900;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'period',
						typeDecimalPlaces: '3',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show 2 decimal places with period type', function () {
				var expectedValue = "654321.65";
				var data = 654321.65000;

				// Assign
				var fieldData = {
					setting: {
						typeDecimalPlaces: '2',
						typeDecimals: 'period',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show 4 decimal places with comma type', function () {
				var expectedValue = "654321,6543";
				var data = 654321.65430;

				// Assign
				var fieldData = {
					setting: {
						typeDecimalPlaces: '4',
						typeDecimals: 'comma',
						typeThousands: 'none',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show comma on thousand digit', function () {
				var expectedValue = "987,654,321,6543";
				var data = 987654321.65430;

				// Assign
				var fieldData = {
					setting: {
						typeDecimalPlaces: '4',
						typeDecimals: 'comma',
						typeThousands: 'comma',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show period on thousand digit', function () {
				var expectedValue = "987.654.321,6543";
				var data = 987654321.65430;

				// Assign
				var fieldData = {
					setting: {
						typeDecimalPlaces: '4',
						typeDecimals: 'comma',
						typeThousands: 'period',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show space on thousand digit', function () {
				var expectedValue = "987 654 321.6543";
				var data = 987654321.65430;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'period',
						typeDecimalPlaces: '4',
						typeThousands: 'space',
						typeRounding: 'none',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show round up at 2 decimal places', function () {
				var expectedValue = "654321.16";
				var data = 654321.1543;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'period',
						typeDecimalPlaces: '2',
						typeThousands: 'none',
						typeRounding: 'roundUp',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show round down at 2 decimal places', function () {
				var expectedValue = "654321.15";
				var data = 654321.1593;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'period',
						typeDecimalPlaces: '2',
						typeThousands: 'none',
						typeRounding: 'roundDown',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});

			it('should show round down at 2 decimal places', function () {
				var expectedValue = "654321.15";
				var data = 654321.1593;

				// Assign
				var fieldData = {
					setting: {
						typeDecimals: 'period',
						typeDecimalPlaces: '2',
						typeThousands: 'none',
						typeRounding: 'roundDown',
						typeFormat: 'none'
					}
				};

				// Action
				target.customDisplay(application, object, fieldData, rowId, data, $('#' + divID), options);

				var result = $('#' + divID).find('.ab-number-format-show').html();

				// Assert
				assert.equal(expectedValue, result);
			});



		});
	}
);