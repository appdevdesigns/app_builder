const ABProcessTriggerTimerCore = require("../../../core/process/tasks/ABProcessTriggerTimerCore.js");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABProcessTriggerTimer extends ABProcessTriggerTimerCore {
   propertyIDs(id) {
      return {
         name: `${id}_name`,
         repeatEvery: `${id}_repeatEvery`,
         repeatTime: `${id}_repeatTime`,
         repeatOnPanel: `${id}_repeatOnPanel`,
         repeatDaily: `${id}_repeatDaily`,
         repeatWeekly: `${id}_repeatWeekly`,
         repeatMonthly: `${id}_repeatMonthly`,
         toggleButton: `${id}_toggleButton`
      };
   }

   /**
    * @function propertiesShow()
    * display the properties panel for this Process Element.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesShow(id) {
      let ids = this.propertyIDs(id);
      let defaultValues = ABProcessTriggerTimer.defaults();

      let dayOptions = [];
      for (let day = 1; day <= 30; day++) {
         dayOptions.push({
            id: day,
            value: day
         });
      }
      dayOptions.push({
         id: "L",
         value: "Last"
      });

      function updateButtonLabel(isRunning) {
         $$(ids.toggleButton).define(
            "label",
            isRunning
               ? L("ab.process.timer.stop", "Stop")
               : L("ab.process.timer.start", "Start")
         );
         $$(ids.toggleButton).refresh();
      }

      const LABEL_WIDTH = 120;
      let ui = {
         view: "form",
         id: id,
         elements: [
            {
               id: ids.name,
               view: "text",
               label: L("ab.process.task.trigger.name", "*Name"),
               labelWidth: LABEL_WIDTH,
               name: "name",
               value: this.name
            },
            {
               id: ids.repeatEvery,
               view: "richselect",
               name: "repeatEvery",
               label: L(
                  "ab.process.task.trigger.timer.repeatEvery",
                  "*Repeat every"
               ),
               labelWidth: LABEL_WIDTH,
               value: this.repeatEvery || defaultValues.repeatEvery,
               options: [
                  { id: "daily", value: "Daily" },
                  {
                     id: "weekly",
                     value: "Weekly"
                  },
                  {
                     id: "monthly",
                     value: "Monthly"
                  }
               ],
               on: {
                  onChange: (repeatEvery) => {
                     $$(ids.repeatOnPanel).showBatch(repeatEvery);
                  }
               }
            },
            {
               id: ids.repeatTime,
               view: "datepicker",
               name: "repeatTime",
               label: L("ab.process.task.trigger.timer.repeatTime", "*Time"),
               labelWidth: LABEL_WIDTH,
               value: this.repeatTime || defaultValues.repeatTime,
               timepicker: true,
               type: "time",
               multiselect: false
            },
            {
               view: "multiview",
               id: ids.repeatOnPanel,
               cells: [
                  {
                     view: "radio",
                     id: ids.repeatDaily,
                     label: " ",
                     labelWidth: LABEL_WIDTH,
                     batch: "daily",
                     vertical: true,
                     value: this.repeatDaily || defaultValues.repeatDaily,
                     options: [
                        { id: "day", value: "Day" },
                        { id: "weekday", value: "Weekday" }
                     ]
                  },
                  {
                     view: "multiselect",
                     id: ids.repeatWeekly,
                     labelWidth: LABEL_WIDTH,
                     label: L(
                        "ab.process.task.trigger.timer.repeatWeekly",
                        "*Every week on:"
                     ),
                     batch: "weekly",
                     value: this.repeatWeekly || defaultValues.repeatWeekly,
                     options: [
                        {
                           id: "SUN",
                           value: L(
                              "ab.process.task.trigger.timer.week.sunday",
                              "*Sunday"
                           )
                        },
                        {
                           id: "MON",
                           value: L(
                              "ab.process.task.trigger.timer.week.monday",
                              "*Monday"
                           )
                        },
                        {
                           id: "TUE",
                           value: L(
                              "ab.process.task.trigger.timer.week.tuesday",
                              "*Tuesday"
                           )
                        },
                        {
                           id: "WED",
                           value: L(
                              "ab.process.task.trigger.timer.week.wednesday",
                              "*Wednesday"
                           )
                        },
                        {
                           id: "THU",
                           value: L(
                              "ab.process.task.trigger.timer.week.thursday",
                              "*Thursday"
                           )
                        },
                        {
                           id: "FRI",
                           value: L(
                              "ab.process.task.trigger.timer.week.friday",
                              "*Friday"
                           )
                        },
                        {
                           id: "SAT",
                           value: L(
                              "ab.process.task.trigger.timer.week.saturday",
                              "*Saturday"
                           )
                        }
                     ]
                  },
                  {
                     view: "layout",
                     batch: "monthly",
                     rows: [
                        {
                           id: ids.repeatMonthly,
                           view: "richselect",
                           labelWidth: LABEL_WIDTH,
                           label: L(
                              "ab.process.task.trigger.timer.month.repeatOn",
                              "*Monthly on day"
                           ),
                           options: dayOptions,
                           value:
                              this.repeatMonthly || defaultValues.repeatMonthly
                        }
                     ]
                  }
               ]
            },
            {
               cols: [
                  { width: LABEL_WIDTH },
                  {
                     id: ids.toggleButton,
                     view: "button",
                     label: "Loading ...",
                     disabled: true,
                     click: () => {
                        if (this.id == null) return;

                        $$(ids.toggleButton).disable();
                        OP.Comm.Service.put({
                           url: `/process/timer/${this.id}/${
                              this.isRunning ? "stop" : "start"
                           }`
                        })
                           .then((result) => {
                              if (result) {
                                 this.isRunning = !this.isRunning;
                              }
                              updateButtonLabel(this.isRunning);

                              $$(ids.toggleButton).enable();
                           })
                           .catch((err) => {
                              console.error(err);
                              $$(ids.toggleButton).enable();
                           });
                     }
                  }
               ]
            }
         ]
      };

      webix.ui(ui, $$(id));

      $$(id).show();
      $$(ids.repeatOnPanel).showBatch(
         this.repeatEvery || defaultValues.repeatEvery
      );

      // Load status of this timer job
      OP.Comm.Service.get({
         url: `/process/timer/${this.id}`
      }).then((result) => {
         this.isRunning = result.isRunning;

         updateButtonLabel(this.isRunning);
         $$(ids.toggleButton).enable();
      });
   }

   /**
    * @function propertiesStash()
    * pull our values from our property panel.
    * @param {string} id
    *        the webix $$(id) of the properties panel area.
    */
   propertiesStash(id) {
      let ids = this.propertyIDs(id);
      this.name = $$(ids.name).getValue();
      this.repeatEvery = $$(ids.repeatEvery).getValue();
      this.repeatTime = $$(ids.repeatTime).getValue();
      this.repeatDaily = $$(ids.repeatDaily).getValue();
      this.repeatWeekly = $$(ids.repeatWeekly).getValue();
      this.repeatMonthly = $$(ids.repeatMonthly).getValue();
      this.triggerKey = `timer.${this.id || OP.Util.uuid()}`;
   }
};
