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
				"js/selectivity/selectivity.min",
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
		}
	}
};
