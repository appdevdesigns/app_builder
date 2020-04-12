import AB from "../../components/ab";
// import OP from "../../OP/OP"

import _ from "../../../../../node_modules/lodash/lodash.min";

describe("OP.Comm.Service.* unit tests : ", () => {
   function L(key, altText) {
      return AD.lang.label.getLabel(key) || altText;
   }

   var sandbox;

   var testURL = "/some/data";
   var testData = {
      data: true
   };

   before(() => {
      AD.comm.service.mockURL("GET", testURL, testData);
   });

   // after(() => {

   // });

   /* User field test cases */
   describe(".get() ", () => {
      // it should not fail if missing parameters.
      it(" should return a promise", () => {
         var dfd = OP.Comm.Service.get({ url: testURL });
         assert.exists(dfd, ": promise should be defined.");

         assert.instanceOf(dfd, Promise, " should be a promise");
      });
   });
});
