steal(
    // List your Controller's dependencies here:
    function () {
        System.import('appdev').then(function () {
            steal.import('appdev/ad',
                'appdev/control/control').then(function () {

                    // Namespacing conventions:
                    // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                    AD.Control.extend('opstools.BuildApp.DataTableEditor', {


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
                            // Number text
                            webix.editors.number = webix.extend({
                                // TODO : Validate number only
                            }, webix.editors.text);

                            // Date & time selector
                            webix.editors.$popup.datetime = {
                                view: "popup", width: 250, height: 250, padding: 0,
                                body: { view: "calendar", icons: true, borderless: true, timepicker: true }
                            };

                            webix.editors.datetime = webix.extend({
                                popupType: "datetime"
                            }, webix.editors.date);

                        }
                    });
                });
        });
    }
);