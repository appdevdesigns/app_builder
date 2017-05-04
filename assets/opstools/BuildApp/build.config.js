module.exports = {
	"paths": {
		"opstools/OP_Bundle": "opstools/BuildApp/OP/OP.js",
		"opstools/BuildApp": "opstools/BuildApp/BuildApp.js"
	},
	"bundle": [
		"opstools/OP_Bundle",
		"opstools/BuildApp"
	],
	"meta": {
		"opstools/BuildApp": {
			"deps": [
				"async",
				"can",
				"webix",
				"js/selectivity/selectivity-full.min",
				"OpsPortal/classes/OpsWebixDataCollection"
			]
		},
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
