/*
 * ab_work_interface_list_newPage
 *
 * Display the form for creating a new Application.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const AB_Work_Interface_List_NewPage_BlankPage = require("./ab_work_interface_list_newPage_blankPage");
const AB_Work_Interface_List_NewPage_QuickPage = require("./ab_work_interface_list_newPage_quickPage");
// const AB_Work_Interface_List_NewPage_ReportPage = require("./ab_work_interface_list_newPage_reportPage");
// const ABPage = require('../classes/platform/views/ABViewPage');

module.exports = class AB_Work_Interface_List_NewPage extends ABComponent {
   constructor(App) {
      super(App, "ab_work_interface_list_newPage");

      var L = this.Label;

      var labels = {
         common: App.labels,

         component: {
            addNewPage: L("ab.interface.addNewPage", "*Add a new page"),

            // formHeader: L('ab.application.form.header', "*Application Info"),
            blankPage: L("ab.interface.blankPage", "*Blank Page"),
            quickPage: L("ab.interface.quickPage", "*Quick Page"),
            reportPage: L("ab.interface.reportPage", "*Report Page")
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),

         selectTab: this.unique("selectTab"),

         tabBlank: this.unique("tabBlank"),
         tabQuick: this.unique("tabQuick"),
         tabReport: this.unique("tabReport"),

         buttonSave: this.unique("buttonSave")
      };

      var BlankPage = new AB_Work_Interface_List_NewPage_BlankPage(App);
      var QuickPage = new AB_Work_Interface_List_NewPage_QuickPage(App);
      // var ReportPage = new AB_Work_Interface_List_NewPage_ReportPage(App);

      // Our webix UI definition:
      this.ui = {
         view: "window",
         id: ids.component,

         //// TODO: @James
         width: 650,
         // maxHeight: 500,

         position: "center",
         modal: true,
         head: labels.component.addNewPage,
         body: {
            rows: [
               {
                  id: ids.selectTab,
                  view: "tabbar",
                  multiview: true,
                  options: [
                     {
                        id: ids.tabBlank,
                        value: labels.component.blankPage
                     },
                     {
                        id: ids.tabQuick,
                        value: labels.component.quickPage
                     }
                     // { id: ids.tabReport, value: labels.component.reportPage }
                  ],
                  on: {
                     onChange: function(newTab, oldTab) {
                        _logic.tabSwitch(newTab, oldTab);
                     }
                  }
               },
               {
                  cells: [
                     BlankPage.ui,
                     QuickPage.ui
                     // ReportPage.ui
                  ]
               },
               {
                  margin: 5,
                  height: 40,
                  cols: [
                     { fillspace: true },
                     {
                        view: "button",
                        value: labels.common.cancel,
                        css: "ab-cancel-button",
                        autowidth: true,
                        click: function() {
                           _logic.buttonCancel();
                        }
                     },
                     {
                        id: ids.buttonSave,
                        css: "webix_primary",
                        view: "button",
                        value: labels.common.add,
                        autowidth: true,
                        type: "form",
                        click: function() {
                           _logic.buttonSave();
                        }
                     }
                  ]
               }
            ]
         }
      };

      // Our init() function for setting up our UI
      this.init = function(options) {
         // webix.extend($$(ids.form), webix.ProgressBar);

         // we're a popup, so create our own ui
         webix.ui(this.ui);

         BlankPage.init();
         QuickPage.init();
         // ReportPage.init();

         // register our callbacks:
         for (var c in _logic.callbacks) {
            _logic.callbacks[c] = options[c] || _logic.callbacks[c];
         }

         $$(ids.selectTab).setValue(ids.tabBlank);
         _logic.tabSwitch(ids.tabBlank);
      };

      var CurrentApplication = null;
      var CurrentEditor = null;

      // our internal business logic
      var _logic = {
         /**
          * @function applicationLoad()
          *
          * Prepare our New Popups with the current Application
          */
         applicationLoad: function(application) {
            CurrentApplication = application;

            BlankPage.applicationLoad(application);
            QuickPage.applicationLoad(application);
            // ReportPage.applicationLoad(application);
         },

         buttonCancel: function() {
            CurrentEditor.clear();
            _logic.hide();
         },

         buttonSave: function() {
            var SaveButton = $$(ids.buttonSave);

            SaveButton.disable();
            CurrentEditor.formBusy();

            setTimeout(() => {
               // var values = CurrentEditor.values();
               CurrentEditor.values().then((values) => {
                  if (!values) {
                     SaveButton.enable();
                     CurrentEditor.formReady();
                     return;
                  }

                  // this interface only creates Root Pages, or pages related to
                  var page = null;
                  if (values.useParent && values.parent) {
                     page = values.parent;
                  } else if (values.parent) {
                     page = values.parent.pageNew(values);
                  } else {
                     page = CurrentApplication.pageNew(values);
                  }

                  var validator = page.isValid(values);
                  if (validator.fail()) {
                     CurrentEditor.errors(validator);
                     return;
                  }

                  let includeSubview = true;

                  page
                     .save(includeSubview)
                     .then(() => {
                        // Q: in the new ABDefinition approach, do we need to do this?
                        /*
                     // save sub-pages sequentially
                     var subTasks = Promise.resolve();
                     page.pages().forEach((subPage) => {
                        subTasks = subTasks.then(() =>
                           subPage.save(includeSubview)
                        );
                     });
                     */

                        _logic.callbacks.onSave(page);

                        BlankPage.clear();
                        QuickPage.clear();
                        // ReportPage.clear();

                        _logic.hide();

                        // the CurrentApplication has changed it's values, so
                        // refresh our editors with the curent values:
                        _logic.applicationLoad(CurrentApplication);

                        SaveButton.enable();
                        CurrentEditor.formReady();
                     })
                     .catch((err) => {
                        // TODO: error message
                        console.error(err);

                        SaveButton.enable();
                        CurrentEditor.formReady();
                     });
               });
            }, 50);
         },

         callbacks: {
            onSave: function() {
               console.error("!! no onSave() callback handler! ");
            }
         },

         /**
          * @function hide()
          *
          * Hide this component.
          */
         hide: function() {
            $$(ids.component).hide();
         },

         // /**
         //  * @function formBusy
         //  *
         //  * Show the progress indicator to indicate a Form operation is in
         //  * progress.
         //  */
         // formBusy: function() {

         // 	$$(ids.form).showProgress({ type: 'icon' });
         // },

         // /**
         //  * @function formReady()
         //  *
         //  * remove the busy indicator from the form.
         //  */
         // formReady: function() {
         // 	$$(ids.form).hideProgress();
         // },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            $$(ids.component).show();
         },

         /**
          * @function tabSwitch()
          *
          * Switch between the different New Page Editors.
          */
         tabSwitch: function(newTab, oldTab) {
            if (newTab != oldTab) {
               switch (newTab) {
                  case ids.tabBlank:
                     CurrentEditor = BlankPage;
                     BlankPage.show();
                     break;
                  case ids.tabQuick:
                     CurrentEditor = QuickPage;
                     QuickPage.show();
                     break;
                  // case ids.tabReport:
                  // 	CurrentEditor = ReportPage;
                  // 	ReportPage.show();
                  // 	break;
               }
            }
         }
      };
      this._logic = _logic;

      // Expose any globally accessible Actions:
      this.actions({
         /**
          * @function populateApplicationForm()
          *
          * Initialze the Form with the values from the provided ABApplication.
          *
          * If no ABApplication is provided, then show an empty form. (create operation)
          *
          * @param {ABApplication} Application  	[optional] The current ABApplication
          *										we are working with.
          */
         // populateApplicationForm:function(Application){
         // 	_logic.formReset();
         // 	if (Application) {
         // 		// populate Form here:
         // 		_logic.formPopulate(Application);
         // 	}
         // 	_logic.permissionPopulate(Application);
         // 	_logic.show();
         // }
      });

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.hide = _logic.hide;
      this.show = _logic.show;
   }
};
