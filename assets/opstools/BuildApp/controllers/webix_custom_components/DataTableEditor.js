steal(
    // List your Controller's dependencies here:
    function () {

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
);