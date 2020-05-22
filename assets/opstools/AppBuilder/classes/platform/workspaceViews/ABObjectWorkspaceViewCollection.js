// ABObjectWorkspaceViewCollection.js
//
// Manages the settings for a collection of views in the AppBuilder Object Workspace

const ABObjectWorkspaceViewGrid = require("./ABObjectWorkspaceViewGrid");
const ABObjectWorkspaceViewKanban = require("./ABObjectWorkspaceViewKanban");
const ABObjectWorkspaceViewGantt = require("./ABObjectWorkspaceViewGantt");

var hashViews = {};
hashViews[ABObjectWorkspaceViewGrid.type()] = ABObjectWorkspaceViewGrid;
hashViews[ABObjectWorkspaceViewKanban.type()] = ABObjectWorkspaceViewKanban;
hashViews[ABObjectWorkspaceViewGantt.type()] = ABObjectWorkspaceViewGantt;

const defaultAttributes = {
   currentViewID: undefined,
   list: []
};

module.exports = class ABObjectWorkspaceViewCollection {
   constructor(attributes, object, application) {
      // link me to my parent ABObject and ABApplication
      this.object = object;
      this.application = application;

      this.fromObj(attributes);
   }

   /**
    * @method fromObj
    * take our persisted data, and properly load it
    * into this object instance.
    * @param {json} data  the persisted data
    */
   fromObj(data) {
      // import our Workspace View Objects
      data.objectWorkspaceViews =
         data.objectWorkspaceViews && data.objectWorkspaceViews.list
            ? data.objectWorkspaceViews
            : defaultAttributes;

      // Temp
      // data.objectWorkspaceViews = defaultAttributes;

      if (
         data.objectWorkspaceViews.list.filter((v) => v.isDefaultView)
            .length === 0
      ) {
         // We should always have at least one default grid view. So if this list
         // is empty we can assume we're 'upgrading' from the old single-view workspace...

         /// So we import the 'old' format workspace settings
         if (typeof data.objectWorkspace != "undefined") {
            if (typeof data.objectWorkspace.sortFields == "undefined")
               data.objectWorkspace.sortFields = [];
            if (typeof data.objectWorkspace.filterConditions == "undefined")
               data.objectWorkspace.filterConditions = [];
            if (typeof data.objectWorkspace.frozenColumnID == "undefined")
               data.objectWorkspace.frozenColumnID = "";
            if (typeof data.objectWorkspace.hiddenFields == "undefined")
               data.objectWorkspace.hiddenFields = [];
         }

         // ...and initialize our grid view attributes
         var gridAttributes = data.objectWorkspace || {
            sortFields: [], // array of columns with their sort configurations
            filterConditions: [], // array of filters to apply to the data table
            frozenColumnID: "", // id of column you want to stop freezing
            hiddenFields: [] // array of [ids] to add hidden:true to
         };
         gridAttributes.isDefaultView = true;

         var defaultGrid = new ABObjectWorkspaceViewGrid(
            gridAttributes,
            this.object
         );
         data.objectWorkspaceViews.list.unshift(defaultGrid);
      }

      this.importViews(data.objectWorkspaceViews);

      this.currentViewID = data.objectWorkspaceViews.currentViewID;
      if (!this.currentViewID) {
         this.currentViewID = this.list()[0].id;
      }
   }

   /**
    * @method toObj()
    *
    * properly compile the current state of this ABApplication instance
    * into the values needed for saving to the DB.
    *
    * Most of the instance data is stored in .json field, so be sure to
    * update that from all the current values of our child fields.
    *
    * @return {json}
    */
   toObj() {
      return {
         currentViewID: this.currentViewID,
         list: this.exportViews()
      };
   }

   list(fn) {
      fn =
         fn ||
         function() {
            return true;
         };
      return this._views.filter(fn);
   }

   importViews(viewSettings) {
      this._views = [];
      viewSettings.list.forEach((view) => {
         this.addView(view, false);
      });
   }

   exportViews() {
      var views = [];
      this._views.forEach((view) => {
         views.push(view.toObj());
      });

      return views;
   }

   setCurrentView(viewID) {
      this.currentViewID = viewID;
   }

   getCurrentView() {
      return this.list((v) => {
         return v.id == this.currentViewID;
      })[0];
   }

   addView(view, save = true) {
      var newView = new hashViews[view.type](view, this);
      this._views.push(newView);
      if (save) {
         this.object.save();
      }
      return newView;
   }

   removeView(view) {
      var indexToRemove = this._views.indexOf(view);
      this._views.splice(indexToRemove, 1);
      if (view.id === this.currentViewID) {
         this.currentViewID = this._views[0].id;
      }
      this.object.save();
   }

   updateView(viewToUpdate, view) {
      var newView;
      if (view.type === viewToUpdate.type) {
         viewToUpdate.update(view);
         newView = viewToUpdate;
      } else {
         newView = new hashViews[view.type](view, this);
         var indexToRemove = this._views.indexOf(viewToUpdate);
         this._views.splice(indexToRemove, 1, newView);
         if (this.currentViewID === viewToUpdate.id) {
            this.currentViewID = newView.id;
         }
      }
      this.object.save();
      return newView;
   }
};
