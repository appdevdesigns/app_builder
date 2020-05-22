import AB from "../../../components/ab";
import ABFieldNumber from "../../../classes/dataFields/ABFieldNumber";

describe("ABFieldNumber unit tests", () => {
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

   var mockValidator;

   var columnName = "TEST_NUMBER_COLUMN";

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = {};

      target = new ABFieldNumber(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject
      );

      targetComponent = ABFieldNumber.propertiesComponent(mockApp);

      // render edit component
      targetComponent.ui.container = "ab_test_div";
      webixCom = new webix.ui(targetComponent.ui);

      mockValidator = { addError: function() {} };
   });

   beforeEach(() => {
      sandbox = sinon.sandbox.create();
   });

   afterEach(() => {
      sandbox.restore();
   });

   after(() => {
      if (webixCom && webixCom.destructor) webixCom.destructor();
   });

   /* Number field test cases */
   describe("Number field test cases", () => {
      it("should exist number field", () => {
         assert.isDefined(target);
      });

      it("should have valid default value", () => {
         let defaultValues = ABFieldNumber.defaults();

         let menuName = L("ab.dataField.number.menuName", "*Number");
         let description = L(
            "ab.dataField.number.description",
            "*A Float or Integer Value"
         );

         assert.equal("number", defaultValues.key);
         assert.equal("hashtag", defaultValues.icon);
         assert.equal(menuName, defaultValues.menuName);
         assert.equal(description, defaultValues.description);
      });

      it(".columnHeader: should return column config", () => {
         let columnConfig = target.columnHeader();

         assert.equal(
            "number",
            columnConfig.editor,
            'should be "number" editor'
         );
         assert.isUndefined(
            columnConfig.sort,
            "should not define sort in webix datatable"
         );
         assert.isDefined(columnConfig.format);
      });

      it(".defaultValue: should have no default value", () => {
         let rowData = {};

         // define default value
         target.settings.numberDefault = "";

         // Set default value to row data
         target.defaultValue(rowData);

         assert.isUndefined(rowData[columnName]);
      });

      it(".defaultValue: should have default value", () => {
         let rowData = {};

         // define default value
         target.settings.default = 777;

         // Set default value to row data
         target.defaultValue(rowData);

         assert.isDefined(rowData[columnName]);
         assert.equal(target.settings.default, rowData[columnName]);
      });

      it(".isValidData - should pass when value is null", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         let rowData = {};

         target.isValidData(rowData, mockValidator);

         sandbox.assert.notCalled(spyAddError);
      });

      it(".isValidData - should not pass when value is not number", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         let rowData = {};
         rowData[columnName] = "THIS IS NOT NUMBER";

         target.isValidData(rowData, mockValidator);

         sandbox.assert.calledOnce(spyAddError);
         sandbox.assert.calledWith(spyAddError, columnName, "invalid number");
      });

      it(".isValidData - should pass when integer value is in valid range", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         target.settings.typeDecimals = "none";
         target.settings.validation = true;
         target.settings.validateMinimum = 100;
         target.settings.validateMaximum = 200;

         let rowData = {};
         rowData[columnName] = 101;

         target.isValidData(rowData, mockValidator);

         sandbox.assert.notCalled(spyAddError);
      });

      it(".isValidData - should not pass when integer value is greater than maximum", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         target.settings.typeDecimals = "none";
         target.settings.validation = true;
         target.settings.validateMinimum = 100;
         target.settings.validateMaximum = 200;

         let rowData = {};
         rowData[columnName] = 205;

         target.isValidData(rowData, mockValidator);

         sandbox.assert.calledOnce(spyAddError);
         sandbox.assert.calledWith(
            spyAddError,
            columnName,
            "should be less than {max}".replace(
               "{max}",
               target.settings.validateMaximum
            )
         );
      });

      it(".isValidData - should not pass when integer value is lower than minimum", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         target.settings.typeDecimals = "none";
         target.settings.validation = true;
         target.settings.validateMinimum = 100;
         target.settings.validateMaximum = 200;

         let rowData = {};
         rowData[columnName] = 99;

         target.isValidData(rowData, mockValidator);

         sandbox.assert.calledOnce(spyAddError);
         sandbox.assert.calledWith(
            spyAddError,
            columnName,
            "should be greater than {min}".replace(
               "{min}",
               target.settings.validateMinimum
            )
         );
      });

      it(".isValidData - should pass when decimal value is in valid range", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         target.settings.typeDecimals = "period";
         target.settings.validation = true;
         target.settings.validateMinimum = 100.5;
         target.settings.validateMaximum = 200.5;

         let rowData = {};
         rowData[columnName] = 105.93;

         target.isValidData(rowData, mockValidator);

         sandbox.assert.notCalled(spyAddError);
      });

      it(".isValidData - should not pass when decimal value is greater than maximum", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         target.settings.typeDecimals = "period";
         target.settings.validation = true;
         target.settings.validateMinimum = 100.5;
         target.settings.validateMaximum = 200.5;

         let rowData = {};
         rowData[columnName] = 200.6;

         target.isValidData(rowData, mockValidator);

         sandbox.assert.calledOnce(spyAddError);
         sandbox.assert.calledWith(
            spyAddError,
            columnName,
            "should be less than {max}".replace(
               "{max}",
               target.settings.validateMaximum
            )
         );
      });

      it(".isValidData - should not pass when decimal value is lower than minimum", () => {
         let spyAddError = sandbox.spy(mockValidator, "addError");

         target.settings.typeDecimals = "period";
         target.settings.validation = true;
         target.settings.validateMinimum = 100.5;
         target.settings.validateMaximum = 200.5;

         let rowData = {};
         rowData[columnName] = 100.4;

         target.isValidData(rowData, mockValidator);

         sandbox.assert.calledOnce(spyAddError);
         sandbox.assert.calledWith(
            spyAddError,
            columnName,
            "should be greater than {min}".replace(
               "{min}",
               target.settings.validateMinimum
            )
         );
      });

      it(".format - should have valid number with dollar format", () => {
         target.settings.typeFormat = "dollar";

         var value = 1000;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("$ 1000", result.trim());
      });

      it(".format - should have valid number with pound format", () => {
         target.settings.typeFormat = "pound";

         var value = 1000;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("£ 1000", result.trim());
      });

      it(".format - should have valid number with euro prefix format", () => {
         target.settings.typeFormat = "euroBefore";

         var value = 1000;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("€ 1000", result.trim());
      });

      it(".format - should have valid number with euro postfix format", () => {
         target.settings.typeFormat = "euroAfter";

         var value = 1000;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("1000 €", result.trim());
      });

      it(".format - should have valid number with percent postfix format", () => {
         target.settings.typeFormat = "percent";

         var value = 1000;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("1000 %", result.trim());
      });

      it(".format - should have valid number with group delimiter", () => {
         target.settings.typeFormat = "none";
         target.settings.typeThousands = "comma";

         var value = 1000;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("1,000", result.trim());
      });

      it(".format - should have valid decimal with round up value", () => {
         target.settings.typeFormat = "none";
         target.settings.typeThousands = "none";
         target.settings.typeDecimals = "period";
         target.settings.typeDecimalPlaces = 2;
         target.settings.typeRounding = "roundUp";

         var value = 1000.986;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("1000.99", result.trim());
      });

      it(".format - should have valid decimal with round down value", () => {
         target.settings.typeFormat = "none";
         target.settings.typeThousands = "none";
         target.settings.typeDecimals = "period";
         target.settings.typeDecimalPlaces = 2;
         target.settings.typeRounding = "roundDown";

         var value = 1000.256;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("1000.25", result.trim());
      });

      it(".format - should have valid decimal with decimal 3 places", () => {
         target.settings.typeFormat = "none";
         target.settings.typeThousands = "none";
         target.settings.typeDecimals = "period";
         target.settings.typeDecimalPlaces = 3;
         target.settings.typeRounding = "none";

         var value = 1000.1;
         var rowData = {};
         rowData[columnName] = value;

         var result = target.format(rowData);

         assert.equal("1000.100", result.trim());
      });
   });
});
