
/**
 * @class sampleApp
 *
 * Set up a mock Application with a single object to test with

 */

export default {
    "translations": [
        {
            "language_code": "en",
            "label": "Sample Application",
            "description": "This application will test all the new features."
        }
    ],
    "name": "Sample_Application",
    "objects": [
        {
            "id": "09eaa364-900d-4c90-8481-386d2faef5c1",
            "name": "Books",
            "labelFormat": "",
            "isImported": "0",
            "urlPath": "Sample_Application/Books",
            "importFromObject": "",
            "objectWorkspace": {
                "frozenColumnID": "Publish Date"
            },
            "translations": [
                {
                    "language_code": "en",
                    "label": "Books"
                }
            ],
            "fields": [
                {
                    "id": "fdba61d6-745d-44c7-96c0-5954ecc04704",
                    "key": "string",
                    "icon": "font",
                    "columnName": "Title",
                    "settings": {
                        "showIcon": "1",
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
                    "id": "e24ea33b-32e6-409e-9bcb-1494d4815e08",
                    "key": "string",
                    "icon": "font",
                    "columnName": "Author",
                    "settings": {
                        "showIcon": "1",
                        "textDefault": "",
                        "supportMultilingual": "1"
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Author"
                        }
                    ]
                },
                {
                    "id": "14dedd7f-adbc-4723-b430-95271fc75d98",
                    "key": "date",
                    "icon": "calendar",
                    "columnName": "Publish Date",
                    "settings": {
                        "showIcon": "1",
                        "includeTime": "0",
                        "defaultCurrentDate": "0",
                        "defaultDate": "",
                        "dayFormat": "%d",
                        "dayOrder": "1",
                        "dayDelimiter": "slash",
                        "monthFormat": "%m",
                        "monthOrder": "2",
                        "monthDelimiter": "slash",
                        "yearFormat": "%Y",
                        "yearOrder": "3",
                        "yearDelimiter": "slash",
                        "hourFormat": "%h",
                        "periodFormat": "none",
                        "timeDelimiter": "colon",
                        "validateCondition": "none",
                        "validateRangeUnit": "days",
                        "validateRangeBefore": "50",
                        "validateRangeAfter": "50",
                        "validateStartDate": "",
                        "validateEndDate": ""
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Publish Date"
                        }
                    ]
                },
                {
                    "id": "a1fba760-ac9f-4cb8-8dcb-83f883ad1c7f",
                    "key": "list",
                    "icon": "th-list",
                    "columnName": "Genre",
                    "settings": {
                        "showIcon": "1",
                        "isMultiple": "0",
                        "singleDefault": "none"
                    },
                    "translations": [
                        {
                            "language_code": "en",
                            "label": "Genre"
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