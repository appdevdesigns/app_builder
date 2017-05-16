module.exports = {
	"paths": {
		"opstools/BuildApp": "opstools/BuildApp/BuildApp.js"
	},
	"bundle": [
		"opstools/BuildApp"
	],
	"meta": {
		"opstools/BuildApp": {
			"deps": [
				"async",
				"webix",
				"js/selectivity/selectivity-full.min",
				"OpsPortal/classes/OpsWebixDataCollection",
				"opstools/BuildApp/OP_Bundle"
			],
			"format": "global"
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
