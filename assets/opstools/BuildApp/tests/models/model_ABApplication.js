// Dependencies
steal(
    "opstools/BuildApp/models/ABApplication.js",
// Initialization
function(){


    //Define the unit tests
    describe('testing model AD.models.opstools.BuildApp.ABApplication ', function(){


        before(function(){


        });


        it('model definition exists ', function(){
            assert.isDefined(AD.models.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp.ABApplication, ' :=> should have been defined ');
               assert.isNotNull(AD.Model.get("opstools.BuildApp.ABApplication"), ' :=> did not return null');
        });

    });


});