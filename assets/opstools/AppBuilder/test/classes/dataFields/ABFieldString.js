import AB from "../../../components/ab";
import ABFieldString from "../../../classes/dataFields/ABFieldString";

describe("ABFieldString unit tests", () => {
   function L(key, altText) {
      return AD.lang.label.getLabel(key) || altText;
   }

   var sandbox;

   var ab;
   var mockApp;
   var mockObject;

   var target;
   var targetComponent;

   var webixCom;

   var columnName = "TEST_STRING_COLUMN";

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = {};

      target = new ABFieldString(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject
      );

      targetComponent = ABFieldString.propertiesComponent(mockApp);

      // render edit component
      targetComponent.ui.container = "ab_test_div";
      webixCom = new webix.ui(targetComponent.ui);
   });

   beforeEach(() => {
      sandbox = sinon.sandbox.create();
   });

   afterEach(() => {
      target.settings = {};
      sandbox.restore();
   });

   after(() => {
      if (webixCom && webixCom.destructor) webixCom.destructor();
   });

   /* String field test cases */
   describe("String field test cases", () => {
      it("should exist string field", () => {
         assert.isDefined(target);
      });

      it("should have valid default value", () => {
         let defaultValues = ABFieldString.defaults();

         let menuName = L("ab.dataField.string.menuName", "*Single line text");
         let description = L(
            "ab.dataField.string.description",
            "*short string value"
         );

         assert.equal("string", defaultValues.key);
         assert.equal("font", defaultValues.icon);
         assert.equal(menuName, defaultValues.menuName);
         assert.equal(description, defaultValues.description);
         assert.isUndefined(defaultValues.isSortable);
         assert.isUndefined(defaultValues.isFilterable);
         assert.isUndefined(defaultValues.useAsLabel);
         assert.isTrue(defaultValues.supportRequire);
      });

      it(".columnHeader: should return valid column config", () => {
         var columnConfig = target.columnHeader();

         assert.equal(
            "text",
            columnConfig.editor,
            'should be "template" editor'
         );
         assert.equal("textCell", columnConfig.css);
      });

      it(".defaultValue: should add new uuid", () => {
         var rowData = {};

         target.settings.default = "{uuid}";

         target.defaultValue(rowData);

         assert.isDefined(rowData[columnName]);
         assert.notEqual(rowData[columnName], target.settings.default);
      });

      it(".defaultValue: should add valid default value", () => {
         var rowData = {};

         target.settings.default = "EXPECT THIS";

         target.defaultValue(rowData);

         assert.isDefined(rowData[columnName]);
         assert.equal(rowData[columnName], target.settings.default);
      });

      it(".isValidData: should not allow value more than 255 characters", () => {
         let validator = { addError: function() {} };
         let stubAddError = sandbox
            .stub(validator, "addError")
            .callsFake(function() {});

         let rowData = {};
         rowData[columnName] =
            "WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE WRONG VALUE";

         target.isValidData(rowData, validator);

         sandbox.assert.calledOnce(stubAddError);
      });

      it(".isValidData: should not call any errors", () => {
         let validator = { addError: function() {} };
         let stubAddError = sandbox
            .stub(validator, "addError")
            .callsFake(function() {});

         let rowData = {};
         rowData[columnName] = "CORRECT VALUE";

         target.isValidData(rowData, validator);

         sandbox.assert.notCalled(stubAddError);
      });

      it(".isMultilingual: should return true", () => {
         target.settings.supportMultilingual = 1;

         let result = target.isMultilingual;

         assert.isTrue(result);
      });

      it(".isMultilingual: should return false", () => {
         target.settings.supportMultilingual = 0;

         let result = target.isMultilingual;

         assert.isFalse(result);
      });

      it(".formComponent: should return form component { common, newInstance }", () => {
         assert.isDefined(target.formComponent);
         assert.isFunction(target.formComponent);

         let result = target.formComponent();

         // common property
         assert.isDefined(result.common);
         assert.isFunction(result.common);
         assert.equal("textbox", result.common().key);
         assert.equal("single", result.common().settings.type);

         // newInstance property
         assert.isDefined(result.newInstance);
         assert.isFunction(result.newInstance);
      });

      it(".detailComponent: should return detail component { common, newInstance }", () => {
         assert.isDefined(target.detailComponent);
         assert.isFunction(target.detailComponent);

         let result = target.detailComponent();

         // common property
         assert.isDefined(result.common);
         assert.isFunction(result.common);
         assert.equal("detailtext", result.common().key);

         // newInstance property
         assert.isDefined(result.newInstance);
         assert.isFunction(result.newInstance);
      });
   });
});
