import ABApplication from "../../classes/ABApplication";

/**
 * @class sampleApp
 *
 * Set up a mock Application with a single object to test with

 */

let jsonApp = {
   id: "MOCK_APP_ID",
   name: "AppDev_Apps",
   json: {
      translations: [
         {
            language_code: "en",
            label: "AppDev Apps",
            description: ""
         },
         {
            language_code: "th",
            label: "AppDev Apps (thai)",
            description: ""
         }
      ],
      objects: [
         {
            id: "f0691dfe-ea6c-4c9e-bad3-f9a143beeda8",
            name: "Sample",
            labelFormat: "",
            isImported: "0",
            urlPath: "AppDev_Apps/Sample",
            importFromObject: "",
            objectWorkspace: {
               frozenColumnID: "Title",
               sortFields: [
                  {
                     by: "Noun",
                     dir: "asc",
                     isMulti: "1"
                  },
                  {
                     by: "Number",
                     dir: "desc",
                     isMulti: ""
                  }
               ],
               filterConditions: [
                  {
                     combineCondtion: "And",
                     fieldName: "Noun",
                     operator: "contains",
                     inputValue: "o",
                     isMultiLingual: "1",
                     languageCode: "en"
                  },
                  {
                     combineCondtion: "And",
                     fieldName: "Number",
                     operator: ">",
                     inputValue: "50",
                     isMultiLingual: "0",
                     languageCode: "en"
                  }
               ],
               hiddenFields: ["Noun"]
            },
            translations: [
               {
                  language_code: "en",
                  label: "Sample"
               },
               {
                  language_code: "th",
                  label: "Sample (thai)"
               }
            ],
            fields: [
               {
                  id: "1a328f1b-278a-4616-a93f-67d24d75fccd",
                  key: "string",
                  icon: "font",
                  columnName: "Noun",
                  settings: {
                     showIcon: "0",
                     textDefault: "",
                     supportMultilingual: "1"
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Noun"
                     }
                  ]
               },
               {
                  id: "de70a66e-38ad-4aff-bb86-6e690fa30b07",
                  key: "string",
                  icon: "font",
                  columnName: "Verbs",
                  settings: {
                     showIcon: "0",
                     textDefault: "",
                     supportMultilingual: "1"
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Verbs"
                     }
                  ]
               },
               {
                  id: "44396ffb-6eed-496a-800a-c192134cadff",
                  key: "string",
                  icon: "font",
                  columnName: "Title",
                  settings: {
                     showIcon: "0",
                     textDefault: "",
                     supportMultilingual: "1"
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Title"
                     }
                  ]
               },
               {
                  id: "f71be778-35af-48cd-ad6b-f43b6affe033",
                  key: "string",
                  icon: "font",
                  columnName: "Name",
                  settings: {
                     showIcon: "0",
                     textDefault: "",
                     supportMultilingual: "0"
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Name"
                     }
                  ]
               },
               {
                  id: "a98f60c8-c80e-41ce-90f2-f556d5a7a2aa",
                  key: "number",
                  icon: "slack",
                  columnName: "Number",
                  settings: {
                     showIcon: "0",
                     allowRequired: "0",
                     numberDefault: "",
                     typeFormat: "none",
                     typeDecimals: "none",
                     typeDecimalPlaces: "none",
                     typeRounding: "none",
                     typeThousands: "none",
                     validation: "0",
                     validateMinimum: "",
                     validateMaximum: ""
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Number"
                     }
                  ]
               },
               {
                  id: "dfa0e438-8bc6-47dc-bbc6-7a95f4c9b30c",
                  key: "date",
                  icon: "calendar",
                  columnName: "Date",
                  settings: {
                     validateCondition: "none",
                     validateRangeUnit: "days",
                     validateRangeBefore: "0",
                     validateRangeAfter: "0",
                     validateStartDate: "null",
                     validateEndDate: "null"
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Date"
                     }
                  ]
               },
               {
                  id: "3e89d0e1-c978-45ba-83b8-7e9e5242fe55",
                  key: "connectObject",
                  icon: "external-link",
                  isImported: 0,
                  columnName: "Link",
                  settings: {
                     showIcon: 1,
                     required: 0,
                     linkObject: "8969f188-96e3-419b-b065-066148d1b77c",
                     linkType: "one",
                     linkViaType: "many",
                     linkColumn: "962f3971-185f-45dd-8cd6-414bbbb06329",
                     isSource: 1,
                     width: 130
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Link"
                     }
                  ]
               }
            ]
         },
         {
            id: "8969f188-96e3-419b-b065-066148d1b77c",
            name: "Sample2",
            labelFormat: "",
            isImported: "0",
            urlPath: "AppDev_Apps/Sample2",
            importFromObject: "",
            objectWorkspace: {
               frozenColumnID: "",
               sortFields: [],
               filterConditions: [],
               hiddenFields: ["Noun"]
            },
            translations: [
               {
                  language_code: "en",
                  label: "Sample"
               },
               {
                  language_code: "th",
                  label: "Sample (thai)"
               }
            ],
            fields: [
               {
                  id: "962f3971-185f-45dd-8cd6-414bbbb06329",
                  key: "connectObject",
                  icon: "external-link",
                  isImported: 0,
                  columnName: "Link",
                  settings: {
                     showIcon: 1,
                     required: 0,
                     linkObject: "f0691dfe-ea6c-4c9e-bad3-f9a143beeda8",
                     linkType: "many",
                     linkViaType: "one",
                     linkColumn: "3e89d0e1-c978-45ba-83b8-7e9e5242fe55",
                     isSource: 0,
                     width: 130
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Link"
                     }
                  ]
               },
               {
                  id: "bc5342a0-3ba1-4be1-a914-27c73c5629f6",
                  key: "number",
                  icon: "slack",
                  columnName: "Number",
                  settings: {
                     showIcon: "0",
                     allowRequired: "0",
                     numberDefault: "",
                     typeFormat: "none",
                     typeDecimals: "none",
                     typeDecimalPlaces: "none",
                     typeRounding: "none",
                     typeThousands: "none",
                     validation: "0",
                     validateMinimum: "",
                     validateMaximum: ""
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "Number"
                     }
                  ]
               },
               {
                  id: "ec0f4e97-eac8-4642-8eb5-f0f98e510431",
                  key: "calculate",
                  icon: "calculator",
                  isImported: 0,
                  columnName: "cal",
                  settings: {
                     showIcon: 1,
                     required: 0,
                     formula: "{Number}+100",
                     decimalSign: "none",
                     decimalPlaces: "none",
                     width: null
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: "cal"
                     }
                  ]
               }
            ]
         }
      ]
   }
};

var result = new ABApplication(jsonApp);

// override this function to
result.save = function() {
   return new Promise(function(resolve, reject) {
      resolve();
   });
};

export default result;
