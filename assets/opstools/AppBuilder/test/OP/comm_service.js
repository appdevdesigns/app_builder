import AB from "../../components/ab";
import OP from "../../OP/OP";

import _ from "../../../../../node_modules/lodash/lodash.min";

describe("OP.Comm.Service.* unit tests : ", () => {
   function L(key, altText) {
      return AD.lang.label.getLabel(key) || altText;
   }

   var sandbox;

   var testURL = "/some/data";
   var testURLError = "/some/error";
   var testData = {
      data: true
   };

   var methods = ["get", "post", "put", "delete"];

   before(() => {
      //// NOTE: for now, our OP.Comm.Service.* routines reuse the underlying
      ////       AD.comm.service.* routines.

      // foreach method, create a success and error url for testing:
      methods.forEach((method) => {
         AD.comm.mockURL(method.toUpperCase(), testURL, testData);
         AD.comm.mockURL(method.toUpperCase(), testURLError, {}, false);
      });
   });

   // after(() => {

   // });

   // run these set of tests for each method:
   methods.forEach((method) => {
      describe("." + method + "() ", () => {
         // it should not fail if missing parameters.
         it(" should return a promise", () => {
            var dfd = OP.Comm.Service[method]({ url: testURL });
            assert.isDefined(dfd, ": promise should be defined.");
            assert.isNotNull(dfd, ": promise should not be null ");
            assert.instanceOf(dfd, Promise, " should be a promise");
         });

         // it should not fail if missing parameters.
         it(" should trigger .then() on success", (cb) => {
            OP.Comm.Service[method]({ url: testURL })
               .then(function(data) {
                  assert.ok(true, " should have called .then() routine");
                  assert.equal(
                     data,
                     testData,
                     " should have returned our expected test data"
                  );
                  cb();
               })
               .catch(function(err) {
                  assert.ok(false, " should not have called .catch routine.");
                  cb();
               });
         });

         //  should trigger .catch() on error
         it(" should trigger .catch() on error", (cb) => {
            OP.Comm.Service[method]({ url: testURLError })
               .then(function(data) {
                  assert.ok(false, " should not have called .then() routine.");
                  cb();
               })
               .catch(function(err) {
                  assert.ok(true, " should have called .catch() routine");
                  cb();
               });
         });
      });
   });
});
