var assert = require('chai').assert;
var AD = require('ad-utils');

var request = null;
var urlResource = '/app_builder/abapprovalstatus';

describe('ABApprovalStatus tests ', function(){

    before(function(done){
        this.timeout(8000);

        request = AD.test.request(function(err){
            done(err);
        });

    });
    


    // ABApprovalStatus exists
    it('should be there', function() {
        assert.isDefined(ABApprovalStatus, ' --> ABApprovalStatus should be defined!');
    });


    // only accessible by users with permission
    it('only accessible by users with permission', function(ok) {
        this.timeout(8000);
        AD.test.common.accessedOnlyWithPermission({ request:request, url:urlResource }, assert, ok);
    });


    // only REST operations
    it('only REST operations allowed :: ', function(ok) {
        this.timeout(8000);
        AD.test.common.accessedOnlyViaMethods({ request:request, url:urlResource, rest:true, shortcuts:false, actions:false }, assert, ok);
    });


    ////
    //// Sample using AD.test.util.*
    ////
/*
    // calling without a labelDef results in an error/rejected deferred
    it('calling without a labelDef results in an error/rejected deferred', function(ok){

        // wait for both checks to complete.
        var oD = AD.test.util.newOnDone(ok);


        var dfd = Multilingual.label.create(function(err, newLabel){
            assert.isNotNull(err, ' should have returned an error.');
            assert.equal(err.code, 'E_MISSINGPARAM', ' error should have code: E_MISSINGPARAM ');
            assert.isUndefined(newLabel, ' should not have returned a new area.'); 
            AD.test.util.onDone(oD);
        })
        .fail(function(err){

            assert.isNotNull(err, ' should have returned an error.');
            assert.equal(err.code, 'E_MISSINGPARAM', ' error should have code: E_MISSINGPARAM ');
            AD.test.util.onDone(oD);
        })
        .then(function(newLabel){
            assert.ok(false, 'should not have gotten here.');
            AD.test.util.onDone(oD);
        })

        AD.test.util.isDeferred(dfd, assert);

    });
*/

});


