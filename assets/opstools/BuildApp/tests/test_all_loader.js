System.import('can').then(function () {
    System.import('webix-opsportal').then(function () {
        System.import('appdev').then(function () {

            async.series([

                // Initialization
                function (next) {
                    mocha.setup({
                        ui: 'bdd',
                        timeout: 9000,
                        reporter: 'html'
                    });
                    expect = chai.expect;
                    assert = chai.assert;


                    // System.import('opstools/BuildApp/tests/js/sinon/lib/sinon').then(function (sinon) {
                    // this.sinon = sinon; // Define sinon globally

                    // next();
                    // });
                    next();
                },

                // Load tests
                function (next) {
                    steal.import(
                        "opstools/BuildApp/tests/controllers/utils/test_ModelCreator",
                        "opstools/BuildApp/tests/controllers/utils/test_DataCollectionHelper",
                        "opstools/BuildApp/tests/controllers/data_fields/test_number"
                    ).then(function () { next(); });
                },

                // Execute the tests
                function (next) {
                    if (window.mochaPhantomJS) {
                        mochaPhantomJS.run();
                    } else {
                        mocha.run();
                    }

                    next();
                }
            ]);


        });
    });
});