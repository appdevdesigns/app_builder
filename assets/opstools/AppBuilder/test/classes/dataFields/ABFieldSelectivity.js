import ABFieldSelectivity from "../../../classes/dataFields/ABFieldSelectivity"

describe("ABFieldSelectivity unit tests", () => {

	var sandbox;

	var mockObject;

	var target;

	const columnName = 'TEST_SELECTIVITY_COLUMN';

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
	});


	it('.selectivityRender: should exist', () => {
		assert.isDefined(ABFieldSelectivity.selectivityRender);
	});

	it('.selectivityRender: should exist', () => {
		ABFieldSelectivity.selectivityRender(document.querySelector('#test_div'));
	});



	it('.selectivityGet: ', () => {
		assert.isDefined(ABFieldSelectivity.selectivityGet);
	});

	it('.selectivitySet: ', () => {
		assert.isDefined(ABFieldSelectivity.selectivitySet);
	});


});