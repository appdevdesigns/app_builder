/*
 * ab_work_object_workspace_track
 *
 * Manage the Object Workspace track area.
 *
 */
const ABComponent = require("../classes/platform/ABComponent");

module.exports = class ABWorkObjectWorkspaceTrack extends ABComponent {
   /**
    * @param {object} App
    * @param {string} idBase
    */
   constructor(App, idBase) {
      idBase = idBase || "ab_work_object_workspace";
      idBase += "_track";

      super(App, idBase);
      let L = this.Label;

      this.labels = {
         common: App.labels,
         component: {
            title: L("ab.object.track.title", "*Record History"),
            insert: L("ab.object.track.insert", "*Add"),
            update: L("ab.object.track.update", "*Edit"),
            delete: L("ab.object.track.delete", "*Delete"),
            unknown: L("ab.object.track.unknown", "*Unknown")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      this.ids = {
         popup: this.unique(idBase + "_popup"),
         timeline: this.unique(idBase + "_timeline")
      };

      this._logic = {};

      // Expose any globally accessible Actions:
      this.actions({});
   }

   // Our webix UI definition:
   get ui() {
      let ids = this.ids;
      let labels = this.labels;

      return {
         view: "window",
         id: ids.popup,
         head: {
            view: "toolbar",
            cols: [
               { view: "label", label: labels.component.title },
               {
                  view: "button",
                  label: "X",
                  width: 50,
                  align: "right",
                  click: () => {
                     this.close();
                  }
               }
            ]
         },
         position: "center",
         resize: true,
         modal: true,
         editable: false,
         width: 500,
         height: 500,
         body: {
            view: "timeline",
            id: ids.timeline,
            type: {
               height: 140,
               templateDate: (obj) => {
                  return moment(obj.timestamp)
                     .locale("en")
                     .format("DD MMM, YYYY hh:mma");
               },
               lineColor: (obj) => {
                  switch (obj.level) {
                     case "insert":
                        return "#FF5C4C";
                     case "update":
                        return "#1CA1C1";
                     case "delete":
                        return "#94A1B3";
                  }
               }
            },
            scheme: {
               $init: (obj) => {
                  // Action
                  switch (obj.level) {
                     case "insert":
                        obj.value = labels.component.insert;
                        break;
                     case "update":
                        obj.value = labels.component.update;
                        break;
                     case "delete":
                        obj.value = labels.component.delete;
                        break;
                  }

                  // By
                  obj.details = `by <b>${obj.username ||
                     labels.component.unknown}</b>`;

                  // Detail of record
                  if (obj.record) {
                     let recDetail = "";
                     Object.keys(obj.record).forEach((prop) => {
                        recDetail = recDetail.concat(
                           `${prop}: <b>${
                              obj.record[prop] != null ? obj.record[prop] : ""
                           }</b> <br />`
                        );
                     });

                     obj.details = obj.details.concat("<br />");
                     obj.details = obj.details.concat(
                        `<div>${recDetail}</div>`
                     );
                  }
               }
            }
         }
      };
   }

   init() {
      webix.ui(this.ui);

      let $timeline = $$(this.ids.timeline);
      if ($timeline) {
         webix.extend($timeline, webix.ProgressBar);
      }
   }

   open(object, rowId) {
      this.CurrentObject = object;

      let ids = this.ids;
      let $popup = $$(ids.popup);
      if (!$popup) return;

      $popup.show();

      this.loadData(rowId);
   }

   loadData(rowId) {
      if (!this.CurrentObject) return;

      let $timeline = $$(this.ids.timeline);

      // pull tracking data
      $timeline.showProgress({ type: "icon" });
      let application = this.CurrentObject.application;
      application
         .objectTrack(this.CurrentObject.id, rowId)
         .then((data) => {
            $timeline.clearAll(true);
            $timeline.parse(data);
            $timeline.hideProgress();
         })
         .catch((err) => {
            console.error(err);
            $timeline.hideProgress();
         });
   }

   close() {
      let ids = this.ids;
      let $popup = $$(ids.popup);
      if (!$popup) return;

      $popup.hide();
   }
};
