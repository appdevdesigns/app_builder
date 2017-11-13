import AB from '../../components/ab'
import ABApplication from "../../classes/ABApplication"
import ABImportCsv from "../../components/ab_work_object_list_newObject_csv"

describe('ab_work_object_list_newObject_csv component', () => {

	var sandbox;

	var ab;
	var mockApp;

	const componentName = 'ab_work_object_list_newObject_csv';

	var webixCom;

	var target;

	before(() => {
		ab = new AB();

		mockApp = ab._app;

		target = new ABImportCsv(mockApp);

		// render Import CSV file popup
		var ui = {
			view: "window",
			position: "center",
			modal: true,
			body: {
				view: "tabview",
				cells: [target.ui]
			}
		};
		webixCom = webix.ui(ui);

	});

	beforeEach(() => {
		sandbox = sinon.sandbox.create();
	});

	afterEach(() => {
		sandbox.restore();
	});

	after(() => {
		if (webixCom && webixCom.destructor)
			webixCom.destructor();
	});

	it('should look like a component', () => {
		OP.Test.isComponent(target);
	});


	// UI test cases
	describe('UI testing', () => {

		it("should call .loadCsvFile when a csv file is updated", () => {

			let csvUploader = OP.Test.findElement(target.ui, { name: "csvFile" }),
				mockFileInfo = {},
				stubLoadCsvFile = sandbox.stub(target._logic, "loadCsvFile");

			csvUploader.on.onBeforeFileAdd(mockFileInfo);

			sandbox.assert.calledOnce(stubLoadCsvFile);
			sandbox.assert.calledWith(stubLoadCsvFile, mockFileInfo);

		});

		it("should call .removeCsvFile when remove a uploaded file", () => {

			let uploadedFile = OP.Test.findElement(target.ui, { name: "uploadedFile" }),
				mockElem = {},
				mockId = "MOCK_FILE_ID",
				mockTarget = {},
				stubRemoveCsvFile = sandbox.stub(target._logic, "removeCsvFile");

			uploadedFile.onClick.webix_remove_upload(mockElem, mockId, mockTarget);

			sandbox.assert.calledOnce(stubRemoveCsvFile);
			sandbox.assert.calledWith(stubRemoveCsvFile, mockId);

		});

		it("should call .populateColumnList when select separate item", () => {

			let separatedByList = OP.Test.findElement(target.ui, { name: "separatedBy" }),
				stubPopulateColumnList = sandbox.stub(target._logic, "populateColumnList");

			separatedByList.on.onChange();

			sandbox.assert.calledOnce(stubPopulateColumnList);

		});

		it("should call .populateColumnList when check/uncheck header on first line option", () => {

			let headerOnFirstLine = OP.Test.findElement(target.ui, { name: "headerOnFirstLine" }),
				stubPopulateColumnList = sandbox.stub(target._logic, "populateColumnList");

			headerOnFirstLine.on.onChange();

			sandbox.assert.calledOnce(stubPopulateColumnList);

		});

		it("should call .cancel when click 'cancel' button", () => {

			let cancelButton = OP.Test.findElement(target.ui, { name: "cancel" }),
				stubCancel = sandbox.stub(target._logic, "cancel");

			cancelButton.click();

			sandbox.assert.calledOnce(stubCancel);

		});

		it("should call .import when click 'import' button", () => {

			let importButton = OP.Test.findElement(target.ui, { name: "import" }),
				stubImport = sandbox.stub(target._logic, "import");

			importButton.click();

			sandbox.assert.calledOnce(stubImport);

		});

	});


	// Init test cases
	describe('Init testing', () => {

		it("should populate valid callbacks", () => {

			let options = {
				onCancel: () => { },
				onSave: () => { }
			};

			target.init(options);

			assert.equal(options.onCancel, target._logic.callbacks.onCancel);
			assert.equal(options.onSave, target._logic.callbacks.onSave);

		});

	});

	// Logic test cases
	describe('Logic testing', () => {

		it("should have valid callbacks", () => {
			assert.isDefined(target._logic.callbacks.onCancel);
			assert.isDefined(target._logic.callbacks.onSave);
		});

		it(".loadCsvFile - should show alert box when upload file type invalid", () => {

			var stubAlert = sandbox.stub(webix, "alert");
			var mockFileInfo = {
				file: {
					type: "image/png" // INVALID file type
				}
			};

			var result = target._logic.loadCsvFile(mockFileInfo);

			assert.isFalse(result);
			sandbox.assert.calledOnce(stubAlert);

		});

		it(".loadCsvFile - should return true when upload a valid file", () => {

			var mockFileInfo = {
				file: {
					type: "text/csv"
				}
			};

			var result = target._logic.loadCsvFile(mockFileInfo);

			assert.isTrue(result);

		});

		it(".removeCsvFile - should remove file in uploader component", () => {

			let fileId = "MOCK_FILE_ID",
				spyFormClear = sandbox.spy(target._logic, "formClear");

			let result = target._logic.removeCsvFile(fileId);

			sandbox.assert.calledOnce(spyFormClear);
			assert.isTrue(result);
		});

	});


});