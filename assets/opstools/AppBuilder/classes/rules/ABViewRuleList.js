//
// ABViewRuleList
//
// A UI component that is responsible for displaying a list of current "Rules"
// for a given purpose.  Some examples are the
//		Form -> Submit Rules,
//		Form -> Display Rules
// 		Form -> Record Rules.
//

// ABViewRuleList is the parent object that manages displaying the common popup,
// list, adding a rule, removing rules, etc...
//
// It is intending to be subclassed by a Specific List object that will load
// up a given set of Actions for their list.
//
// When using it in the AppBuilder Interface Builder, this object provides:
// 	var PopupRecordList = new ABViewRuleList(App, idBase);
//  PopupRecordList.fromSettings(CurrentObjectDefinition.rules); // populates List with current settings defined in CurrentObjectDefinition
//  PopupRecordList.init({ onSave:()=>{}})	// displays the popup for IB
//  CurrentObjectDefinition.rules = PopupRecordList.toSettings(); // save the settings to store in json config
//
// When using on a live running App:
//  PopupRecordList = new ABViewRuleList(App, idBase);
//  PopupRecordList.fromSettings();
//
//  onFormSubmit(data) {
//		// note: this automatically validates and runs each rule:
//		PopupRecordList.process({data:data, view:{ current ABViewForm object }})
//		.then()
//		.catch();
//  }

