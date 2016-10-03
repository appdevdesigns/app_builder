// Dependencies
steal(
    "opstools/BuildApp/models/ABPage.js",
// Initialization
function(){


    //Define the unit tests
    describe('testing model AD.models.opstools.BuildApp.ABPage ', function(){


        before(function(){


        });


        it('model definition exists ', function(){
            assert.isDefined(AD.models.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp.ABPage, ' :=> should have been defined ');
               assert.isNotNull(AD.Model.get("opstools.BuildApp.ABPage"), ' :=> did not return null');
        });

    });


});