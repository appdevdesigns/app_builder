steal(
   // List your Controller's dependencies here:

   function() {
      System.import("appdev").then(function() {
         System.import("opstools/BuildApp").then(function() {
            steal
               .import("appdev/ad", "appdev/control/control")
               .then(function() {
                  // Namespacing conventions:
                  // AD.Control.extend('[application].[controller]', [{ static },] {instance} );
                  AD.Control.extend("opstools.BuildApp.ABLiveTool", {
                     init: function(element, options) {
                        var self = this;

                        if (!webix.env.touch && webix.env.scrollSize)
                           webix.CustomScroll.init();

                        options = AD.defaults(
                           {
                              app: -1,
                              page: -1,
                              areaKey: "",
                              toolKey: -1
                           },
                           options
                        );
                        self.options = options;

                        // Call parent init
                        self._super(element, options);

                        // Validate
                        if (options.app == null || options.app < 0) {
                           AD.error.log("Application id is invalid.");
                           return;
                        }

                        if (options.page == null || options.page < 0) {
                           AD.error.log("Page id is invalid.");
                           return;
                        }

                        self.containerDomID = self.unique(
                           "ab_live_tool",
                           self.options.app,
                           self.options.page
                        );

                        self.debounceResize = false;
                        self.resizeValues = {
                           height: 0,
                           width: 0
                        };

                        self.App = new OP.Component(
                           null,
                           self.containerDomID
                        ).App;

                        // Store page/sub page .components()
                        // These values will be defined in .renderPage()
                        self.pageComponents = {}; // { pageId: component }

                        // Has this app been selected by the user yet?
                        self.activated = false;

                        self.initDOM();
                        self.initModels();

                        self.__events = {};

                        if (self.__events.areaShow == null)
                           self.__events.areaShow = AD.comm.hub.subscribe(
                              "opsportal.area.show",
                              function(message, data) {
                                 self.menuChange(data.area);
                              }
                           );

                        if (self.__events.toolShow == null)
                           self.__events.toolShow = AD.comm.hub.subscribe(
                              "opsportal.tool.show",
                              function(message, data) {
                                 self.menuChange(data.area, data.tool);
                              }
                           );

                        if (self.__events.resize == null)
                           self.__events.resize = AD.comm.hub.subscribe(
                              "opsportal.resize",
                              function(message, data) {
                                 if (data && data.height) {
                                    self.height = data.height;
                                 }
                                 self.debounceResize = false; // if we do not set this the resize is never set
                                 self.resize(self.height);
                              }
                           );

                        if (self.__events.adjust == null)
                           self.__events.adjust = AD.comm.hub.subscribe(
                              "component.adjust",
                              function(message, data) {
                                 self.containerID = null;
                                 if (data && data.containerID) {
                                    self.containerID = data.containerID;
                                 }
                                 self.adjust(self.containerID);
                              }
                           );

                        // Check this is active
                        self.menuChange();

                        // FIX: If there is only menu item, then click the first item to default
                        var menuList = document.getElementsByClassName(
                           "op-list"
                        )[0];
                        if (menuList) {
                           var menuItems = menuList.getElementsByClassName(
                              "op-container"
                           );
                           if (menuItems.length === 1) {
                              menuItems[0].click();
                           }
                        }
                     },

                     initQTT: function() {
                        var self = this;

                        var quickTranslationTool = {
                           view: "scrollview",
                           css: "lightgray ab_amp",
                           body: {
                              rows: [
                                 {
                                    view: "accordion",
                                    id: "qtt_accordion_" + self.containerDomID,
                                    roles: [],
                                    hidden: true,
                                    collapsed: true,
                                    css: "webix_dark",
                                    rows: []
                                 },
                                 {
                                    id:
                                       "qtt_accordion_noSelection_" +
                                       self.containerDomID,
                                    rows: [{}]
                                 }
                              ]
                           }
                        };

                        webix.ui({
                           view: "window",
                           css: "qttWindow",
                           id: "quickTranslationTool_" + self.containerDomID,
                           position: function(state) {
                              state.left = state.maxWidth - 400; // fixed values
                              state.top = 0;
                              state.width = 400; // relative values
                              state.height = state.maxHeight;
                           },
                           on: {
                              onShow: () => {
                                 // collapse all the accordion items but the top one
                                 var index = 0;
                                 $$("qtt_accordion_" + self.containerDomID)
                                    .getChildViews()
                                    .forEach((a) => {
                                       if (index == 0) {
                                          $$(a).expand();
                                       } else {
                                          $$(a).collapse();
                                       }
                                       index++;
                                       $$(
                                          "qtt_accordion_" + self.containerDomID
                                       ).show();
                                       $$(
                                          "qtt_accordion_noSelection_" +
                                             self.containerDomID
                                       ).hide();
                                    });
                              }
                           },
                           head: {
                              rows: [
                                 {
                                    view: "toolbar",
                                    css: "webix_dark",
                                    cols: [
                                       {
                                          width: 15
                                       },
                                       {
                                          view: "label",
                                          label: "Translation Tool",
                                          autowidth: true
                                       },
                                       {},
                                       {
                                          view: "button",
                                          width: 38,
                                          css: "webix_transparent",
                                          icon: "fa fa-cog",
                                          type: "iconTop",
                                          click: function() {
                                             if (
                                                $$("translationSettings").config
                                                   .hidden
                                             ) {
                                                $$(
                                                   "translationSettings"
                                                ).show();
                                             } else {
                                                $$(
                                                   "translationSettings"
                                                ).hide();
                                             }
                                          }
                                       },
                                       {
                                          view: "button",
                                          width: 35,
                                          css: "webix_transparent",
                                          type: "icon",
                                          icon: "nomargin fa fa-times",
                                          click: () => {
                                             $$(
                                                "quickTranslationTool_" +
                                                   self.containerDomID
                                             ).hide();
                                          }
                                       }
                                    ]
                                 },
                                 {
                                    view: "toolbar",
                                    id: "translationSettings",
                                    hidden: true,
                                    css: "webix_dark",
                                    rows: [
                                       {
                                          id:
                                             "qtt_accordion_" +
                                             self.containerDomID +
                                             "_translateTo",
                                          view: "select",
                                          labelWidth: 120,
                                          label: "Translate to:",
                                          labelAlign: "right",
                                          options: [],
                                          on: {
                                             onChange: (newVal, oldVal) => {
                                                if (newVal != oldVal) {
                                                   self.buildTranslationAccordion(
                                                      self.data.application
                                                         ._objects,
                                                      self.data.application
                                                         ._pages
                                                   );
                                                }
                                             }
                                          }
                                       },
                                       {
                                          id:
                                             "qtt_accordion_" +
                                             self.containerDomID +
                                             "_translateHint",
                                          view: "select",
                                          labelWidth: 120,
                                          label: "Hint language:",
                                          bottomLabel:
                                             "*Hover over label to display hint",
                                          labelAlign: "right",
                                          options: [],
                                          on: {
                                             onChange: (newVal, oldVal) => {
                                                if (newVal != oldVal) {
                                                   self.buildTranslationAccordion(
                                                      self.data.application
                                                         ._objects,
                                                      self.data.application
                                                         ._pages
                                                   );
                                                }
                                             }
                                          }
                                       }
                                    ]
                                 }
                              ]
                           },
                           body: quickTranslationTool
                        });

                        var languageList = [];

                        AD.lang.list().then(function(list) {
                           for (const property in list) {
                              languageList.push({
                                 id: property,
                                 value: list[property]
                              });
                           }
                           $$(
                              "qtt_accordion_" +
                                 self.containerDomID +
                                 "_translateTo"
                           ).define({
                              options: languageList,
                              value: AD.lang.currentLanguage
                           });
                           $$(
                              "qtt_accordion_" +
                                 self.containerDomID +
                                 "_translateTo"
                           ).refresh();
                           $$(
                              "qtt_accordion_" +
                                 self.containerDomID +
                                 "_translateHint"
                           ).define({
                              options: languageList,
                              value: languageList[0].id
                           });
                           $$(
                              "qtt_accordion_" +
                                 self.containerDomID +
                                 "_translateHint"
                           ).refresh();
                           self.buildTranslationAccordion(
                              self.data.application._objects,
                              self.data.application._pages
                           );
                        });

                        webix.ready(function() {
                           webix.protoUI(
                              {
                                 name: "edittree"
                              },
                              webix.EditAbility,
                              webix.ui.tree
                           );
                        });

                        $(`#qttButton_${self.containerDomID}`).show();
                     },

                     buildTranslationAccordion: function(objects, views) {
                        var self = this;
                        var objects = objects;
                        var views = views;

                        $$("qtt_accordion_" + self.containerDomID).removeView(
                           "qtt_accordionitem_" +
                              self.containerDomID +
                              "_objects"
                        );
                        $$("qtt_accordion_" + self.containerDomID).removeView(
                           "qtt_accordionitem_" + self.containerDomID + "_views"
                        );

                        var toggleParent = (element) => {
                           if (!element.parent) return false;
                           var parentElem = element.parent;
                           if (!parentElem.parent) return false;
                           parentElem.parent.emit("changeTab", parentElem.id);
                           toggleParent(parentElem.parent);
                        };

                        var objectTree = [
                           {
                              id: "qtt_object_progress" + self.containerDomID,
                              height: 7
                           },
                           {
                              id:
                                 "linetree_" + self.containerDomID + "_objects",
                              view: "edittree",
                              type: "lineTree",
                              editable: true,
                              tooltip: "#hint#",
                              // role: role,
                              editor: "text",
                              editValue: "value",
                              template: (obj, common) => {
                                 let language = $$(
                                    "qtt_accordion_" +
                                       self.containerDomID +
                                       "_translateTo"
                                 ).getValue();
                                 var color = "gray";
                                 if (
                                    obj.value.indexOf("[" + language + "]") > -1
                                 ) {
                                    color = "#ff5c4c";
                                 }
                                 if (!obj.icon) {
                                    obj.icon = "minus";
                                 }
                                 var icon = `<span class="fa-stack" style="margin: 0 5px 0 4px;">
                                             <i style="color: ${color};" class="fa fa-circle fa-stack-2x"></i>
                                             <i class="fa fa-${obj.icon} fa-stack-1x fa-inverse"></i>
                                          </span>`;
                                 return (
                                    `<span>` +
                                    icon +
                                    common.icon(obj, common) +
                                    `<span>${obj.value}</span>`
                                 );
                              },
                              data: [],
                              on: {
                                 onAfterLoad: function(id) {
                                    if (
                                       !$$(
                                          "qtt_object_progress" +
                                             self.containerDomID
                                       ).showProgress
                                    ) {
                                       webix.extend(
                                          $$(
                                             "qtt_object_progress" +
                                                self.containerDomID
                                          ),
                                          webix.ProgressBar
                                       );
                                    }
                                    $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_objects"
                                    ).parse(
                                       self.getTranslationToolObjectsTree(
                                          objects,
                                          self.containerDomID
                                       )
                                    );
                                    $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_objects"
                                    ).openAll();
                                 },
                                 onAfterEditStop: (
                                    state,
                                    editor,
                                    ignoreUpdate
                                 ) => {
                                    if (state.old == state.value) return false;
                                    let language = $$(
                                       "qtt_accordion_" +
                                          self.containerDomID +
                                          "_translateTo"
                                    ).getValue();
                                    let branch = $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_objects"
                                    ).data.getItem(editor.id);
                                    let propName = branch.field;
                                    let objectId = branch.objectId
                                       ? branch.objectId
                                       : branch.id;
                                    let fieldId = branch.fieldId
                                       ? branch.fieldId
                                       : "";
                                    let obj = self.data.application.objectByID(
                                       objectId
                                    );
                                    if (fieldId) {
                                       let field = obj.fields((item) => {
                                          return item.id == fieldId;
                                       })[0];
                                       if (branch.type == "option") {
                                          field.settings.options.forEach(
                                             (option) => {
                                                if (option.id == branch.id) {
                                                   if (
                                                      obj.languageDefault() ==
                                                      language
                                                   ) {
                                                      hasLang = true;
                                                      option[propName] =
                                                         state.value;
                                                   } else {
                                                      option.translations.forEach(
                                                         (t) => {
                                                            if (
                                                               t.language_code ==
                                                               language
                                                            ) {
                                                               hasLang = true;
                                                               t[propName] =
                                                                  state.value;
                                                            }
                                                         }
                                                      );
                                                   }
                                                   if (!hasLang) {
                                                      var trans = {};
                                                      trans.language_code = language;
                                                      trans[propName] =
                                                         state.value;
                                                      option.translations.push(
                                                         trans
                                                      );
                                                   }
                                                   field.save();
                                                }
                                             }
                                          );
                                       } else {
                                          var hasLang = false;
                                          if (
                                             obj.languageDefault() == language
                                          ) {
                                             hasLang = true;
                                             field[propName] = state.value;
                                          } else {
                                             field.translations.forEach((t) => {
                                                if (
                                                   t.language_code == language
                                                ) {
                                                   hasLang = true;
                                                   t[propName] = state.value;
                                                }
                                             });
                                          }
                                          if (!hasLang) {
                                             var trans = {};
                                             trans.language_code = language;
                                             trans[propName] = state.value;
                                             field.translations.push(trans);
                                          }
                                          field.save();
                                       }
                                    } else {
                                       var hasLang = false;
                                       if (obj.languageDefault() == language) {
                                          hasLang = true;
                                          obj[propName] = state.value;
                                       } else {
                                          obj.translations.forEach((t) => {
                                             if (t.language_code == language) {
                                                hasLang = true;
                                                t[propName] = state.value;
                                             }
                                          });
                                       }
                                       if (!hasLang) {
                                          var trans = {};
                                          trans.language_code = language;
                                          trans[propName] = state.value;
                                          obj.translations.push(trans);
                                       }
                                       obj.save();
                                    }
                                    debugger;
                                    let progressBar = $$(
                                       "qtt_object_progress" +
                                          self.containerDomID
                                    );
                                    let total = progressBar.config.total;
                                    let completed =
                                       progressBar.config.completed;
                                    debugger;
                                    if (
                                       state.old.indexOf(
                                          "[" + language + "]"
                                       ) == -1 &&
                                       state.value.indexOf(
                                          "[" + language + "]"
                                       ) > -1
                                    ) {
                                       completed--;
                                    } else if (
                                       state.old.indexOf("[" + language + "]") >
                                          -1 &&
                                       state.value.indexOf(
                                          "[" + language + "]"
                                       ) > -1
                                    ) {
                                       // no change to completed count
                                    } else {
                                       completed++;
                                    }
                                    let position = completed / total + 0.00001;
                                    progressBar.define({
                                       total: total,
                                       completed: completed
                                    });
                                    progressBar.showProgress({
                                       type: "top",
                                       position: position
                                    });
                                 }
                              }
                           }
                        ];

                        var viewTree = [
                           {
                              id: "qtt_view_progress" + self.containerDomID,
                              height: 7
                           },
                           {
                              id: "linetree_" + self.containerDomID + "_views",
                              view: "edittree",
                              type: "lineTree",
                              editable: true,
                              tooltip: "#hint#",
                              // role: role,
                              editor: "text",
                              editValue: "value",
                              template: (obj, common) => {
                                 let language = $$(
                                    "qtt_accordion_" +
                                       self.containerDomID +
                                       "_translateTo"
                                 ).getValue();
                                 var color = "gray";
                                 if (
                                    obj.value.indexOf("[" + language + "]") > -1
                                 ) {
                                    color = "#ff5c4c";
                                 }
                                 if (!obj.icon) {
                                    obj.icon = "minus";
                                 }
                                 var externalLink = "";
                                 if (
                                    ["button", "label", "menu"].indexOf(
                                       obj.type
                                    ) == -1
                                 ) {
                                    externalLink = `<i style="float:right; color: lightgray" class="externalLink fa fa-external-link"></i>`;
                                 }
                                 var icon = `<span class="fa-stack" style="margin: 0 5px 0 4px;">
                                             <i style="color: ${color};" class="fa fa-circle fa-stack-2x"></i>
                                             <i class="fa fa-${obj.icon} fa-stack-1x fa-inverse"></i>
                                          </span>`;
                                 return (
                                    `<span>` +
                                    icon +
                                    common.icon(obj, common) +
                                    `<span>${obj.value}</span>` +
                                    externalLink
                                 );
                              },
                              data: [],
                              onClick: {
                                 externalLink: (event, branch, target) => {
                                    var item = $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_views"
                                    ).getItem(branch);
                                    if (item.type == "tab") {
                                       self.showPage(item.pageId);

                                       var tabView = self.rootPage.application.views(
                                          (v) => v.id == item.id
                                       )[0];
                                       if (!tabView) return false;

                                       var tab = tabView.parent;
                                       if (!tab) return false;

                                       toggleParent(tab);
                                       if (
                                          !$$(tabView.id) ||
                                          !$$(tabView.id).isVisible()
                                       ) {
                                          var showIt = setInterval(function() {
                                             if (
                                                $$(tabView.id) &&
                                                $$(tabView.id).isVisible()
                                             ) {
                                                clearInterval(showIt);
                                             }
                                             tab.emit("changeTab", tabView.id);
                                          }, 200);
                                       }
                                    }
                                    // switch page
                                    else {
                                       self.showPage(item.id);
                                    }

                                    return false;
                                 }
                              },
                              on: {
                                 onAfterLoad: function(id) {
                                    if (
                                       !$$(
                                          "qtt_view_progress" +
                                             self.containerDomID
                                       ).showProgress
                                    ) {
                                       webix.extend(
                                          $$(
                                             "qtt_view_progress" +
                                                self.containerDomID
                                          ),
                                          webix.ProgressBar
                                       );
                                    }
                                    $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_views"
                                    ).parse(
                                       self.getTranslationToolViewsTree(
                                          views,
                                          self.containerDomID
                                       )
                                    );
                                    $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_views"
                                    ).openAll();
                                 },
                                 onAfterEditStop: (
                                    state,
                                    editor,
                                    ignoreUpdate
                                 ) => {
                                    if (state.old == state.value) return false;
                                    let language = $$(
                                       "qtt_accordion_" +
                                          self.containerDomID +
                                          "_translateTo"
                                    ).getValue();
                                    let branch = $$(
                                       "linetree_" +
                                          self.containerDomID +
                                          "_views"
                                    ).data.getItem(editor.id);
                                    let propName = branch.field;
                                    if (branch.type == "menu") {
                                       let view = self.data.application.views(
                                          (view) => {
                                             return view.id == branch.viewId;
                                          }
                                       )[0];
                                       view.settings.order.forEach((button) => {
                                          if (
                                             button.pageId == branch.buttonId
                                          ) {
                                             var hasLang = false;
                                             button.translations.forEach(
                                                (t) => {
                                                   if (
                                                      t.language_code ==
                                                      language
                                                   ) {
                                                      hasLang = true;
                                                      t[propName] = state.value;
                                                   }
                                                }
                                             );
                                             if (!hasLang) {
                                                var trans = {};
                                                trans.language_code = language;
                                                trans[propName] = state.value;
                                                button.translations.push(trans);
                                             }
                                             view.save();
                                          }
                                       });
                                    } else if (branch.type == "button") {
                                       let view = self.data.application.views(
                                          (view) => {
                                             return view.id == branch.viewId;
                                          }
                                       )[0];
                                       var hasLang = false;

                                       if (view.languageDefault() == language) {
                                          hasLang = true;
                                          view.settings[propName] = state.value;
                                       } else {
                                          view.settings.translations.forEach(
                                             (t) => {
                                                if (
                                                   t.language_code == language
                                                ) {
                                                   hasLang = true;
                                                   t[propName] = state.value;
                                                }
                                             }
                                          );
                                       }
                                       if (!hasLang) {
                                          var trans = {};
                                          trans.language_code = language;
                                          trans[propName] = state.value;
                                          view.settings.translations.push(
                                             trans
                                          );
                                       }
                                       view.save();
                                    } else {
                                       let view = self.data.application.views(
                                          (view) => {
                                             return view.id == branch.id;
                                          }
                                       )[0];
                                       var hasLang = false;
                                       if (view.languageDefault() == language) {
                                          hasLang = true;
                                          view[propName] = state.value;
                                       } else {
                                          view.translations.forEach((t) => {
                                             if (t.language_code == language) {
                                                hasLang = true;
                                                t[propName] = state.value;
                                             }
                                          });
                                       }
                                       if (!hasLang) {
                                          var trans = {};
                                          trans.language_code = language;
                                          trans[propName] = state.value;
                                          view.translations.push(trans);
                                       }
                                       view.save();
                                    }
                                    let progressBar = $$(
                                       "qtt_view_progress" + self.containerDomID
                                    );
                                    let total = progressBar.config.total;
                                    let completed =
                                       progressBar.config.completed;
                                    if (
                                       state.old.indexOf(
                                          "[" + language + "]"
                                       ) == -1 &&
                                       state.value.indexOf(
                                          "[" + language + "]"
                                       ) > -1
                                    ) {
                                       completed--;
                                    } else if (
                                       state.old.indexOf("[" + language + "]") >
                                          -1 &&
                                       state.value.indexOf(
                                          "[" + language + "]"
                                       ) > -1
                                    ) {
                                       // no change to completed count
                                    } else {
                                       completed++;
                                    }
                                    let position = completed / total + 0.00001;
                                    progressBar.define({
                                       total: total,
                                       completed: completed
                                    });
                                    progressBar.showProgress({
                                       type: "top",
                                       position: position
                                    });
                                 }
                              }
                           }
                        ];

                        var objectsAccordionItem = {
                           view: "accordionitem",
                           id:
                              "qtt_accordionitem_" +
                              self.containerDomID +
                              "_objects",
                           header: "Data Objects",
                           collapsed: true,
                           body: {
                              type: "clean",
                              rows: objectTree
                           }
                        };

                        var viewsAccordionItem = {
                           view: "accordionitem",
                           id:
                              "qtt_accordionitem_" +
                              self.containerDomID +
                              "_views",
                           header: "Interface Items",
                           collapsed: true,
                           body: {
                              type: "clean",
                              rows: viewTree
                           }
                        };

                        $$("qtt_accordion_" + self.containerDomID).addView(
                           objectsAccordionItem,
                           -1
                        );
                        $$("qtt_accordion_" + self.containerDomID).addView(
                           viewsAccordionItem,
                           -1
                        );
                        $$("qtt_accordion_" + self.containerDomID).show();
                        $$(
                           "qtt_accordion_noSelection_" + self.containerDomID
                        ).hide();

                        $$(
                           "linetree_" + self.containerDomID + "_objects"
                        ).openAll();
                        $$(
                           "linetree_" + self.containerDomID + "_views"
                        ).openAll();
                     },

                     initAMP: function() {
                        var self = this;
                        // This is also defined in assets/opstools/AppBuilder/classes/core/views/ABViewCore.js
                        // In the furture we can remove from this location when App Builder is not dependant on OpsPortal
                        self.accessLevels = [
                           {
                              id: "0",
                              value: "No Access"
                           },
                           {
                              id: "1",
                              value: "Read Only"
                           },
                           {
                              id: "2",
                              value: "Full Access"
                           }
                        ];

                        var newRolePopup = {
                           view: "popup",
                           id: "role_popup_" + self.containerDomID,
                           position: "center",
                           height: 250,
                           width: 350,
                           modal: true,
                           body: {
                              rows: [
                                 {
                                    view: "toolbar",
                                    id: "myToolbarABLiveTool",
                                    css: "webix_dark",
                                    cols: [
                                       {
                                          view: "label",
                                          label: "Add Role",
                                          align: "center"
                                       }
                                    ]
                                 },
                                 {
                                    view: "form",
                                    elements: [
                                       /* We are not managing users yet so take this out
                                       {
                                         view: "text",
                                         label: "Create new",
                                         labelWidth: 90
                                       },
                                       {
                                         view: "label",
                                         label: "- or -",
                                         align: "center"
                                       },*/
                                       {
                                          view: "combo",
                                          label: "",
                                          id:
                                             "role_popup_options_" +
                                             self.containerDomID,
                                          placeholder: "Choose role",
                                          options: []
                                       },
                                       {
                                          cols: [
                                             {
                                                view: "button",
                                                value: "Cancel",
                                                click: () => {
                                                   $$(
                                                      "role_popup_" +
                                                         self.containerDomID
                                                   ).hide();
                                                }
                                             },
                                             {
                                                view: "button",
                                                value: "Add",
                                                id:
                                                   "role_popup_options_add_" +
                                                   self.containerDomID,
                                                css: "webix_primary",
                                                click: () => {
                                                   var role = $$(
                                                      "role_popup_options_" +
                                                         self.containerDomID
                                                   ).getValue();
                                                   if (
                                                      $$(
                                                         "amp_accordionitem_" +
                                                            self.containerDomID +
                                                            "_" +
                                                            role
                                                      )
                                                   ) {
                                                      $$(
                                                         "amp_accordionitem_" +
                                                            self.containerDomID +
                                                            "_" +
                                                            role
                                                      ).show();
                                                      $$(
                                                         "amp_accordion_" +
                                                            self.containerDomID
                                                      ).config.roles.push(role);
                                                   } else {
                                                      self.buildAccessAccordion(
                                                         role
                                                      );
                                                   }
                                                   $$(
                                                      "role_popup_" +
                                                         self.containerDomID
                                                   ).hide();
                                                }
                                             }
                                          ]
                                       }
                                    ]
                                 }
                              ]
                           }
                        };

                        /* This is the sample UI for managing users we decided not to implement this yet
                        var manageUsersPopup = {
                           view: "popup",
                           id: "user_popup_" + this.containerDomID,
                           position: "center",
                           height: 250,
                           width: 350,
                           modal: true,
                           body: {
                              rows: [
                                 {
                                    view: "toolbar",
                                    id: "myToolbar",
                                    css: "webix_dark",
                                    cols: [
                                       {
                                          view: "label",
                                          label: "Manage Users",
                                          align: "center"
                                       }
                                    ]
                                 },
                                 {
                                    view: "form",
                                    elements: [
                                       {
                                          view: "multiselect",
                                          label: "Participant",
                                          labelWidth: 100,
                                          options: [
                                             {
                                                id: 1,
                                                value: "Alex Brown"
                                             },
                                             {
                                                id: 2,
                                                value: "Dan Simons"
                                             },
                                             {
                                                id: 3,
                                                value: "Gron Alanski"
                                             },
                                             {
                                                id: 4,
                                                value: "Dan Alanski"
                                             }
                                          ],
                                          value: "1,4"
                                       },
                                       {
                                          cols: [
                                             {
                                                view: "button",
                                                value: "Cancel",
                                                click: () => {
                                                   $$(
                                                      "user_popup_" +
                                                         this.containerDomID
                                                   ).hide();
                                                }
                                             },
                                             {
                                                view: "button",
                                                value: "Save",
                                                css: "webix_primary",
                                                click: () => {
                                                   $$(
                                                      "user_popup_" +
                                                         this.containerDomID
                                                   ).hide();
                                                }
                                             }
                                          ]
                                       }
                                    ]
                                 }
                              ]
                           }
                        };
                        */

                        /*
                        var treeAccordionItem = {
                           view: "accordionitem",
                           header: "Bookkeeper",
                           body: {
                              type: "clean",
                              rows: [tree1, manageUsers]
                           },
                           height: 430
                        };
                        */

                        var accessLevelManager = {
                           view: "scrollview",
                           css: "lightgray ab_amp",
                           body: {
                              rows: [
                                 {
                                    view: "accordion",
                                    id: "amp_accordion_" + self.containerDomID,
                                    roles: [],
                                    hidden: true,
                                    collapsed: true,
                                    css: "webix_dark",
                                    rows: []
                                 },
                                 {
                                    id:
                                       "amp_accordion_noSelection_" +
                                       self.containerDomID,
                                    rows: [
                                       {},
                                       {
                                          view: "label",
                                          align: "center",
                                          height: 200,
                                          label:
                                             "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-unlock-alt'></div>"
                                       },
                                       {
                                          view: "label",
                                          align: "center",
                                          label: "Add a role to control access."
                                       },
                                       {
                                          cols: [
                                             {},
                                             {
                                                view: "button",
                                                label: "Add Role",
                                                type: "form",
                                                css: "webix_primary",
                                                autowidth: true,
                                                click: function() {
                                                   webix
                                                      .ui(newRolePopup)
                                                      .show();

                                                   var roles = self.roles.filter(
                                                      (f) => {
                                                         return (
                                                            $$(
                                                               "amp_accordion_" +
                                                                  self.containerDomID
                                                            ).config.roles.indexOf(
                                                               f.id
                                                            ) == -1
                                                         );
                                                      }
                                                   );

                                                   $$(
                                                      "role_popup_options_" +
                                                         self.containerDomID
                                                   ).define("options", roles);
                                                   $$(
                                                      "role_popup_options_" +
                                                         self.containerDomID
                                                   ).refresh();
                                                }
                                             },
                                             {}
                                          ]
                                       },
                                       {}
                                    ]
                                 }
                              ]
                           }
                        };

                        webix.ui({
                           view: "window",
                           css: "ampWindow",
                           id: "accessManager_" + self.containerDomID,
                           position: function(state) {
                              state.left = state.maxWidth - 350; // fixed values
                              state.top = 0;
                              state.width = 350; // relative values
                              state.height = state.maxHeight;
                           },
                           on: {
                              onShow: () => {
                                 // collapse all the accordion items but the top one
                                 var index = 0;
                                 $$("amp_accordion_" + self.containerDomID)
                                    .getChildViews()
                                    .forEach((a) => {
                                       if (index == 0) {
                                          $$(a).expand();
                                       } else {
                                          $$(a).collapse();
                                       }
                                       index++;
                                       $$(
                                          "amp_accordion_" + self.containerDomID
                                       ).show();
                                       $$(
                                          "amp_accordion_noSelection_" +
                                             self.containerDomID
                                       ).hide();
                                    });
                              }
                           },
                           //modal: true,
                           head: {
                              view: "toolbar",
                              css: "webix_dark",
                              cols: [
                                 {
                                    width: 15
                                 },
                                 {
                                    view: "label",
                                    label: "Access Manager",
                                    autowidth: true
                                 },
                                 {},
                                 {
                                    view: "button",
                                    label: "Add Role",
                                    width: 100,
                                    css: "webix_primary",
                                    click: () => {
                                       webix.ui(newRolePopup).show();

                                       var roles = self.roles.filter((f) => {
                                          return (
                                             $$(
                                                "amp_accordion_" +
                                                   self.containerDomID
                                             ).config.roles.indexOf(f.id) == -1
                                          );
                                       });

                                       $$(
                                          "role_popup_options_" +
                                             self.containerDomID
                                       ).define("options", roles);
                                       $$(
                                          "role_popup_options_" +
                                             self.containerDomID
                                       ).refresh();
                                    }
                                 },
                                 {
                                    view: "button",
                                    width: 35,
                                    css: "webix_transparent",
                                    type: "icon",
                                    icon: "nomargin fa fa-times",
                                    click: () => {
                                       $$(
                                          "accessManager_" + self.containerDomID
                                       ).hide();
                                    }
                                 }
                              ]
                           },
                           body: accessLevelManager
                        });

                        webix.ready(function() {
                           webix.protoUI(
                              {
                                 name: "edittree"
                              },
                              webix.EditAbility,
                              webix.ui.tree
                           );
                        });

                        // buld the tree views for already defined role access levels
                        if (self.rootPage.application.isAccessManaged) {
                           // Build the access level tree for Roles
                           var roles = Object.keys(self.rootPage.accessLevels);
                           roles.forEach((role) => {
                              self.buildAccessAccordion(role);
                           });
                        }

                        $(`#ampButton_${self.containerDomID}`).show();
                     },

                     buildAccessAccordion: function(role) {
                        var self = this;

                        // if a role cannot be found it may have been deleted
                        // do not show the settings in accordion of removed roles
                        // Should we remove/clean up the role settings here???
                        if (self.roles) {
                           var findRole = self.roles.find((r) => {
                              return r.id === role;
                           });
                           if (!findRole) {
                              return false;
                           }
                        }

                        var manageUsers = {
                           rows: [
                              {
                                 height: 10
                              },
                              {
                                 cols: [
                                    {
                                       width: 10
                                    },
                                    {
                                       view: "button",
                                       type: "icon",
                                       icon: "fa fa-trash",
                                       css: "webix_danger_inverse",
                                       label: "Remove",
                                       click: function() {
                                          webix
                                             .confirm("Remove role from app?")
                                             .then(function(result) {
                                                var tree = $$(
                                                   "linetree_" +
                                                      self.containerDomID +
                                                      "_" +
                                                      role
                                                );
                                                var branch = tree.getItem(
                                                   self.rootPage.id
                                                );
                                                branch.access = "0";
                                                var view = self.rootPage.application.views(
                                                   (v) => {
                                                      return (
                                                         v.id ==
                                                         self.rootPage.id
                                                      );
                                                   }
                                                )[0];
                                                view
                                                   .updateAccessLevels(
                                                      tree.config.role,
                                                      "0"
                                                   )
                                                   .then((res) => {
                                                      console.log(
                                                         `Role: ${tree.config.role} set to Access Level: 0 on view: ${view.id}`
                                                      );
                                                      tree.updateItem(
                                                         self.rootPage.id,
                                                         branch
                                                      );
                                                   });
                                                $$(
                                                   "amp_accordionitem_" +
                                                      self.containerDomID +
                                                      "_" +
                                                      role
                                                ).hide();
                                                var itemToRemove = $$(
                                                   "amp_accordion_" +
                                                      self.containerDomID
                                                ).config.roles.indexOf(role);
                                                if (itemToRemove > -1) {
                                                   $$(
                                                      "amp_accordion_" +
                                                         self.containerDomID
                                                   ).config.roles.splice(
                                                      itemToRemove,
                                                      1
                                                   );
                                                }
                                             })
                                             .fail(function() {
                                                //canceled
                                             });
                                       }
                                    },
                                    {
                                       width: 10
                                    }
                                    /* We are not managing users yet
                                    {
                                      view: "button",
                                      type: "icon",
                                      icon: "fa fa-cog",
                                      css: "webix_primary",
                                      label: "Manage Users",
                                      click: function() {
                                        webix.ui(manageUsersPopup).show();
                                      }
                                    }
                                    */
                                 ]
                              },
                              {
                                 height: 10
                              }
                           ]
                        };

                        $$(
                           "amp_accordion_" + self.containerDomID
                        ).config.roles.push(role);

                        var toggleParent = (element) => {
                           if (!element.parent) return false;
                           var parentElem = element.parent;
                           if (!parentElem.parent) return false;
                           parentElem.parent.emit("changeTab", parentElem.id);
                           toggleParent(parentElem.parent);
                        };

                        var tree = {
                           id: "linetree_" + self.containerDomID + "_" + role,
                           view: "edittree",
                           type: "lineTree",
                           editable: true,
                           role: role,
                           editor: "combo",
                           editValue: "access",
                           threeState: true,
                           template: (obj, common) => {
                              var treeOptions = $$(
                                 "linetree_" + self.containerDomID + "_" + role
                              ).config.options;
                              var option = treeOptions.find(
                                 (o) => o.id === obj.access
                              );
                              var color = "#ff4938";
                              var icon = "lock";
                              if (option.id == "0") {
                                 color = "#ff4938";
                                 icon = "lock";
                              } else if (option.id == "1") {
                                 color = "#FFAB00";
                                 icon = "eye";
                              } else if (option.id == "2") {
                                 color = "#00C853";
                                 icon = "pencil";
                              }
                              return (
                                 `
                                <span class="accessLevel">
                                  <span class="fa-stack">
                                    <i style="color: ${color};" class="fa fa-circle fa-stack-2x"></i>
                                    <i class="fa fa-${icon} fa-stack-1x fa-inverse"></i>
                                  </span>` +
                                 common.icon(obj, common) +
                                 `<span>${obj.label}</span>
                                     <i class="externalLink fa fa-external-link"></i>
                                   </span>`
                              );
                           },
                           options: self.accessLevels,
                           data: self.getAccessLevelTree(self.rootPage, role),
                           onClick: {
                              externalLink: (event, branch, target) => {
                                 var item = $$(
                                    "linetree_" +
                                       self.containerDomID +
                                       "_" +
                                       role
                                 ).getItem(branch);
                                 if (item.type == "tab") {
                                    self.showPage(item.pageId);

                                    var tabView = self.rootPage.application.views(
                                       (v) => v.id == item.id
                                    )[0];
                                    if (!tabView) return false;

                                    var tab = tabView.parent;
                                    if (!tab) return false;

                                    toggleParent(tab);
                                    if (
                                       !$$(tabView.id) ||
                                       !$$(tabView.id).isVisible()
                                    ) {
                                       var showIt = setInterval(function() {
                                          if (
                                             $$(tabView.id) &&
                                             $$(tabView.id).isVisible()
                                          ) {
                                             clearInterval(showIt);
                                          }
                                          tab.emit("changeTab", tabView.id);
                                       }, 200);
                                    }
                                 }
                                 // switch page
                                 else {
                                    self.showPage(item.id);
                                 }

                                 return false;
                              }
                           },
                           on: {
                              onAfterEditStop: (
                                 state,
                                 editor,
                                 ignoreUpdate
                              ) => {
                                 if (state.old == state.value) return false;
                                 var tree = $$(
                                    "linetree_" +
                                       self.containerDomID +
                                       "_" +
                                       role
                                 );
                                 var view = self.rootPage.application.views(
                                    (v) => {
                                       return v.id == editor.id;
                                    }
                                 )[0];
                                 view
                                    .updateAccessLevels(
                                       tree.config.role,
                                       state.value
                                    )
                                    .then((res) => {
                                       console.log(
                                          `Role: ${tree.config.role} set to Access Level: ${state.value} on view: ${view.id}`
                                       );
                                    });
                              },
                              onDataUpdate: (id, data, old) => {
                                 var tree = $$(
                                    "linetree_" +
                                       self.containerDomID +
                                       "_" +
                                       role
                                 );
                                 if (data.access == "0") {
                                    tree.blockEvent();
                                    tree.data.eachSubItem(id, (child) => {
                                       var childData = tree.getItem(child.id);
                                       if (childData.access != data.access) {
                                          childData.access = data.access;
                                          var view = self.rootPage.application.views(
                                             (v) => {
                                                return v.id == child.id;
                                             }
                                          )[0];
                                          view
                                             .updateAccessLevels(
                                                tree.config.role,
                                                data.access
                                             )
                                             .then((res) => {
                                                console.log(
                                                   `Role: ${tree.config.role} set to Access Level: ${data.access} on view: ${view.id}`
                                                );
                                                tree.updateItem(
                                                   child.id,
                                                   childData
                                                );
                                             });
                                       }
                                    });
                                    tree.unblockEvent();
                                 } else {
                                    var parentBranch = tree.getParentId(id);
                                    var parentData = tree.getItem(parentBranch);
                                    if (parentData) {
                                       if (parentData.access == "0") {
                                          parentData.access = "1";
                                          var view = self.rootPage.application.views(
                                             (v) => {
                                                return v.id == parentBranch;
                                             }
                                          )[0];
                                          view
                                             .updateAccessLevels(
                                                tree.config.role,
                                                parentData.access
                                             )
                                             .then((res) => {
                                                console.log(
                                                   `Role: ${tree.config.role} set to Access Level: ${parentData.access} on view: ${view.id}`
                                                );
                                                tree.updateItem(
                                                   parentBranch,
                                                   parentData
                                                );
                                             });
                                       }
                                    }
                                 }
                              }
                           }
                        };

                        var newAccordionItem = {
                           view: "accordionitem",
                           id:
                              "amp_accordionitem_" +
                              self.containerDomID +
                              "_" +
                              role,
                           header: () => {
                              if (!self.roles) {
                                 return role;
                              } else {
                                 var header = self.roles.find((r) => {
                                    return r.id === role;
                                 });
                                 if (header && header.value) {
                                    return header.value;
                                 } else {
                                    return "";
                                 }
                              }
                           },
                           collapsed: true,
                           body: {
                              type: "clean",
                              rows: [tree, manageUsers]
                           }
                        };

                        $$("amp_accordion_" + self.containerDomID).addView(
                           newAccordionItem,
                           -1
                        );
                        $$("amp_accordion_" + self.containerDomID).show();
                        $$(
                           "amp_accordion_noSelection_" + self.containerDomID
                        ).hide();

                        $$(
                           "linetree_" + self.containerDomID + "_" + role
                        ).openAll();
                     },

                     getTranslations: function(
                        translations,
                        domId,
                        field,
                        completed,
                        total
                     ) {
                        var missingHint = false;
                        var missingTranslate = false;
                        var translateLang = $$(
                           "qtt_accordion_" + domId + "_translateTo"
                        ).getValue();
                        var value = translations.filter((item) => {
                           return item.language_code == translateLang;
                        })[0];
                        if (!value) {
                           // we didn't find the language so we are defaulting to first language
                           missingTranslate = true;
                           value = translations[0];
                        }
                        var hintLang = $$(
                           "qtt_accordion_" + domId + "_translateHint"
                        ).getValue();
                        var hint = translations.filter((item) => {
                           return item.language_code == hintLang;
                        })[0];
                        if (!hint) {
                           // we didn't find the language so we are defaulting to first language
                           missingHint = true;
                           hint = translations[0];
                        }

                        var hintLabel = "";
                        var valueLabel = "";

                        // some items store the text we need translated under "text"
                        if (field) {
                           hintLabel = hint[field];
                           valueLabel = value[field];
                        }
                        if (!hintLabel) {
                           hintLabel = hint.label;
                        }
                        if (!valueLabel) {
                           valueLabel = value.label;
                        }

                        var hintPrefix = "";
                        if (missingHint) {
                           hintPrefix = "[" + hintLang + "] ";
                        }
                        var translatePrefix = "";
                        if (missingTranslate) {
                           translatePrefix = "[" + translateLang + "] ";
                        }
                        if (
                           (valueLabel || "").indexOf(
                              "[" + translateLang + "]" - 1 && !missingTranslate
                           )
                        ) {
                           completed++;
                        }
                        total++;
                        return {
                           hint: hintPrefix + hintLabel,
                           value: translatePrefix + valueLabel,
                           completed: completed,
                           total: total
                        };
                     },

                     getTranslationToolViewsTree: function(views, domId) {
                        var completed = 0;
                        var total = 0;
                        var self = this;
                        // this so it looks right/indented in a tree view:
                        var tree = new webix.TreeCollection();

                        /**
                         * @method addPage
                         *
                         * @param {ABView} page
                         * @param {integer} index
                         * @param {uuid} parentId
                         */
                        var addPage = (
                           page,
                           parentId,
                           type,
                           field = "label",
                           viewId
                        ) => {
                           var translations = page.translations;
                           var pageId = page.id;
                           if (type == "button") {
                              translations = page.settings.translations;
                              pageId = page.id + "_" + field;
                           }
                           var labels = self.getTranslations(
                              translations,
                              domId,
                              field,
                              completed,
                              total
                           );
                           completed = labels.completed;
                           total = labels.total;
                           var icon = page.tabicon ? page.tabicon : page.icon;

                           // add to tree collection
                           var branch = {
                              id: pageId,
                              value: labels.value,
                              hint: labels.hint,
                              field: field,
                              viewId: viewId,
                              translations: page.translations,
                              pageId: parentId,
                              buttonId: page.pageId,
                              type: type,
                              icon: icon
                           };
                           tree.add(branch, null, parentId);

                           // stop at detail views
                           // if (page.defaults.key == "detail") {
                           //    return;
                           // }

                           var subPages = page.pages ? page.pages() : [];
                           subPages.forEach((childPage, childIndex) => {
                              addPage(childPage, page.id, "page");
                           });

                           // stop if there are no views to parse
                           if (!page.views) return;
                           // add labels
                           page
                              .views((v) => v.defaults.key == "label")
                              .forEach((label, labelIndex) => {
                                 // label views
                                 // label.icon = "th-list";
                                 addPage(
                                    label,
                                    page.id,
                                    "label",
                                    "text",
                                    label.id
                                 );
                              });
                           // add tabs
                           page
                              .views((v) => v.defaults.key == "tab")
                              .forEach((tab, tabIndex) => {
                                 // tab views
                                 tab.views().forEach(
                                    (tabView, tabViewIndex) => {
                                       // tab items will be below sub-page items
                                       // tabView.icon = "th-list";
                                       addPage(
                                          tabView,
                                          page.id,
                                          "tab",
                                          "label",
                                          tab.id
                                       );
                                    }
                                 );
                              });
                           // add menus
                           page
                              .views((v) => v.defaults.key == "menu")
                              .forEach((menu, menuIndex) => {
                                 // menu buttons
                                 if (!menu.settings.order) return;
                                 menu.settings.order.forEach(
                                    (menuItem, menuItemIndex) => {
                                       // tab items will be below sub-page items
                                       // menuItem.icon = "link";
                                       addPage(
                                          menuItem,
                                          page.id,
                                          "menu",
                                          "aliasname",
                                          menu.id
                                       );
                                    }
                                 );
                              });
                           // add form buttons
                           page
                              .views((v) => v.defaults.key == "form")
                              .forEach((form, formIndex) => {
                                 // form inputs
                                 form
                                    .views()
                                    .forEach((formInput, formInputIndex) => {
                                       // we only need buttons
                                       if (formInput.key == "button") {
                                          for (const property in formInput
                                             .settings.translations[0]) {
                                             if (property != "language_code") {
                                                addPage(
                                                   formInput,
                                                   page.id,
                                                   "button",
                                                   property,
                                                   formInput.id
                                                );
                                             }
                                          }
                                       }
                                    });
                              });
                           // add chart labels
                           page
                              .views((v) => v.defaults.key == "chart")
                              .forEach((chart, chartIndex) => {
                                 // chart views
                                 chart.views().forEach((view, viewIndex) => {
                                    // we only need buttons
                                    if (view.key == "label") {
                                       addPage(
                                          view,
                                          page.id,
                                          "label",
                                          "text",
                                          view.id
                                       );
                                    }
                                 });
                              });
                        };
                        views.forEach((p, index) => {
                           addPage(p, null, "page", "label", p.id);
                        });

                        // there is a webix bug that will not allow you to se the value of a progress bar to 0
                        let progressBar = $$("qtt_view_progress" + domId);
                        let position = completed / total + 0.0001;
                        progressBar.showProgress({
                           type: "top",
                           position: position
                        });
                        progressBar.define({
                           total: total,
                           completed: completed
                        });

                        return tree;
                     },

                     getTranslationToolObjectsTree: function(objects, domId) {
                        var self = this;
                        var completed = 0;
                        var total = 0;
                        // this so it looks right/indented in a tree view:
                        var tree = new webix.TreeCollection();

                        /**
                         * @method addBranch
                         *
                         * @param {ABView} page
                         * @param {uuid} parentId
                         * @param {string} type
                         */
                        var addBranch = (
                           object,
                           parentId,
                           type,
                           field = "label",
                           fieldId,
                           objectId
                        ) => {
                           var translations = object.translations;
                           var labels = self.getTranslations(
                              translations,
                              domId,
                              field,
                              completed,
                              total
                           );
                           completed = labels.completed;
                           total = labels.total;

                           // add to tree collection
                           var branch = {
                              id: object.id,
                              value: labels.value,
                              hint: labels.hint,
                              translations: object.translations,
                              pageId: parentId,
                              objectId: objectId,
                              type: type,
                              field: field,
                              fieldId: fieldId,
                              icon:
                                 type == "object"
                                    ? "database"
                                    : object.icon
                                    ? object.icon
                                    : ""
                           };
                           tree.add(branch, null, parentId);

                           var fields = object.fields ? object.fields() : [];
                           fields.forEach((field, fieldIndex) => {
                              addBranch(
                                 field,
                                 object.id,
                                 "field",
                                 "label",
                                 field.id,
                                 object.id
                              );
                           });

                           // add options
                           if (
                              object.settings &&
                              object.settings.options &&
                              object.settings.options.length
                           ) {
                              object.settings.options.forEach(
                                 (option, optionIndex) => {
                                    addBranch(
                                       option,
                                       object.id,
                                       "option",
                                       "text",
                                       fieldId,
                                       parentId
                                    );
                                 }
                              );
                           }
                        };
                        objects.forEach((p, index) => {
                           addBranch(p, null, "object");
                        });

                        // there is a webix bug that will not allow you to se the value of a progress bar to 0
                        let progressBar = $$("qtt_object_progress" + domId);
                        let position = completed / total + 0.0001;
                        progressBar.showProgress({
                           type: "top",
                           position: position
                        });
                        progressBar.define({
                           total: total,
                           completed: completed
                        });

                        return tree;
                     },

                     getAccessLevelTree: function(rootPage, role) {
                        // this so it looks right/indented in a tree view:
                        var tree = new webix.TreeCollection();

                        /**
                         * @method addPage
                         *
                         * @param {ABView} page
                         * @param {integer} index
                         * @param {uuid} parentId
                         */
                        var addPage = (page, index, parentId, type) => {
                           // add to tree collection
                           var accessLevel = "0";
                           if (role) {
                              accessLevel = page.accessLevels[role] || "0";
                           }
                           var branch = {
                              id: page.id,
                              access: accessLevel,
                              label: page.label,
                              pageId: parentId,
                              type: type
                           };
                           tree.add(branch, index, parentId);

                           // stop at detail views
                           if (page.defaults.key == "detail") {
                              return;
                           }

                           var subPages = page.pages ? page.pages() : [];
                           subPages.forEach((childPage, childIndex) => {
                              addPage(childPage, childIndex, page.id, "page");
                           });

                           // add tabs
                           page
                              .views((v) => v.defaults.key == "tab")
                              .forEach((tab, tabIndex) => {
                                 // tab views
                                 tab.views().forEach(
                                    (tabView, tabViewIndex) => {
                                       // tab items will be below sub-page items
                                       var tIndex =
                                          subPages.length +
                                          tabIndex +
                                          tabViewIndex;
                                       addPage(tabView, tIndex, page.id, "tab");
                                    }
                                 );
                              });
                        };
                        rootPage.application.pages().forEach((p, index) => {
                           addPage(p, index, null, "page");
                        });

                        return tree;
                     },

                     initDOM: function() {
                        // console.log('... creating ABLiveTool <div> ');
                        var css =
                           "background-color: #fff !important; font-size: 30px; line-height: 80px; padding-top: 160px; text-align: center; width: 100%;";

                        this.element.html(
                           `<div id="${this.containerDomID}">
                              <div style="${css}" class="ab-loading">
                                 <i class="fa fa-refresh fa-spin fa-3x fa-fw"></i><br/>Loading&#8230;
                              </div>
                           </div>
                           <div style="display: none;" id="ampTree_${this.containerDomID}"></div>
                           <div style="display: none;" id="ampButton_${this.containerDomID}" class="amp" onclick="$$('accessManager_${this.containerDomID}').show();">
                              <div>
                                <i class="fa fa-fw fa-unlock-alt fa-inverse"></i>
                                <i class="fa fa-fw fa-lock fa-inverse"></i>
                              </div>
                              <div>
                                Access Management
                              </div>
                           </div>
                           <div style="display: none;" id="qttTree_${this.containerDomID}"></div>
                           <div style="display: none;" id="qttButton_${this.containerDomID}" class="amp qtt" onclick="$$('quickTranslationTool_${this.containerDomID}').show();">
                              <div>
                                <i class="fa fa-fw fa-language fa-inverse"></i>
                              </div>
                              <div>
                                Translation Tool
                              </div>
                           </div>`
                        );

                        // this.element.html(
                        // 	('<div id="#domID#"></div>' +
                        // 		'<i id="#domID#-reload-button" class="fa fa-refresh ab-reload-page-button" aria-hidden="true"></i>')
                        // 		.replace(/#domID#/g, this.containerDomID));
                     },

                     initModels: function() {
                        this.Models = {};
                        this.Models.ABApplication = OP.Model.get(
                           "opstools.BuildApp.ABApplication"
                        );
                     },

                     initPage: function() {
                        var self = this;

                        // Wait until the tool's area has been shown
                        if (!self.activated) return;

                        self.renderPageContainer();

                        self.initEvents(self.rootPage);

                        if (self.rootPage.application.isAccessManaged) {
                           var shouldInitAMP = false;
                           if (
                              parseInt(
                                 self.rootPage.application.accessManagers
                                    .useRole
                              ) == 1
                           ) {
                              self.rootPage.application
                                 .userRoles()
                                 .forEach((role) => {
                                    if (
                                       self.rootPage.application.accessManagers.role.indexOf(
                                          role.id
                                       ) > -1
                                    ) {
                                       shouldInitAMP = true;
                                    }
                                 });
                           }
                           if (
                              !shouldInitAMP &&
                              parseInt(
                                 self.rootPage.application.accessManagers
                                    .useAccount
                              ) == 1
                           ) {
                              if (
                                 self.rootPage.application.accessManagers.account.indexOf(
                                    OP.User.id() + ""
                                 ) > -1
                              ) {
                                 shouldInitAMP = true;
                              }
                           }
                           if (shouldInitAMP) {
                              self.initAMP();
                           }
                        }
                        if (self.rootPage.application.isTranslationManaged) {
                           var shouldInitQTT = false;
                           if (
                              parseInt(
                                 self.rootPage.application.translationManagers
                                    .useRole
                              ) == 1
                           ) {
                              self.rootPage.application
                                 .userRoles()
                                 .forEach((role) => {
                                    if (
                                       self.rootPage.application.translationManagers.role.indexOf(
                                          role.id
                                       ) > -1
                                    ) {
                                       shouldInitQTT = true;
                                    }
                                 });
                           }
                           if (
                              !shouldInitQTT &&
                              parseInt(
                                 self.rootPage.application.translationManagers
                                    .useAccount
                              ) == 1
                           ) {
                              if (
                                 self.rootPage.application.translationManagers.account.indexOf(
                                    OP.User.id() + ""
                                 ) > -1
                              ) {
                                 shouldInitQTT = true;
                              }
                           }
                           if (shouldInitQTT) {
                              self.initQTT();
                           }
                        }

                        webix.ready(function() {
                           self.showPage();

                           self.resize(self.height || 600);
                        });
                     },

                     initRoles: function() {
                        var self = this;

                        return new Promise((resolve, reject) => {
                           var __Roles = [];
                           var __UserRoles = [];

                           async.series(
                              [
                                 function(next) {
                                    self.rootPage.application.class.ABRole.find()
                                       .then((list) => {
                                          list.forEach(function(l) {
                                             __Roles.push({
                                                id: l.uuid,
                                                value: l.name
                                             });
                                          });
                                          self.roles = __Roles;
                                          next();
                                       })
                                       .catch((err) => {
                                          AD.error.log(
                                             "ABLiveTool: Error loading Roles",
                                             {
                                                error: err
                                             }
                                          );
                                          next(err);
                                       });
                                 },
                                 function(next) {
                                    if (
                                       self.rootPage.application.userRoles()
                                          .length
                                    ) {
                                       next();
                                       return;
                                    }
                                    self.rootPage.application.class.ABRole.rolesOfUser(
                                       window.OP.User.username()
                                    )
                                       .then((list) => {
                                          list.forEach(function(l) {
                                             __UserRoles.push({
                                                id: l.id,
                                                label: l.label
                                             });
                                          });
                                          self.rootPage.application.userRoles(
                                             __UserRoles
                                          );
                                          next();
                                       })
                                       .catch((err) => {
                                          AD.error.log(
                                             "ABLiveTool: Error loading roles of user",
                                             {
                                                error: err
                                             }
                                          );
                                          next(err);
                                       });
                                 },
                                 function(next) {
                                    self.initPage();
                                    next();
                                 }
                              ],
                              function(err) {
                                 if (err) reject(err);
                                 else resolve();
                              }
                           );
                        });
                     },

                     menuChange: function(areaKey, toolKey) {
                        var self = this;

                        // Get current area key
                        if (areaKey == null) {
                           let currAreaElem = document.querySelector(
                              "#op-list-menu > .op-container.active"
                           );
                           if (!currAreaElem) return;

                           areaKey = currAreaElem.getAttribute("area");
                        }

                        // Get current tool key
                        if (toolKey == null) {
                           // get active tool element
                           let currToolElem = document.querySelector(
                              '#op-masthead-sublinks [area="{area}"] .active'.replace(
                                 "{area}",
                                 areaKey
                              )
                           );
                           if (!currToolElem) return;

                           toolKey = currToolElem.getAttribute("op-tool-id");
                        }

                        // Check it is our page
                        if (
                           self.options.areaKey == areaKey &&
                           self.options.toolKey == toolKey
                        ) {
                           if (!self.activated) {
                              self.activated = true;

                              self.getData();
                           } else {
                              self.showPage();
                           }
                        }
                     },

                     getData: function() {
                        var self = this,
                           q = $.Deferred();

                        self.data = {};
                        async.series(
                           [
                              // Show loading spinners
                              function(next) {
                                 var areaMenuItem = document.body.querySelector(
                                    '[class="op-container"][area="' +
                                       self.options.areaKey +
                                       '"]'
                                 );
                                 if (areaMenuItem) {
                                    areaMenuItem.insertAdjacentHTML(
                                       "beforeend",
                                       '<span class="icon ' +
                                          self.options.areaKey +
                                          '_appLoading"><i class="fa fa-refresh fa-spin"></i></span>'
                                    );
                                 }

                                 next();
                              },
                              // Get application data
                              function(next) {
                                 ABApplication.livepage(
                                    self.options.app,
                                    self.options.page
                                 )
                                    .catch(console.error)
                                    .then(function(result) {
                                       self.data.application = result;

                                       // Store the root page
                                       if (self.rootPage == null)
                                          self.rootPage = self.data.application.pages(
                                             (p) => p.id == self.options.page
                                          )[0];

                                       next();
                                    }, next);
                              },

                              // Bind objects and queries from data views
                              function(next) {
                                 if (!self.data.application) return next();

                                 let storeObject = (datasource) => {
                                    if (
                                       self.data.application.objects(
                                          (o) => o.id == datasource.id
                                       ).length < 1
                                    ) {
                                       self.data.application._objects.push(
                                          datasource
                                       );
                                    }
                                 };

                                 self.data.application
                                    .datacollectionsIncluded()
                                    .forEach((dc) => {
                                       if (!dc) return;

                                       dc.init();

                                       /*
                                       // ABApplications can now already referece
                                       // all objects and queries:

                                       let datasource = dc.datasource;
                                       if (!datasource) return;

                                       // Queries
                                       if (
                                          dc.settings &&
                                          dc.settings.isQuery &&
                                          self.data.application.queries(
                                             (q) => q.id == datasource.id
                                          ).length < 1
                                       ) {
                                          self.data.application._queries.push(
                                             datasource
                                          );

                                          datasource
                                             .objects()
                                             .forEach((obj) => {
                                                storeObject(obj);
                                             });
                                       }
                                       // Objects
                                       else {
                                          storeObject(datasource);
                                       }
                                       */
                                    });

                                 next();
                              },

                              function(next) {
                                 if (self.rootPage == null) return next();

                                 if (
                                    self.rootPage.application.isAccessManaged
                                 ) {
                                    self
                                       .initRoles()
                                       .then(() => {
                                          next();
                                       })
                                       .catch((err) => {
                                          next(err);
                                       });
                                 } else {
                                    self.initPage();
                                 }
                                 //self.initPage(); moved this inside self.initRoles() to fire after roles are loaded

                                 // let areaKey = 'ab-' + self.data.application.name.trim();
                                 // areaKey = areaKey.toLowerCase().replace(/[^a-z0-9]/gi, '');

                                 // // If there is a ops-area, it should trigger that ops-area to render page
                                 // // Because 'opsportal.tool.show' and 'opsportal.area.show' are not trigger
                                 // var opsMenus = document.body.querySelectorAll('#op-list-menu > .op-container');
                                 // if (opsMenus.length == 1) {
                                 // 	opsMenus[0].click();
                                 // }
                                 // // If this area is showing
                                 // else {
                                 // 	// TODO: How to get current area ?
                                 // 	var currPanel = document.body.querySelector('#op-masthead-sublinks > ul:not([style*="display:none"]):not([style*="display: none"])');
                                 // 	if (currPanel) {
                                 // 		var currArea = currPanel.getAttribute('area');
                                 // 		if (currArea == areaKey) {
                                 // 			callback(null, { area: areaKey });
                                 // 		}
                                 // 	}
                                 // }

                                 // next();
                              },

                              // Hide loading spinners
                              function(next) {
                                 // we will remove the loading spinners on the menu now
                                 var opsMenuItem = document.body.querySelectorAll(
                                    "#op-list-menu > .op-container ." +
                                       self.options.areaKey +
                                       "_appLoading"
                                 );
                                 (opsMenuItem || []).forEach((x) => {
                                    x.remove();
                                 });

                                 next();
                              }
                           ],
                           function(err) {
                              if (err) q.reject(err);
                              else q.resolve();
                           }
                        );

                        return q;
                     },

                     renderPageContainer: function() {
                        var self = this;

                        if (self.rootPage == null) return;

                        // Clear UI content
                        var rootDomId = self.getPageDomID(self.rootPage.id);

                        // var parentContainer = self.element.parent()[0];
                        // parentContainer.style.width = "900px";
                        // parentContainer.style.margin = "0 auto";

                        if ($$(rootDomId)) webix.ui({}, $$(rootDomId));

                        // Create a sub pages container
                        if ($$(self.containerDomID)) {
                           $$(self.containerDomID).destructor();
                        }
                        webix.ui({
                           view: "multiview",
                           container: self.containerDomID,
                           css: "ab-main-container ab-generated-page",
                           id: self.containerDomID,
                           cells: [{}],
                           on: {
                              onViewChange: function(prevId, nextId) {
                                 self.resize();
                              }
                           }
                        });

                        // Render the root page
                        self.renderPage(self.rootPage, true);
                     },

                     renderPage: function(page, isRootPage) {
                        var self = this,
                           pageDomId = this.getPageDomID(page.id);

                        var component = page.component(self.App);
                        var ui = component.ui;

                        // this may need to move to initPage()
                        // if (isRootPage && page.application.isAccessManaged) {
                        //    // Build the access level tree for Roles
                        //    var roles = Object.keys(page.accessLevels);
                        //    roles.forEach((role) => {
                        //       self.buildAccessAccordion(role);
                        //    });
                        // }

                        // Keep the page component
                        self.pageComponents[page.id] = component;

                        // Define page id to be batch id of webix.multiview
                        ui.batch = page.id;

                        if (
                           parseInt(page.settings.pageWidth) > 0 &&
                           parseInt(page.settings.fixedPageWidth) == 1
                        ) {
                           var parentContainer = self.element.parent()[0];
                           parentContainer.style.width =
                              parseInt(page.settings.pageWidth) + "px";
                           parentContainer.style.margin = "0 auto";
                           parentContainer.classList.add(
                              page.settings.pageBackground
                           );
                        }

                        switch (page.settings.type) {
                           case "popup":
                              var popupTemplate = {
                                 view: "window",
                                 id: pageDomId,
                                 modal: true,
                                 position: "center",
                                 resize: true,
                                 width:
                                    parseInt(page.settings.popupWidth) || 700,
                                 height:
                                    parseInt(page.settings.popupHeight) + 44 ||
                                    450,
                                 css: "ab-main-container",
                                 head: {
                                    view: "toolbar",
                                    css: "webix_dark",
                                    cols: [
                                       {
                                          view: "label",
                                          label: page.label,
                                          css: "modal_title",
                                          align: "center"
                                       },
                                       {
                                          view: "button",
                                          label: "Close",
                                          autowidth: true,
                                          align: "center",
                                          click: function() {
                                             var popup = this.getTopParentView();
                                             popup.hide();
                                          }
                                       }
                                    ]
                                 },
                                 body: {
                                    view: "scrollview",
                                    scroll: true,
                                    body: ui
                                 }
                              };

                              if ($$(pageDomId)) {
                                 // Destroy old popup
                                 if ($$(pageDomId).config.view == "window") {
                                    $$(pageDomId).destructor();
                                 }
                                 // Change page type (Page -> Popup)
                                 else if ($$(self.containerDomID)) {
                                    $$(self.containerDomID).removeView(
                                       pageDomId
                                    );
                                 }
                              }

                              // Create popup
                              webix.ui(popupTemplate).hide();

                              break;
                           case "page":
                           default:
                              // console.log(ui);
                              if ($$(pageDomId)) {
                                 // Change page type (Popup -> Page)
                                 if ($$(pageDomId).config.view == "window") {
                                    $$(pageDomId).destructor();

                                    $$(self.containerDomID).addView(ui);
                                 }
                                 // Rebuild
                                 else {
                                    webix.ui(ui, $$(pageDomId));
                                 }
                              }
                              // Add to multi-view
                              else if ($$(self.containerDomID))
                                 $$(self.containerDomID).addView(ui);

                              break;
                        }

                        // handle events
                        self.initEvents(page);

                        // Render children pages
                        if (page.pages) {
                           (page.pages() || []).forEach(function(subpage) {
                              self.renderPage(subpage);
                           });
                        }

                        // Initial UI components
                        setTimeout(function() {
                           component.init();
                        }, 50);
                     },

                     /**
                      * @param ABPage page
                      *      Optional page. Default is to show
                      *      the root page.
                      */
                     showPage: function(pageId, viewId) {
                        var self = this;

                        // if pageId is not passed we will clear the peviousPageId so it won't load, this fixes a bug with the popup pages
                        if (pageId == null) {
                           self.previousPageId = null;
                        }

                        pageId =
                           pageId ||
                           (self.previousPageId == self.activePageId
                              ? null
                              : self.previousPageId) ||
                           (self.rootPage ? self.rootPage.id : null);

                        if (pageId == null) return;

                        // Hide page popup
                        var activePageDomId = self.getPageDomID(
                           self.activePageId
                        );
                        if ($$(activePageDomId) && $$(activePageDomId).hide) {
                           $$(activePageDomId).hide();
                           // tell the UI that the previous page is the active page
                           self.activePageId = self.previousPageId;
                        }

                        if (
                           pageId &&
                           self.activePageId &&
                           pageId == self.activePageId
                        ) {
                           return false;
                        }
                        self.previousPageId = self.activePageId;
                        self.activePageId = pageId;

                        // Show page popup
                        var pageDomId = self.getPageDomID(pageId);
                        if ($$(pageDomId)) $$(pageDomId).show();

                        // Question: should we do a resize() after all the components are rendered?

                        // Change page by batch id
                        var childViews = $$(
                              self.containerDomID
                           ).getChildViews(),
                           batchExist = childViews.filter(function(v) {
                              return v.config.batch == pageId;
                           })[0];
                        if (batchExist)
                           $$(self.containerDomID).showBatch(pageId);

                        // Trigger .onShow to the component
                        var loadPage = setInterval(function() {
                           // console.log("loading page");

                           if (
                              self.pageComponents[pageId] &&
                              self.pageComponents[pageId].onShow
                           ) {
                              // console.log("canceling load");
                              clearInterval(loadPage);
                              for (const element of document
                                 .getElementById(self.containerDomID)
                                 .getElementsByClassName("ab-loading")) {
                                 element.style.display = "none";
                              }
                              self.pageComponents[pageId].onShow();
                              if (viewId) {
                                 $$(viewId).show();
                              }
                           }
                        }, 60);
                     },

                     initEvents(page) {
                        var self = this;

                        if (page == null) return;

                        // { pageId: eventId, ..., pageIdn: eventIdn }
                        self.changePageEventIds = self.changePageEventIds || {};

                        if (!self.changePageEventIds[page.id]) {
                           self.changePageEventIds[page.id] = page.on(
                              "changePage",
                              function(pageId) {
                                 self.showPage(pageId);
                              }
                           );
                        }

                        let needToReloadPage = () => {
                           // clear the cache of events
                           self.changePageEventIds = {};

                           // remove stored root page
                           // it will re-render when this page will be triggered
                           delete self.rootPage;

                           self.activated = false;

                           self.initDOM();
                        };

                        if (!self.updatePageEventId && page.isRoot()) {
                           /**
                            * @event ab.interface.update
                            * This event is triggered when the root page is updated
                            *
                            * @param data.rootPage {uuid} - id of the root page
                            */
                           self.updatePageEventId = AD.comm.hub.subscribe(
                              "ab.interface.update",
                              function(msg, data) {
                                 if (page.id == data.rootPageId) {
                                    needToReloadPage();
                                 }
                              }
                           );
                        }

                        if (
                           !self.updateDatacollectionEventId &&
                           page.isRoot()
                        ) {
                           /**
                            * @event ab.datacollection.update
                            * This event is triggered when the datacollection is updated
                            *
                            * @param data.datacollectionId {uuid} - id of the data view
                            */
                           self.updateDatacollectionEventId = AD.comm.hub.subscribe(
                              "ab.datacollection.update",
                              function(msg, data) {
                                 let updatedDC = self.data.application.datacollections(
                                    (dc) => dc.id == data.datacollectionId
                                 )[0];
                                 if (updatedDC) {
                                    needToReloadPage();
                                 }
                              }
                           );
                        }
                     },

                     adjust: function(containerID) {
                        if ($$(containerID)) {
                           // $$(containerID).getTopParentView().resizeChildren();
                           $$(containerID).adjust();
                        }
                     },

                     resize: function(height) {
                        var _this = this;

                        // NOTE: resize() calls from the OpsPortal OPView element
                        // .resize({ height:value });
                        if (height) height = height.height || height;
                        if (
                           !$$(this.containerDomID) ||
                           !$(this.element).is(":visible")
                        )
                           return;

                        var width = this.element.width();
                        if (!width) {
                           this.element.parents().each(function(index, elm) {
                              if ($(elm).width() > width)
                                 width = $(elm).width();
                           });
                        }

                        // QUESTION: where does self.height come from?  is this a webix setting?
                        if (height == null && self.height == null) return;
                        if (height == null) height = self.height;

                        // track the last set of height/width values:
                        this.resizeValues.height = height;
                        this.resizeValues.width = width;
                        // console.log('ABLiveTool.resize()');

                        // this debounce method seems to cut down our resize()
                        // operations to 1/3
                        if (!this.debounceResize) {
                           _this.debounceResize = true;

                           setTimeout(function() {
                              // console.log('ABLiveTool.debouncedResize()');
                              if (_this.resizeValues.width > 0)
                                 $$(_this.containerDomID).define(
                                    "width",
                                    width
                                 );

                              if (_this.resizeValues.height > 0)
                                 $$(_this.containerDomID).define(
                                    "height",
                                    height
                                 );

                              $$(_this.containerDomID).resize();

                              /// REFACTOR NOTES:
                              // here is an example where we are not keeping strict boundries about which
                              // object is supposed to know and do what.
                              //
                              // here we have a UI Object (ABLiveTool), that is trying to update the display
                              // of a current Page (a View).
                              //
                              // This UI Object knows all the details about how a Page (View) should display
                              // itself:  which .domID  it is attached to, that it needs to .adjust() itself,
                              // and most importantly, that a page consists of components, and how it must
                              // step through each component and .resize() each one of them.
                              //
                              // The problem is, now that we have a TabComponent that also has Pages(Views) as
                              // components, this code must also be reduplicated there.  That is a bad design
                              // pattern.
                              //
                              // Instead, our Page object should be responsible for itself.  It knows that it is
                              // comprised of components, and that when a Page.resize() is requested, the Page
                              // should be calling it's components to .resize() themselves.
                              //
                              // A UI Object like this, should only know that it is displaying a Page object.
                              // We can call:
                              // 		Page.show(divID);
                              // 		Page.resize();
                              // 		Page.remove();
                              //
                              // And that's all a UI object should be allowed to know.
                              //
                              // This UI Object can also know about it's outer Container, and do the resizing
                              // of that object.  But to display and update a Page, we should only be limited
                              // to the above interface.
                              //
                              // If this were the case, the TabComponent would also be able to reuse those same
                              // methods on the Pages that it is managing.
                              //

                              // I went ahead and refactored ABPage to have a .resize()
                              // it is not exactly the right solution, but it is close
                              // see notes on ABPage.js .resize()
                              // _this.activePage.resize();
                              ////  OLD Logic:
                              //
                              // // Resize components
                              // if (_this.activePage && _this.activePage.comInstances) {
                              // 	for (var key in _this.activePage.comInstances) {
                              // 		if (_this.activePage.comInstances[key].resize)
                              // 			_this.activePage.comInstances[key].resize(width, height);
                              // 	}
                              // }

                              _this.debounceResize = false;
                           }, 5);
                        }
                     },

                     removePage: function(pageId) {
                        var pageCom = this.pageComponents[pageId];
                        var pageElemId = pageCom.ui.id;

                        // swtich the page before it will be removed
                        if (this.activePageId == pageId) {
                           this.showPage(this.rootPage.id);
                        }

                        // remove from .multiview
                        $$(this.containerDomID).removeView(pageElemId);

                        // destroy view's modal
                        if ($$(pageElemId)) $$(pageElemId).destructor();
                     },

                     showUpdatingPopup: function() {
                        let popup = document.createElement("div");
                        let message = document.createTextNode(
                           "UI is updating..."
                        );

                        popup.appendChild(message);

                        let containerDOM = document.getElementById(
                           this.containerDomID
                        );
                        document.body.insertBefore(popup, containerDOM);
                     },

                     hideUpdatingPopup: function() {
                        // document.remo
                     },

                     translate: function(
                        obj,
                        json,
                        fields,
                        languageCode = null
                     ) {
                        json = json || {};
                        fields = fields || [];

                        if (!json.translations) {
                           json.translations = [];
                        }

                        if (typeof json.translations == "string") {
                           json.translations = JSON.parse(json.translations);
                        }

                        var currLanguage =
                           languageCode || AD.lang.currentLanguage;

                        if (fields && fields.length > 0) {
                           // [fix] if no matching translation is in our json.translations
                           //     object, then just use the 1st one.
                           var first = null; // the first translation entry encountered
                           var found = false; // did we find a matching translation?

                           json.translations.forEach(function(t) {
                              if (!first) first = t;

                              // find the translation for the current language code
                              if (t.language_code == currLanguage) {
                                 found = true;

                                 // copy each field to the root object
                                 fields.forEach(function(f) {
                                    if (t[f] != null) obj[f] = t[f];

                                    obj[f] = t[f] || ""; // default to '' if not found.
                                 });
                              }
                           });

                           // if !found, then use the 1st entry we did find.  prepend desired
                           // [language_code] to each of the fields.
                           if (!found && first) {
                              // copy each field to the root object
                              fields.forEach(function(f) {
                                 if (first[f] != null && first[f] != "")
                                    obj[f] = `[${currLanguage}]${first[f]}`;
                                 else obj[f] = ""; // default to '' if not found.
                              });
                           }
                        }
                     },

                     getPageDomID: function(pageId) {
                        return this.unique(
                           "ab_live_page",
                           this.options.app,
                           pageId
                        );
                     },

                     unique: function() {
                        var args = Array.prototype.slice.call(arguments); // Convert to Array
                        return args.join("_");
                     }
                  }); // end AD.Control.extend
               }); // end steal.import
         });
      }); // end System.import
   }
); // end steal

