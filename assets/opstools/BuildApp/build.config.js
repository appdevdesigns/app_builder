module.exports = {
	"paths": {
		"opstools/BuildApp": "opstools/BuildApp/BuildApp.js"
	},
	"bundle": [
		"opstools/BuildApp"
	],
	"meta": {
		"opstools/BuildApp/OP_Bundle": {
			"format": "global",
			"sideBundle": true
		},
		"opstools/BuildApp": {
			"deps": [
				"async",
				"webix",
				"js/webix/extras/tinymce",
				"js/selectivity/selectivity.min",
				"js/vfs_fonts",
				"OpsPortal/classes/OpsWebixDataCollection",
				"opstools/BuildApp/OP_Bundle"
			],
			"format": "global"
		},
		"js/selectivity/selectivity.min": {
			"format": "global",
			"deps": [
				"js/selectivity/selectivity.min.css"
			],
			"sideBundle": true
		},
        "js/vfs_fonts": {
            "format": "global",
            "deps": [
                "js/pdfmake.min"
            ],
            "sideBundle": true
        },
        "js/pdfmake.min": {
            "format": "global",
            "deps": [
            ],
            "sideBundle": true
        }
	}
};
