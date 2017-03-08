steal(
    'opstools/BuildApp/controllers/utils/InputValidator.js',
    'opstools/BuildApp/controllers/webix_custom_components/EditTree.js',
    // List your Controller's dependencies here:
    function (inputValidator) {
        var componentIds = {
            editView: 'ab-tab-edit-view',
            editMenu: 'ab-tab-edit-mode',
            addTabForm: 'ab-tab-create-form',
            iconPicker: 'ab-tab-icon-picker',
            propertyView: 'ab-tab-property-view',
            pageTree: 'ab-tab-page-tree'
        };

        //Constructor
        var tabComponent = function (application, viewId, componentId) {
            var data = {};

            var _this = this;

            this.viewId = viewId;
            this.editViewId = componentIds.editMenu;


            // transactions that should be processed after the Tab instance 
            // is saved
            this.pendingTransactions = [];


            //
            // Instance functions
            //

            this.transaction = function(action, value) {

                if (!this.pendingTransactions) {
                    this.pendingTransactions = [];
                }

                // record a new 'add' operation
                this.pendingTransactions.push({
                    op:action,
                    values: value
                });
            }


            /*
             * @function render
             * display this instance on the screen.
             *
             * in whatever context this component is being displayed, in the editor or on 
             * a generated page, render this instance based upon the provided settings.
             *
             * @param {json} setting  our instance settings.
             * @return {deferred}
             */
            this.render = function (setting) {
                var q = $.Deferred(),
                    self = this;

                // 1) rebuild the current view of our component 
                // based upon the given setting

                var view = $.extend(true, {}, tabComponent.getView());

                // setting.tabs    : {array} of { tab definitions }



                // do we have any pages added?
                // if (!self.listTabPages.length > 0) {
                    if ((setting.tabs)
                        && (setting.tabs.length)) {

                        view = tabComponent.tabView();
                        // self.listTabPages = setting.tabs;
                    } 
                // } else {
                //     view = tabComponent.tabView();
                // }
                view.id = self.viewId;  


                // there are several paths in .render() that need to
                // properly close out the method.  This is a common
                // routine to properly finish off the process.
                function finishIt() {

                    // event to notifiy the [ask pong who?] we are finished 
                    // updating our display
                    $(self).trigger('renderComplete', {});

                    var tabView = $$(self.viewId);
                    if (tabView && tabView.hideProgress) {
                        tabView.hideProgress();
                    }


                    data.isRendered = true;
                    q.resolve();
                }


                // if we are actually rendering tabs here
                if (view.view == 'tabview') {


                    // perform the page lookup here.
                    var listPagesToLoad = [];

                    // for each tab
                        // add a cell to the template
                    setting.tabs.forEach(function(tab){
                        if ((tab.checked === true) || (tab.checked == 'true')) {
                            view.cells.push(
                                {
                                  header: "<i class='fa "+tab.icon+"'></i> "+tab.label,
                                  body: {
                                    view: "template", 
                                    css: 'ab-scroll-y',
                                    template:"<div id=\""+tab.uuid+"\" > </div>",
                                    height:500
                                  }
                                }
                            );
                            listPagesToLoad.push(tab.uuid);
                        }
                        return true;
                    });


                    // 2) find the existing element on our page, and replace it with the
                    // current view:
                    var tabView = webix.ui(view, $$(self.viewId));  // create the view at location $$(self.viewId) ?
                    webix.extend($$(self.viewId), webix.ProgressBar);

                    tabView.getTabbar().attachEvent("onChange", function(newv, oldv){

                        refreshTabView(function(err) {
                            if(err == null) {
                                $(self).trigger('changeTab', {});
                            }
                        });
                    });


                    var Page = AD.Model.get('opstools.BuildApp.ABPage');

                    function refreshTabView(cb) {
                        var renderTasks = [];

                        if (tabView._pageTabs) {
                            tabView._pageTabs.forEach(function(page){

                                // a tab view only generates the display of 1 page
                                // at a time.  So find which one is displayed:
                                var id = '#'+page.name;
                                if ($(id).length) {

                                    // mark this one to be rendered
                                    renderTasks.push(function(next) {

                                        // insert the page template html
                                        // this should have all the <div>s for 
                                        // it's components to attach to.
                                        $(id).html(page.getItemTemplate());

                                        // force a refresh on components
                                        // page.comInstances = null;
                                        page.removeAttr('comInstances');

                                        // cause the page to insert it's components:
                                        page.display(application)
                                            .fail(next)
                                            .done(function() {
                                                next();
                                            });
                                    });
                                }

                            });
                        }

                        async.series(renderTasks, function(err) {
                            if (cb) cb(err);
                        });
                    } // end refreshTabView()


                    // 3) load the pages associated with these tabs:
                    if (listPagesToLoad.length) {

//// NOTE: due to ABApplication.getPage() deleting the store, we can't do this.
//// instead pull our pages from application.pages:

//                         Page.findAll({ name: listPagesToLoad })
//                         .then(function(pageTabs){

// // self.pageTabs = pageTabs;
//                             tabView._pageTabs = pageTabs;

//                             refreshTabView(finishIt);
//                         })
                        // reuse existing application.pages
                        var pageTabs = application.pages.filter(function(p){ return listPagesToLoad.indexOf(p.name) > -1; })
                        tabView._pageTabs = pageTabs;
                        refreshTabView(finishIt);

                    } else {
                        finishIt();
                    }

                } else {

                    // else our tabView currently doesn't have any Tabs to render.
                    finishIt();
                }


                return q;
            };


            /**
             * @function getSettings
             *
             * In the Editor, once the user clicks [save], this is called
             * to pull out the current settings for this component.
             * @return {json}  the {json} configuration that becomes our 
             *                 {settings} parameters in our instance methods.
             *                  .tabs {array} of tab definitions for this instance
             *                      .checked {bool} if this tab is currently included
             *                      .icon {string} the fa-[icon] for this tab
             *                      .label {string} what is displayed for this  
             *                                      tab's label
             *                      .uuid {string} the uuid link to the ABPage that
             *                                     is displayed in this Tab area.
             */
            this.getSettings = function () {

                var tabs = [];
                $$(componentIds.pageTree).find(function(obj){
                    tabs.push({
                        checked:obj.checked || false,
                        icon: obj.icon,
                        label: obj.label,
                        uuid: obj.uuid
                    })
                    return true
                });

                if (tabs == null || tabs.length == 0) tabs = '';

                return {
                    tabs: tabs
                };
            };


            /**
             * @function populateSettings
             *
             * In the Editor, take our current {settings} and display those 
             * values in the component's editor.
             */
            this.populateSettings = function (setting) {
                

                // call .render() to place the element on the page.
                // NOTE: this is happening in the Editor, so don't display
                // the rendered Tabs here:
                this.render({});


                // Clear the current tree view
                $$(componentIds.pageTree).clearAll();

                // display each tab definition in our tree view
                var tabs = setting.tabs || [];
                tabs.forEach(function(tab){

                    // make a copy of tab so changes don't persist unless 
                    // we click [save]
                    var cTab = {
                        icon: tab.icon,
                        label: tab.label,
                        uuid: tab.uuid,
                        tabID: componentId
                    }
                    if (tab.checked == 'true') {
                        cTab.checked = true;
                    } else { 
                        cTab.checked = false; 
                    }

                    // add it to the tree view
                    $$(componentIds.pageTree).add(cTab, $$(componentIds.pageTree).count());
                })
                

                // we've added a method to our component to update the display 
                // once a configuration change has been made.
                tabComponent.refreshEditView(componentIds.editMenu /* viewId */);

                $$(componentIds.propertyView).refresh();
            };


            /**
             * @function isRendered
             *
             * indicates wether or not our component has rendered itself to the 
             * display.
             *
             * Should return TRUE after our .render() method has been called.
             *
             * @return {bool}
             */
            this.isRendered = function () {
                return data.isRendered === true;
            };


            /**
             * @function beforeDestroy
             *
             * before a Tab component is destroyed, make sure all it's associated
             * pages are deleted.
             *
             * Should return TRUE after our .render() method has been called.
             *
             * @return {bool}
             */
            this.beforeDestroy = function(next) {
                // console.error('beforeDestroy!');

                // get the current instance of my component
                var Component = AD.Model.get('opstools.BuildApp.ABPageComponent');
                Component.findOne({id:componentId})
                .fail(next)
                .done(function(thisTab){

                    // if we found our definition:
                    if (thisTab) { 

                        // if there are setting.tabs defined:
                        if ((thisTab.setting) && (thisTab.setting.tabs)) {

                            // find all the page.name(s) to remove
                            var listPagesToRemove = [];
                            thisTab.setting.tabs.forEach(function(tab){
                                listPagesToRemove.push(tab.uuid);
                            })

                            // if pages to delete
                            if (listPagesToRemove.length > 0) {

                                var Page = AD.Model.get('opstools.BuildApp.ABPage');
                                Page.findAll({name:listPagesToRemove})
                                .fail(next)
                                .done(function(pages){

                                    var allDeleteIDs = [];
                                    pages.forEach(function(page){
                                        allDeleteIDs.push(page.id);
                                    })

                                    var allDeleteOperations = [];
                                    application.pages
                                    .filter(function (p ) { return allDeleteIDs.indexOf(p.id) > -1 })
                                    .forEach(function(p){
                                        allDeleteOperations.push(p.destroy());
                                    })

                                    $.when.apply($, allDeleteOperations)
                                    .fail(next)
                                    .then(function() {

                                        // all our pages have been removed
                                        next();
                                    })
                                })  

                            } else { 

                                // defined tabs were empty
                                next();
                            }

                        } else {
                            // we haven't defined any tabs yet.  
                            // move along.
                            next();
                        }

                    } else {

                        // couldn't find myself.  this shouldn't happen!
                        next(new Error('no tab found (id:'+componentId+')'));
                    }

                });

            }


            /**
             * @function afterUpdate
             * 
             * called after the settings are saved and allows your component
             * to perform additional commands to complete the process.
             *
             * @param {obj} page  the ABPage this component is on.
             * @param {obj} component the ABPageComponent instance of this component
             * @return {Deferred} since this can be an async method of updating
             *              DB settings.
             */
            this.afterUpdate = function (next  /* page, component */) {
                var dfd = AD.sal.Deferred();
                var _this = this;

                function onError(err){
                    AD.error.log('error in tab.afterUpdate()',err);
                    if(next) next(err);
                    dfd.reject(err);
                }

                var Component = AD.Model.get('opstools.BuildApp.ABPageComponent');
                Component.findOne({id:componentId})
                .fail(onError)
                .done(function(thisTab){

                    if ((!thisTab) || (thisTab.length==0)) {
                        onError(new Error('tab component not found (id:'+componentId+')'));
                    } else {


                        var page = application.pages.filter(function(p) { return p.id == thisTab.page.id })[0];

                        if (page) { 

                            var actions = [];

                            _this.pendingTransactions.forEach(function(trans){

                                switch(trans.op) {
                                    case 'add':
                                        // name the page with our uuid, so we can manage it later.
                                        actions.push(page.createTab({ name: trans.values.uuid, label:trans.values.Name }).done(function(result) {
                                            // FIX : call add event to tell CanJS list
                                            can.event.dispatch.call(AD.classes.AppBuilder.currApp, "change", ['pages', 'add', [result]]);
                                        }));
                                        break;


                                    case 'delete':
                                        var targetPage = application.pages.filter(function(p) { return p.name == trans.values.uuid })[0];
                                        if (targetPage) {
                                            actions.push(targetPage.destroy().done(function(result) {
                                                // FIX : remove deleted tab in list
                                                can.event.dispatch.call(AD.classes.AppBuilder.currApp, "change", ['pages', 'remove', null, [result]]);
                                            }));
                                        } else {
                                            AD.error.log("Could not find target page to delete", { uuid: trans.values.uuid});                                            
                                        }
                                        
                                        break;
                                    case 'update':
                                        var targetPage = application.pages.filter(function(p) { return p.name == trans.values.uuid })[0];
                                        if (targetPage) {
                                            targetPage.attr('label', trans.values.label);
                                            actions.push(targetPage.save());
                                        } else {
                                            AD.error.log("Could not find target page to update", { uuid: trans.values.uuid});
                                        }
                                        break;

                                    default:
                                        console.error('unknown transaction type:', trans.op);
                                        break;
                                }
                            })

                            $.when.apply($, actions)
                            .fail(onError)
                            .then(function() {
                                console.log('looks good.');
                                if (next) next();
                                dfd.resolve();
                            })

                        } else {
                            onError(new Error('could not find my application.page (id:'+thisTab.page.id+')'));
                        }

                    }
                })
                return dfd;
            }


            /**
             * @function resize
             *
             * This method is called when the page this app is on initiates a 
             * resize().
             *
             * (if they are in edit mode, then you wont get the updated value)
             *
             * @param {integer} width
             * @param {integer} height
             */
            this.resize = function TabResize(width, height) {
                var _this = this;

                // // in case this is somehow called from the OPsPortal directly:
                // if (!height) {
                //     if (width.height) {
                //         // width parameter looks like the OPsPortal 
                //         // { height:value, width:value }
                //         height = width.height;
                //         width = width.width;
                //     }
                // }

                // .resize() can get spammed numerous times in a row.
                // let's not .adjust() each time to increase performance.
                if (!this.resizeDebounce) {

                    this.resizeDebounce = true;
                    
                    setTimeout(function(){

                        var myTabComponent = $$(_this.viewId);
                        if (myTabComponent) {
                            myTabComponent.adjust();

                            // make sure any of our Tab Views are resized()
                            if (myTabComponent._pageTabs) {
                                myTabComponent._pageTabs.forEach(function(tab){
                                    tab.resize(width, height);
                                })
                            }
                        }
                        
                        _this.resizeDebounce = false;
                    }, 10);

                }
            }

        }


        //
        // Static Class functions
        // 


        /**
         * @function getInfo
         *
         * returns the definition that allows the Editor to display an icon
         * to drag this component onto the Page layout.
         *
         * This needs to provide a 
         *      .name : {string}  The label for this component
         *      .icon : {string}  The font awesome icon to display 
         *
         * @return {json} 
         */
        tabComponent.getInfo = function () {
            return {
                name: 'tab',
                icon: 'fa-window-maximize'
            };
        };


        // .tabView()
        // the base tabview Webix definition
        tabComponent.tabView = function(){
            return  { 
                // id:componentIds.editMenu,
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


        /**
         * @function getView
         * 
         * returns the Webix definition for this component.
         *
         * For our Tab Component, we start off by returning a Label view.
         * If any tabs are available, we then swtich to the .tabView definition.
         * 
         * We do it this way because Webix will not display a tab view correctly
         * if there are no .cell entries.
         *
         * @return {json} 
         */
        tabComponent.getView = function () {
            return { 
                view:'label', 
                label:AD.lang.label.getLabel('ab.component.tab.addPage') || '*Add a page below'
                // , id:componentIds.editMenu 
            };
        };


        // refreshEditView
        // There are several places in our Tab Component when we want to 
        // update the Editor once a change has been made (click on a tab entry
        // to include or exclude from the list)
        //
        // this is unique to our Tab View
        tabComponent.refreshEditView = function(tabViewId) {

            // find out which pages have been included (those that are checked)
            var currentPages = [];
            $$(componentIds.pageTree).getChecked().forEach(function (pageId) {
                currentPages.push($$(componentIds.pageTree).getItem(pageId));
            });
            
            var updatedView = {};

            // if we have tabs
            if (currentPages.length) {

                // get the tabView data
                updatedView = tabComponent.tabView();

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
                updatedView = tabComponent.getView();
            }

            // make sure we continue our reference.
            updatedView.id = tabViewId;

            // overwrite the current instance of our component
            webix.ui(updatedView, $$(tabViewId));
        }


        /**
         * @function getEditView
         *
         * return the Webix layout definition for what should be displayed for
         * this component's Editor.
         *
         * @return {json}
         */
        tabComponent.getEditView = function (componentManager) {
            var menu = $.extend(true, {}, tabComponent.getView());
            menu.id = componentIds.editMenu;

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
                                            "placeholder": AD.lang.label.getLabel('ab.component.tab.enterTabName') || "*Enter a tab name",
                                            "invalidMessage":AD.lang.label.getLabel('ab.component.tab.invalidTabName') || "*Tab name cannot be empty",
                                            "required":true,
                                            on:{

                                                "onBlur":function(){
                                                    //or validate this element only
                                                }
                                            }
                                        }
                                    ]
                                },
                            {
                                "rows": [
                                    {
                                        "id": componentIds.iconPicker,
                                        "view": "template",
                                        // "name": "Icon",
                                        // "label": "Icon",
                                        // "labelWidth": "50",
                                        // "placeholder": AD.lang.label.getLabel('ab.component.tab.chooseIcon') || "*Choose an icon",
                                        "width": 90,
                                        "borderless": true,
                                        "template": '<div class="btn-group">' +
                                                        '<button type="button" class="btn btn-primary iconpicker-component"><i class="fa fa-fw fa-heart"></i></button>' +
                                                        '<button type="button" class="icp icp-dd btn btn-primary dropdown-toggle" style="height: 28px" data-selected="fa-car" data-toggle="dropdown">' +
                                                        '<span class="caret"></span>' +
                                                        '<span class="sr-only">Toggle Dropdown</span>' +
                                                        '</button>' +
                                                        '<div class="dropdown-menu"></div>' +
                                                        '</div>',
                                        "on": {
                                            "onAfterRender": function() {
                                                var chooseIcon = $(this.$view).find('.icp-dd');
                                                if (chooseIcon.iconpicker) {
                                                    chooseIcon.iconpicker({ hideOnSelect: true });
                                                }
                                            }
                                        }
                                    }
                                ]
                            },
                            {
                                view:"button",
                                width:100,
                                value: AD.lang.label.getLabel('ab.component.tab.addTab') || "*Add Page",

                                // .click
                                // the [Add Page] button for our input form
                                click:function(){

                                    // make sure our form is valid
                                    if (!$$(componentIds.addTabForm).validate()) {
                                        webix.message(AD.lang.label.getLabel('ab.component.tab.enterTabName') || "*Please enter a tab name");
                                        return false;
                                    }

                                    
                                    var values = $$(componentIds.addTabForm).getValues();

                                    if (!inputValidator.validate(values['Name'])) {
                                        return false;
                                    }

                                    values.uuid = AD.util.uuid('tabs-');

                                    // 1) Trim value
                                    // 2) lowerCase() name must not match any existing lc names



                                    // after all our validations pass, we will 
                                    // store this as a pending transaction.
                                    //
                                    // we will add a new page to our page list to
                                    // reference this tab. The user can edit the 
                                    // tab view by editing that page in the editor.
                                    //
                                    // but we will wait until [save] is pressed 
                                    // before actually creating those pages.
                                    // 
                                    // to do that, we will store this as a pendingTransaction
                                    // on our component.  And when the .afterSaveSetting() is
                                    // called, we will then issue the commands to create the
                                    // pages.
                                    // 
                                    // componentManager.editInstance is the reference to
                                    // the current instance of the Tab we are editing.
                                    // store the new page transactions here:

                                    // make sure we have a pending transaction
                                    var currentTab = componentManager.editInstance;
                                    currentTab.transaction('add', values);

                                    var chooseIcon = $($$(componentIds.iconPicker).$view).find('.icp-dd');
                                    var iconData = chooseIcon.data('iconpicker');
                                    var icon = null;
                                    if (iconData) {
                                        icon = iconData.iconpickerValue;
                                    }
                                    

                                    // clear our form
                                    $$(componentIds.addTabForm).clear();

                                    // new tab definition value
                                    var currentValue = {label:values.Name, icon: icon, checked:true, uuid:values.uuid};

                                    // update the display of our pageTree
                                    $$(componentIds.pageTree).add(currentValue, $$(componentIds.pageTree).count());

                                    // now update the Edit View to represent the 
                                    // current settings/values
                                    tabComponent.refreshEditView(componentIds.editMenu);

                                    // set focus back on the Name text box
                                    $$(componentIds.addTabForm).focus();

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
                        view: 'edittree',
                        editaction: 'click',
                        editable: true,
                        editor: "text",
                        editValue: "label",

                        template: function(item, common) {

                            var template = "<div class='ab-page-list-item'>" +
                                  "{common.checkbox()} <i class='fa #icon#'></i> #label#" +
                                  common.iconDelete+
                                  "</div>"
                            template = template.replace('#label#', item.label).replace('#icon#', item.icon).replace('{common.checkbox()}', common.checkbox(item));
                            return template;
                        },
                        type: {
                            iconDelete: "<span class='webix_icon ab-tab-page-delete fa-trash pull-right'></span>"
                        },
                        on: {

                            // .onItemCheck
                            // the [] next to the tab in the tree view
                            // each time one is clicked we need to update the Edit View
                            onItemCheck: function () {
                                tabComponent.refreshEditView(componentIds.editMenu);
                            },

                            // .onAfterEditStop
                            // store the info for updating the pages during .afterUpdate()
                            onAfterEditStop: function (state, editor, ignoreUpdate) {
                                if (state.value != state.old) {

                                    var thisEntry = this.getItem(editor.id);


                                    // mark this for an afterUpdate() action:
                                    var currentTab = componentManager.editInstance;
                                    currentTab.transaction('update', thisEntry)


                                    // refresh our sample display
                                    tabComponent.refreshEditView(componentIds.editMenu);
                                }
                            }


                        },
                        onClick:{
                            'ab-tab-page-delete': function(e, id, trg) {

                                var _treeView = this;

                                // clear our form validation
                                $$(componentIds.addTabForm).clearValidation();


                                var currTab = this.getItem(id);
                                AD.op.Dialog.ConfirmDelete({

                                    text: AD.lang.label.getLabel('opp.dialog.confirm.deleteMsg', [currTab.label]), // self.labels.interface.confirmDeleteMessage.replace('{0}', selectedPage.label),
                                    callback: function (result) {
                                        if (result) {
                                            
                                            // mark this for an afterUpdate() action:
                                            var currentTab = componentManager.editInstance;
                                            currentTab.transaction('delete', currTab);


                                            // remove this from the tree entry:
                                            _treeView.remove(id);

                                            // refresh our sample display
                                            tabComponent.refreshEditView(componentIds.editMenu);
                                        }

                                    }
                                });

                                // stop the click propogation, so the text editor doesn't show up.
                                return false;

                            }
                        }
                    }
                ]
            };
        };


        /**
         * @function getPropertyView
         *
         * The Editor has a property list on the right side.
         * 
         * This method returns the Webix layout for that display.
         *
         * @param {object} componentManager
         * @return {json} 
         */
        tabComponent.getPropertyView = function (componentManager) {
            var self = this;

            // if you change a property value, you can reset the display by:
            // var setting = componentManager.editInstance.getSettings();
            // componentManager.editInstance.render(setting);

            return {
                id: componentIds.propertyView,
                view: "label",
                label: ""
            };
        };



        /**
         * @function editStop
         *
         * This method is called before .saveSetting().  It is for making
         * sure any field in your property editor is no longer in an edit mode 
         * before you try to read from them.
         *
         * (if they are in edit mode, then you wont get the updated value)
         *
         * @param {object} componentManager
         * @return {json} 
         */
        // tabComponent.editStop = function () {
        //     if ($$(componentIds.propertyView))
        //         $$(componentIds.propertyView).editStop();
        // };



        return tabComponent;
    }
);