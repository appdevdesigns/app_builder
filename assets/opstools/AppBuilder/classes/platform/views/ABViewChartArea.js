const ABViewChartAreaCore = require("../../core/views/ABViewChartAreaCore");

const ABViewChartAreaPropertyComponentDefaults = ABViewChartAreaCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewChartArea extends ABViewChartAreaCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   //
   //	Editor Related
   //

   /**
    * @method editorComponent
    * return the Editor for this UI component.
    * the editor should display either a "block" view or "preview" of
    * the current layout of the view.
    * @param {string} mode what mode are we in ['block', 'preview']
    * @return {Component}
    */
   editorComponent(App, mode) {
      let idBase = "ABViewChartAreaEditorComponent";
      let ids = {
         component: App.unique(idBase + "_component")
      };
      let baseEditor = super.editorComponent(App, mode, {
         componentId: ids.component
      });

      return baseEditor;
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            name: "areaType",
            view: "richselect",
            label: L("ab.component.chart.area.areaType", "*Chart Type"),
            labelWidth: App.config.labelWidthLarge,
            options: [
               {
                  id: "area",
                  value: L("ab.component.chart.area.area", "*Area")
               },
               {
                  id: "stackedArea",
                  value: L(
                     "ab.component.chart.area.stackedArea",
                     "*Stacked Area"
                  )
               }
            ]
         },
         // {
         // 	name: 'chartWidth',
         // 	view: 'counter',
         // 	min: 1,
         // 	label: L('ab.component.chart.area.chartWidth', '*Width')
         // },
         {
            name: "chartHeight",
            view: "counter",
            min: 1,
            label: L("ab.component.chart.area.chartHeight", "*Height")
         },
         {
            name: "stepValue",
            view: "counter",
            min: 1,
            label: L("ab.component.chart.area.stepValue", "*Step")
         },
         {
            name: "maxValue",
            view: "counter",
            min: 1,
            label: L("ab.component.chart.area.maxValue", "*Max Value")
         },
         {
            name: "labelFontSize",
            view: "counter",
            min: 1,
            label: L(
               "ab.component.chart.area.labelFontSize",
               "*Label Font Size"
            ),
            labelWidth: App.config.labelWidthXLarge
         },
         {
            name: "isLegend",
            view: "checkbox",
            labelRight: L("ab.component.chart.isLegend", "*Show Legend"),
            labelWidth: App.config.labelWidthCheckbox
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      // Make sure you set the values for this property editor in Webix
      // $$(ids.chartWidth).setValue(view.settings.chartWidth != null ? view.settings.chartWidth : ABViewChartAreaPropertyComponentDefaults.chartWidth);
      $$(ids.chartHeight).setValue(
         view.settings.chartHeight != null
            ? view.settings.chartHeight
            : ABViewChartAreaPropertyComponentDefaults.chartHeight
      );
      $$(ids.labelFontSize).setValue(
         view.settings.labelFontSize != null
            ? view.settings.labelFontSize
            : ABViewChartAreaPropertyComponentDefaults.labelFontSize
      );
      $$(ids.stepValue).setValue(
         view.settings.stepValue != null
            ? view.settings.stepValue
            : ABViewChartAreaPropertyComponentDefaults.stepValue
      );
      $$(ids.maxValue).setValue(
         view.settings.maxValue != null
            ? view.settings.maxValue
            : ABViewChartAreaPropertyComponentDefaults.maxValue
      );
      $$(ids.areaType).setValue(
         view.settings.areaType != null
            ? view.settings.areaType
            : ABViewChartAreaPropertyComponentDefaults.areaType
      );
      $$(ids.isLegend).setValue(
         view.settings.isLegend != null
            ? view.settings.isLegend
            : ABViewChartAreaPropertyComponentDefaults.isLegend
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      // Retrive the values of your properties from Webix and store them in the view
      view.settings.areaType = $$(ids.areaType).getValue();
      view.settings.isLegend = $$(ids.isLegend).getValue();
      // view.settings.chartWidth = $$(ids.chartWidth).getValue();
      view.settings.chartHeight = $$(ids.chartHeight).getValue();
      view.settings.labelFontSize = $$(ids.labelFontSize).getValue();
      view.settings.stepValue = $$(ids.stepValue).getValue();
      view.settings.maxValue = $$(ids.maxValue).getValue();
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      let baseComp = super.component(App);

      // get a UI component for each of our child views
      var viewComponents = [];
      this.views().forEach((v) => {
         viewComponents.push(v.component(App));
      });

      var idBase = "ABViewChartArea_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var _ui = {
         id: ids.component,
         view: "chart",
         type:
            this.settings.areaType != null
               ? this.settings.areaType
               : ABViewChartAreaPropertyComponentDefaults.areaType,
         yAxis: {
            start: 0,
            step:
               this.settings.stepValue != null
                  ? this.settings.stepValue
                  : ABViewChartAreaPropertyComponentDefaults.stepValue, //"#stepValue#",
            end:
               this.settings.maxValue != null
                  ? this.settings.maxValue
                  : ABViewChartAreaPropertyComponentDefaults.maxValue //"#maxValue#"
         },
         xAxis: {
            template:
               this.settings.isLegend == true
                  ? "<div style='font-size:" +
                    this.settings.labelFontSize +
                    "px;'>#label#</div>"
                  : ""
         },
         // legend: this.settings.isLegend == true ? "<div style='font-size:" + this.settings.labelFontSize + "px;'>#label#</div>" : "",
         series: [
            {
               alpha: 0.7,
               value: "#value#",
               color: "#ee4339"
            },
            {
               alpha: 0.4,
               value: "#value2#",
               color: "#a7ee70"
            }
         ]
         // height: this.settings.chartHeight != null ? this.settings.chartHeight : ABViewChartAreaPropertyComponentDefaults.chartHeight,
         // width: this.settings.chartWidth != null ? this.settings.chartWidth : ABViewChartAreaPropertyComponentDefaults.chartWidth,
         // data: reportData
      };

      if (this.settings.chartHeight) _ui.height = this.settings.chartHeight;

      // make sure each of our child views get .init() called
      let _init = (options) => {
         baseComp.init({
            componentId: ids.component
         });
      };
      let _logic = baseComp.logic;
      let _onShow = baseComp.onShow;

      return {
         ui: _ui,
         init: _init,
         logic: _logic,

         onShow: _onShow
      };
   }
};
