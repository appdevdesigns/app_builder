
/**
 * @class sampleApp
 *
 * Set up a mock Application with a single object to test with

 */

export default {
    "translations": [
        {
            "language_code": "en",
            "label": "AppDev Apps",
            "description": ""
        },
        {
            "language_code": "th",
            "label": "AppDev Apps (thai)",
            "description": ""
        }
    ],
    "name": "AppDev_Apps",
    "objects": [
        {
            "id": "f0691dfe-ea6c-4c9e-bad3-f9a143beeda8",
            "name": "Sample",
            "labelFormat": "",
            "isImported": "0",
            "urlPath": "AppDev_Apps/Sample",
            "importFromObject": "",
            "objectWorkspace": {
                "frozenColumnID": "Title",
                "sortFields": [
                    {
                        "by": "Noun",
                        "dir": "asc",
                        "isMulti": "1"
                    },
                    {
                        "by": "Number",
                        "dir": "desc",
                        "isMulti": ""
                    }
                ],
                "filterConditions": [
                    {
                        "combineCondtion": "And",
                        "fieldName": "Noun",
                        "operator": "contains",
                        "inputValue": "o",
                        "isMultiLingual": "1",
                        "languageCode": "en"
                    },
                    {
                        "combineCondtion": "And",
                        "fieldName": "Number",
                        "operator": ">",
                        "inputValue": "50",
                        "isMultiLingual": "0",
                        "languageCode": "en"
                    }
                ],
                "hiddenFields": [
                    "Noun"
                ]
            },
            "translations": [
                {
                    "language_code": "en",
                    "label": "Sample"
                },
                {
                    "language_code": "th",
                    "label": "Sample (thai)"
                }
            ],
            "fields": [
                {
                    "id": "1a328f1b-278a-4616-a93f-67d24d75fccd",
                    "key": "string",
                    "icon": "font",
                    "columnName": "Noun",
                    "settings": {
                        "showIcon": "0",
                        "textDefault": "",
                        "supportMultilingual": "1"
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Noun"
                        }
                    ]
                },
                {
                    "id": "de70a66e-38ad-4aff-bb86-6e690fa30b07",
                    "key": "string",
                    "icon": "font",
                    "columnName": "Verbs",
                    "settings": {
                        "showIcon": "0",
                        "textDefault": "",
                        "supportMultilingual": "1"
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Verbs"
                        }
                    ]
                },
                {
                    "id": "44396ffb-6eed-496a-800a-c192134cadff",
                    "key": "string",
                    "icon": "font",
                    "columnName": "Title",
                    "settings": {
                        "showIcon": "0",
                        "textDefault": "",
                        "supportMultilingual": "1"
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Title"
                        }
                    ]
                },
                {
                    "id": "f71be778-35af-48cd-ad6b-f43b6affe033",
                    "key": "string",
                    "icon": "font",
                    "columnName": "Name",
                    "settings": {
                        "showIcon": "0",
                        "textDefault": "",
                        "supportMultilingual": "0"
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Name"
                        }
                    ]
                },
                {
                    "id": "a98f60c8-c80e-41ce-90f2-f556d5a7a2aa",
                    "key": "number",
                    "icon": "slack",
                    "columnName": "Number",
                    "settings": {
                        "showIcon": "0",
                        "allowRequired": "0",
                        "numberDefault": "",
                        "typeFormat": "none",
                        "typeDecimals": "none",
                        "typeDecimalPlaces": "none",
                        "typeRounding": "none",
                        "typeThousands": "none",
                        "validation": "0",
                        "validateMinimum": "",
                        "validateMaximum": ""
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Number"
                        }
                    ]
                }
            ]
        }
    ],
    save: function() {
		return new Promise(function(resolve, reject){ resolve() });
	}
};