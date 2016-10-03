// Dependencies
steal(
    "opstools/BuildApp/controllers/ModelPage.js",
// Initialization
function(){

    // the div to attach the controller to
    var divID = 'test_ModelPage';

    // add the div to the window
    var buildHTML = function() {
        var html = [
                    '<div id="'+divID+'">',
                    '</div>'
                    ].join('\n');

        $('body').append($(html));
    }
    

    //Define the unit tests
    describe('testing controller AD.controllers.opstools.BuildApp.ModelPage ', function(){

        var testController = null;

        before(function(){

            buildHTML();

            // Initialize the controller
            testController = new AD.controllers.opstools.BuildApp.ModelPage($('#'+divID), { some:'data' });

        });



        it('controller definition exists ', function(){
            assert.isDefined(AD.controllers.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.controllers.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.controllers.opstools.BuildApp.ModelPage, ' :=> should have been defined ');
              assert.isNotNull(AD.Control.get('opstools.BuildApp.ModelPage'), ' :=> returns our controller. ');
        });


    });


});