module.exports = class ABViewRuleList {
   /**
    * @param {object} App
    *      The shared App object that is created in OP.Component
    * @param {string} idBase
    *      Identifier for this component
    */
   constructor(childSettings) {
      this.listRules = [];
      this.currentObject = null;

      // ensure required values:
      childSettings = childSettings || {};
      childSettings.labels = childSettings.labels || {};
      childSettings.labels.header =
         childSettings.labels.header || "ab.components.form.ruleList";
      childSettings.labels.headerDefault =
         childSettings.labels.headerDefault || "*Rule List";
      this.childSettings = childSettings;
   }

   /**
    * @method component
    * initialize the UI display for this popup editor.
    * @param {obj} App  The common UI App object shared among our UI components
    * @param {string} idBase A unique Key used the the base of our unique ids
    */
   component(App, idBase) {
      this.App = App;
      this.idBase = idBase;

      var L = function(key, altText) {
         return AD.lang.label.getLabel(key) || altText;
      };

      this.currentForm = null;

      var labels = (this.labels = {
         common: App.labels,
         component: {
            header: L(
               this.childSettings.labels.header,
               this.childSettings.labels.headerDefault
            ),
            addNewRule: L("ab.components.form.addNewRule", "*Add new rule")
         }
      });

      // internal list of Webix IDs to reference our UI components.
      var ids = (this.ids = {
         component: idBase + "_component",
         rules: idBase + "_rules",
         rulesScrollview: idBase + "_rulesScrollview",

         action: idBase + "_action",
         when: idBase + "_when",

         values: idBase + "_values",
         set: idBase + "_set"
      });

      // webix UI definition:
      this.ui = {
         view: "window",
         id: ids.component,
         modal: true,
         position: "center",
         resize: true,
         width: 700,
         height: 450,
         css: "ab-main-container",
         head: {
            view: "toolbar",
            css: "webix_dark",
            cols: [
               { view: "label", label: labels.component.header },
               {
                  view: "button",
                  css: "webix_primary",
                  icon: "fa fa-plus",
                  type: "iconButton",
                  label: labels.component.addNewRule,
                  width: 150,
                  click: () => {
                     this.addRule();
                     console.log($$(ids.rules).$height);
                     $$(ids.rulesScrollview).scrollTo(0, $$(ids.rules).$height);
                  }
               }
            ]
         },
         body: {
            type: "form",
            rows: [
               {
                  view: "scrollview",
                  id: ids.rulesScrollview,
                  scroll: "xy",
                  body: {
                     view: "layout",
                     id: ids.rules,
                     margin: 20,
                     padding: 10,
                     rows: []
                  }
               },
               // {
               // 	css: { 'background-color': '#fff' },
               // 	cols: [
               // 		{
               // 			view: "button",
               // 			icon: "plus",
               // 			type: "iconButton",
               // 			label: labels.component.addNewRule,
               // 			width: 150,
               // 			click: () => {
               // 				this.addRule();
               // 			}
               // 		},
               // 		{ fillspace: true }
               // 	]
               // },
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
                           _logic.buttonCancel();
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
                           _logic.buttonSave();
                        }
                     },
                     { fillspace: true }
                  ]
               }
            ]
         }
      };

      // var _currentObject = null;
      var _rules = [];

      // for setting up UI
      this.init = (options) => {
         // register callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         webix.ui(this.ui);
      };

      // internal business logic
      var _logic = (this._logic = {
         buttonCancel: function() {
            $$(ids.component).hide();
         },

         buttonSave: () => {
            var results = this.toSettings();

            _logic.callbacks.onSave(results);
            _logic.hide();
         },

         callbacks: {
            onCancel: function() {
               console.warn("NO onCancel()!");
            },
            onSave: function(field) {
               console.warn("NO onSave()!");
            }
         },

         hide: function() {
            $$(ids.component).hide();
         },

         show: function() {
            $$(ids.component).show();
         }
      });

      this.show = _logic.show;
      this.setValue = _logic.setValue;
   }

   /**
    * @method addRule
    * Instantiate a new Rule in our list.
    * @param {obj} settings  The settings object from the Rule we created in .toSettings()
    */
   addRule(settings) {
      var Rule = this.getRule();
      if (!Rule) return;

      this.listRules.push(Rule);

      // if we have tried to create our component:
      if (this.ids) {
         // if our actually exists, then populate it:
         var RulesUI = $$(this.ids.rules);
         if (RulesUI) {
            // make sure Rule.ui is created before calling .init()
            Rule.component(this.App, this.idBase); // prepare the UI component
            var viewId = RulesUI.addView(Rule.ui);

            Rule.init({
               onDelete: (deletedRule) => {
                  $$(this.ids.rules).removeView(Rule.ids.component);

                  var index = this.listRules.indexOf(deletedRule);
                  if (index !== -1) {
                     this.listRules.splice(index, 1);
                  }
               }
            });
         }
      }

      if (settings) {
         Rule.fromSettings(settings);
      }
   }

   /**
    * @method fromSettings
    * Create an initial set of default values based upon our settings object.
    * @param {obj} settings  The settings object we created in .toSettings()
    */
   fromSettings(settings) {
      // settings: [
      //  { rule.settings },
      //  { rule.settings }
      // ]

      // clear any existing Rules:
      this.listRules.forEach((rule) => {
         if (
            this.ids &&
            this.ids.rules &&
            rule &&
            rule.ids &&
            rule.ids.component
         ) {
            $$(this.ids.rules).removeView(rule.ids.component);
         }
      });
      this.listRules = [];

      if (settings) {
         settings.forEach((ruleSettings) => {
            this.addRule(ruleSettings);
         });
      }
   }

   /**
    * @method objectLoad
    * A rule is based upon a Form that was working with an Object.
    * .objectLoad() is how we specify which object we are working with.
    *
    * @param {ABObject} The object that will be used to evaluate the Rules
    */
   objectLoad(object) {
      this.currentObject = object;

      // tell each of our rules about our object
      this.listRules.forEach((r) => {
         r.objectLoad(object);
      });
   }

   processPre(options) {
      (this.listRules || [])
         .filter((rule) => rule.isPreProcess == true)
         .forEach((rule) => {
            rule.processPre(options, options.data);
         });
   }

   /**
    * @method process
    * Take the provided data and process each of our rules.
    * @param {obj} options
    * @return {promise}
    */
   process(options) {
      return new Promise((resolve, reject) => {
         let listRules = (this.listRules || []).filter(
            (rule) => !rule.isPreProcess
         );

         var numDone = 0;
         var onDone = () => {
            numDone++;
            if (numDone >= listRules.length) {
               resolve();
            }
         };

         listRules.forEach((rule) => {
            rule
               .process(options)
               .then(function() {
                  onDone();
               })
               .catch((err) => {
                  reject(err);
               });
         });

         if (listRules.length == 0) {
            resolve();
         }
      });
   }

   /**
    * @method toSettings
    * create a settings object to be persisted with the application.
    * @return {array} of rule settings.
    */
   toSettings() {
      var settings = [];
      this.listRules.forEach((r) => {
         settings.push(r.toSettings());
      });
      return settings;
   }

   getRule() {
      console.error(
         "!!! ABViewRuleList.getRule() should be overridded by a child object."
      );
      return null;
   }

   formLoad(form) {
      this.currentForm = form;
   }

   // NOTE: Querybuilder v5.2 has a bug where it won't display the [and/or]
   // choosers properly if it hasn't been shown before the .setValue() call.
   // so this work around allows us to refresh the display after the .show()
   // on the popup.
   // When they've fixed the bug, we'll remove this workaround:
   qbFixAfterShow() {
      this.listRules.forEach((r) => {
         r.qbFixAfterShow();
      });
   }
};
