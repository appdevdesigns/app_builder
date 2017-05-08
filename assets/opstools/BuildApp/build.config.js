module.exports = {
	"paths": {
		// "opstools/OP_Bundle": "opstools/BuildApp/OP_Bundle.js",
		"opstools/BuildApp": "opstools/BuildApp/BuildApp.js"
	},
	"bundle": [
		// "opstools/OP_Bundle",
		"opstools/BuildApp"
	],
	"meta": {
		"opstools/BuildApp": {
			"deps": [
				// "opstools/OP_Bundle",
				"async",
				"can",
				"webix",
				"js/selectivity/selectivity-full.min",
				"OpsPortal/classes/OpsWebixDataCollection"
			]
		},
		// "opstools/OP_Bundle": {
    //   "format": "global",
    //   "sideBundle": true
		// },
		"js/selectivity/selectivity-full.min": {
			"format": "global",
			"deps": [
				"jquery",
				"can",
				"js/selectivity/selectivity-full.min.css"
			],
			"sideBundle": true
		}
	}
};
