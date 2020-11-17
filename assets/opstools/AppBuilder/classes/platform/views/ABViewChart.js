const ABViewChartCore = require("../../core/views/ABViewChartCore");

const ABViewChartPropertyComponentDefaults = ABViewChartCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewChart extends ABViewChartCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   /**
    * @method editorComponent
    * return the Editor for this UI component.
    * the editor should display either a "block" view or "preview" of
    * the current layout of the view.
    * @param {string} mode what mode are we in ['block', 'preview']
    * @return {Component}
    */
   editorComponent(App, mode) {
      var comp = super.editorComponent(App, mode);

      // Define height of cell
      comp.ui.rows[0].cellHeight = 400;

      return comp;
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
      _logic.enableMultipleSeries = (isEnable) => {
         var currView = _logic.currentEditObject();

         if (isEnable) {
            this.populateFieldOptions2(ids, currView);
         } else {
            $$(ids.columnValue2).define("options", []);
            $$(ids.columnValue2).refresh();
            $$(ids.columnValue2).disable();
         }
      };
      return commonUI.concat([
         {
            name: "multipleSeries",
            view: "checkbox",
            label: L("ab.component.chart.isMultipleSeries", "*Multiple Series"),
            labelWidth: App.config.labelWidthLarge,
            on: {
               onChange: _logic.enableMultipleSeries
            }
         },
         {
            name: "dataview",
            view: "richselect",
            label: L("ab.component.chart.dataSource", "*Chart Data"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "columnLabel",
            view: "richselect",
            label: L("ab.component.chart.columnLabel", "*Label Column"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "columnValue",
            view: "richselect",
            label: L("ab.component.chart.columnValue", "*Value Column"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "columnValue2",
            view: "richselect",
            label: L("ab.component.chart.columnValue2", "*Value Column 2"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "isPercentage",
            view: "checkbox",
            labelRight: L("ab.component.chart.isPercentage", "*Percentage"),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            name: "showLabel",
            view: "checkbox",
            label: L("ab.components.common.showlabel", "*Display Label"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "labelPosition",
            view: "richselect",
            label: L("ab.components.common.labelPosition", "*Label Position"),
            labelWidth: App.config.labelWidthLarge,
            options: [
               {
                  id: "left",
                  value: L("ab.components.common.left", "*Left")
               },
               {
                  id: "top",
                  value: L("ab.components.common.top", "*Top")
               }
            ]
         },
         {
            name: "labelWidth",
            view: "counter",
            label: L("ab.components.common.labelWidth", "*Label Width"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            view: "counter",
            name: "height",
            label: L("ab.component.common.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      this.populateDataview(ids, view);
      this.populateFieldOptions(ids, view);

      $$(ids.multipleSeries).setValue(
         view.settings.multipleSeries ||
            ABViewChartPropertyComponentDefaults.multipleSeries
      );
      $$(ids.dataview).setValue(
         view.settings.dataviewID ||
            ABViewChartPropertyComponentDefaults.dataviewID
      );
      $$(ids.columnValue).setValue(
         view.settings.columnValue ||
            ABViewChartPropertyComponentDefaults.columnValue
      );
      $$(ids.columnLabel).setValue(
         view.settings.columnLabel ||
            ABViewChartPropertyComponentDefaults.columnLabel
      );
      $$(ids.isPercentage).setValue(
         view.settings.isPercentage != null
            ? view.settings.isPercentage
            : ABViewChartPiePropertyComponentDefaults.isPercentage
      );

      $$(ids.showLabel).setValue(
         view.settings.showLabel ||
            ABViewChartPropertyComponentDefaults.showLabel
      );
      $$(ids.labelPosition).setValue(
         view.settings.labelPosition ||
            ABViewChartPropertyComponentDefaults.labelPosition
      );
      $$(ids.labelWidth).setValue(
         view.settings.labelWidth ||
            ABViewChartPropertyComponentDefaults.labelWidth
      );
      $$(ids.height).setValue(
         view.settings.height || ABViewChartPropertyComponentDefaults.height
      );

      if (view.settings.multipleSeries) {
         this.populateFieldOptions2(ids, view);
         $$(ids.columnValue2).setValue(
            view.settings.columnValue2 ||
               ABViewChartPropertyComponentDefaults.columnValue2
         );
      }
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.multipleSeries = $$(ids.multipleSeries).getValue();
      view.settings.dataviewID = $$(ids.dataview).getValue();
      view.settings.columnValue = $$(ids.columnValue).getValue();
      view.settings.columnLabel = $$(ids.columnLabel).getValue();
      view.settings.isPercentage = $$(ids.isPercentage).getValue();

      view.settings.showLabel = $$(ids.showLabel).getValue();
      view.settings.labelPosition = $$(ids.labelPosition).getValue();
      view.settings.labelWidth = $$(ids.labelWidth).getValue();
      view.settings.height = $$(ids.height).getValue();

      this.populateFieldOptions(ids, view);

      if (view.settings.multipleSeries) {
         view.settings.columnValue2 = $$(ids.columnValue2).getValue();
         this.populateFieldOptions2(ids, view);
      }

      // UPDATE charts when parent properties are changed
      view.views().forEach((v) => {
         v.parent.refreshData();
      });
   }

   static populateDataview(ids, view) {
      // Set the objects you can choose from in the list
      var objectOptions = view.application.datacollections().map((dc) => {
         return {
            id: dc.id,
            value: dc.label
         };
      });

      // Add a default option
      var defaultOption = {
         id: "",
         value: L("ab.component.label.selectObject", "*Select an object")
      };
      objectOptions.unshift(defaultOption);

      $$(ids.dataview).define("options", objectOptions);
      $$(ids.dataview).refresh();
   }

   static populateFieldOptions(ids, view) {
      // clear options
      $$(ids.columnLabel).define("options", []);
      $$(ids.columnLabel).refresh();

      $$(ids.columnValue).define("options", []);
      $$(ids.columnValue).refresh();

      var dc = view.datacollection;
      if (dc == null) return;

      var obj = dc.datasource;
      if (obj == null) return;

      var allFields = obj.fields();
      var numFields = obj.fields(
         (f) => f.key == "number" || f.key == "formula" || f.key == "calculate"
      );

      var convertOption = (opt) => {
         return {
            id: opt.id,
            value: opt.columnName,
            key: opt.key
         };
      };

      var columnLabelOptions = allFields.map(convertOption);
      var columnValueOptions = numFields.map(convertOption);

      var defaultOption = {
         id: "",
         value: L("ab.component.label.selectColumn", "*Select a column"),
         key: ""
      };
      columnLabelOptions.unshift(defaultOption);
      columnValueOptions.unshift(defaultOption);

      $$(ids.columnLabel).define("options", columnLabelOptions);
      $$(ids.columnLabel).refresh();
      $$(ids.columnLabel).enable();

      $$(ids.columnValue).define("options", columnValueOptions);
      $$(ids.columnValue).refresh();
      $$(ids.columnValue).enable();
   }

   static populateFieldOptions2(ids, view) {
      // clear options

      $$(ids.columnValue2).define("options", []);
      $$(ids.columnValue2).refresh();
      $$(ids.columnValue2).enable();

      var dc = view.datacollection;
      if (dc == null) return;

      var obj = dc.datasource;
      if (obj == null) return;

      var numFields = obj.fields((f) => f.key == "number");

      var convertOption = (opt) => {
         return {
            id: opt.id,
            value: opt.columnName,
            key: opt.key
         };
      };

      var columnValueOptions = numFields.map(convertOption);

      var defaultOption = {
         id: "",
         value: L("ab.component.label.selectColumn", "*Select a column"),
         key: ""
      };
      columnValueOptions.unshift(defaultOption);

      $$(ids.columnValue2).define("options", columnValueOptions);
      $$(ids.columnValue2).refresh();
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var idBase = "ABViewChart_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      // get webix.dashboard
      var container = super.component(App);

      var _ui = {
         type: "form",
         borderless: true,
         // height: this.settings.height || ABViewChartPropertyComponentDefaults.height,
         rows: [
            {
               // view: "scrollview",
               body: container.ui
            }
         ]
      };

      // make sure each of our child views get .init() called
      var _init = (options, accessLevel) => {
         container.init(options, accessLevel);

         var currentComponent = $$(ids.component);
         if (currentComponent) {
            webix.extend(currentComponent, webix.ProgressBar);
         }

         let dc = this.datacollection;
         if (dc) {
            if (dc.datacollectionLink) {
               this.eventAdd({
                  emitter: dc.datacollectionLink,
                  eventName: "changeCursor",
                  listener: () => this.refreshData()
               });
            }

            this.eventAdd({
               emitter: dc,
               eventName: "changeCursor",
               listener: () => this.refreshData()
            });

            this.eventAdd({
               emitter: dc,
               eventName: "create",
               listener: () => this.refreshData()
            });

            this.eventAdd({
               emitter: dc,
               eventName: "update",
               listener: () => this.refreshData()
            });

            this.eventAdd({
               emitter: dc,
               eventName: "delete",
               listener: () => this.refreshData()
            });

            this.eventAdd({
               emitter: dc,
               eventName: "initializedData",
               listener: () => this.refreshData()
            });
         }
      };

      var _logic = {};

      return {
         ui: _ui,
         init: _init,
         logic: _logic,

         onShow: container.onShow
      };
   }

   getReportData() {
      if (!this.dcChart) {
         this.dcChart = new webix.DataCollection();
      }

      return this.dcChart;
   }

   refreshData() {
      var dc = this.datacollection;
      if (dc == null) return this.dcChart;

      var labelCol = this.labelField();
      var valueCol = this.valueField();
      var valueCol2 = this.valueField2();

      if (!labelCol || !valueCol) return this.dcChart;

      // var labelColName = labelCol.columnName;
      var numberColName = valueCol.columnName;

      var numberColName2 = "";
      if (this.settings.multipleSeries && valueCol2) {
         numberColName2 = valueCol2.columnName;
      }

      var colorList = [
         "#ee4339",
         "#ee9336",
         "#eed236",
         "#d3ee36",
         "#a7ee70",
         "#58dccd",
         "#36abee",
         "#476cee",
         "#a244ea",
         "#e33fc7"
      ];

      var dInfo = dc.getData();

      var result = [];
      var sumData = {};
      var sumNumber = 0;
      var sumNumber2 = 0;
      var countNumber = dInfo.length;

      switch (valueCol.key) {
         case "formula":
            {
               var obj = valueCol.object;
               var objLink = this.application.objects(
                  (obj) => obj.id == valueCol.settings.object
               )[0];
               var fieldBase = obj.fields(
                  (f) => f.id == valueCol.settings.field
               )[0];
               var fieldLink = objLink.fields(
                  (f) => f.id == valueCol.settings.fieldLink
               )[0];
            }
            break;

         case "calculate":
            {
               var obj = valueCol.object;
               var place = valueCol.settings.decimalPlaces;
            }
            break;

         default:
            break;
      }

      dInfo.forEach((item) => {
         var labelKey = labelCol.format(item) || item.id;
         var numberVal = parseFloat(item[numberColName] || 0);
         if (this.settings.multipleSeries) {
            var numberVal2 = parseFloat(item[numberColName2]) || 0;
         }

         switch (valueCol.key) {
            //Formula Datatype
            case "formula":
               {
                  var data = item[fieldBase.relationName()];
                  if (!Array.isArray(data)) {
                     data = [data];
                  }
                  var numberList = [];

                  // pull number from data
                  switch (fieldLink.key) {
                     case "calculate":
                        data.forEach((d) => {
                           numberList.push(
                              parseFloat(fieldLink.format(d) || 0)
                           );
                        });
                        break;
                     case "number":
                        numberList = data.map(
                           (d) => d[fieldLink.columnName] || 0
                        );
                        break;
                  }

                  var result = 0;

                  // calculate
                  switch (valueCol.settings.type) {
                     case "sum":
                        numberList.forEach((num) => (result += num));
                        break;
                     case "average":
                        if (numberList.length > 0) {
                           numberList.forEach((num) => (result += num)); // sum
                           result = result / numberList.length;
                        }
                        break;
                     case "max":
                        numberList.forEach((num) => {
                           if (result < num) result = num;
                        });
                        break;
                     case "min":
                        numberList.forEach((num) => {
                           if (result > num) result = num;
                        });
                        break;
                     case "count":
                        result = numberList.length;
                        break;
                  }
                  numberVal = result;
               }
               break;

            //Calcualte Datatype
            case "calculate":
               {
                  var formula = valueCol.settings.formula;
                  // replace with current date
                  formula = formula.replace(/\(CURRENT\)/g, "(new Date())");

                  obj.fields().forEach((f) => {
                     var colName = f.columnName;
                     if (colName.indexOf(".") > -1)
                        // QUERY: get only column name
                        colName = colName.split(".")[1];

                     // if template does not contain, then should skip
                     if (formula.indexOf("{" + colName + "}") < 0) return;

                     // number fields
                     if (f.key == "number") {
                        let numberVal = "(#numberVal#)".replace(
                           "#numberVal#",
                           item[f.columnName] || 0
                        ); // (number) - NOTE : (-5) to support negative number
                        formula = formula.replace(
                           new RegExp("{" + colName + "}", "g"),
                           numberVal
                        );
                     }
                     // calculate and formula fields
                     else if (f.key == "calculate" || f.key == "formula") {
                        let calVal = "(#calVal#)".replace(
                           "#calVal#",
                           f.format(item) || 0
                        );
                        formula = formula.replace(
                           new RegExp("{" + colName + "}", "g"),
                           calVal
                        );
                     }
                     // date fields
                     else if (f.key == "date") {
                        let dateVal = '"#dataVal#"'.replace(
                           "#dataVal#",
                           item[f.columnName] ? item[f.columnName] : ""
                        ); // "date"
                        formula = formula.replace(
                           new RegExp("{" + colName + "}", "g"),
                           dateVal
                        );
                     }
                     // boolean fields
                     else if (f.key == "boolean") {
                        let booleanVal = "(#booleanVal#)".replace(
                           "#booleanVal#",
                           item[f.columnName] || 0
                        ); // show 1 or 0 for boolean
                        formula = formula.replace(
                           new RegExp("{" + colName + "}", "g"),
                           booleanVal
                        );
                     }
                  });

                  // decimal places - toFixed()
                  // FIX: floating number calculation
                  // https://randomascii.wordpress.com/2012/02/25/comparing-floating-point-numbers-2012-edition/
                  numberVal = parseFloat(eval(formula).toFixed(place || 0));
               }
               break;

            default:
               break;
         }
         if (sumData[labelKey] == null) {
            var label = labelKey;

            // Get label of the connect field
            if (labelCol.key == "connectObject") {
               var relateValues = labelCol.pullRelationValues(item);
               if (relateValues != null) label = relateValues.text;
            }

            if (this.settings.multipleSeries) {
               sumData[labelKey] = {
                  label: label || item.id,
                  value: 0,
                  value2: 0
               };
            } else {
               sumData[labelKey] = {
                  label: label || item.id,
                  value: 0
               };
            }
         }

         sumData[labelKey].value += numberVal;
         sumNumber += numberVal;

         if (this.settings.multipleSeries) {
            sumData[labelKey].value2 += numberVal2;
            sumNumber2 += numberVal2;
         }
      });

      var index = 0;

      for (var key in sumData) {
         var val = sumData[key].value;
         if (val <= 0) continue;

         // Display to percent values
         if (this.settings.isPercentage) {
            val = (val / sumNumber) * 100;
            val = Math.round(val * 100) / 100; // round decimal 2 digits
            val = val + " %";
         }

         if (this.settings.multipleSeries) {
            var val2 = sumData[key].value2;
            if (val2 <= 0) continue;

            // Display to percent values
            if (this.settings.isPercentage) {
               val2 = (val2 / sumNumber2) * 100;
               val2 = Math.round(val2 * 100) / 100; // round decimal 2 digits
               val2 = val2 + " %";
            }

            result.push({
               label: sumData[key].label,
               value: val,
               value2: val2,
               color: colorList[index % colorList.length],
               count: countNumber
            });
         } else {
            result.push({
               label: sumData[key].label,
               value: val,
               color: colorList[index % colorList.length],
               count: countNumber
            });
         }

         index += 1;
      }

      let dcChart = this.getReportData();
      dcChart.clearAll();
      dcChart.parse(result);

      this.emit("refreshData", this.dcChart);
   }
};
