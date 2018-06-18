/*
 * ABViewPage
 *
 * An ABView that represents a "Page" in the system.
 *
 * Pages are 
 *	- allowed to be displayed in the interface list
 *	- return a full list of components that can be added to the view editor
 * 
 *
 */

import ABViewContainer from "./ABViewContainer"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

var ABPropertyComponentDefaults = {
    type: 'page', // 'page', 'popup' or 'reportPage'
}

var ABViewDefaults = {
    key: 'page',		// unique key identifier for this ABView
    icon: 'file-o',		// icon reference: (without 'fa-' )

}

export default class ABViewPage extends ABViewContainer {

    constructor(values, application, parent, defaultValues) {

        super(values, application, parent, (defaultValues || ABViewDefaults));


        // 	{
        // 		id:'uuid',					// uuid value for this obj
        // 		key:'viewKey',				// unique key for this View Type
        // 		icon:'font',				// fa-[icon] reference for an icon for this View Type

        //		name: '',					// unique page name

        // 		label:'',					// pulled from translation

        //		settings: {					// unique settings for the type of field
        //		},

        //		translations:[]
        // 	}

        this.parent = null;  // will be set by the pageNew() that creates this obj.
    }


    static common() {
        return ABViewDefaults;
    }


    /**
     * @method toObj()
     *
     * properly compile the current state of this ABViewPage instance
     * into the values needed for saving to the DB.
     *
     * @return {json}
     */
    toObj() {

        var obj = super.toObj();

        obj.name = this.name;

        // icon of popup page
        if (this.settings.type == 'popup')
            obj.icon = "window-maximize";

        // set label of the page
        if (!this.label || this.label == '?label?')
            obj.label = obj.name;

        // compile our pages
        var pages = [];
        this._pages.forEach((page) => {
            pages.push(page.toObj())
        })

        obj.pages = pages;


        // compile our data sources
        var dataCollections = [];
        this._dataCollections.forEach((data) => {
            dataCollections.push(data.toObj())
        })

        obj.dataCollections = dataCollections;


        return obj;
    }



    /**
     * @method fromValues()
     *
     * initialze this object with the given set of values.
     * @param {obj} values
     */
    fromValues(values) {

        super.fromValues(values);

        // icon of popup page
        if (values.settings.type == 'popup')
            this.icon = "window-maximize";

        // set label of the page
        if (!this.label || this.label == '?label?')
            this.label = this.name;


        // now properly handle our sub pages.
        var pages = [];
        (values.pages || []).forEach((child) => {
            pages.push(this.pageNew(child));  // ABViewManager.newView(child, this.application, this));
        })
        this._pages = pages;


        // now properly handle our data sources.
        var dataCollections = [];
        (values.dataCollections || []).forEach((data) => {
            dataCollections.push(this.dataCollectionNew(data));
        })
        this._dataCollections = dataCollections;


        // the default columns of ABView is 1
        this.settings.columns = this.settings.columns || 1;
        this.settings.gravity = this.settings.gravity || [1];

        // convert from "0" => 0

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

        var comp = super.editorComponent(App, mode);


        var _init = (options) => {

            comp.init(options);

            // initialize data sources
            this.pageRoot().dataCollections().forEach((dc) => {
                dc.init();
            });


        };


        return {
            ui: comp.ui,
            init: _init,
            logic: comp.logic,

            onShow: comp.onShow
        }

    }


    static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

        var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

        _logic.permissionClick = (id, e, node) => {
            var List = $$(ids.permissions);
            var item = List.getItem(id); 

            if (item.markCheckbox) {

                OP.Comm.Service.delete({
                    url: "/app_builder/page/"+item.action_key+"/role",
                    data: {
                        role_id: item.id
                    }
                }).then((data) => {

                    item.markCheckbox = false;
                    List.updateItem(id, item); 

                });

            } else {

                OP.Comm.Service.put({
                    url: "/app_builder/page/"+item.action_key+"/role",
                    data: {
                        role_id: item.id
                    }
                }).then((data) => {

                    item.markCheckbox = true;
                    List.updateItem(id, item); 

                });

            }
            

        };

