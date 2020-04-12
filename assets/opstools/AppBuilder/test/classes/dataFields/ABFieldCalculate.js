import AB from "../../../components/ab";
import ABFieldCalculate from "../../../classes/dataFields/ABFieldCalculate";

import sampleApp from "../../fixtures/ABApplication";

describe("ABFieldCalculate unit tests", () => {
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

   var columnName = "TEST_CALCULATE_COLUMN";

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = sampleApp.objects()[0];

      target = new ABFieldCalculate(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject
      );

      targetComponent = ABFieldCalculate.propertiesComponent(mockApp);

      // render edit component
      targetComponent.ui.container = "ab_test_div";
      webixCom = new webix.ui(targetComponent.ui);
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

   /* Calculate field test cases */
   describe("Calculate field test cases", () => {
      it("should exist", () => {
         assert.isDefined(target);
      });

      it("should have valid default value", () => {
         let defaultValues = ABFieldCalculate.defaults();

         let menuName = L("ab.dataField.calculate.menuName", "*Calculate");
         let description = L("ab.dataField.calculate.description", "*");

         assert.equal("calculate", defaultValues.key);
         assert.equal("calculator", defaultValues.icon);
         assert.equal(menuName, defaultValues.menuName);
         assert.equal(description, defaultValues.description);
         assert.isNotTrue(defaultValues.supportRequire);
         assert.isFalse(defaultValues.isSortable);
         assert.isFalse(defaultValues.isFilterable);
      });

      it(".columnHeader: should return valid column config", () => {
         var columnConfig = target.columnHeader();

         assert.isNull(columnConfig.editor, "should be null (read-only)");
         assert.equal("textCell", columnConfig.css);
         assert.isDefined(columnConfig.template);
         assert.isFunction(columnConfig.template);
      });

      it(".columnHeader: template() should return value of field when display in grouping feature", () => {
         var columnConfig = target.columnHeader();

         let row = {
            $group: true
         };
         row[columnName] = "SHOULD RETURN THIS VALUE";

         let result = columnConfig.template(row);

         assert.equal(row[columnName], result);
      });

      it(".columnHeader: template() should data following format", () => {
         let numColName = "Number";

         target.settings.formula = `{${numColName}} + 10`;

         var columnConfig = target.columnHeader();

         let row = {};
         row[numColName] = 777;

         let expect = 787,
            result = columnConfig.template(row);

         assert.equal(expect, result);
      });

      it(".defaultValue: should not have this column value in row data", () => {
         let row = {};
         row[columnName] = 9999;

         assert.isDefined(target.defaultValue);
         assert.isFunction(target.defaultValue);

         target.defaultValue(row);

         assert.isUndefined(row[columnName]);
      });

      it(".format: should return data with valid decimal places", () => {
         let numColName = "Number";
         let row = {};
         row[numColName] = 8888888888;

         // case 1
         target.settings.decimalSign = "comma";
         target.settings.decimalPlaces = 3;
         target.settings.formula = `{${numColName}} + 1000`;

         let result = target.format(row);
         let expect = "8888889888,000";
         assert.equal(expect, result);

         // case 2
         target.settings.decimalSign = "period";
         target.settings.decimalPlaces = 5;
         target.settings.formula = `{${numColName}} - 100`;

         result = target.format(row);
         expect = "8888888788.00000";
         assert.equal(expect, result);

         // case 3
         target.settings.decimalSign = "space";
         target.settings.decimalPlaces = 10;
         target.settings.formula = `{${numColName}} * 2`;

         result = target.format(row);
         expect = "17777777776 0000000000";
         assert.equal(expect, result);
      });

      it(".format: should return data with valid AGE", () => {
         target.settings.decimalSign = "none";
         target.settings.decimalPlaces = 0;

         let dateColName = "Date";
         let row = {};
         row[dateColName] = new Date(1986, 2, 28);

         target.settings.formula = `AGE({${dateColName}})`;

         let result = target.format(row);
         let expect = 33;

         assert.equal(expect, result);
      });

      it(".format: should return data with valid YEAR", () => {
         let dateColName = "Date";
         let row = {};
         row[dateColName] = new Date(1986, 2, 28);

         target.settings.formula = `YEAR({${dateColName}})`;

         let result = target.format(row);
         let expect = 1986;
         assert.equal(expect, result);
      });

      it(".format: should return data with valid MONTH", () => {
         let dateColName = "Date";
         let row = {};
         row[dateColName] = new Date(1986, 2, 28);

         target.settings.formula = `MONTH({${dateColName}})`;

         let result = target.format(row);
         let expect = 2;
         assert.equal(expect, result);
      });

      // it('.format: should return data with valid DAY', () => {

      // 	let dayColName = 'Day';
      // 	let row = {};
      // 	row[dayColName] = new Date(1986, 2, 28);

      // 	target.settings.formula = `DAY({${dayColName}})`;

      // 	let result = target.format(row);
      // 	let expect = 28;
      // 	assert.equal(expect, result);

      // });

      it(".format: should return data with valid DATE", () => {
         let dateColName = "Date";
         let row = {};
         row[dateColName] = new Date(1986, 2, 28);

         target.settings.formula = `DATE({${dateColName}})`;

         let result = target.format(row);
         let expect = 5930;
         assert.equal(expect, result);
      });

      it(".formComponent: should return null (not support in form component)", () => {
         assert.isDefined(target.formComponent);
         assert.isFunction(target.formComponent);

         let result = target.formComponent();

         // common property
         assert.isDefined(result.common);
         assert.isFunction(result.common);
         assert.equal("fieldreadonly", result.common().key);

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

   /* Calculate field component test cases */
   describe("Calculate field component test cases", () => {
      it("should exist calculate component", () => {
         assert.isDefined(targetComponent);
      });

      it("should return valid key", () => {
         let result = targetComponent.values();

         assert.equal("calculate", result.key);
         assert.equal(1, result.settings.showIcon);
         assert.equal(0, result.settings.required, "required should be 0");
         assert.isUndefined(
            result.settings.default,
            "default should be undefined"
         );
      });
   });
});
