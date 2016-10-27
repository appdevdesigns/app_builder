module.exports = {
	"paths": {
		"opstools/BuildApp": "opstools/BuildApp/BuildApp.js",
	},
	"bundle": [
		"opstools/BuildApp"
	],
	"meta": {
		"opstools/BuildApp": {
			"deps": [
				"async",
				"can",
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