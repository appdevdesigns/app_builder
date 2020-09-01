const ABViewProperty = require("./ABViewProperty");
const ABViewGridFilterRule = require("../../../rules/ABViewGridFilterRule");

const RowFilter = require("../../RowFilter");

var L = (key, altText) => {
   return AD.lang.label.getLabel(key) || altText;
};

var getRule = (object, App, idBase) => {
   var FilterRule = new ABViewGridFilterRule();
   FilterRule.objectLoad(object);

   // run .component because it need to have .getValue and .setValue functions to Rule
   // NOTE: ABViewQueryBuilderObjectFieldCondition - why does not return new object from .compnent ?
   if ((App, idBase)) FilterRule.component(App, idBase);

   return FilterRule;
};

// var rowFilter = null;
// var rowFilterForm = null;

module.exports = class ABViewPropertyFilterData extends ABViewProperty {
   constructor(App, idBase) {
      super();

      this.object = null;
      // this.queryRules = [];

      this.App = App;
      this.idBase = idBase;
      this.rowFilter = null;
      this.rowFilterForm = null;
   }

   /**
    * @property default
    * return default settings
    *
    * @return {Object}
    */
   static get default() {
      return {
         filterOption: 1, // 0 - Not allow, 1 - Enable user filter, 2 - Predefined filter menu, 3 - Global filter input

         // 1- Enable user filter options
         userFilterPosition: "toolbar", // "toolbar" || "form"

         // 2 - Predefined filter menu options
         // queryRules: [], // An array of ABViewGridFilterRule object

         // 3 - Global filter input options
         // globalFilterPosition: "default", // "default" || "single"

         isGlobalToolbar: 1 // "boolean"
      };
   }

   static propertyComponent(App, idBase) {
      let base = super.propertyComponent();

      let ids = {
         /** Property */
         filterRules: idBase + "_rules",
         filterRulesScrollview: idBase + "_filterRulesScrollview",

         filterOptionRadio: idBase + "_filterOptionRadio",
         filterUserLayout: idBase + "_filterUserLayout",
         filterUser: idBase + "_filterUser",
         filterGlobal: idBase + "_filterGlobal",
         filterMenuLayout: idBase + "_filterMenuLayout",

         needLoadAllLabel: idBase + "_needLoadAll",
         globalToolbar: idBase + "_globalToolbar"
      };

      let labels = {
         common: App.labels,
         component: {
            header: L("ab.component.grid.filterMenu", "*Filter Menu"),
            addNewFilter: L(
               "ab.components.grid.addNewFilter",
               "*Add new filter"
            )
         }
      };

      let ui = {
         type: "form",
         rows: [
            {
               view: "radio",
               id: ids.filterOptionRadio,
               value: 0,
               options: [
                  { id: 0, value: "Do not Allow User filters" },
                  { id: 1, value: "Enable User filters" },
                  { id: 2, value: "Use a filter menu" },
                  { id: 3, value: "Use a global filter input" }
               ],
               vertical: true,
               label: "Filter Option",
               labelWidth: App.config.labelWidthLarge,
               on: {
                  onChange: (newValue, oldValue) => {
                     logic.setFilterOption(newValue);
                  }
               }
            },

            {
               view: "radio",
               id: ids.filterGlobal,
               hidden: true,
               vertical: true,
               label: "Show",
               labelWidth: App.config.labelWidthLarge,
               options: [
                  { id: "default", value: "All matching records" },
                  { id: "single", value: "Single records only" }
               ]
            },

            {
               view: "layout",
               id: ids.filterUserLayout,
               hidden: true,
               cols: [
                  {
                     view: "radio",
                     vertical: true,
                     id: ids.filterUser,
                     value: "toolbar",
                     label: "Display",
                     labelWidth: App.config.labelWidthLarge,
                     width: 200,
                     options: [
                        { id: "toolbar", value: "Toolbar" },
                        { id: "form", value: "Form" }
                     ],
                     on: {
                        onChange: (newValue) => {
                           logic.setFilterUser(newValue);
                        }
                     }
                  },
                  {
                     view: "checkbox",
                     id: ids.globalToolbar,
                     width: 350,
                     labelRight: "Include a global filter input"
                  },
                  {}
               ]
            },

            {
               view: "layout",
               id: ids.filterMenuLayout,
               hidden: true,
               rows: [
                  {
                     css: { "padding-bottom": 10 },
                     cols: [
                        {
                           view: "button",
                           css: "webix_primary",
                           icon: "fa fa-plus",
                           type: "iconButton",
                           label: labels.component.addNewFilter,
                           width: 150,
                           click: () => {
                              logic.addFilterRule();
                           }
                        },
                        {
                           view: "label",
                           label: '*need "LoadAll" from datasource',
                           css: { color: "red" },
                           id: ids.needLoadAllLabel,
                           hidden: true
                        },
                        { fillspace: true }
                     ]
                  },
                  {
                     view: "scrollview",
                     id: ids.filterRulesScrollview,
                     scroll: "xy",
                     body: {
                        view: "layout",
                        id: ids.filterRules,
                        margin: 20,
                        padding: 10,
                        rows: []
                     }
                  }
               ]
            },
            {
               css: { "background-color": "#fff" },
               cols: [
                  { fillspace: true },
                  {
                     view: "button",
                     name: "cancel",
                     value: labels.common.cancel,
                     css: "ab-cancel-button",
                     autowidth: true,
                     click: function() {
                        logic.buttonCancel();
                     }
                  },
                  {
                     view: "button",
                     css: "webix_primary",
                     name: "save",
                     label: labels.common.save,
                     type: "form",
                     autowidth: true,
                     click: function() {
                        logic.buttonSave();
                     }
                  },
                  { fillspace: true }
               ]
            }
         ]
      };

      let init = (options) => {
         // register callbacks:
         for (var c in logic.callbacks) {
            logic.callbacks[c] = options[c] || logic.callbacks[c];
         }
      };

      let instance = this;
      instance.queryRules = [];

      let logic = {
         callbacks: {
            onCancel: function() {
               console.warn("NO onCancel()!");
            },
            onSave: function() {
               console.warn("NO onSave()!");
            }
         },

         buttonCancel: function() {
            logic.callbacks.onCancel();
         },

         buttonSave: () => {
            logic.callbacks.onSave();
         },

         objectLoad(object, isLoadAll = false) {
            instance.object = object;
            instance.isLoadAll = isLoadAll;

            //tell each of our rules about our object
            if (instance.queryRules && instance.queryRules.length) {
               instance.queryRules.forEach((r) => {
                  r.objectLoad(object);
               });
            }
         },

         setSettings(settings = {}) {
            //Convert some condition from string to integer
            (settings.queryRules || []).forEach((qr) => {
               if (
                  qr &&
                  qr.queryRules &&
                  qr.queryRules[0] &&
                  qr.queryRules[0].rules
               ) {
                  qr.queryRules[0].rules.forEach((rule) => {
                     if (/^[+-]?\d+(\.\d+)?$/.exec(rule.value)) {
                        rule.value = JSON.parse(rule.value);
                     }
                  });
               }
            });

            $$(ids.filterOptionRadio).setValue(settings.filterOption);
            $$(ids.filterUser).setValue(
               settings.userFilterPosition ||
                  ABViewPropertyFilterData.default.userFilterPosition
            );
            $$(ids.globalToolbar).setValue(
               typeof settings.isGlobalToolbar != "undefined"
                  ? settings.isGlobalToolbar
                  : ABViewPropertyFilterData.default.isGlobalToolbar
            );

            $$(ids.filterGlobal).setValue(
               settings.globalFilterPosition ||
                  ABViewPropertyFilterData.default.globalFilterPosition
            );

            // clear any existing Rules:
            if (instance.queryRules && instance.queryRules.length > 0) {
               instance.queryRules.forEach((rule) => {
                  if ($$(ids.filterRules))
                     $$(ids.filterRules).removeView(rule.ids.component);
               });
            }
            instance.queryRules = [];

            (settings.queryRules || []).forEach((ruleSettings) => {
               logic.addFilterRule(ruleSettings);
            });
         },

         getSettings() {
            var settings = this.settings || {};
            settings.filterOption = parseInt(
               $$(ids.filterOptionRadio).getValue()
            );
            settings.queryRules = [];

            switch (settings.filterOption) {
               case 0: // Disable User filters
                  settings.isGlobalToolbar = 0;
                  break;
               case 1: // Enable User filters
                  settings.userFilterPosition = $$(ids.filterUser).getValue();

                  settings.isGlobalToolbar = $$(ids.globalToolbar).getValue();
                  break;
               case 2: // Use a filter menu
                  instance.queryRules.forEach((r) => {
                     settings.queryRules.push(r.toSettings());
                  });
                  break;
               case 3: // Use a global filter menu
                  settings.globalFilterPosition = $$(
                     ids.filterGlobal
                  ).getValue();
                  break;
            }

            return settings;
         },

         /**
          * @method addFilterRule
          * Instantiate a new Rule in our list.
          * @param {obj} settings  The settings object from the Rule we created in .toSettings()
          */
         addFilterRule(settings) {
            if (instance.object == null) return;

            var Rule = getRule(instance.object, App, idBase);
            instance.queryRules.push(Rule);

            // if we have tried to create our component:
            if (ids) {
               // if our actually exists, then populate it:
               var RulesUI = $$(ids.filterRules);
               if (RulesUI) {
                  // make sure Rule.ui is created before calling .init()
                  Rule.component(App, idBase); // prepare the UI component
                  var viewId = RulesUI.addView(Rule.ui);
                  Rule.showQueryBuilderContainer();
                  Rule.init({
                     onDelete: (deletedRule) => {
                        $$(ids.filterRules).removeView(Rule.ids.component);

                        var index = instance.queryRules.indexOf(deletedRule);
                        if (index !== -1) {
                           instance.queryRules.splice(index, 1);
                        }
                     }
                  });
               }
            }

            if (settings) {
               Rule.fromSettings(settings);
            }
         },

         onShow: function() {
            if (!this.isLoadAll) {
               $$(ids.needLoadAllLabel).show();
            } else {
               $$(ids.needLoadAllLabel).hide();
            }
         },

         setFilterOption: function(value) {
            switch (JSON.parse(value || 0)) {
               case 1: // Enable User filters
                  $$(ids.filterMenuLayout).hide();
                  $$(ids.filterGlobal).hide();
                  $$(ids.filterUserLayout).show();
                  break;
               case 2: // Use a filter menu
                  $$(ids.filterUserLayout).hide();
                  $$(ids.filterGlobal).hide();
                  $$(ids.filterMenuLayout).show();
                  break;
               case 3: // Use a global filter menu
                  $$(ids.filterUserLayout).hide();
                  $$(ids.filterMenuLayout).hide();
                  $$(ids.filterGlobal).show();
                  break;
               case 0:
               default:
                  // Do not Allow User filters
                  $$(ids.filterUserLayout).hide();
                  $$(ids.filterMenuLayout).hide();
                  $$(ids.filterGlobal).hide();
                  break;
            }
         },

         setFilterUser: (val) => {
            switch (val) {
               case "toolbar":
                  $$(ids.globalToolbar).show();
                  break;
               case "form":
                  $$(ids.globalToolbar).hide();
                  break;
            }
         }
      };

      return {
         ui: ui,
         init: init,
         logic: logic,
         onShow: logic.onShow,
         objectLoad: logic.objectLoad,
         setSettings: logic.setSettings,
         getSettings: logic.getSettings
      };
   }

   /**
    * @method fromSettings
    * Create an initial set of default values based upon our settings object.
    * @param {obj} settings  The settings object we created in .toSettings()
    */
   fromSettings(settings) {
      // this.queryRules = [];

      settings = settings || {};

      settings.filterOption =
         typeof settings.filterOption != "undefined"
            ? settings.filterOption
            : ABViewPropertyFilterData.default.filterOption;

      settings.isGlobalToolbar =
         typeof settings.isGlobalToolbar != "undefined"
            ? settings.isGlobalToolbar
            : ABViewPropertyFilterData.default.isGlobalToolbar;

      // (settings.queryRules || []).forEach(qr => {

      // 	if (qr) {

      // 		//Convert some condition from string to integer
      // 		if (qr.queryRules &&
      // 			qr.queryRules[0] &&
      // 			qr.queryRules[0].rules) {
      // 			qr.queryRules[0].rules.forEach(rule => {
      // 				if (/^[+-]?\d+(\.\d+)?$/.exec(rule.value)) {
      // 					rule.value = JSON.parse(rule.value);
      // 				}
      // 			});
      // 		}

      // 		var Rule = getRule(this.object);
      // 		Rule.fromSettings(qr);
      // 		this.queryRules.push(Rule);

      // 	}

      // });

      this.settings = settings;
   }

   /**
    * @method objectLoad
    * A rule is based upon a Form that was working with an Object.
    * .objectLoad() is how we specify which object we are working with.
    *
    * @param {ABObject} The object that will be used to evaluate the Rules
    */
   objectLoad(object) {
      this.object = object;

      //tell each of our rules about our object
      // if (this.queryRules &&
      // 	this.queryRules.length) {
      // 	this.queryRules.forEach((r) => {
      // 		r.objectLoad(object);
      // 	});
      // }

      if (this.rowFilter) {
         this.rowFilter.applicationLoad(object.application);
         this.rowFilter.fieldsLoad(object.fields());
      }

      if (this.rowFilterForm) {
         this.rowFilterForm.applicationLoad(object.application);
         this.rowFilterForm.fieldsLoad(object.fields());
      }
   }

   viewLoad(view) {
      this.view = view;
   }

   /** == UI == */
   /**
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    */
   component(App, idBase) {
      super.component(App, idBase);

      this.App = App;
      this.idBase = idBase;

      this.rowFilter = new RowFilter(App, idBase + "_filter");
      this.rowFilterForm = new RowFilter(App, idBase + "_filter_form");

      if (this.object) {
         this.rowFilter.applicationLoad(this.object.application);
         this.rowFilter.fieldsLoad(this.object.fields());

         this.rowFilterForm.applicationLoad(this.object.application);
         this.rowFilterForm.fieldsLoad(this.object.fields());
      }

      let ids = {
         /** UI */
         filterPanel: App.unique(idBase + "_filterPanel"),
         globalFilterFormContainer: App.unique(
            idBase + "_globalFilterFormContainer"
         ),
         globalFilterForm: App.unique(idBase + "_globalFilterForm"),
         filterMenutoolbar: App.unique(idBase + "_filterMenuToolbar"),
         resetFilterButton: App.unique(idBase + "_resetFilterButton"),
         component: App.unique(idBase + "_filterData_popup")
      };

      let instance = this;

      // hide filter form
      this.rowFilterForm.ui.hidden = true;

      let _ui = {
         id: ids.filterPanel,
         type: "space",
         borderless: true,
         padding: 0,
         rows: [
            {
               id: ids.globalFilterFormContainer,
               hidden: true,
               cols: [
                  {
                     id: ids.globalFilterForm,
                     view: "text",
                     placeholder: "Search or scan a barcode to see results",
                     on: {
                        onTimedKeyPress: function() {
                           var searchText = this.getValue();

                           logic.searchText(searchText);
                        }
                     }
                  },
                  {
                     view: "button",
                     css: "webix_primary",
                     width: 28,
                     type: "icon",
                     icon: "fa fa-times",
                     click: function() {
                        $$(ids.globalFilterForm).setValue("");
                        $$(ids.globalFilterForm).focus();
                        $$(ids.globalFilterForm).callEvent("onTimedKeyPress");
                     }
                  }
               ]
            },
            this.rowFilterForm.ui,
            {
               view: "toolbar",
               id: ids.filterMenutoolbar,
               css: "ab-data-toolbar",
               hidden: true,
               cols: [
                  {
                     view: "button",
                     css: "webix_primary",
                     id: ids.resetFilterButton,
                     label: L("ab.object.toolbar.resetFilter", "*Reset Filter"),
                     icon: "fa fa-ban",
                     type: "icon",
                     badge: 0,
                     autowidth: true,
                     click: function() {
                        logic.resetFilter();
                     }
                  }
               ]
            }
         ]
      };

      let init = (options) => {
         this.filter_popup = webix.ui({
            view: "popup",
            id: ids.component,
            width: 800,
            hidden: true,
            body: this.rowFilter.ui
         });

         // register callbacks:
         for (var c in logic.callbacks) {
            logic.callbacks[c] = options[c] || logic.callbacks[c];
         }

         this.rowFilter.init({
            onChange: () => {
               let filterRules = this.rowFilter.getValue().rules || [];

               // if ($$(ids.buttonFilter)) {
               // 	$$(ids.buttonFilter).define('badge', filterRules.length || null);
               // 	$$(ids.buttonFilter).refresh();
               // }

               // be notified when there is a change in the filter
               logic.triggerCallback((rowData) => {
                  return this.rowFilter.isValid(rowData);
               }, filterRules);
            }
         });

         this.rowFilterForm.init({
            onChange: () => {
               let filterRules = this.rowFilterForm.getValue().rules || [];

               // be notified when there is a change in the filter
               logic.triggerCallback((rowData) => {
                  return this.rowFilterForm.isValid(rowData);
               }, filterRules);
            }
         });

         $$(ids.filterPanel).hide();
         if ($$(this.rowFilterForm.ui.id)) $$(this.rowFilterForm.ui.id).hide();
         $$(ids.filterMenutoolbar).hide();
         $$(ids.globalFilterFormContainer).hide();

         switch (this.settings.filterOption) {
            case 0:
               break;
            case 1:
               switch (this.settings.userFilterPosition) {
                  case "form":
                     $$(this.rowFilterForm.ui.id).show();
                     $$(ids.filterPanel).show();
                     break;
                  case "toolbar":
                     $$(ids.filterPanel).hide();
                     break;
               }

               break;
            case 2:
               $$(ids.filterPanel).show();
               $$(ids.filterMenutoolbar).show();

               // populate filter items
               if (
                  this.settings.queryRules &&
                  this.settings.queryRules.length > 0
               ) {
                  this.settings.queryRules.forEach((qr) => {
                     var filterRuleButton = {
                        view: "button",
                        css: "webix_primary",
                        label: qr.ruleName,
                        icon: "fa fa-filter",
                        type: "icon",
                        badge: 0,
                        autowidth: true,
                        click: function() {
                           logic.selectFilter(qr.queryRules);
                        }
                     };
                     $$(ids.filterMenutoolbar).addView(filterRuleButton);
                  });
               }
               break;
            case 3:
               $$(ids.globalFilterFormContainer).show();
               $$(ids.filterPanel).show();
               break;
         }
      };

      let logic = {
         callbacks: {
            /**
             * @param {function} fnFilter
             */
            onFilterData: function(fnFilter, filterRules) {
               console.warn("NO onFilterData()");
            }
         },

         triggerCallback: (fnFilter, filterRules) => {
            instance.__currentFilter = fnFilter;
            logic.callbacks.onFilterData(this.__currentFilter, filterRules);
         },

         resetFilter: () => {
            let showAllFn = function(rowData) {
                  return true;
               },
               filterRules = [];

            logic.triggerCallback(showAllFn, filterRules);
         },

         selectFilter: (queryRules) => {
            let id = "hiddenQB_" + webix.uid();

            let queryRule = getRule(this.object, this.App, this.idBase);

            let ui = {
               id: id,
               hidden: true,
               view: "querybuilder",
               fields: queryRule.conditionFields()
            };
            let hiddenQB = webix.ui(ui);

            hiddenQB.setValue(queryRules);

            let QBHelper = hiddenQB.getFilterHelper();

            hiddenQB.destructor(); // remove the QB

            logic.triggerCallback(QBHelper);
         },

         getFilter() {
            // default filter
            if (instance.__currentFilter == null) {
               // if empty search text in global single mode, then no display rows
               if (
                  instance.settings.filterOption == 3 &&
                  instance.settings.globalFilterPosition == "single"
               )
                  instance.__currentFilter = (row) => {
                     return false;
                  };
               // always true, show every rows
               else
                  instance.__currentFilter = (row) => {
                     return true;
                  };
            }

            return instance.__currentFilter;
         },

         showFilterPopup($view) {
            instance.filter_popup.show($view, null, { pos: "top" });
         },

         closeFilterPopup() {
            instance.filter_popup.hide();
         },

         searchText(search) {
            let texts = search
               .trim()
               .toLowerCase()
               .split(" ");

            let isTextValid = (rowData) => {
               var isValid = false;

               // if empty search text in global single mode, then no display rows
               if (
                  instance.settings.filterOption == 3 &&
                  instance.settings.globalFilterPosition == "single" &&
                  search.replace(/ /g, "") == ""
               ) {
                  return isValid;
               }

               for (let key in rowData || {}) {
                  if (isValid || key == "uuid" || key == "id") continue;

                  texts.forEach((text) => {
                     if (
                        rowData[key] &&
                        rowData[key]
                           .toString()
                           .toLowerCase()
                           .indexOf(text) > -1
                     )
                        isValid = true;
                  });
               }

               return isValid;
            };

            logic.triggerCallback(isTextValid);

            // var table = $$(DataTable.ui.id);
            // var columns = table.config.columns;
            // var count = 0;
            // var matchArray = [];
            // table.filter(function (obj) {
            // 	matchArray = [];
            // 	// console.log("filter", obj);
            // 	for (var i = 0; i < columns.length; i++) {
            // 		for (var x = 0; x < text.length; x++) {
            // 			var searchFor = text[x];
            // 			if (obj[columns[i].id] && obj[columns[i].id].toString().toLowerCase().indexOf(searchFor) !== -1) {
            // 				// console.log("matched on:", searchFor);
            // 				if (matchArray.indexOf(searchFor) == -1) {
            // 					matchArray.push(searchFor);
            // 				}
            // 			}
            // 		}
            // 	}

            // 	if (matchArray.length == text.length) {
            // 		count++;
            // 		return true;
            // 	} else {
            // 		return false;
            // 	}
            // });
            // if (globalFilterPosition == "single") {
            // 	if (count == 1) {
            // 		table.show();
            // 		table.select(table.getFirstId(), false);
            // 		table.callEvent("onItemClick", [table.getFirstId(), "auto", null]);
            // 	} else {
            // 		table.hide();
            // 	}
            // }
         }
      };

      return {
         ui: _ui,
         init: init,
         logic: logic,

         showPopup: logic.showFilterPopup,
         closePopup: logic.closeFilterPopup,

         getFilter: logic.getFilter,

         searchText: logic.searchText
      };
   }
};
