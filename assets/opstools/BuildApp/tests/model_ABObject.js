// Dependencies
steal(
    "opstools/BuildApp/models/ABObject.js",
// Initialization
function(){


    //Define the unit tests
    describe('testing model AD.models.opstools.BuildApp.ABObject ', function(){


        before(function(){


        });


        it('model definition exists ', function(){
            assert.isDefined(AD.models.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.models.opstools.BuildApp.ABObject, ' :=> should have been defined ');
               assert.isNotNull(AD.Model.get("opstools.BuildApp.ABObject"), ' :=> did not return null');
        });

    });


});