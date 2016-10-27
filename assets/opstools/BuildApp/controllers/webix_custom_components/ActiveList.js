steal(
    // List your Controller's dependencies here:
    function () {
        webix.protoUI({
            name: "activelist"
        }, webix.ui.list, webix.ActiveContent);
    }
);