import ABFieldSelectivity from "../../../classes/dataFields/ABFieldSelectivity"

describe("ABFieldSelectivity unit tests", () => {

	var sandbox;

	var mockObject;
	var target;
	var domTest = document.querySelector('#ab_test_div');

	const columnName = 'TEST_SELECTIVITY_COLUMN';

	var sampleItems = [
		{
			id: 1,
			text: 'FIRST_ITEM'
		},
		{
			id: 2,
			text: 'SECOND_ITEM'
		},
		{
			id: 3,
			text: 'THIRD_ITEM'
		}

	];


	before(() => {
		mockObject = {};

		target = new ABFieldSelectivity({
			columnName: columnName,
			settings: {}
		}, mockObject, {});

	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();

		// Clear test div
		target.selectivityDestroy(domTest);
	});

	after(() => {
		// domTest;
	});

	describe('.selectivityRender', () => {

		it('should exist', () => {

			assert.isDefined(target.selectivityRender);
		});

		it('should add selectivity to dom element', () => {

			target.selectivityRender(domTest, {});

			// should have .selectivity object in dom
			assert.isDefined(domTest.selectivity);
		});

	});


	describe('.selectivityGet', () => {

		it('should exist', () => {

			assert.isDefined(target.selectivityGet);
		});

		it('should return empty array when selectivity does not render', () => {

			var resultData = target.selectivityGet(domTest);

			assert.isTrue(resultData instanceof Array);
			assert.equal(0, resultData.length);
		});

		it('should return selectivity data', () => {

			var selectivitySetting = {
				items: sampleItems,
				value: sampleItems[0].id
			};

			target.selectivityRender(domTest, selectivitySetting);

			var resultData = target.selectivityGet(domTest);


			assert.equal(selectivitySetting.value, resultData.id);

		});

		it('should return multiple selectivity data', () => {

			var selectivitySetting = {
				multiple: true,
				items: sampleItems,
				data: [sampleItems[0], sampleItems[1]]
			};

			target.selectivityRender(domTest, selectivitySetting);

			var resultData = target.selectivityGet(domTest);

			assert.equal(selectivitySetting.data.length, resultData.length);

		});

	});


	describe('.selectivitySet', () => {

		it('should exist', () => {
			assert.isDefined(target.selectivitySet);
		});

		it('should not error when set value to not selectivity', () => {

			target.selectivitySet(domTest, sampleItems[0]);
		});

		it('should set value to single selectivity object', () => {

			var selectivitySetting = {
				items: sampleItems
			};

			// render selectivity
			target.selectivityRender(domTest, selectivitySetting);

			// set single data to selectivity
			target.selectivitySet(domTest, sampleItems[0]);

			var resultData = target.selectivityGet(domTest);

			assert.equal(sampleItems[0], resultData);
		});

		it('should set value to multiple selectivity object', () => {

			var selectivitySetting = {
				multiple: true,
				items: sampleItems
			};

			// render selectivity
			target.selectivityRender(domTest, selectivitySetting);

			// set multiple data to selectivity
			var data = [sampleItems[0], sampleItems[1]];
			target.selectivitySet(domTest, data);

			var resultData = target.selectivityGet(domTest);

			assert.equal(data.length, resultData.length);
			assert.equal(data[0].id, resultData[0].id);
			assert.equal(data[1].id, resultData[1].id);
		});

	});

	describe('.selectivityDestroy', () => {
		it('should exist', () => {
			assert.isDefined(target.selectivityDestroy);
		});

		it('should not error when destroy not selectivity object', () => {

			target.selectivityDestroy(domTest);
		});

		it('should be empty content dom when destroy', () => {

			target.selectivityRender(domTest);

			assert.isTrue(domTest.innerHTML.length > 0);

			target.selectivityDestroy(domTest);

			assert.isTrue(domTest.innerHTML.length == 0);
		});


	});


});