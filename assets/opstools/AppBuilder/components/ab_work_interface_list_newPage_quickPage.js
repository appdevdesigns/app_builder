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
               CurrentApplication.datacollectionsIncluded().map((dc) => {
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

         getFormView: (datacollection, options = {}, parent) => {
            let formSettings = {
               key: ABViewForm.common().key,
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
            let newForm = parent.viewNew(formSettings);

            // populate fields to a form
            var allFieldSaves = [];
            let object = datacollection.datasource;
            if (object) {
               object.fields().forEach((f, index) => {
                  var field = newForm.addFieldToForm(f, index);
                  if (field) {
                     allFieldSaves.push(field.save());
                  }
               });
            }

            // Add action button to the form
            var button = newForm.viewNew({
               key: ABViewFormButton.common().key,
               label: "Form buttons",
               settings: {
                  includeSave: true,
                  includeCancel: options.includeCancel || false,
                  includeReset: false
               },
               position: {
                  y: object.fields().length
               }
            });
            newForm._views.push(button);
            allFieldSaves.push(button.save());
            // newForm._views.push(
            //    new ABViewFormButton(
            //       {
            //          label: "Form buttons",
            //          settings: {
            //             includeSave: true,
            //             includeCancel: options.includeCancel || false,
            //             includeReset: false
            //          },
            //          position: {
            //             y: object.fields().length
            //          }
            //       },
            //       CurrentApplication
            //    )
            // );

            return Promise.all(allFieldSaves).then(() => {
               return newForm;
            });
         },

         createFormPage: function(Label, parent = null, useDC = null) {
            var NewPage = null;
            var subViewSaves = [];
            if (!useDC) {
               useDC = CurrentDC;
            }

            return Promise.resolve()
               .then(() => {
                  // Add a 'add' page
                  NewPage = new ABViewPage(
                     {
                        name: Label,
                        label: Label,
                        settings: {
                           type: "popup"
                        }
                     },
                     CurrentApplication,
                     parent
                  );

                  // NOTE: the order we are doing this here:
                  // Create the object
                  // add to the Parent's ._views
                  // then object.save()
                  // when all child ._views are saved, then we
                  // perform the .save() on the Parent object.
                  // this will create all the Items with the fewest
                  // number of .save()s
                  var AddPageTitle = NewPage.viewNew({
                     key: ABViewLabel.common().key,
                     label: Label,
                     text: Label,
                     settings: {
                        format: 1
                     }
                  });
                  NewPage._views.push(AddPageTitle);
                  subViewSaves.push(AddPageTitle.save());
               })
               .then(() => {
                  return _logic
                     .getFormView(
                        useDC,
                        {
                           clearOnLoad: true
                        },
                        NewPage
                     )
                     .then((AddForm) => {
                        NewPage._views.push(AddForm);
                        subViewSaves.push(AddForm.save());
                     });
               })
               .then(() => {
                  return Promise.all(subViewSaves).then(() => {
                     // return the NewPage just before it should be .saved()
                     // so the parent can add it to it's .views
                     return NewPage;
                  });
               });
         },

         createMenu: function(options, Parent) {
            var settings = {
               key: ABViewMenu.common().key,
               label: "Menu",
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
                  menuTextLeft: "",
                  menuTextCenter: "",
                  menuTextRight: "",
                  pages: [],
                  order: []
               }
            };

            if (options.label) {
               settings.label = options.label;
               settings.translations = [
                  {
                     language_code: "en",
                     label: options.label
                  }
               ];
            }

            options.settings = options.settings || {};

            // copy over the base options:
            Object.keys(options).forEach((k) => {
               if (k != "settings") {
                  settings[k] = options[k];
               }
            });

            // now copy over the options.settings:
            var skipSettings = ["pages", "order"];
            Object.keys(options.settings).forEach((k) => {
               if (skipSettings.indexOf(k) == -1) {
                  settings.settings[k] = options.settings[k];
               }
            });

            (options.settings.pages || []).forEach((p) => {
               var pEntry = {
                  pageId: p.pageId,
                  tabId: "",
                  type: "page",
                  aliasname: p.label,
                  isChecked: true,
                  translations: [
                     {
                        language_code: "en",
                        label: p.label,
                        aliasname: p.label
                     }
                  ],
                  parent: 0,
                  position: 0,
                  icon: p.icon || "plus"
               };
               settings.settings.pages.push(pEntry);
               settings.settings.order.push(pEntry);
            });

            return Parent.viewNew(settings);
         },

         getDetailView: function() {
            // create a new detail instance
            var newDetail = new ABViewDetail(
               {
                  label: `Details of ${CurrentDC.label}`,
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
            var allFieldSaves = [];
            var object = CurrentDC.datasource;
            if (object) {
               object.fields().forEach((f, index) => {
                  var field = newDetail.addFieldToView(f, index);
                  allFieldSaves.push(field.save());
               });
            }

            return Promise.all(allFieldSaves).then(() => {
               return newDetail;
            });
         },

         createSubTab: function(parent) {
            var settings = {
               key: ABViewTab.common().key,
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
               position: {
                  y: 2
               }
            };

            return parent.viewNew(settings);
         },

         createTabView: function(parent, childDC) {
            var settings = {
               key: "viewcontainer",
               icon: "braille",
               tabicon: "",
               name: childDC.label,
               settings: {
                  columns: 1,
                  removable: true,
                  movable: true
               },
               translations: [
                  {
                     language_code: "en",
                     label: childDC.label
                  }
               ],
               position: {
                  dx: 1,
                  dy: 1
               }
            };

            var tabView = parent.viewNew(settings);

            return Promise.resolve()
               .then(() => {
                  // add Menu
                  var menu = _logic.createMenu(
                     {
                        name: `${childDC.label}.menu`,
                        label: `${childDC.label}.menu`,
                        settings: {
                           menuTheme: "webix_dark",
                           menuTextLeft: childDC.label,
                           pages: [
                              {
                                 pageId: OP.Util.uuid(), // Q: So what really goes here? : subAddPages[datacollectionId],
                                 label: `Add ${childDC.label}`,
                                 icon: "plus"
                              }
                           ]
                        }
                     },
                     tabView
                  );
                  tabView._views.push(menu);

                  // add Grid
                  var grid = tabView.viewNew({
                     key: ABViewGrid.common().key,
                     label: `${childDC.label}'s grid`,
                     settings: {
                        dataviewID: childDC.id,
                        height: 300
                     },
                     position: {
                        y: 1
                     }
                  });
                  tabView._views.push(grid);

                  var allSaves = [];
                  allSaves.push(menu.save());
                  allSaves.push(grid.save());
                  return Promise.all(allSaves);
               })
               .then(() => {
                  return tabView;
               });
         },

         values: function() {
            if (!CurrentDC || !CurrentDC.datasource) {
               return Promise.resolve(() => {
                  return null;
               });
            }

            // TODO : validate unique page's name
            let formValues = $$(ids.form).getValues(),
               subValues = $$(ids.subDVs).getValues();

            let currLabel = CurrentDC.datasource.label;

            // Now that we need .ids, this should be a Promise chain
            // so we can perform the necessary .save() and get the id's
            var BasePage = null;
            var EditPage = null;
            var ViewPage = null;

            return Promise.resolve()
               .then(() => {
                  // Create the Base Page That we will add subPages and Views to:
                  BasePage = new ABViewPage(
                     {
                        name: $$(ids.name)
                           .getValue()
                           .trim()
                     },
                     CurrentApplication
                  );
               })
               .then(() => {
                  // Start with the AddPage

                  if (formValues.addable) {
                     // addPageId = OP.Util.uuid();
                     var AddPage = null;
                     return _logic
                        .createFormPage(`Add ${currLabel}`, BasePage)
                        .then((newAddPage) => {
                           AddPage = newAddPage;
                           BasePage._pages.push(AddPage);
                           AddPage.parent = BasePage;
                           return AddPage.save();
                        })
                        .then(() => {
                           // Add a menu to the BasePage:
                           var menu = _logic.createMenu(
                              {
                                 settings: {
                                    menuTheme: "webix_dark",
                                    menuTextLeft: currLabel,
                                    pages: [
                                       {
                                          pageId: AddPage.id,
                                          label: `Add ${currLabel}`
                                       }
                                    ]
                                 }
                              },
                              BasePage
                           );
                           BasePage._views.push(menu);
                           return menu.save();
                        });
                  } //  end if addable
               })
               .then(() => {
                  // Add a 'edit' page
                  if (formValues.editable) {
                     // editPageId = OP.Util.uuid();

                     return _logic
                        .createFormPage(`Edit ${currLabel}`, BasePage)
                        .then((newPage) => {
                           EditPage = newPage;
                           BasePage._pages.push(EditPage);
                           EditPage.parent = BasePage;
                           return EditPage.save();
                        });
                  }
               })
               .then(() => {
                  // View Page
                  if (formValues.viewable) {
                     return Promise.resolve()
                        .then(() => {
                           // create the View Page
                           ViewPage = new ABViewPage(
                              {
                                 name: `Details of ${currLabel}`,
                                 settings: {
                                    type: "popup"
                                 }
                              },
                              CurrentApplication
                           );
                        })
                        .then(() => {
                           // add Menu & Title
                           var menu = _logic.createMenu(
                              {
                                 settings: {
                                    menuTheme: "bg_gray",
                                    menuTextLeft: `Details ${currLabel}`,
                                    pages: [
                                       {
                                          pageId: EditPage.id,
                                          label: `Edit ${currLabel}`
                                       }
                                    ]
                                 }
                              },
                              ViewPage
                           );
                           ViewPage._views.push(menu);
                           return menu.save();
                        })
                        .then(() => {
                           // add new Detail View
                           return _logic.getDetailView().then((newDetail) => {
                              newDetail.position = newDetail.position || {};
                              newDetail.position.y = 1;

                              ViewPage._views.push(newDetail);
                              newDetail.parent = ViewPage;
                              return newDetail.save();
                           });
                        })
                        .then(() => {
                           return new Promise((resolve, reject) => {
                              // Process Any SubValues
                              let tabSubChildren = null;
                              let subAddPages = {}; // { dataCollectionId: "uuid", pageId: "uuid" }

                              var allKeys = Object.keys(subValues);
                              function processKey(cb) {
                                 // # {fn} processKey
                                 // recursively process each subValue key and create
                                 // the appropriate Tab or Page

                                 // when finished, call the cb()
                                 if (allKeys.length == 0) {
                                    cb();
                                 } else {
                                    // get the next key
                                    var key = allKeys.shift();
                                    if (subValues[key]) {
                                       let vals = key.split("|"),
                                          datacollectionId = vals[0],
                                          flag = vals[1]; // 'list' or 'form'

                                       let childDC = CurrentApplication.datacollections(
                                          (dc) => dc.id == datacollectionId
                                       )[0];

                                       if (
                                          subAddPages[datacollectionId] == null
                                       )
                                          subAddPages[
                                             datacollectionId
                                          ] = OP.Util.uuid();

                                       // Add grids of sub-dcs
                                       if (flag == "list") {
                                          if (!tabSubChildren) {
                                             tabSubChildren = _logic.createSubTab(
                                                ViewPage
                                             );
                                             tabSubChildren.____allTabViewSaves =
                                                tabSubChildren.____allTabViewSaves ||
                                                [];
                                          }
                                          _logic
                                             .createTabView(
                                                tabSubChildren,
                                                childDC
                                             )
                                             .then((tabView) => {
                                                tabSubChildren._views.push(
                                                   tabView
                                                );
                                                tabSubChildren.____allTabViewSaves.push(
                                                   tabView.save()
                                                );
                                                processKey(cb);
                                             });
                                       }
                                       // Create a new page with form
                                       else if (flag == "form") {
                                          // add to menu
                                          // menuSubPages.push(subAddPageId);

                                          _logic
                                             .createFormPage(
                                                `Add ${childDC.label}`,
                                                BasePage,
                                                childDC
                                             )
                                             .then((newAddPage) => {
                                                BasePage._pages.push(
                                                   newAddPage
                                                );
                                                newAddPage.parent = BasePage;
                                                return newAddPage.save();
                                             })
                                             .then(() => {
                                                processKey(cb);
                                             });
                                       } else {
                                          console.warn(
                                             `QuickPage:value():unknown subvalue flag [${flag}] => should be ["list","form"]`
                                          );
                                          processKey(cb);
                                       }
                                    } // if (subValues[key]);
                                    else {
                                       processKey(cb);
                                    }
                                 }
                              } // processKey
                              processKey((err) => {
                                 // now attach tab to ViewPage
                                 if (tabSubChildren) {
                                    Promise.all(
                                       tabSubChildren.____allTabViewSaves
                                    )
                                       .then(() => {
                                          ViewPage._views.push(tabSubChildren);
                                          return tabSubChildren.save();
                                       })
                                       .then(() => {
                                          resolve();
                                       });
                                 } else {
                                    resolve();
                                 }
                              });
                           }); // end Promise
                        })
                        .then(() => {
                           // ViewPage Final Step: Add ViewPage to BasePage:
                           BasePage._pages.push(ViewPage);
                           ViewPage.parent = BasePage;
                           return ViewPage.save();
                        });
                  }
               })
               .then(() => {
                  var allSaves = [];
                  if (formValues.showGrid) {
                     var grid = BasePage.viewNew({
                        key: ABViewGrid.common().key,
                        label: currLabel,
                        settings: {
                           dataviewID: CurrentDC.id,
                           height: 300,
                           editPage: formValues.editable ? EditPage.id : null,
                           detailsPage: formValues.viewable ? ViewPage.id : null
                        }
                     });
                     BasePage._views.push(grid);
                     allSaves.push(grid.save());
                  }

                  if (formValues.formAdd) {
                     // add the title to the form
                     var title = BasePage.viewNew({
                        key: ABViewLabel.common().key,
                        label: "Title",
                        text: `Add ${currLabel}`,
                        settings: {
                           format: 1
                        }
                     });
                     BasePage._views.push(title);
                     allSaves.push(title.save());

                     allSaves.push(
                        _logic
                           .getFormView(
                              CurrentDC,
                              {
                                 includeCancel: true
                              },
                              BasePage
                           )
                           .then((editForm) => {
                              BasePage._views.push(editForm);
                              return editForm.save();
                           })
                     );
                  }

                  return Promise.all(allSaves);
               })
               .then(() => {
                  // add a new tab into selected page
                  if (CurrentPage && formValues.addToTab) {
                     var tabSaves = [];

                     (BasePage.pages() || []).forEach((p) => {
                        CurrentPage._pages.push(p);
                        p.parent = CurrentPage;
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
                           }
                        };

                        updateTab = new ABViewTab(
                           tabSettings,
                           CurrentApplication,
                           CurrentPage
                        );

                        CurrentPage._views.push(updateTab);
                        tabSaves.push(updateTab.save());
                     }

                     return Promise.all(tabSaves)
                        .then(() => {
                           let newTabViewSetting = {
                              name: currLabel,
                              label: currLabel,
                              settings: {
                                 columns: "1",
                                 removable: true,
                                 movable: true,
                                 height: 400
                              },
                              translations: [
                                 {
                                    language_code: "en",
                                    label: currLabel
                                 }
                              ],
                              position: {
                                 dx: 1,
                                 dy: 1
                              }
                           };
                           var tabView = new ABViewContainer(
                              newTabViewSetting,
                              CurrentApplication,
                              updateTab
                           );
                           // Transfer all the views from the BasePage
                           // into the tabView
                           tabView._views = BasePage._views;
                           updateTab._views.push(tabView);

                           // Now make sure all these are Saved with the latest changes:
                           return tabView
                              .save()
                              .then(() => {
                                 return updateTab.save();
                              })
                              .then(() => {
                                 return CurrentPage.save();
                              });
                        })
                        .then(() => {
                           return {
                              useParent: true,
                              parent: CurrentPage,
                              label: CurrentPage.label
                           };
                        });
                  } else {
                     // Final Step, return the definition of the BasePage:
                     // since the ab_work_interface_list_newPage will create an
                     // instance of it withing the CurrentApplication.
                     return BasePage.toObj();
                  }
               });
         } // end values()
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
