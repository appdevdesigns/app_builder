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
				"can/model/cached/cached",
				"js/selectivity/selectivity-full.min"
			]
		},
		"js/selectivity/selectivity-full.min": {
			"format": "global",
			"deps": [
				"jquery",
				"js/selectivity/selectivity-full.min.css"
			],
			"sideBundle": true
		}

	}
};