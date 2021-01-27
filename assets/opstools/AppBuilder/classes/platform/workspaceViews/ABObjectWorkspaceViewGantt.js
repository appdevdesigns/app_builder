// ABObjectWorkspaceViewGantt.js
//
// Manages the settings for a Gantt Chart View in the AppBuilder Object Workspace

const ABObjectWorkspaceView = require("./ABObjectWorkspaceView");
const ABObjectWorkspaceViewComponent = require("./ABObjectWorkspaceViewComponent");

const ABPopupNewDataField = require("../../../components/ab_work_object_workspace_popupNewDataField");

const ABFieldDate = require("../dataFields/ABFieldDate");
const ABFieldNumber = require("../dataFields/ABFieldNumber");
const ABFieldString = require("../dataFields/ABFieldString");
const ABFieldLongText = require("../dataFields/ABFieldLongText");

var defaultValues = {
   name: "Default Gantt",
   filterConditions: [], // array of filters to apply to the data table
   sortFields: [],
   title: "none", // id of a ABFieldString, ABFieldLongText
   startDate: null, // id of a ABFieldDate
   endDate: "none", // id of a ABFieldDate
   duration: "none", // id of a ABFieldNumber
   progress: "none", // id of a ABFieldNumber
   notes: "none" // id of a ABFieldString, ABFieldLongText
};

