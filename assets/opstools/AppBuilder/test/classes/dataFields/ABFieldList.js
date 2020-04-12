import AB from "../../../components/ab";
import ABFieldList from "../../../classes/dataFields/ABFieldList";

describe("ABFieldList unit tests", () => {
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

   var columnName = "TEST_LIST_COLUMN";

   var xlatedTestOptions = [
      { id: 1, text: "1st" },
      { id: 2, text: "2nd" },
      { id: 3, text: "3rd" }
   ];

   var testOptions = [
      {
         id: 1,
         text: "First",
         translations: [{ language_code: "en", text: "1st" }]
      },
      {
         id: 2,
         text: "Second",
         translations: [{ language_code: "en", text: "2nd" }]
      },
      {
         id: 3,
         text: "Third",
         translations: [{ language_code: "en", text: "3rd" }]
      }
   ];

   before(() => {
      ab = new AB();

      mockApp = ab._app;
      mockObject = {};

      target = new ABFieldList(
         {
            columnName: columnName,
            settings: {
               options: testOptions
            }
         },
         mockObject
      );

      targetComponent = ABFieldList.propertiesComponent(mockApp);

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

   /* List field test cases */
   describe("List field test cases", () => {
      it("should exist field", () => {
         assert.isDefined(target);
      });

      it("should have valid default value", () => {
         let defaultValues = ABFieldList.defaults();

         let menuName = L("ab.dataField.list.menuName", "*Select list");
         let description = L(
            "ab.dataField.list.description",
            "*Select list allows you to select predefined options below from a dropdown."
         );

         assert.equal("list", defaultValues.key);
         assert.equal("th-list", defaultValues.icon);
         assert.equal(menuName, defaultValues.menuName);
         assert.equal(description, defaultValues.description);
      });

      it(".fromValues: should populate .translations property to options", () => {
         target.fromValues(target);

         target.settings.options.forEach((opt) => {
            assert.isDefined(opt.translations, " translations exist");

            var xlated = xlatedTestOptions.filter((o) => {
               return o.id == opt.id;
            })[0];
            assert.equal(
               opt.text,
               xlated.text,
               " entries are properly translated"
            );
         });
      });

      it(".toObj: should populate .translations property to options", () => {
         target.toObj(target);

         target.settings.options.forEach((opt) => {
            assert.isDefined(opt.translations);
            assert.isTrue(opt.translations.length > 0);
         });
      });

      it(".columnHeader: should return single select column config", () => {
         target.settings.isMultiple = false;

         var columnConfig = target.columnHeader();

         assert.equal(
            "richselect",
            columnConfig.editor,
            'should be "richselect" editor'
         );
         assert.isDefined(columnConfig.options);
         assert.isUndefined(
            columnConfig.sort,
            "should not define sort in webix datatable"
         );

         columnConfig.options.forEach((opt, index) => {
            assert.equal(testOptions[index].id, opt.id);
            assert.equal(testOptions[index].value, opt.text);
         });
      });

      it(".columnHeader: should return multiple select column config", () => {
         target.settings.isMultiple = true;

         var columnConfig = target.columnHeader();

         assert.isFunction(columnConfig.template);
      });

      it(".defaultValue: should set default single value to data", () => {
         var rowData = {};

         target.settings.isMultiple = false;

         // set single default setting
         target.settings.default = 1;

         // Set default value
         target.defaultValue(rowData);

         assert.isDefined(rowData[columnName]);
         assert.equal(target.settings.default, rowData[columnName]);
      });

      it(".defaultValue: should set default multiple value to data", () => {
         var rowData = {};

         target.settings.isMultiple = true;

         // set single default setting
         target.settings.multipleDefault = [testOptions[0], testOptions[1]];

         // Set default value
         target.defaultValue(rowData);

         assert.isDefined(rowData[columnName]);
         assert.equal(target.settings.multipleDefault, rowData[columnName]);
      });

      it(".customDisplay: should not render selectivity to DOM when's single select", () => {
         var rowData = {},
            domNode = document.createElement("div");

         target.settings.isMultiple = false;

         target.customDisplay(rowData, mockApp, domNode);

         assert.isUndefined(domNode.selectivity);
      });

      it(".customDisplay: should render selectivity to DOM when's multiple select", () => {
         var rowData = {},
            domNode = document.createElement("div"),
            domSelectArea = document.createElement("div");

         domSelectArea.className = "list-data-values";
         domNode.appendChild(domSelectArea);

         target.settings.isMultiple = true;

         target.customDisplay(rowData, mockApp, domNode);

         assert.isDefined(domSelectArea.selectivity);
      });

      it(".customEdit: should return true when's single select", () => {
         var rowData = {},
            domNode = document.createElement("div"),
            domSelectArea = document.createElement("div");

         domSelectArea.className = "list-data-values";
         domNode.appendChild(domSelectArea);

         target.settings.isMultiple = false;

         var result = target.customEdit(rowData, mockApp, domNode);

         assert.isTrue(result);
      });
   });

   /* List field component test cases */
   describe("List field component test cases", () => {
      it("should exist list component", () => {
         assert.isDefined(targetComponent);
      });
   });
});
