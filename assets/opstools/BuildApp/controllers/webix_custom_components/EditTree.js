steal(
    // List your Controller's dependencies here:
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/ad',
                'appdev/control/control').then(function () {

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.BuildApp.EditTree', {


                        init: function (element, options) {
                            var self = this;
                            options = AD.defaults({
                            }, options);
                            this.options = options;

                            // Call parent init
                            this._super(element, options);

                            this.initWebixControls();
                        },

                        initWebixControls: function () {

                            webix.protoUI({
                                name: "edittree"
                            }, webix.EditAbility, webix.ui.tree);

                        }
                    });
                });
        });
    }
);