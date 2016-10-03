// Dependencies
steal(
    "opstools/BuildApp/controllers/ModelWorkspace.js",
// Initialization
function(){

    // the div to attach the controller to
    var divID = 'test_ModelWorkspace';

    // add the div to the window
    var buildHTML = function() {
        var html = [
                    '<div id="'+divID+'">',
                    '</div>'
                    ].join('\n');

        $('body').append($(html));
    }
    

    //Define the unit tests
    describe('testing controller AD.controllers.opstools.BuildApp.ModelWorkspace ', function(){

        var testController = null;

        before(function(){

            buildHTML();

            // Initialize the controller
            testController = new AD.controllers.opstools.BuildApp.ModelWorkspace($('#'+divID), { some:'data' });

        });



        it('controller definition exists ', function(){
            assert.isDefined(AD.controllers.opstools , ' :=> should have been defined ');
            assert.isDefined(AD.controllers.opstools.BuildApp , ' :=> should have been defined ');
            assert.isDefined(AD.controllers.opstools.BuildApp.ModelWorkspace, ' :=> should have been defined ');
              assert.isNotNull(AD.Control.get('opstools.BuildApp.ModelWorkspace'), ' :=> returns our controller. ');
        });


    });


});