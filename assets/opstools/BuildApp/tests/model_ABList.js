// Dependencies
steal(
    "opstools/BuildApp/models/ABList.js",
// Initialization
function(){


    //Define the unit tests
    describe('testing model AD.models.opstools.BuildApp.ABList ', function(){


        before(function(){


        });


        it('model definition exists ', function(){
            assert.isDefined(AD.models.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp.ABList, ' :=> should have been defined ');
               assert.isNotNull(AD.Model.get("opstools.BuildApp.ABList"), ' :=> did not return null');
        });

    });


});