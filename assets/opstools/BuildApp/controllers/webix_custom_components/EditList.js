steal(
    // List your Controller's dependencies here:
    function () {
        webix.protoUI({
            name: "editlist"
        }, webix.EditAbility, webix.ui.list);
    }
);