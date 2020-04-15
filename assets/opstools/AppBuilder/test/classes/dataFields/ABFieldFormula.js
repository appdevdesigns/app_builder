import AB from "../../../components/ab";
import ABFieldFormula from "../../../classes/dataFields/ABFieldFormula";

import sampleApp from "../../fixtures/ABApplication";

describe("ABFieldFormula unit tests", () => {
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

   var columnName = "TEST_FORMULA_COLUMN";

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = sampleApp.objects()[0];

      target = new ABFieldFormula(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject
      );

      targetComponent = ABFieldFormula.propertiesComponent(mockApp);

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

   /* Formula field test cases */
   describe("Formula field test cases", () => {
      it("should exist formula field", () => {
         assert.isDefined(target);
      });

      it("should have valid default value", () => {
         let defaultValues = ABFieldFormula.defaults();

         let menuName = L("ab.dataField.formula.menuName", "*Formula");
         let description = L("ab.dataField.formula.description", "*");

         assert.equal("formula", defaultValues.key);
         assert.equal("circle-o-notch", defaultValues.icon);
         assert.equal(menuName, defaultValues.menuName);
         assert.equal(description, defaultValues.description);
         assert.isFalse(defaultValues.isSortable);
         assert.isFalse(defaultValues.isFilterable);
         assert.isFalse(defaultValues.useAsLabel);
      });

      it(".columnHeader: should return valid column config", () => {
         let columnConfig = target.columnHeader();

         assert.isNull(columnConfig.editor, "should be read-only mode");
         assert.equal("textCell", columnConfig.css);
         assert.isFunction(columnConfig.template);
      });

      it(".columnHeader .template: should origin value in grouping feature", () => {
         let columnConfig = target.columnHeader();
         let rowData = {
            $group: true
         };
         rowData[columnName] = "EXPECT THIS";

         let result = columnConfig.template(rowData);

         assert.equal(rowData[columnName], result);
      });

      it(".columnHeader .template: should return valid format data", () => {
         target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
         target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
         target.settings.fieldLink = "bc5342a0-3ba1-4be1-a914-27c73c5629f6";
         target.settings.type = "sum";

         let rowData = {};
         let relationName = target.fieldBase().relationName();
         let linkColName = target.fieldLink.columnName;

         rowData[relationName] = [{}, {}];
         rowData[relationName][0][linkColName] = 3;
         rowData[relationName][1][linkColName] = 4;

         let columnConfig = target.columnHeader();
         let result = columnConfig.template(rowData);

         let expect = 7;

         assert.equal(expect, result);
      });

      it(".defaultValue: should not have value of this column - this field is read only.", () => {
         let row = {};
         row[columnName] = "SHOULD NOT HAVE THIS VALUE AFTER .defaultValue";

         target.defaultValue(row);

         assert.isUndefined(row[columnName]);
      });

      it(".formComponent: should return null", () => {
         assert.isNull(target.formComponent());
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

      it(".fieldBase: should return valid field", () => {
         target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";

         let result = target.fieldBase();

         assert.equal(target.settings.field, result.id);
      });

      it(".fieldLink: should return valid field", () => {
         target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
         target.settings.fieldLink = "bc5342a0-3ba1-4be1-a914-27c73c5629f6";

         let result = target.fieldLink;

         assert.equal(target.settings.fieldLink, result.id);
         assert.equal(target.settings.object, result.object.id);
      });

      describe("Formula field .format test cases", () => {
         describe("Field link is number field", () => {
            it(".format: type is summary", () => {
               target.settings.type = "sum";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "bc5342a0-3ba1-4be1-a914-27c73c5629f6";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let linkColName = target.fieldLink.columnName;

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][linkColName] = 1;
               rowData[relationName][1][linkColName] = 2;
               rowData[relationName][2][linkColName] = 3;
               rowData[relationName][3][linkColName] = 4;
               rowData[relationName][4][linkColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 15;

               assert.equal(expect, result);
            });

            it(".format: type is average", () => {
               target.settings.type = "average";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "bc5342a0-3ba1-4be1-a914-27c73c5629f6";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let linkColName = target.fieldLink.columnName;

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][linkColName] = 1;
               rowData[relationName][1][linkColName] = 2;
               rowData[relationName][2][linkColName] = 3;
               rowData[relationName][3][linkColName] = 4;
               rowData[relationName][4][linkColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 3;

               assert.equal(expect, result);
            });

            it(".format: type is max", () => {
               target.settings.type = "max";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "bc5342a0-3ba1-4be1-a914-27c73c5629f6";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let linkColName = target.fieldLink.columnName;

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][linkColName] = 1;
               rowData[relationName][1][linkColName] = 2;
               rowData[relationName][2][linkColName] = 3;
               rowData[relationName][3][linkColName] = 4;
               rowData[relationName][4][linkColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 5;

               assert.equal(expect, result);
            });

            it(".format: type is min", () => {
               target.settings.type = "min";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "bc5342a0-3ba1-4be1-a914-27c73c5629f6";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let linkColName = target.fieldLink.columnName;

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][linkColName] = 1;
               rowData[relationName][1][linkColName] = 2;
               rowData[relationName][2][linkColName] = 3;
               rowData[relationName][3][linkColName] = 4;
               rowData[relationName][4][linkColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 1;

               assert.equal(expect, result);
            });

            it(".format: type is count", () => {
               target.settings.type = "count";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "bc5342a0-3ba1-4be1-a914-27c73c5629f6";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let linkColName = target.fieldLink.columnName;

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][linkColName] = 1;
               rowData[relationName][1][linkColName] = 2;
               rowData[relationName][2][linkColName] = 3;
               rowData[relationName][3][linkColName] = 4;
               rowData[relationName][4][linkColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 5;

               assert.equal(expect, result);
            });
         });

         describe("Field link is calculate field", () => {
            it(".format: type is summary", () => {
               target.settings.type = "sum";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "ec0f4e97-eac8-4642-8eb5-f0f98e510431";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let numColName = "Number";

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][numColName] = 1;
               rowData[relationName][1][numColName] = 2;
               rowData[relationName][2][numColName] = 3;
               rowData[relationName][3][numColName] = 4;
               rowData[relationName][4][numColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 515;

               assert.equal(expect, result);
            });

            it(".format: type is average", () => {
               target.settings.type = "average";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "ec0f4e97-eac8-4642-8eb5-f0f98e510431";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let numColName = "Number";

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][numColName] = 1;
               rowData[relationName][1][numColName] = 2;
               rowData[relationName][2][numColName] = 3;
               rowData[relationName][3][numColName] = 4;
               rowData[relationName][4][numColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 103;

               assert.equal(expect, result);
            });

            it(".format: type is max", () => {
               target.settings.type = "max";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "ec0f4e97-eac8-4642-8eb5-f0f98e510431";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let numColName = "Number";

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][numColName] = 1;
               rowData[relationName][1][numColName] = 2;
               rowData[relationName][2][numColName] = 3;
               rowData[relationName][3][numColName] = 4;
               rowData[relationName][4][numColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 105;

               assert.equal(expect, result);
            });

            it(".format: type is min", () => {
               target.settings.type = "min";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "ec0f4e97-eac8-4642-8eb5-f0f98e510431";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let numColName = "Number";

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][numColName] = 1;
               rowData[relationName][1][numColName] = 2;
               rowData[relationName][2][numColName] = 3;
               rowData[relationName][3][numColName] = 4;
               rowData[relationName][4][numColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 101;

               assert.equal(expect, result);
            });

            it(".format: type is count", () => {
               target.settings.type = "count";

               target.settings.field = "3e89d0e1-c978-45ba-83b8-7e9e5242fe55";
               target.settings.object = "8969f188-96e3-419b-b065-066148d1b77c";
               target.settings.fieldLink =
                  "ec0f4e97-eac8-4642-8eb5-f0f98e510431";

               let rowData = {};
               let relationName = target.fieldBase().relationName();
               let numColName = "Number";

               rowData[relationName] = [{}, {}, {}, {}, {}];
               rowData[relationName][0][numColName] = 1;
               rowData[relationName][1][numColName] = 2;
               rowData[relationName][2][numColName] = 3;
               rowData[relationName][3][numColName] = 4;
               rowData[relationName][4][numColName] = 5;

               let columnConfig = target.columnHeader();
               let result = columnConfig.template(rowData);

               let expect = 5;

               assert.equal(expect, result);
            });
         });
      });
   });
});
