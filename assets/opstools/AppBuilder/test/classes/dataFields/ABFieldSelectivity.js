import ABFieldSelectivity from "../../../classes/dataFields/ABFieldSelectivity";

describe("ABFieldSelectivity unit tests", () => {
   var sandbox;

   var mockObject;
   var target;
   var domTest = document.querySelector("#ab_test_div");

   const columnName = "TEST_SELECTIVITY_COLUMN";

   var sampleItems = [
      {
         id: 1,
         text: "FIRST_ITEM"
      },
      {
         id: 2,
         text: "SECOND_ITEM"
      },
      {
         id: 3,
         text: "THIRD_ITEM"
      }
   ];

   before(() => {
      mockObject = {};

      target = new ABFieldSelectivity(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject,
         {}
      );
   });

   beforeEach(() => {
      // sandbox = sinon.sandbox.create();
      mockObject = {};

      target = new ABFieldSelectivity(
         {
            columnName: columnName,
            settings: {}
         },
         mockObject,
         {}
      );
   });

   afterEach(() => {
      // Clear test div
      target.selectivityDestroy(domTest);
   });

   after(() => {
      // domTest;
   });

   describe(".selectivityRender", () => {
      it("should exist", () => {
         assert.isDefined(target.selectivityRender);
      });

      it("should add multiple selectivity to dom element", () => {
         target.selectivityRender(domTest, {
            data: sampleItems,
            multiple: true
         });

         // should have .selectivity object in dom
         assert.isDefined(domTest.selectivity);
      });

      it("should add single selectivity to dom element", () => {
         target.selectivityRender(domTest, {
            data: sampleItems[0],
            multiple: false
         });

         // should have .selectivity object in dom
         assert.isDefined(domTest.selectivity);
      });

      it("should add single selectivity (with multiple given data) to dom element", () => {
         target.selectivityRender(domTest, {
            data: sampleItems,
            multiple: false
         });

         // should have .selectivity object in dom
         assert.isDefined(domTest.selectivity);
      });

      it("should add multiple selectivity (with single given data) to dom element", () => {
         target.selectivityRender(domTest, {
            data: sampleItems[0],
            multiple: true
         });

         // should have .selectivity object in dom
         assert.isDefined(domTest.selectivity);
      });
   });

   describe(".selectivityGet", () => {
      it("should exist", () => {
         assert.isDefined(target.selectivityGet);
      });

      it("should return null when selectivity does not render", () => {
         var resultData = target.selectivityGet(domTest);

         assert.isNull(resultData, " result should be null");
      });

      it("should return selectivity data", () => {
         var selectivitySetting = {
            multiple: false,
            items: sampleItems,
            value: sampleItems[0].id
         };

         target.selectivityRender(domTest, selectivitySetting);

         var resultData = target.selectivityGet(domTest);

         assert.isNotArray(resultData, " should be a single value");
         assert.equal(
            selectivitySetting.value,
            resultData.id,
            " should match what we asked for."
         );
      });

      it("should return null if single select no domNode or no selectivity", () => {
         var selectivitySetting = {
            multiple: false,
            items: sampleItems
         };

         target.selectivityRender(domTest, selectivitySetting);

         var resultData = target.selectivityGet(null);
         assert.isNull(resultData, " should be null");

         target.selectivityDestroy(domTest);
         var resultData2 = target.selectivityGet(domTest);
         assert.isNull(resultData2, " should be null");
      });

      it("should return null if nothing set in a Single select entry", () => {
         var selectivitySetting = {
            multiple: false,
            items: sampleItems
         };

         target.selectivityRender(domTest, selectivitySetting);

         var resultData = target.selectivityGet(domTest);
         assert.isNull(resultData, " should be null");
      });

      it("should return multiple selectivity data", () => {
         // erase domTest.selectivity
         domTest.selectivity = null;

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

   describe(".selectivitySet", () => {
      it("should exist", () => {
         assert.isDefined(target.selectivitySet);
      });

      it("should not error when set value to not selectivity", () => {
         target.selectivitySet(domTest, sampleItems[0]);
      });

      it("should set value to single selectivity object (in multiple mode) ", () => {
         var selectivitySetting = {
            multiple: true,
            items: sampleItems
         };

         // render selectivity
         target.selectivityRender(domTest, selectivitySetting);

         // set single data to selectivity
         target.selectivitySet(domTest, sampleItems[0]);

         var resultData = target.selectivityGet(domTest);

         assert.isArray(resultData, " --> should return an array");
         assert.equal(sampleItems[0], resultData[0]);
      });

      it("should set value to single selectivity object (in single mode) ", () => {
         var selectivitySetting = {
            multiple: false,
            items: sampleItems
         };

         // render selectivity
         target.selectivityRender(domTest, selectivitySetting);

         // set single data to selectivity
         target.selectivitySet(domTest, sampleItems[0]);

         var resultData = target.selectivityGet(domTest);

         assert.isNotArray(resultData, " --> should return an object");
         assert.equal(sampleItems[0], resultData);
      });

      it("should set value to multiple selectivity object", () => {
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

   describe(".selectivityDestroy", () => {
      it("should exist", () => {
         assert.isDefined(target.selectivityDestroy);
      });

      it("should not error when destroy not selectivity object", () => {
         target.selectivityDestroy(domTest);
      });

      it("should be empty content dom when destroy", () => {
         target.selectivityRender(domTest, { multiple: false });

         assert.isTrue(domTest.innerHTML.length > 0);

         target.selectivityDestroy(domTest);

         assert.isTrue(domTest.innerHTML.length == 0);
      });
   });
});