        // in addition to the common .label  values, we 
        // ask for:
        return commonUI.concat([
            {
                name: 'type',
                view: 'richselect',
                label: L('ab.components.page.type', "*Type"),
                options: [
                    { id: 'page', value: L('ab.components.page.page', "*Page") },
                    { id: 'popup', value: L('ab.components.page.popup', "*Popup") }
                ]
            },
            {
                view: "fieldset",
                name: "dataCollectionPanel",
                label: L('ab.component.page.dataCollections', '*Data Collections:'),
                labelWidth: App.config.labelWidthLarge,
                body: {
                    type: "clean",
                    paddingY: 20,
                    paddingX: 10,
                    rows: [
                        {
                            cols: [
                                {
                                    view: "label",
                                    label: L("ab.component.page.collections", "*Collections:"),
                                    width: App.config.labelWidthLarge,
                                },
                                {
                                    view: "button",
                                    name: "datacollection",
                                    label: L("ab.component.page.settings", "*Settings"),
                                    icon: "gear",
                                    type: "icon",
                                    badge: 0,
                                    click: function () {
                                        App.actions.interfaceViewPartChange('data');
                                    }
                                }
                            ]
                        }

                    ]
                }
            },
            {
                view: "fieldset",
                name: "pagePermissionPanel",
                label: L('ab.component.page.pagePermissions', '*Page Permissions:'),
                labelWidth: App.config.labelWidthLarge,
                body: {
                    type: "clean",
                    paddingY: 20,
                    paddingX: 10,
                    rows: [
                        {
            				name: 'permissions',
            				view: 'list',
            				select: false,
            				minHeight: 200,
            				template: "{common.markCheckbox()} #name#",
                            type:{
                                markCheckbox:function(obj ){
                                    return "<span class='check webix_icon fa-"+(obj.markCheckbox?"check-":"")+"square-o'></span>";
                                }
                            },
                            on: {
                                onItemClick: function (id, e, node) {
                                    _logic.permissionClick(id, e, node);
                                }
                            }
            			}
                    ]
                }
            }
        ]);


    }


    static propertyEditorPopulate(App, ids, view, logic) {

        super.propertyEditorPopulate(App, ids, view, logic);

        $$(ids.type).setValue(view.settings.type || ABPropertyComponentDefaults.type);

        // Disable select type of page when this page is root 
        if (view.isRoot()) {
            $$(ids.type).hide();
            $$(ids.dataCollectionPanel).show();
            
            // Update permission options
            $$(ids.pagePermissionPanel).show();
            this.propertyUpdatePermissionsOptions(ids, view);
        }
        else {
            $$(ids.pagePermissionPanel).hide();
            $$(ids.type).show();
            $$(ids.dataCollectionPanel).hide();
        }

        this.populateBadgeNumber(ids, view);

        // when data collections are added/deleted, then update number of badge
        this.viewUpdateEventIds = this.viewUpdateEventIds || {}; // { viewId: number, ..., viewIdn: number }
        if (!this.viewUpdateEventIds[view.id]) {
            this.viewUpdateEventIds[view.id] = AD.comm.hub.subscribe('ab.interface.update', (message, data) => {

                if (data.rootPage && data.rootPage.id == view.id) {
                    this.populateBadgeNumber(ids, view);
                }

            });

        }


    }


    static propertyEditorValues(ids, view) {

        super.propertyEditorValues(ids, view);

        view.settings.type = $$(ids.type).getValue();

    }


    static populateBadgeNumber(ids, view) {

        var dataCols = view.dataCollections();
        if (dataCols && dataCols.length > 0) {
            $$(ids.datacollection).define('badge', dataCols.length);
            $$(ids.datacollection).refresh();
        }
        else {
            $$(ids.datacollection).define('badge', 0);
            $$(ids.datacollection).refresh();
        }

    }
    
    static getPageActionKey(view) {
        
        return ['opstools', "AB_" + String(view.application.name).replace(/[^a-z0-9]/gi, ''), String(view.name).replace(/[^a-z0-9]/gi, '').toLowerCase(), "view"].join('.');
        
    }
    
    /**
     * @method propertyUpdatePermissionsOptions
     * Populate permissions of Ops Portal to select list in property
     * 
     */
    static propertyUpdatePermissionsOptions(ids, view) {

        var action_key = this.getPageActionKey(view);
        var roles = [];
        
        view.application.getPermissions()
            .then(function (selected_role_ids) {
                var app_roles = selected_role_ids;

                OP.Comm.Service.get({
                    url: "/app_builder/page/"+action_key+"/role"
                }).then((data) => {

                    var selectedRoles = [];
                    data.selected.forEach((s) => {
                        selectedRoles.push(s.id);
                    });
                    
                    data.roles.forEach((r) => {
                        if (app_roles.indexOf(r.id) != -1) {
                            if (selectedRoles.indexOf(r.id) != -1) {
                                r.markCheckbox = true;
                            } else {
                                r.markCheckbox = false;
                            }
                            r.action_key = action_key;
                            roles.push(r);
                        }
                    });
                    
                    roles = _.orderBy(roles, 'id', 'asc');
                    
                    $$(ids.permissions).clearAll();
                    $$(ids.permissions).parse(roles);

                });

            })
            .catch(function (err) { next(err); });
        
    }

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
    component(App) {

        var comp = super.component(App);

        var _ui = {
            view: "scrollview",
            body: comp.ui
        };

        var _init = (options) => {

            comp.init(options);

            // initialize data sources
            this.pageRoot().dataCollections().forEach((dc) => {
                dc.init();
            });

        }


        return {
            ui: _ui,
            init: _init,
            logic: comp.logic,

            onShow: comp.onShow
        }
    }



    /**
     * @method destroy()
     *
     * destroy the current instance of ABApplication
     *
     * also remove it from our _AllApplications
     *
     * @return {Promise}
     */
    destroy() {
        return new Promise(
            (resolve, reject) => {

                // verify we have been .save() before:
                if (this.id) {

                    this.application.pageDestroy(this)
                        .then(() => {

                            // remove the page in list
                            var parent = this.parent || this.application;
                            var remainingPages = parent.pages((p) => { return p.id != this.id; })
                            parent._pages = remainingPages;

                            resolve();
                        })
                        .catch(reject);

                } else {

                    resolve();  // nothing to do really
                }

            }
        )

    }


    /**
     * @method save()
     *
     * persist this instance of ABViewPage with it's parent
     *
     *
     * @return {Promise}
     *         .resolve( {this} )
     */
    save() {
        return new Promise(
            (resolve, reject) => {

                // if this is our initial save()
                if (!this.id) {
                    this.id = OP.Util.uuid();   // setup default .id
                    this.name = this.name + "_" + this.id.split("-")[1]; // add a unique string to the name so it doesnt collide with a previous page name
                }

                this.application.pageSave(this)
                    .then(() => {

                        // persist the current ABViewPage in our list of ._pages.
                        var parent = this.parent || this.application;
                        var isIncluded = (parent.pages((p) => { return p.id == this.id }).length > 0);
                        if (!isIncluded) {
                            parent._pages.push(this);
                        }

                        resolve();
                    })
                    .catch(reject)
            }
        )
    }



    ///
    /// Pages
    ///


    /**
     * @method pages()
     *
     * return an array of all the ABViewPages for this ABViewPage.
     *
     * @param {fn} filter		a filter fn to return a set of ABViewPages that this fn
     *							returns true for.
     * @param {boolean} deep	flag to find in sub pages
     * 
     * @return {array}			array of ABViewPages
     */
    pages(filter, deep) {

        var result = [];

        // find into sub-pages recursively
        if (filter && deep) {

            if (this._pages && this._pages.length > 0) {

                result = this._pages.filter(filter);

                if (result.length < 1) {
                    this._pages.forEach((p) => {
                        var subPages = p.pages(filter, deep);
                        if (subPages && subPages.length > 0) {
                            result = subPages;
                        }
                    });
                }
            }

        }
        // find root pages
        else {

            filter = filter || function () { return true; };

            result = this._pages.filter(filter);

        }

        return result;

    }



    /**
     * @method pageNew()
     *
     * return an instance of a new (unsaved) ABViewPage that is tied to this
     * ABViewPage.
     *
     * NOTE: this new page is not included in our this.pages until a .save()
     * is performed on the page.
     *
     * @return {ABViewPage}
     */
    pageNew(values) {

        // make sure this is an ABViewPage description
        values.key = ABViewDefaults.key;

        // NOTE: this returns a new ABView component.  
        // when creating a new page, the 3rd param should be null, to signify 
        // the top level component.
        var page = new ABViewManager.newView(values, this.application, null);
        page.parent = this;
        return page;
    }



    /**
     * @method pageDestroy()
     *
     * remove the current ABViewPage from our list of ._pages.
     *
     * @param {ABViewPage} page
     * @return {Promise}
     */
    pageDestroy(page) {

        var remainingPages = this.pages(function (p) { return p.id != page.id; })
        this._pages = remainingPages;
        return this.save();
    }



    ///
    /// Data sources
    ///

    /**
     * @method dataCollections()
     *
     * return an array of all the ABViewDataCollection for this ABViewPage.
     *
     * @param {fn} filter		a filter fn to return a set of ABViewDataCollection that this fn
     *							returns true for.
     * 
     * @return {array}			array of ABViewDataCollection
     */
    dataCollections(filter) {

        if (!this._dataCollections) return [];

        filter = filter || function () { return true; };

        return this._dataCollections.filter(filter);

    }



    /**
     * @method dataCollectionNew()
     *
     * return an instance of a new (unsaved) ABViewDataCollection that is tied to this
     * ABViewPage.
     *
     * NOTE: this new data source is not included in our this.dataCollections until a .save()
     * is performed on the page.
     *
     * @return {ABViewPage}
     */
    dataCollectionNew(values) {

        values = values || {};
        values.key = 'datacollection';

        // NOTE: this returns a new ABViewDataCollection component.  
        // when creating a new page, the 3rd param should be null, to signify 
        // the top level component.
        var dataCollection = new ABViewManager.newView(values, this.application, this);
        dataCollection.parent = this;

        return dataCollection;
    }



    /**
     * @method dataCollectionDestroy()
     *
     * remove the current ABViewDataCollection from our list of ._dataCollections.
     *
     * @param {ABViewDataCollection} dataCollection
     * @return {Promise}
     */
    dataCollectionDestroy(dataCollection) {

        var remainingDataCollections = this.dataCollections(function (data) { return data.id != dataCollection.id; })
        this._dataCollections = remainingDataCollections;
        return this.save();
    }



    /**
     * @method dataCollectionSave()
     *
     * persist the current ABViewDataCollection in our list of ._dataCollections.
     *
     * @param {ABViewDataCollection} object
     * @return {Promise}
     */
    dataCollectionSave(dataCollection) {
        var isIncluded = (this.dataCollections(function (data) { return data.id == dataCollection.id }).length > 0);
        if (!isIncluded) {
            this._dataCollections.push(dataCollection);
        }

        return this.save();
    }




    /**
     * @method urlView()
     * return the url pointer for views in this application.
     * @return {string} 
     */
    urlPage() {
        return this.urlPointer() + '/_pages/'
    }


    /**
     * @method urlPointer()
     * return the url pointer that references this view.  This url pointer
     * should be able to be used by this.application.urlResolve() to return 
     * this view object.
     * @return {string} 
     */
    urlPointer() {
        if (this.parent) {
            return this.parent.urlPage() + this.id;
        } else {
            return this.application.urlPage() + this.id;
        }
    }
    
    removeFieldSubPages(field, cb) {
        var done = 0;
        
        // for each subpage, removeField(field)
        var subPages = this.pages();
        subPages.forEach((sp)=>{
            sp.removeField(field, (err)=>{
                if (err) {
                    cb(err);
                } else {
                    done ++;
                    if (done >= subPages.length) {
                        cb();
                    }
                }
            })
        });

        if (subPages.length == 0) {
            cb();
        }

    }


    removeField(field, cb) {
		
        super.removeField(field, (err)=>{
            
            if (err) {
                cb(err);
            } else {
                var done = 0;
                
                // for each data collection, removeField(field)
                var listDC = this.dataCollections();
                listDC.forEach((dc)=>{
                    dc.removeField(field, (err)=>{
                        if (err) {
                            cb(err);
                        } else {
                            done ++;
                            if (done >= listDC.length) {
                                // for each subpage, removeField(field)
                                this.removeFieldSubPages(field, cb);
                            }
                        }
                    })
                });
                
                if (listDC.length == 0) {
                    this.removeFieldSubPages(field, cb);
                }
            }
        });
        
	}        

}
