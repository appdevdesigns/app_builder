// Dependencies
steal(
    "opstools/BuildApp/models/ABPageComponent.js",
// Initialization
function(){


    //Define the unit tests
    describe('testing model AD.models.opstools.BuildApp.ABPageComponent ', function(){


        before(function(){


        });


        it('model definition exists ', function(){
            assert.isDefined(AD.models.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp.ABPageComponent, ' :=> should have been defined ');
               assert.isNotNull(AD.Model.get("opstools.BuildApp.ABPageComponent"), ' :=> did not return null');
        });

    });


});