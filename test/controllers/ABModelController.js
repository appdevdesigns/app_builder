var assert = require("chai").assert;
var fs = require("fs");
var path = require("path");
var async = require("async");
var AD = require("ad-utils");

var urlService = "/app_builder/model/application/{appId}/object/{objectId}";
function urlForObject(appId, objectId) {
   return urlService.replace("{appId}", appId).replace("{objectId}", objectId);
}

describe("ABModelController ", function() {
   // it('should be there', function () {
   // 	assert.isDefined(ABModelController, ' --> ABModelController should be defined!');
   // });
   var appId = 0;
   var objectId = 0;
   var testObj;

   before(function(done) {
      this.timeout(4000);

      request = AD.test.request(function(err) {
         done(err);
      });
   });

   // default response tests
   function defaultResponseTest(res) {
      assert.isDefined(res, " --> response should be defined ");
      assert.isDefined(res.body.data, " --> expect data in the response ");
      assert.isArray(res.body.data, " --> expect data to be an array ");
      assert.lengthOf(
         res.body.data,
         res.body.total_count,
         " --> expect data length to be the same as total_count "
      );
   }

   it("should have our Test Application loaded ", function(ok) {
      ABApplication.find({ id: 1 }).exec(function(err, list) {
         assert.isNull(err, " should not have an error");
         assert.isDefined(list, " should have returned an application");
         assert.isArray(list, " should be an array of values");
         // console.log('... app: ', app[0].toABClass() );
         var app = list[0].toABClass();
         appId = app.id;
         objectId = app.objects()[0].id;
         testObj = app.objects()[0];
         ok();
      });
   });

   // it('should be able to request an object ', function(ok) {
   //     this.timeout(16000);
   //     var url = urlForObject(appId, objectId);
   //     request
   //         .get(url)
   //         .set('Accept', 'application/json')
   //         .expect(200)
   //         .end(function(err, res){

   //             assert.isNull(err, ' --> err should be undefined ');

   //             defaultResponseTest(res);

   //             ok(err);
   //         });
   // })

   // it('should be able to request an object ', function(ok) {

   //     // get a field that is a connected object
   //     var connectedField = testObj.fields( function(f) {
   //         return f.key == "connectObject";
   //     })[0];

   //     // determine if the connected field is the source or not and set the operator query param to the proper setting
   //     var operator = "";
   //     if (connectedField.settings.linkType == "one" && connectedField.settings.linkViaType == "one") {
   //         if (connectedField.settings.isSource) {
   //             operator = "is null";
   //         } else {
   //             operator = "have no relation";
   //         }
   //     }

   //     this.timeout(16000);
   //     var url = urlForObject(appId, objectId);
   //     request
   //         .get(url)
   //         .set('Accept', 'application/json')
   //         .query({
   //             "where[where][0][fieldName]": connectedField.columnName,
   //             "where[where][0][operator]": operator
   //         })
   //         .expect(200)
   //         .end(function(err, res){
   //             assert.isNull(err, ' --> err should be undefined ');
   //             defaultResponseTest(res);
   //             ok(err);
   //         });
   // })
});
