const ABViewWidget = require("./ABViewWidget");

module.exports = class ABViewChartComponent extends ABViewWidget {
   editorComponent(App, mode, options) {
      let component = this.component(App);
      let _ui = component.ui;
      _ui.id = options.componentId;

      let _init = () => {
         component.init({
            componentId: _ui.id
         });
      };
      let _logic = component.logic;
      let _onShow = component.onShow;

      return {
         ui: _ui,
         init: _init,
         logic: _logic,
         onShow: _onShow
      };
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      // make sure each of our child views get .init() called
      var _init = (options) => {
         this._componentId = options.componentId;

         this.eventAdd({
            emitter: this.parent,
            eventName: "refreshData",
            listener: (reportData) => {
               // If this widget does not show, then will not refresh data
               if (this._isShow) _logic.refreshData(reportData);
            }
         });
      };

      var _logic = {
         setValue: (componentId, val) => {
            if ($$(componentId)) $$(componentId).setValues({ display: val });
         },

         onShow: () => {
            // if (!this._isShow) {

            // Mark this widget is showing
            this._isShow = true;

            let reportData = this.parent.getReportData();
            _logic.refreshData(reportData);
            // }
         },

         refreshData: (reportData) => {
            let comp = $$(this._componentId);
            if (comp && comp.data) comp.data.sync(reportData);
         }
      };

      return {
         // ui: _ui,
         init: _init,
         logic: _logic,

         onShow: _logic.onShow
      };
   }
};
