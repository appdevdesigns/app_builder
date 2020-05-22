import AB from "../../../components/ab";
import ABFieldEmail from "../../../classes/dataFields/ABFieldEmail";

import sampleApp from "../../fixtures/ABApplication";

describe("ABFieldEmail unit tests", () => {
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

   var columnName = "TEST_EMAIL_COLUMN";

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = sampleApp.objects()[0];

      target = new ABFieldEmail(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject
      );

      targetComponent = ABFieldEmail.propertiesComponent(mockApp);

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

   /* Email field test cases */
   describe("Email field test cases", () => {
      it("should exist email field", () => {
         assert.isDefined(target);
      });

      it("should have valid default value", () => {
         let defaultValues = ABFieldEmail.defaults();

         let menuName = L("ab.dataField.email.menuName", "*Email");
         let description = L(
            "ab.dataField.email.description",
            "*Email fields are used to store email addresses."
         );

         assert.equal("email", defaultValues.key);
         assert.equal("envelope", defaultValues.icon);
         assert.equal(menuName, defaultValues.menuName);
         assert.equal(description, defaultValues.description);
         assert.isTrue(defaultValues.supportRequire);
      });

      it(".columnHeader: should return valid column config", () => {
         var columnConfig = target.columnHeader();

         assert.isUndefined(
            columnConfig.template,
            'should not have "template" editor'
         );
         assert.equal("text", columnConfig.editor);
      });

      it(".defaultValue: should set valid default value", () => {
         var rowData = {};

         target.settings.default = "test@digiserve.com";

         target.defaultValue(rowData);

         assert.equal(target.settings.default, rowData[columnName]);
      });

      it(".defaultValue: should not set default value", () => {
         var rowData = {};

         delete target.settings.default;

         target.defaultValue(rowData);

         assert.isUndefined(rowData[columnName]);
      });

      it(".isValidData: should add error into validator", () => {
         let validator = { addError: function() {} };
         let stubAddError = sandbox
            .stub(validator, "addError")
            .callsFake(function() {});

         var rowData = {};
         rowData[columnName] = "INVALID_EMAIL_FORMAT";

         target.isValidData(rowData, validator);

         sandbox.assert.calledOnce(stubAddError);
      });

      it(".isValidData: should not add error into validator", () => {
         let validator = { addError: function() {} };
         let stubAddError = sandbox
            .stub(validator, "addError")
            .callsFake(function() {});

         var rowData = {};
         rowData[columnName] = "validEmail@digiserve.com";

         target.isValidData(rowData, validator);

         sandbox.assert.notCalled(stubAddError);
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
