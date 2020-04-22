/*
 * ab_work_interface_list_newPage_quickPage
 *
 * Display the form for creating a new template page
 *
 */

const ABComponent = require("../classes/platform/ABComponent");
const ABDataCollection = require("../classes/platform/ABDataCollection");
const ABViewContainer = require("../classes/platform/views/ABViewContainer");
const ABViewDetail = require("../classes/platform/views/ABViewDetail");
const ABViewForm = require("../classes/platform/views/ABViewForm");
const ABViewFormButton = require("../classes/platform/views/ABViewFormButton");
const ABViewGrid = require("../classes/platform/views/ABViewGrid");
const ABViewLabel = require("../classes/platform/views/ABViewLabel");
const ABViewMenu = require("../classes/platform/views/ABViewMenu");
const ABViewPage = require("../classes/platform/views/ABViewPage");
const ABViewTab = require("../classes/platform/views/ABViewTab");

module.exports = class AB_Work_Interface_List_NewPage_QuickPage extends ABComponent {
   constructor(App) {
      super(App, "ab_work_interface_list_newPage_quickPage");

      var L = this.Label;

      var labels = {
         common: App.labels,
         component: {
            // formHeader: L('ab.application.form.header', "*Application Info"),
            parentPage: L("ab.interface.page.parentList", "*Parent Page"),
            pageName: L("ab.interface.page.name", "*Page Name"),
            placeholderPageName: L(
               "ab.interface.placeholderPageName",
               "*Creat a page name"
            ),

            rootPage: L("ab.interface.rootPage", "*[Root page]"),
            selectDataCollection: L(
               "ab.interface.selectDataCollection",
               "*[Select data collection]"
            )
         }
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: this.unique("component"),
         form: this.unique("form"),
         name: this.unique("name"),

         parentList: this.unique("parentList"),
         selectDataCollection: this.unique("selectDataCollection"),
         displayGrid: this.unique("displayGrid"),
         addable: this.unique("addable"),
         formAdd: this.unique("formAdd"),
         editable: this.unique("editable"),
         viewable: this.unique("viewable"),

         subDVs: this.unique("subDVs")
      };

      // Our init() function for setting up our UI
      this.init = function() {
         if ($$(ids.component))
            webix.extend($$(ids.component), webix.ProgressBar);
      };

      var CurrentApplication = null,
         CurrentPage = null,
         CurrentDC = null;

      // our internal business logic
      var _logic = (this._logic = {
         /**
          * @function applicationLoad()
          *
          * Prepare our New Popups with the current Application
          */
         applicationLoad: function(application) {
            CurrentApplication = application;
         },

         /**
          * @function selectPage()
          *
          * Select the parent page
          */
         selectPage: function(newPageUrl, oldPageUrl) {
            CurrentPage = CurrentApplication.pages(
               (p) => p.id == newPageUrl.trim()
            )[0];
         },

         /**
          * @function selectDataCollection()
          *
          * Select a data collection
          */
         selectDataCollection: function(datacollectionId) {
            CurrentDC = CurrentApplication.datacollections(
               (dc) => dc.id == datacollectionId
            )[0];

            $$(ids.name).show();
            $$(ids.name).setValue(CurrentDC ? CurrentDC.label : "");

            // Rename data source name to template
            $$(ids.form)
               .getChildViews()
               .forEach(function(r) {
                  if (r && r.config.labelRight) {
                     let label = r.config.labelRight.replace(
                        /<b>[\s\S]*?<\/b>/,
                        '<b>"' + (CurrentDC ? CurrentDC.label : "") + '"</b>'
                     );

                     r.define("labelRight", label);
                     r.refresh();
                  }
               });

            // Pull data collections that parent is the selected dc
            let subDCs = [];
            if (CurrentDC) {
               let datasource = CurrentDC.datasource;
               if (datasource) {
                  subDCs = CurrentApplication.datacollections((dc) => {
                     let linkDatasource = dc.datasource;
                     if (!linkDatasource) return false;

                     return dc.settings.linkDatacollectionID == CurrentDC.id;
                     // return dc.id == CurrentDC.settings.linkDatacollectionID;
                     // return linkDatasource.fields(f => f.key == 'connectObject' && f.settings.linkObject == datasource.id).length > 0;
                  });
               }
            }

            // Re-build sub-dcs layout
            $$(ids.subDVs).reconstruct();

            // Add title
            if (subDCs.length > 0) {
               $$(ids.subDVs).addView({
                  view: "label",
                  label: "Do you want to add other options?",
                  css: "ab-text-bold"
               });
            }

            // Add sub-dcs to layout
            subDCs.forEach((subObj) => {
               $$(ids.subDVs).addView({
                  view: "checkbox",
                  name: subObj.id + "|list",
                  labelRight: 'List connected <b>"#label#"</b> with a Grid'.replace(
                     "#label#",
                     subObj.label
                  ),
                  labelWidth: 2
               });

               $$(ids.subDVs).addView({
                  view: "checkbox",
                  name: subObj.id + "|form",
                  labelRight: 'Add a connected <b>"#label#"</b> with a Form'.replace(
                     "#label#",
                     subObj.label
                  ),
                  labelWidth: 2
               });
            });
         },

         /**
          * @function clear()
          *
          * Clear our form
          */
         clear: function() {
            $$(ids.form).clearValidation();
            $$(ids.form).clear();
            $$(ids.parentList).setValue("-");

            // Re-build sub-dcs layout
            $$(ids.subDVs).reconstruct();
         },

         /**
          * @function errors()
          *
          * show errors on our form:
          */
         errors: function(validator) {
            validator.updateForm($$(ids.component));
         },

         /**
          * @function formBusy
          *
          * Show the progress indicator to indicate a Form operation is in
          * progress.
          */
         formBusy: function() {
            $$(ids.component).showProgress({ type: "icon" });
         },

         /**
          * @function formReady()
          *
          * remove the busy indicator from the form.
          */
         formReady: function() {
            $$(ids.component).hideProgress();
         },

         /**
          * @function show()
          *
          * Show this component.
          */
         show: function() {
            let pageOptions = [{ id: "-", value: labels.component.rootPage }];

            /* Pages */
            let addPage = function(page, indent) {
               indent = indent || "";
               pageOptions.push({ id: page.id, value: indent + page.label });
               page.pages().forEach(function(p) {
                  addPage(p, indent + "-");
               });
            };
            CurrentApplication.pages().forEach(function(page) {
               addPage(page, "");
            });

            $$(ids.parentList).define("options", pageOptions);
            $$(ids.parentList).refresh();

            /* Objects */
            let dcOptions =
               CurrentApplication.datacollections().map((dc) => {
                  return {
                     id: dc.id,
                     value: dc.label
                  };
               }) || [];

            dcOptions.unshift({
               id: "",
               value: labels.component.selectDataCollection
            });

            $$(ids.selectDataCollection).define("options", dcOptions);
            $$(ids.selectDataCollection).refresh();

            $$(ids.component).show();
         },

         getDatacollection: function(label, obj, parentDv) {
            var dvConfig = {
               id: OP.Util.uuid(),
               label: label || obj.label,
               settings: {
                  object: obj.id,
                  loadAll: 0,
                  fixSelect: ""
               }
            };

            if (parentDv) {
               dvConfig.settings.linkDatacollectionID = parentDv.id;

               var linkField = obj.fields(
                  (f) =>
                     f.datasourceLink &&
                     f.datasourceLink.id == parentDv.datasource.id
               )[0];
               if (linkField) dvConfig.settings.linkFieldID = linkField.id;
            }

            return new ABDataCollection(dvConfig, CurrentApplication);
         },

         getFormView: (datacollection, options = {}) => {
            let formSettings = {
               label: datacollection.label + " Form",
               settings: {
                  dataviewID: datacollection.id,
                  showLabel: true,
                  labelPosition: "left",
                  labelWidth: 120,
                  clearOnLoad: options.clearOnLoad || false
               }
            };

            // set redirect page
            if (options && options.redirectPageId) {
               formSettings.settings.submitRules = [
                  {
                     selectedAction: "ABViewRuleActionFormSubmitRuleExistPage",
                     queryRules: [""],
                     actionSettings: {
                        valueRules: {
                           pageId: options.redirectPageId
                        }
                     }
                  }
               ];
            }

            // create a new form instance
            let newForm = new ABViewForm(formSettings, CurrentApplication);

            // populate fields to a form
            let object = datacollection.datasource;
            if (object) {
               object.fields().forEach((f, index) => {
                  newForm.addFieldToForm(f, index);
               });
            }

            // Add action button to the form
            newForm._views.push(
               new ABViewFormButton(
                  {
                     label: "Form buttons",
                     settings: {
                        includeSave: true,
                        includeCancel: options.includeCancel || false,
                        includeReset: false
                     },
                     position: {
                        y: object.fields().length
                     }
                  },
                  CurrentApplication
               )
            );

            return newForm;
         },

         getDetailView: function() {
            // create a new detail instance
            var newDetail = new ABViewDetail(
               {
                  label: "Details of " + CurrentDC.label,
                  settings: {
                     dataviewID: CurrentDC.id,
                     showLabel: true,
                     labelPosition: "left",
                     labelWidth: 120
                  }
               },
               CurrentApplication
            );

            // populate fields to a form
            var object = CurrentDC.datasource;
            if (object) {
               object.fields().forEach((f, index) => {
                  newDetail.addFieldToView(f, index);
               });
            }

            return newDetail;
         },

         values: function() {
            if (!CurrentDC) return null;

            // TODO : validate unique page's name

            let pages = [],
               views = [],
               formValues = $$(ids.form).getValues(),
               subValues = $$(ids.subDVs).getValues();

            let addPageId = null,
               editPageId = null,
               viewPageId = null;

            // Add a 'add' page
            if (formValues.addable) {
               addPageId = OP.Util.uuid();

               let addForm = _logic.getFormView(CurrentDC, {
                  clearOnLoad: true
               });

               // Add a 'add' page
               pages.push({
                  id: addPageId,
                  key: ABViewPage.common().key,
                  icon: ABViewPage.common().icon,
                  name: "Add " + CurrentDC.label,
                  settings: {
                     type: "popup"
                  },
                  views: [
                     // Title
                     {
                        key: ABViewLabel.common().key,
                        icon: ABViewLabel.common().icon,
                        label: "Title",
                        text: "Add " + CurrentDC.label,
                        settings: {
                           format: 1
                        }
                     },
                     // Form
                     addForm.toObj()
                  ]
               });

               // Add a menu
               if (formValues.addable) {
                  views.push({
                     key: ABViewMenu.common().key,
                     icon: ABViewMenu.common().icon,
                     label: "Menu",
                     settings: {
                        columnSpan: "1",
                        rowSpan: "1",
                        orientation: "x",
                        buttonStyle: "ab-menu-default",
                        menuAlignment: "ab-menu-right",
                        menuInToolbar: "1",
                        menuPadding: "10",
                        menuTheme: "webix_dark",
                        menuPosition: "right",
                        menuTextLeft: "Team",
                        menuTextCenter: "",
                        menuTextRight: "",
                        pages: [
                           {
                              pageId: addPageId,
                              tabId: "",
                              type: "page",
                              aliasname: "Add " + CurrentDC.label,
                              isChecked: true,
                              translations: [
                                 {
                                    language_code: "en",
                                    label: "Add " + CurrentDC.label,
                                    aliasname: "Add " + CurrentDC.label
                                 }
                              ]
                           }
                        ],
                        order: [
                           {
                              pageId: addPageId,
                              tabId: "",
                              type: "page",
                              aliasname: "Add " + CurrentDC.label,
                              isChecked: true,
                              translations: [
                                 {
                                    language_code: "en",
                                    label: "Add " + CurrentDC.label,
                                    aliasname: "Add " + CurrentDC.label
                                 }
                              ],
                              parent: "0",
                              position: "0",
                              icon: "plus"
                           }
                        ]
                     }
                  });
               }
            }

            // Add a 'edit' page
            if (formValues.editable) {
               editPageId = OP.Util.uuid();

               let editForm = _logic.getFormView(CurrentDC);

               // Add a 'edit' page
               pages.push({
                  id: editPageId,
                  key: ABViewPage.common().key,
                  icon: ABViewPage.common().icon,
                  name: "Edit " + CurrentDC.label,
                  settings: {
                     type: "popup"
                  },
                  views: [
                     // Title
                     {
                        key: ABViewLabel.common().key,
                        icon: ABViewLabel.common().icon,
                        label: "Title",
                        text: "Edit " + CurrentDC.label,
                        settings: {
                           format: 1
                        }
                     },
                     // Form
                     editForm.toObj()
                  ]
               });
            }

            // View page
            if (formValues.viewable) {
               viewPageId = OP.Util.uuid();

               let newDetail = _logic.getDetailView();
               newDetail.position = newDetail.position || {};
               newDetail.position.y = 1;

               let viewsOfDetail = [
                  // Menu & Title
                  {
                     key: ABViewMenu.common().key,
                     icon: ABViewMenu.common().icon,
                     label: "Menu & Title",
                     settings: {
                        columnSpan: 1,
                        rowSpan: 1,
                        orientation: "x",
                        buttonStyle: "ab-menu-default",
                        menuAlignment: "ab-menu-right",
                        menuInToolbar: 1,
                        menuPadding: 10,
                        menuTheme: "bg_gray",
                        menuPosition: "right",
                        menuTextLeft: "Details " + CurrentDC.label,
                        pages: [
                           {
                              pageId: editPageId,
                              tabId: "",
                              type: "page",
                              aliasname: "Edit " + CurrentDC.label,
                              isChecked: true,
                              translations: [
                                 {
                                    language_code: "en",
                                    label: "Edit " + CurrentDC.label,
                                    aliasname: "Edit " + CurrentDC.label
                                 }
                              ]
                           }
                        ],
                        order: [
                           {
                              pageId: editPageId,
                              tabId: "",
                              type: "page",
                              aliasname: "Edit Team",
                              isChecked: true,
                              translations: [
                                 {
                                    language_code: "en",
                                    label: "Edit Team",
                                    aliasname: "Edit Team"
                                 }
                              ],
                              parent: 0,
                              position: 0,
                              icon: "edit"
                           }
                        ]
                     },
                     position: {
                        y: 0
                     }
                  },
                  // Detail
                  newDetail.toObj()
               ];

               let tabSubChildren = {
                  key: ABViewTab.common().key,
                  icon: ABViewTab.common().icon,
                  label: "Tab",
                  name: "Tab",
                  settings: {
                     height: 400,
                     minWidth: 0,
                     stackTabs: 0,
                     darkTheme: 1,
                     sidebarWidth: 200,
                     sidebarPos: "left",
                     iconOnTop: 0,
                     columnSpan: 1,
                     rowSpan: 1
                  },
                  views: [],
                  position: {
                     y: 2
                  }
               };

               // define sub-pages to menu
               let subAddPages = {}; // { dataCollectionId: "uuid", pageId: "uuid" }
               // let menuSubPages = [];
               // if (editPageId) menuSubPages.push(editPageId);

               Object.keys(subValues).forEach((key, i) => {
                  if (subValues[key]) {
                     // Check
                     let vals = key.split("|"),
                        datacollectionId = vals[0],
                        flag = vals[1]; // 'list' or 'form'

                     let childDC = CurrentApplication.datacollections(
                        (dc) => dc.id == datacollectionId
                     )[0];

                     if (subAddPages[datacollectionId] == null)
                        subAddPages[datacollectionId] = OP.Util.uuid();

                     // Add grids of sub-dcs
                     if (flag == "list") {
                        let tabView = {
                           id: OP.Util.uuid(),
                           key: "viewcontainer",
                           icon: "braille",
                           tabicon: "",
                           name: childDC.label,
                           settings: {
                              columns: "1",
                              removable: true,
                              movable: true
                           },
                           translations: [
                              {
                                 language_code: "en",
                                 label: childDC.label
                              }
                           ],
                           views: [],
                           position: {
                              dx: 1,
                              dy: 1
                           },
                           pages: []
                        };

                        tabView.views.push(
                           // Menu & Title
                           {
                              key: ABViewMenu.common().key,
                              icon: ABViewMenu.common().icon,
                              tabicon: "",
                              name: childDC.label + ".menu",
                              settings: {
                                 columnSpan: 1,
                                 rowSpan: 1,
                                 orientation: "x",
                                 buttonStyle: "ab-menu-default",
                                 menuAlignment: "ab-menu-right",
                                 menuInToolbar: 1,
                                 menuPadding: 10,
                                 menuTheme: "webix_dark",
                                 menuPosition: "right",
                                 menuTextLeft: childDC.label,
                                 pages: [
                                    {
                                       pageId: subAddPages[datacollectionId],
                                       tabId: "",
                                       type: "page",
                                       aliasname: "Add " + childDC.label,
                                       isChecked: true,
                                       translations: [
                                          {
                                             language_code: "en",
                                             label: "Add " + childDC.label,
                                             aliasname: "Add " + childDC.label
                                          }
                                       ]
                                    }
                                 ],
                                 order: [
                                    {
                                       pageId: subAddPages[datacollectionId],
                                       tabId: "",
                                       type: "page",
                                       aliasname: "Add " + childDC.label,
                                       isChecked: "true",
                                       translations: [
                                          {
                                             language_code: "en",
                                             label: "Add " + childDC.label,
                                             aliasname: "Add " + childDC.label
                                          }
                                       ],
                                       parent: "0",
                                       position: "0",
                                       icon: "plus"
                                    }
                                 ]
                              },
                              translations: [
                                 {
                                    language_code: "en",
                                    label: childDC.label + ".menu"
                                 }
                              ],
                              position: {
                                 dx: 1,
                                 dy: 1
                              }
                           },
                           // Grid
                           {
                              key: ABViewGrid.common().key,
                              icon: ABViewGrid.common().icon,
                              label: childDC.label + "'s grid",
                              settings: {
                                 dataviewID: childDC.id,
                                 height: 300
                              },
                              position: {
                                 y: 1
                              }
                           }
                        );

                        tabSubChildren.views.push(tabView);
                     }
                     // Create a new page with form
                     else if (flag == "form") {
                        // add to menu
                        // menuSubPages.push(subAddPageId);

                        let newForm = _logic.getFormView(childDC, {
                           clearOnLoad: true,
                           redirectPageId: viewPageId
                        });

                        pages.push({
                           id: subAddPages[datacollectionId],
                           key: ABViewPage.common().key,
                           icon: ABViewPage.common().icon,
                           name: "Add " + childDC.label,
                           settings: {
                              type: "popup"
                           },
                           views: [
                              // Title
                              {
                                 key: ABViewLabel.common().key,
                                 icon: ABViewLabel.common().icon,
                                 label: "Title",
                                 text: "Add " + childDC.label,
                                 settings: {
                                    format: 1
                                 }
                              },
                              // Form
                              newForm.toObj()
                           ]
                        });
                     }
                  }
               });

               // Menu
               // viewsOfDetail.splice(1, 0, {
               //    key: ABViewMenu.common().key,
               //    icon: ABViewMenu.common().icon,
               //    label: "Menu",
               //    settings: {
               //       pages: menuSubPages
               //    },
               //    position: {
               //       y: 2
               //    }
               // });

               // Tab
               if (tabSubChildren.views && tabSubChildren.views.length)
                  viewsOfDetail.push(tabSubChildren);

               pages.push({
                  id: viewPageId,
                  key: ABViewPage.common().key,
                  icon: ABViewPage.common().icon,
                  name: "Details of " + CurrentDC.label,
                  settings: {
                     type: "popup"
                  },
                  views: viewsOfDetail
               });
            }

            // Add a grid to show data of data source
            if (formValues.showGrid) {
               views.push({
                  key: ABViewGrid.common().key,
                  icon: ABViewGrid.common().icon,
                  label: CurrentDC.label,
                  settings: {
                     dataviewID: CurrentDC.id,
                     height: 300,
                     editPage: formValues.editable ? editPageId : null,
                     detailsPage: formValues.viewable ? viewPageId : null
                  }
               });
            }

            // Edit form
            if (formValues.formAdd) {
               // add the title to the form
               views.push({
                  key: ABViewLabel.common().key,
                  icon: ABViewLabel.common().icon,
                  label: "Title",
                  text: "Add " + CurrentDC.label,
                  settings: {
                     format: 1
                  }
               });

               let editForm = _logic.getFormView(CurrentDC, {
                  includeCancel: true
               });

               // add the new form to page
               views.push(editForm.toObj());
            }

            // add a new tab into selected page
            if (CurrentPage && formValues.addToTab) {
               (pages || []).forEach((p) => {
                  CurrentPage._pages.push(CurrentPage.pageNew(p));
               });

               if (!CurrentPage._views) {
                  CurrentPage._views = [];
               }

               let updateTab = CurrentPage.views(
                  (v) => v.key == ABViewTab.common().key
               )[0];

               if (updateTab == null) {
                  let tabSettings = {
                     label: "Tab",
                     name: "Tab",
                     settings: {
                        height: 400,
                        minWidth: 0,
                        stackTabs: 0,
                        darkTheme: 1,
                        sidebarWidth: 200,
                        sidebarPos: "left",
                        iconOnTop: 0,
                        columnSpan: 1,
                        rowSpan: 1
                     },
                     views: []
                  };

                  updateTab = new ABViewTab(
                     tabSettings,
                     CurrentApplication,
                     CurrentPage
                  );

                  CurrentPage._views.push(updateTab);
               }

               let newTabViewSetting = {
                  name: CurrentDC.label,
                  label: CurrentDC.label,
                  settings: {
                     columns: "1",
                     removable: true,
                     movable: true,
                     height: 400
                  },
                  translations: [
                     {
                        language_code: "en",
                        label: CurrentDC.label
                     }
                  ],
                  views: views,
                  position: {
                     dx: 1,
                     dy: 1
                  },
                  pages: []
               };

               updateTab._views.push(
                  new ABViewContainer(
                     newTabViewSetting,
                     CurrentApplication,
                     updateTab
                  )
               );

               return {
                  useParent: true,
                  parent: CurrentPage,
                  label: CurrentPage.label
               };
            } else {
               return {
                  parent: CurrentPage, // should be either null or an {}
                  name: $$(ids.name)
                     .getValue()
                     .trim(),
                  key: ABViewPage.common().key,
                  views: views,
                  pages: pages
               };
            }
         }
      });

      // Our webix UI definition:
      this.ui = {
         view: "scrollview",
         id: ids.component,
         scroll: "y",
         height: 400,

         body: {
            rows: [
               {
                  view: "form",
                  id: ids.form,
                  elements: [
                     {
                        view: "select",
                        id: ids.parentList,
                        name: "parent",
                        label: labels.component.parentPage,
                        labelWidth: 170,
                        options: [],
                        on: { onChange: _logic.selectPage }
                     },
                     {
                        view: "select",
                        id: ids.selectDataCollection,
                        name: "dataviewID",
                        label: "Select a data collection",
                        labelWidth: 170,
                        options: [],
                        on: { onChange: _logic.selectDataCollection }
                     },
                     {
                        view: "text",
                        id: ids.name,
                        hidden: true,
                        name: "name",
                        label: labels.component.pageName,
                        placeholder: labels.component.placeholderPageName,
                        labelWidth: 170
                     },
                     { height: 10 },
                     {
                        view: "checkbox",
                        id: ids.addToTab,
                        name: "addToTab",
                        labelRight: 'Display <b>""</b> into a Tab',
                        labelWidth: 2
                     },
                     {
                        view: "checkbox",
                        id: ids.displayGrid,
                        name: "showGrid",
                        labelRight: 'Display multiple <b>""</b> in a Grid',
                        labelWidth: 2
                     },
                     {
                        view: "checkbox",
                        id: ids.addable,
                        name: "addable",
                        labelRight:
                           'A Menu button linked to a page to Add a new <b>""</b>',
                        labelWidth: 2
                     },
                     {
                        view: "checkbox",
                        id: ids.formAdd,
                        name: "formAdd",
                        labelRight: 'Add a new <b>""</b> with a Form',
                        labelWidth: 2
                     },
                     { height: 10 },
                     {
                        view: "label",
                        label:
                           "Each record in the Grid can be linked to a page that shows on Edit form or a page to View Details",
                        css: "ab-text-bold"
                     },
                     {
                        view: "checkbox",
                        id: ids.editable,
                        name: "editable",
                        labelRight: 'Edit selected <b>""</b>',
                        labelWidth: 2
                     },
                     {
                        view: "checkbox",
                        id: ids.viewable,
                        name: "viewable",
                        labelRight: 'View details of <b>""</b>',
                        labelWidth: 2
                     },
                     {
                        view: "form",
                        id: ids.subDVs,
                        borderless: true,
                        elements: []
                     }
                  ]
               }
            ]
         }
      };

      //
      // Define our external interface methods:
      //
      this.applicationLoad = _logic.applicationLoad;
      this.clear = _logic.clear;
      this.errors = _logic.errors;
      this.show = _logic.show;
      this.values = _logic.values;
      this.formBusy = _logic.formBusy;
      this.formReady = _logic.formReady;
   }
};
