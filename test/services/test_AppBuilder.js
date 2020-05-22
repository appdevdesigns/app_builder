var assert = require("chai").assert;
var fs = require("fs");
var path = require("path");
var async = require("async");

describe("AppBuilder service", function() {
   it("should be there", function() {
      assert.isDefined(AppBuilder, " --> AppBuilder should be defined!");
   });

   // it('build object', function (done) {
   // 	this.timeout(15000);

   // 	async.series([
   // 		function (next) {
   // 			AppBuilder.buildObject(1)
   // 				.fail(next)
   // 				.then(function () {
   // 					next();
   // 				});
   // 		},
   // 		function (next) {
   // 			AppBuilder.buildObject(2)
   // 				.fail(next)
   // 				.then(function () {
   // 					next();
   // 				});

   // 		}
   // 	], done);
   // });
});
