steal(
    // List your Controller's dependencies here:
    function () {
        var componentIds = {
            editView: 'ab-tab-edit-view',
            editMenu: 'ab-tab-edit-mode',
            addTabForm: 'ab-tab-create-form',
            propertyView: 'ab-tab-property-view',
            pageTree: 'ab-tab-page-tree'
        };

        //Constructor
        var menuComponent = function (application, viewId, componentId) {
            var data = {};

            this.viewId = viewId;
            this.editViewId = componentIds.editMenu;


            this.pendingTransactions = [];

            // Instance functions
            /*
             * @function render
             * display this instance on the screen.
             *
             * @param {json} setting  our instance settings.
             * @return {deferred}
             */
            this.render = function (setting) {
                var q = $.Deferred(),
                    self = this;

                // 1) rebuild the current view of our component 
                // based upon the given setting

                var view = $.extend(true, {}, menuComponent.getView());
                view.id = self.viewId;  

                // setting.pages    : {array} of { page definition }


                            // view.layout = 'x';
                // if (setting.layout)
                //  view.layout = setting.layout;


                // view.click = function (id, ev) {
                //  $(self).trigger('changePage', {
                //      pageId: id
                //  })
                // };

                // do we have any pages added?
                if ((setting.pages)
                    && (setting.pages.length)) {
console.error(' todo!');

                    view = menuComponent.tabView();
                    
                } 


                function finishIt() {

                    // event to notifiy the [ask pong who?] we are finished 
                    // updating our display
                    $(self).trigger('renderComplete', {});

                    if($$(self.viewId).hideProgress) $$(self.viewId).hideProgress();

                    data.isRendered = true;
                    q.resolve();
                }



                if (view.view == 'tabview') {


                    // perform the page lookup here.

                    // foreach page:
                        // add a tab cell






                    // 2) find the existing element on our page, and replace it with the
                    // current view:
                    webix.ui(view, $$(self.viewId));  // create the view at location $$(self.viewId) ?
                    webix.extend($$(self.viewId), webix.ProgressBar);

                    finishIt();

                } else {

                    finishIt();
                }


                // $$(self.viewId).clearAll();
                // $$(self.viewId).showProgress({ type: 'icon' });

                // if (setting.pageIds && setting.pageIds.length > 0) {
                //  // Convert array to object
                //  var pageIds = $.map(setting.pageIds, function (id) {
                //      return { id: id };
                //  });

                //  // Get selected pages
                //  application.getPages({ or: pageIds })
                //      .fail(q.reject)
                //      .then(function (pages) {

                //          pages.forEach(function (p) {
                //              if (p.translate) p.translate();
                //          });

                //          // Convert object format (same arrange)
                //          var pageMenu = [];
                //          pageIds.forEach(function (page) {
                                
                //              // NOTE: if a page was just deleted, an existing menu might 
                //              // still be trying to reference it.  Verify it still exists
                //              // before trying to add it:
                //              var foundPage = pages.filter(function (p) { return p.id == page.id })[0];
                //              if (foundPage && foundPage.label) {
                //                  pageMenu.push({
                //                      id: page.id,
                //                      value: foundPage.label
                //                  });
                //              } else {
                //                  console.warn('AppBuilder:Menu: tried to reference a Page['+page.id+'] that was not found.');
                //              }
                //          });

                //          // Show page menu
                //          $$(self.viewId).parse(pageMenu, 'json');

                //          $(self).trigger('renderComplete', {});

                //          $$(self.viewId).hideProgress();

                //          data.isRendered = true;

                //          q.resolve();
                //      });
                // }
                // else {
                //  $(self).trigger('renderComplete', {});

                //  $$(self.viewId).hideProgress();

                //  data.isRendered = true;
                //  q.resolve();
                // }



                return q;
            };

            this.getSettings = function () {
                // var values = $$(componentIds.propertyView).getValues(),
                //     selectedPages = $$(componentIds.editMenu).find(function () { return true; }),
                //     selectedPageIds = $.map(selectedPages || [], function (page) {
                //         return page.id;
                //     });

                var tabs = [];
                $$(componentIds.pageTree).find(function(obj){
                    tabs.push({
                        checked:obj.checked || false,
                        icon: obj.icon,
                        label: obj.label
                    })
                    return true
                })
                return {
                    tabs: tabs
                };
            };

            this.populateSettings = function (setting) {
                // Menu
                this.render(setting);

                // // Page list
                $$(componentIds.pageTree).clearAll();

                var tabs = setting.tabs || [];
                tabs.forEach(function(tab){

                    // make a copy of tab so changes don't persist unless we click [save]
                    var cTab = {
                        icon: tab.icon,
                        label: tab.label
                    }
                    if (tab.checked == 'true') {
                        cTab.checked = true;
                    } else { 
                        cTab.checked = false; 
                    }

                    $$(componentIds.pageTree).add(cTab, $$(componentIds.pageTree).count());
                })
                

                menuComponent.refreshEditView();


                // var pageItems = [];
                // if (application.currPage) {
                //  webix.extend($$(componentIds.pageTree), webix.ProgressBar);

                //  $$(componentIds.pageTree).showProgress({ type: 'icon' });

                //  var parentId = application.currPage.parent ? application.currPage.parent.attr('id') : application.currPage.attr('id');
                //  application.getPages({ or: [{ id: parentId }, { parent: parentId }] }) // Get children
                //      .fail(function (err) {
                //          $$(componentIds.pageTree).hideProgress();
                //      })
                //      .then(function (pages) {
                //          pages.forEach(function (p) {
                //              if (p.translate)
                //                  p.translate();
                //          });

                //          pageItems = $.map(pages.attr(), function (p) {
                //              if (!p.parent) { // Get root page
                //                  var pageItem = {
                //                      id: p.id,
                //                      value: p.name,
                //                      label: p.label
                //                  };

                //                  // Get children pages
                //                  pageItem.data = $.map(pages.attr(), function (subP) {
                //                      if (subP.parent && subP.parent.id == p.id) {
                //                          return {
                //                              id: subP.id,
                //                              value: subP.name,
                //                              label: subP.label
                //                          }
                //                      }
                //                  });

                //                  return pageItem;
                //              }
                //          });

                //          $$(componentIds.pageTree).parse(pageItems);
                //          $$(componentIds.pageTree).openAll();

                //          // Set checked items
                //          if (setting && setting.pageIds) {
                //              setting.pageIds.forEach(function (pageId) {
                //                  $$(componentIds.pageTree).checkItem(pageId);
                //              });
                //          }

                //          $$(componentIds.pageTree).hideProgress();
                //      });
                // }

                // // Properties
                // if (!$$(componentIds.propertyView)) return;

                // $$(componentIds.propertyView).setValues({
                //  orientation: setting.layout || 'x'
                // });

                $$(componentIds.propertyView).refresh();
            };

            this.isRendered = function () {
                return data.isRendered === true;
            };


            /**
             * @function afterSaveSettings
             * 
             * called after the settings are saved and allows your component
             * to perform additional commands to complete the process.
             *
             * @param {obj} page  the ABPage this component is on.
             * @param {obj} component the ABPageComponent instance of this component
             */
            this.afterSaveSetting = function (page, component) {

var soNowWhat="?";

            }

        };


        // Static functions
        // .getInfo()
        // shows the entry in the component picker
        menuComponent.getInfo = function () {
            return {
                name: 'tab',
                icon: 'fa-window-maximize'
            };
        };


        // .tabView()
        // the base tabview definition
        menuComponent.tabView = function(){
            return  { 
                id:componentIds.editMenu,
                view:"tabview", 
                cells: [
                    // {
                    //   header: "Form",
                    //   // body: {
                    //   //   id: "formView",
                    //   //   view: "label", 
                    //   //   label:"form View"
                    //   // }
                    // }
                ]
                // tabbar:{
                // }, 
                // multiview:{
                // }
            };
        }

        // .getView()
        // return the base Webix component definition
        menuComponent.getView = function () {
            return { 
                view:'label', 
// TODO: make this a multilingual string:
                label:'Add a page below', 
                id:componentIds.editMenu 
            };
        };

        menuComponent.refreshEditView = function() {
            var currentPages = [];
            $$(componentIds.pageTree).getChecked().forEach(function (pageId) {
                currentPages.push($$(componentIds.pageTree).getItem(pageId));
            });
            
            var updatedView = {};

            // if we have tabs
            if (currentPages.length) {

                // get the tabView data
                updatedView = menuComponent.tabView();

                // for each tab
                    // add a cell to the template
                currentPages.forEach(function(obj){
                    if (obj.checked) {
                        updatedView.cells.push(
                            {
                              header: "<i class='fa "+obj.icon+"'></i> "+obj.label,
                              body: {
                                view: "label", 
                                label:""
                              }
                            }
                        );
                    }
                    return true;
                });

            } else {

                // get the base label view
                updatedView = menuComponent.getView();
            }


            // overwrite the current instance of our component
            webix.ui(updatedView, $$(componentIds.editMenu));
        }

        menuComponent.getEditView = function (componentManager) {
            var menu = $.extend(true, {}, menuComponent.getView());
            // menu.id = componentIds.editMenu;

            return {
                id: componentIds.editView,
                padding: 10,
                rows: [
                    menu,

                    {
                        id:componentIds.addTabForm,
                  

                      "view": "form",
                      "elements": [{
                          "margin": 10,
                          "cols": [
                            {
                              "rows": [
                                {
                                  "view": "text",
                                  "name": "Name",
                                  "label": "Tab Name",
                                  "labelWidth": "100",
    // TODO: make this multilingual
                                  "placeholder": "Enter a tab name",
                                  "invalidMessage": "Tab name cannot be empty",
                                  "required":true,
                                  "width": 300, on:{
                                    "onBlur":function(){
                                        //or validate this element only
                                        if (!this.validate()) {
                                            webix.message("Please enter a tab name");
                                            return false;
                                        }
                                    }}
                                }
                              ]
                            },
                            {
                              "rows": [
                                {
                                  "view": "text",
                                  "name": "Icon",
                                  "label": "Icon",
                                  "labelWidth": "50",
    // TODO: make this multilingual
                                  "placeholder": "Choose an icon",
                                  "width": 200
                                }
                              ]
                            },
                            {
                                view:"button",
                                width:100,
                                // TODO: make this multilingual
                                value: 'Add Page',
                                click:function(){
                                    if (!$$(componentIds.addTabForm).validate()) {
                                        webix.message("Please enter a tab name");
                                        return false;
                                    }

                                    
                                    var values = $$(componentIds.addTabForm).getValues();

                                    // 1) Trim value
                                    // 2) lowerCase() name must not match any existing lc names

                                    // componentManager.editInstance is the reference to
                                    // the current instance of the Tab we are editing.
                                    // store the new page values here:
                                    var currentTab = componentManager.editInstance;
                                    if (!currentTab.pendingTransactions) {
                                        currentTab.pendingTransactions = [];
                                    }

                                    // record a new 'add' operation
                                    currentTab.pendingTransactions.push({
                                        op:'add',
                                        values: values
                                    });

                                    console.log('transactions:', currentTab.pendingTransactions);

                                    // $$(componentIds.pageTree).add({label:values.Name, icon:values.Icon}, $$(componentIds.pageTree).count(), "root" );
                                    $$(componentIds.addTabForm).clear();

                                    var currentValue = {label:values.Name, icon:values.Icon, checked:true};


                                    // update the display of our pageTree
                                    $$(componentIds.pageTree).add(currentValue, $$(componentIds.pageTree).count());

                                    menuComponent.refreshEditView();

                                    // var currentPages = $$(componentIds.pageTree).getChecked();
                                    

                                    // var updatedView = {};
                                    // // if we have tabs
                                    // if (currentPages.length) {

                                    //     // get the tabView data
                                    //     updatedView = menuComponent.tabView();

                                    //     // for each tab
                                    //         // add a cell to the template
                                    //     currentPages.forEach(function(obj){
                                    //         updatedView.cells.push(
                                    //             {
                                    //               header: "<i class='fa "+obj.icon+"'></i> "+obj.label,
                                    //               body: {
                                    //                 view: "label", 
                                    //                 label:"Your tab content will appear here."
                                    //               }
                                    //             }
                                    //         );
                                    //         return true;
                                    //     });

                                    // }
                                    // // else
                                    //     // get the base label view
                                    //     // endif

                                    // // overwrite the current instance of our component
                                    // webix.ui(updatedView, $$(componentIds.editMenu));


                                    

                                    // // caus of that stupid Webix issue!
                                    // currentPages.forEach(function(obj){
                                    //     $$(componentIds.pageTree).add(obj, $$(componentIds.pageTree).count(), "root" );
                                    // })
                                    // //$$(componentIds.editMenu).adjust();

                                }
                              
                            }
                          ]
                        }]
                    },

                    {
                        id: 'this-is-not-it',
                        view: 'label',
                        label: 'Tab list'
                    },
                    {
                     id: componentIds.pageTree,
                     view: 'tree',
                     template: "<div class='ab-page-list-item'>" +
                     "{common.checkbox()} <i class='fa #icon#'></i> #label#" +
                     "</div>",
                     on: {
                         onItemCheck: function () {
                             menuComponent.refreshEditView();
                         }
                     }
                    }
                ]
            };
        };

        menuComponent.getPropertyView = function (componentManager) {
            var self = this;

            return {
                view: "property",
                id: componentIds.propertyView,
                elements: [
                    { label: "Layout", type: "label" },
                    {
                        id: 'orientation',
                        type: "richselect",
                        label: "Orientation",
                        options: [
                            { id: 'x', value: "Horizontal" },
                            { id: 'y', value: "Vertical" }
                        ]
                    },
                ],
                on: {
                    onAfterEditStop: function (state, editor, ignoreUpdate) {
                        if (state.old === state.value) return true;

                        switch (editor.id) {
                            case 'orientation':
                                var setting = componentManager.editInstance.getSettings();
                                componentManager.editInstance.render(setting);
                                break;
                        }
                    }
                }
            };
        };

        menuComponent.editStop = function () {
            if ($$(componentIds.propertyView))
                $$(componentIds.propertyView).editStop();
        };

        return menuComponent;

    }
);