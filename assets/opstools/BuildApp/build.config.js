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
				"js/selectivity/selectivity-full.min"
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