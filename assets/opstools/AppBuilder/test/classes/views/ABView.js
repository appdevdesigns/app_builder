import AB from '../../../components/ab'
import ABApplication from '../../../classes/ABApplication'
import ABView from '../../../classes/views/ABView'

import sampleApp from "../../fixtures/ABApplication"
import { doesNotReject } from 'assert';
import ABViewPage from 'app_builder/assets/opstools/AppBuilder/classes/views/ABViewPage';

describe("ABView unit tests", () => {

	var sandbox;

	var ab;
	var mock_APP;
	var mockApplication;
	var mockPage;

	var target;

	before(() => {

		ab = new AB();

		mock_APP = ab._app;
		mockApplication = new ABApplication(sampleApp);
		mockPage = new ABViewPage({
			label: "PARENT PAGE"
		}, mockApplication);

	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();

		// refresh target
		target = new ABView({
			label: "TEST VIEW"
		}, mockApplication, mockPage);

	});

	afterEach(() => {
		sandbox.restore();
	});

	after(() => {
	});

	it('.common: should return valid default values', () => {

		let result = ABView.common();

		assert.equal('view', result.key);
		assert.equal('window-maximize', result.icon);
		assert.equal('ab.components.view', result.labelKey);

	});

	it('.newInstance: should return valid instance', () => {

		let result = ABView.newInstance(mockApplication);

		assert.isTrue(result instanceof ABView);

	});

	it('.viewKey: should return valid key', () => {

		assert.equal('view', target.viewKey());

	});

	it('.viewKey: should return valid icon', () => {

		assert.equal('window-maximize', target.viewIcon());

	});

	it('.isValid: should return validator', () => {

		let result = target.isValid();

		let validator = { addError: function () { } };
		let stubAddError = sandbox.stub(validator, 'addError').callsFake(function () { });

		assert.isDefined(result);

		sandbox.assert.notCalled(stubAddError);

	});

	it('.destroy: should not process any remove when no .id', (done) => {

		// this view should not exists
		delete target.id;

		let stubViewDestroy = sandbox.stub(mockPage, 'viewDestroy').callsFake(function (view) { return Promise.resolve(); });

		let result = target.destroy();
		result.then(() => { done(); });

		assert.isTrue(result instanceof Promise);
		sandbox.assert.notCalled(stubViewDestroy);

	});

	it('.destroy: should return Promise and destroy view', (done) => {

		target.id = "THIS VIEW EXISTS";

		let stubViewDestroy = sandbox.stub(mockPage, 'viewDestroy').callsFake(function (view) { return Promise.resolve(); });

		let result = target.destroy();
		result.then(() => { done(); });

		assert.isTrue(result instanceof Promise);
		sandbox.assert.calledOnce(stubViewDestroy);

	});

	it('.save: should add new id and save view', (done) => {

		delete target.id;

		let stubViewSave = sandbox.stub(mockPage, 'viewSave').callsFake(function (view) { return Promise.resolve(); });

		let result = target.save();
		result.then(() => { done(); });

		assert.isTrue(result instanceof Promise);
		assert.isDefined(target.id);
		sandbox.assert.calledOnce(stubViewSave);

	});

	it('.toObj: should return valid JSON to database', () => {

		let result = target.toObj();

		// {
		// 	"id": 1551774383957,
		// 	"key": "view",
		// 	"icon": "window-maximize",
		// 	"settings": { },
		// 	"translations": [{ "language_code": "en", "label": "TEST VIEW" }],
		// 	"views": [],
		// 	"position": { "dx": 1, "dy": 1 }
		// }
		assert.isDefined(result.id);
		assert.equal(target.viewKey(), result.key);
		assert.equal(target.viewIcon(), result.icon);
		assert.isDefined(result.translations);
		assert.isArray(result.translations);
		assert.isTrue(result.translations.length > 0);
		assert.isArray(result.views);
		assert.equal(target.position, result.position);

	});

	it('.fromValues: should populate valid properties to instance', () => {

		let vals = {
			key: "KEY",
			icon: "ICON",
			translations: [{ "language_code": "en", "label": "LABEL" }],
			position: {
				x: "1",
				y: "2",
				dx: "3",
				dy: "4"
			}
		};

		target.fromValues(vals);

		assert.equal(vals.key, target.key);
		assert.equal(vals.icon, target.icon);
		assert.equal(vals.translations[0].label, target.label);
		assert.equal(vals.position.x, target.position.x);
		assert.equal(vals.position.y, target.position.y);
		assert.equal(vals.position.dx, target.position.dx);
		assert.equal(vals.position.dy, target.position.dy);
		assert.equal('number', typeof target.position.x);
		assert.equal('number', typeof target.position.y);
		assert.equal('number', typeof target.position.dx);
		assert.equal('number', typeof target.position.dy);

	});

	it('.isRoot: should return false', () => {

		assert.isFalse(target.isRoot());

	});

	it('.isRoot: should return true', () => {

		delete target.parent;

		assert.isTrue(target.isRoot());

	});

	it('.allParents: should return a array', () => {

		let result = target.allParents();

		assert.isArray(result);
		assert.isTrue(result.length > 0);

	});

	it('.parentFormComponent: should return null', () => {

		let result = target.parentFormComponent();

		assert.isNull(result);

	});

	it('.parentFormUniqueID: should return a string', () => {

		let key = "KEY",
			result = target.parentFormUniqueID(key);

		assert.isDefined(result);
		assert.isTrue(typeof result == "string");
		assert.isTrue(result.indexOf(key) > -1);

	});

	it('.pageParent: should return a parent page', () => {

		let result = target.pageParent();

		assert.isDefined(result);
		assert.equal(target.parent, result);

	});

	it('.pageRoot: should return the root page', () => {

		let result = target.pageRoot();

		assert.isDefined(result);
		assert.equal(target.parent, result);

	});

	it('.views: should return a array', () => {

		let result = target.views();

		assert.isDefined(result);
		assert.isArray(result);
		assert.isTrue(result.length == 0);

	});

	it('.viewDestroy: should return a valid view', () => {

		// add new view
		let remove_id = "remove_id";
		target._views.push({ id: remove_id });

		// remove
		let result = target.viewDestroy(target._views[0]);

		assert.isTrue(result instanceof Promise);
		assert.isUndefined(target.views(v => v.id == remove_id)[0]);

	});

	it('.viewSave: should add a new view into list', () => {

		let newView = {
			id: "new_id"
		};

		// add new
		let result = target.viewSave(newView);

		assert.isTrue(result instanceof Promise);
		assert.isDefined(target.views(v => v.id == newView.id)[0]);

	});

	it('.viewReorder: should order correctly', () => {

		target._views.push({ id: 1 });
		target._views.push({ id: 2 });
		target._views.push({ id: 3 });
		target._views.push({ id: 4 });

		// reorder
		let result = target.viewReorder(2, 2);

		assert.isTrue(result instanceof Promise);
		assert.equal(1, target.views()[0].id);
		assert.equal(3, target.views()[1].id);
		assert.equal(2, target.views()[2].id);
		assert.equal(4, target.views()[3].id);

	});


});