module.exports = class ABObjectWorkspaceViewGantt extends ABObjectWorkspaceView {
   constructor(attributes, object) {
      super(attributes, object, "gantt");

      /*
			{
				id:uuid(),
				type:'gantt',  
				filterConditions:[],
			}
		
		*/
   }

   /**
    * unique key describing this View.
    * @return {string}
    */
   static type() {
      return "gantt";
   }

   /**
    * @return {string}
    */
   static icon() {
      return "fa fa-tasks";
   }

   static component(App, idBase) {
      let ids = {
         title: App.unique(idBase + "_popupGanttTitle"),
         startDate: App.unique(idBase + "_popupGanttStartDate"),
         endDate: App.unique(idBase + "_popupGanttEndDate"),
         duration: App.unique(idBase + "_popupGanttDuration"),
         progress: App.unique(idBase + "_popupGanttProgress"),
         notes: App.unique(idBase + "_popupGanttNotes")
      };

      let L = (key, altText) => {
         return AD.lang.label.getLabel(key) || altText;
      };

      let labels = {
         common: App.labels,
         component: {
            title: L("ab.add_view.gantt.title", "*Title"),
            startDate: L("ab.add_view.gantt.startDate", "*Start Date"),
            endDate: L("ab.add_view.gantt.endDate", "*End Date"),
            duration: L("ab.add_view.gantt.duration", "*Duration"),
            progress: L("ab.add_view.gantt.progress", "*Progress"),
            notes: L("ab.add_view.gantt.notes", "*Notes"),

            datePlaceholder: L(
               "ab.add_view.gantt.datePlaceholder",
               "*Select a date field"
            ),
            numberPlaceholder: L(
               "ab.add_view.gantt.numberPlaceholder",
               "*Select a number field"
            ),
            stringPlaceholder: L(
               "ab.add_view.gantt.stringPlaceholder",
               "*Select a string field"
            )
         }
      };

      let refreshOptions = (object, view) => {
         let dateFields = object
            .fields((f) => f instanceof ABFieldDate)
            .map(({ id, label }) => ({ id, value: label }));

         // Start date
         $$(ids.startDate).define("options", dateFields);

         // Add default option
         dateFields.unshift({
            id: "none",
            value: labels.component.datePlaceholder
         });

         // End date
         $$(ids.endDate).define("options", dateFields);

         // Duration
         let numberFields = object
            .fields((f) => f instanceof ABFieldNumber)
            .map(({ id, label }) => ({ id, value: label }));

         // Add default option
         numberFields.unshift({
            id: "none",
            value: labels.component.numberPlaceholder
         });
         $$(ids.duration).define("options", numberFields);

         // Progress
         let decimalFields = object
            .fields((f) => f instanceof ABFieldNumber)
            .map(({ id, label }) => ({ id, value: label }));

         // Add default option
         decimalFields.unshift({
            id: "none",
            value: labels.component.numberPlaceholder
         });
         $$(ids.progress).define("options", decimalFields);

         // Title & Notes
         let stringFields = object
            .fields(
               (f) => f instanceof ABFieldString || f instanceof ABFieldLongText
            )
            .map(({ id, label }) => ({ id, value: label }));

         // Add default option
         stringFields.unshift({
            id: "none",
            value: labels.component.stringPlaceholder
         });
         $$(ids.title).define("options", stringFields);
         $$(ids.notes).define("options", stringFields);

         // Select view's values
         if (view && view.title) {
            $$(ids.title).define("value", view.title);
            $$(ids.title).refresh();
         }

         if (view && view.startDate) {
            $$(ids.startDate).define("value", view.startDate);
            $$(ids.startDate).refresh();
         }

         if (view && view.endDate) {
            $$(ids.endDate).define(
               "value",
               view.endDate || defaultValues.endDate
            );
            $$(ids.endDate).refresh();
         }

         if (view && view.duration) {
            $$(ids.duration).define(
               "value",
               view.duration || defaultValues.duration
            );
            $$(ids.duration).refresh();
         }

         if (view && view.progress) {
            $$(ids.progress).define("value", view.progress);
            $$(ids.progress).refresh();
         }

         if (view && view.notes) {
            $$(ids.notes).define("value", view.notes);
            $$(ids.notes).refresh();
         }
      };

      var PopupNewDataFieldComponent = new ABPopupNewDataField(
         App,
         idBase + "_gantt"
      );

      let ViewComponent = new ABObjectWorkspaceViewComponent({
         elements: () => {
            return {
               batch: "gantt",
               rows: [
                  {
                     cols: [
                        {
                           id: ids.title,
                           view: "richselect",
                           label: `<span class='webix_icon fa fa-calendar'></span> ${labels.component.title}`,
                           placeholder: labels.component.stringPlaceholder,
                           labelWidth: 130,
                           name: "title",
                           options: []
                        },
                        {
                           view: "button",
                           css: "webix_primary",
                           type: "icon",
                           icon: "fa fa-plus",
                           label: "",
                           width: 20,
                           click: () => {
                              PopupNewDataFieldComponent.show(
                                 null,
                                 ABFieldString.defaults().key
                              );
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           id: ids.startDate,
                           view: "richselect",
                           label: `<span class='webix_icon fa fa-calendar'></span> ${labels.component.startDate}`,
                           placeholder: labels.component.datePlaceholder,
                           labelWidth: 130,
                           name: "startDate",
                           required: true,
                           options: []
                        },
                        {
                           view: "button",
                           css: "webix_primary",
                           type: "icon",
                           icon: "fa fa-plus",
                           label: "",
                           width: 20,
                           click: () => {
                              PopupNewDataFieldComponent.show(
                                 null,
                                 ABFieldDate.defaults().key
                              );
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           id: ids.endDate,
                           view: "richselect",
                           label: `<span class='webix_icon fa fa-calendar'></span> ${labels.component.endDate}`,
                           placeholder: labels.component.datePlaceholder,
                           labelWidth: 130,
                           name: "endDate",
                           options: []
                        },
                        {
                           view: "button",
                           css: "webix_primary",
                           type: "icon",
                           icon: "fa fa-plus",
                           label: "",
                           width: 20,
                           click: () => {
                              PopupNewDataFieldComponent.show(
                                 null,
                                 ABFieldDate.defaults().key
                              );
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           id: ids.duration,
                           view: "richselect",
                           label: `<span class='webix_icon fa fa-hashtag'></span> ${labels.component.duration}`,
                           placeholder: labels.component.numberPlaceholder,
                           labelWidth: 130,
                           name: "duration",
                           options: []
                        },
                        {
                           view: "button",
                           css: "webix_primary",
                           type: "icon",
                           icon: "fa fa-plus",
                           label: "",
                           width: 20,
                           click: () => {
                              PopupNewDataFieldComponent.show(
                                 null,
                                 ABFieldNumber.defaults().key
                              );
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           id: ids.progress,
                           view: "richselect",
                           label: `<span class='webix_icon fa fa-hashtag'></span> ${labels.component.progress}`,
                           placeholder: labels.component.numberPlaceholder,
                           labelWidth: 130,
                           name: "progress",
                           required: false,
                           options: []
                        },
                        {
                           view: "button",
                           css: "webix_primary",
                           type: "icon",
                           icon: "fa fa-plus",
                           label: "",
                           width: 20,
                           click: () => {
                              PopupNewDataFieldComponent.show(
                                 null,
                                 ABFieldNumber.defaults().key
                              );
                           }
                        }
                     ]
                  },
                  {
                     cols: [
                        {
                           id: ids.notes,
                           view: "richselect",
                           label: `<span class='webix_icon fa fa-align-right'></span> ${labels.component.notes}`,
                           placeholder: labels.component.stringPlaceholder,
                           labelWidth: 130,
                           name: "notes",
                           required: false,
                           options: []
                        },
                        {
                           view: "button",
                           css: "webix_primary",
                           type: "icon",
                           icon: "fa fa-plus",
                           label: "",
                           width: 20,
                           click: () => {
                              PopupNewDataFieldComponent.show(
                                 null,
                                 ABFieldLongText.defaults().key
                              );
                           }
                        }
                     ]
                  }
               ]
            };
         },

         init: (object, view) => {
            if (!object) return;

            refreshOptions(object, view);

            PopupNewDataFieldComponent.applicationLoad(object.application);
            PopupNewDataFieldComponent.objectLoad(object);
            PopupNewDataFieldComponent.init({
               onSave: () => {
                  // be notified when a new Field is created & saved

                  refreshOptions(object, view);
               }
            });
         },

         validate: function($form) {
            let endDate = $$(ids.endDate).getValue() || defaultValues.endDate,
               duration = $$(ids.duration).getValue() || defaultValues.duration;

            if (
               endDate == defaultValues.endDate &&
               duration == defaultValues.duration
            ) {
               $form.markInvalid("endDate", "Required");
               $form.markInvalid("duration", "Required");

               return false;
            } else {
               return true;
            }
         },

         values: function() {
            let result = {};

            result.title = $$(ids.title).getValue() || defaultValues.title;
            result.startDate =
               $$(ids.startDate).getValue() || defaultValues.startDate;
            result.endDate =
               $$(ids.endDate).getValue() || defaultValues.endDate;
            result.duration =
               $$(ids.duration).getValue() || defaultValues.duration;
            result.progress =
               $$(ids.progress).getValue() || defaultValues.progress;
            result.notes = $$(ids.notes).getValue() || defaultValues.notes;

            return result;
         },

         logic: {}
      });

      return ViewComponent;
   }

   /**
    * @method fromObj
    * take our persisted data, and properly load it
    * into this object instance.
    * @param {json} data  the persisted data
    */
   fromObj(data) {
      super.fromObj(data);

      for (var v in defaultValues) {
         this[v] = data[v] || defaultValues[v];
      }

      this.type = ABObjectWorkspaceViewGantt.type();
   }

   /**
    * @method toObj()
    * compile our current state into a {json} object
    * that can be persisted.
    */
   toObj() {
      var obj = super.toObj();

      for (var v in defaultValues) {
         obj[v] = this[v];
      }

      obj.type = ABObjectWorkspaceViewGantt.type();
      return obj;
   }

   get titleField() {
      let viewCollection = this.object, // Should use another name property ?
         object = viewCollection.object;

      return object.fields((f) => f.id == this.title)[0];
   }

   get startDateField() {
      let viewCollection = this.object, // Should use another name property ?
         object = viewCollection.object;

      return object.fields((f) => f.id == this.startDate)[0];
   }

   get endDateField() {
      let viewCollection = this.object, // Should use another name property ?
         object = viewCollection.object;

      return object.fields((f) => f.id == this.endDate)[0];
   }

   get durationField() {
      let viewCollection = this.object, // Should use another name property ?
         object = viewCollection.object;

      return object.fields((f) => f.id == this.duration)[0];
   }

   get progressField() {
      let viewCollection = this.object, // Should use another name property ?
         object = viewCollection.object;

      return object.fields((f) => f.id == this.progress)[0];
   }

   get notesField() {
      let viewCollection = this.object,
         object = viewCollection.object;

      return object.fields((f) => f.id == this.notes)[0];
   }
};
