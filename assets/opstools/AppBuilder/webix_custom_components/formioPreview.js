/*
 * formioBuilder
 *
 * Create a custom webix component.
 *
 */

module.exports = class ABCustomFormIOPreview {
    get key() {
        return "formiopreview";
    }

    constructor(App) {
        // App 	{obj}	our application instance object.
        // key {string}	the destination key in App.custom[componentKey] for the instance of this component:

        // super(App, key);

        var L = App.Label;

        var labels = {
            common: App.labels,

            component: {}
        };

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: App.unique(this.key)
        };

        // Our webix UI definition:
        var _ui = {
            name: this.key,
            defaults: {
                css: "scrolly",
                borderless: true
            },
            $init: function(config) {
                var formComponents = config.formComponents
                    ? config.formComponents
                    : {};
                Formio.createForm(this.$view, formComponents, {
                    // readOnly: true
                    // sanitizeConfig: {
                    //     addTags: ["a", "label", "img", "i"],
                    //     addAttr: ["src", "href", "class", "target"]
                    // }
                }).then(function(form) {
                    // now that it is set up we can push it into the global var
                    // formBuilder = builder;
                    // Provide a default submission.
                    // form.submission = {
                    //     data: {
                    //         Name: "Item #5",
                    //         Image: "4f2be24f-6ad0-4687-abbb-1a87ce7bc1d6",
                    //         "Long text": "This is a long text field.",
                    //         "Number Field": 3,
                    //         "Date Field": "2020-02-03",
                    //         "Date and Time": "2020-02-19 00:00:00",
                    //         "Checkbox field": 1,
                    //         "Items to select": 1580782610224,
                    //         "Multiple Items": [1580786381276, 1580786381494],
                    //         "Email Field": "james@digiserve.org",
                    //         "Image Field":
                    //             "d5063af3-06b0-44d0-ae9d-c88a74b81e21",
                    //         "File Attachment":
                    //             '{"uuid":"2d3708eb-d567-483b-9b1e-7cbd6d654866","filename":"2018-01-12 09-44 copy.pdf"}',
                    //         "User Field": "James"
                    //     }
                    // };
                });
            }
        };
        this.view = this.key;

        // our internal business logic
        var _logic = {};
        this._logic = _logic;

        // Tell Webix to create an INSTANCE of our custom component:
        webix.protoUI(_ui, webix.ui.view);
    }
};
