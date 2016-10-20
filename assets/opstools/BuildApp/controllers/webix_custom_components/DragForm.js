steal(
	// List your Controller's dependencies here:
	function () {

		webix.protoUI({
			name: "dragform"
		}, webix.RenderStack, webix.DragItem, webix.ui.form);

	}
);