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
    popupWidth: 700,
    popupHeight: 450,
    pageWidth: null,
    fixedPageWidth: 0,
    pageBackground: "ab-background-default"
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
            obj.icon = "clone";

        // set label of the page
        if (!this.label || this.label == '?label?')
            obj.label = obj.name;

        // compile our pages
        var pages = [];
        this._pages.forEach((page) => {
            pages.push(page.toObj())
        })

        obj.pages = pages;



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
            this.icon = "clone";

        // set label of the page
        if (!this.label || this.label == '?label?')
            this.label = this.name;


        // now properly handle our sub pages.
        var pages = [];
        (values.pages || []).forEach((child) => {
            pages.push(this.pageNew(child));  // ABViewManager.newView(child, this.application, this));
        })
        this._pages = pages;


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

        _logic.permissionClick = (id, e, node, isRetry=false) => {
            var List = $$(ids.permissions);
            var item = List.getItem(id); 

            List.showProgress({type:'icon'});

            if (item.markCheckbox) {

                OP.Comm.Service.delete({
                    url: "/app_builder/page/"+item.action_key+"/role",
                    data: {
                        role_id: item.id
                    }
                }).then((data) => {

                    item.markCheckbox = false;
                    List.updateItem(id, item); 
                    List.hideProgress();

                }).catch((err)=>{
                    console.error(err);
                    if (err.code == "E_NOACTIONKEY") {

                        // if this our second time through, then display an error:
                        if (isRetry) {
                            console.error("Error Saving Permisison: ", err);
                            List.hideProgress();
                            return;
                        }

                        // in the case where no ActionKey was present,
                        // we can still mark that this is no longer connected:
                        item.markCheckbox = false;
                        List.updateItem(id, item); 

                        // Now if we got here, there is an issue with the data in our
                        // Permissions.  These permissions get created when a Page is 
                        // .created/saved, so let's run through our pages again and
                        // save() them
                        var allSaves = [];
                        item._view.application.pages().forEach((page)=>{
                            allSaves.push(page.save());
                        })

                        // once that is all done, try this again:
                        Promise.all(allSaves)
                        .then(()=>{
                            _logic.permissionClick(id, e, node, true);
                        })

                    }
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
                    List.hideProgress();

                }).catch((err)=>{
                    console.error(err);
                    if (err.code == "E_NOACTIONKEY") {


                        // if this our second time through, then display an error:
                        if (isRetry) {
                            console.error("Error Saving Permisison: ", err);
                            List.hideProgress();
                            return;
                        }

                        // Now if we got here, there is an issue with the data in our
                        // Permissions.  These permissions get created when a Page is 
                        // .created/saved, so let's run through our pages again and
                        // save() them
                        var allSaves = [];
                        item._view.application.pages().forEach((page)=>{
                            allSaves.push(page.save());
                        })

                        // once that is all done, try this again:
                        Promise.all(allSaves)
                        .then(()=>{
                            _logic.permissionClick(id, e, node, true);
                        })

                    }
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
                ],
                on: {
                    "onChange": function(newv, oldv) {
                        if (newv == "page") {
                            $$(ids.popupSettings).hide();
                            $$(ids.pageSettings).show();
                        } else {
                            $$(ids.popupSettings).show();
                            $$(ids.pageSettings).hide();                            
                        }
                    }
                }
            },
            {
                view: "fieldset",
                name: "popupSettings",
                label: L('ab.component.page.popupSettings', '*Popup Settings'),
                labelWidth: App.config.labelWidthLarge,
                body: {
                    type: "clean",
                    padding: 10,
                    rows: [
                        {
                            view: "text",
            				name:'popupWidth',
            				placeholder: L('ab.component.page.popupWidthPlaceholder', '*Set popup width'),
                            label: L("ab.component.page.popupWidth", "*Width:"),
                            labelWidth: App.config.labelWidthLarge,
                            validate:webix.rules.isNumber
                        },
                        {
                            view: "text",
            				name:'popupHeight',
            				placeholder: L('ab.component.page.popupHeightPlaceholder', '*Set popup height'),
                            label: L("ab.component.page.popupHeight", "*Height:"),
                            labelWidth: App.config.labelWidthLarge,
                            validate:webix.rules.isNumber
                        }
                    ]
                }
            },
            {
                view: "fieldset",
                name: "pageSettings",
                label: L('ab.component.page.pageSettings', '*Page Settings'),
                labelWidth: App.config.labelWidthLarge,
                body: {
                    type: "clean",
                    padding: 10,
                    rows: [
                        {
                            view:"checkbox", 
                            name:"fixedPageWidth",
                            labelRight:L("ab.component.page.fixedPageWidth", "*Page has fixed width"),
                            labelWidth: App.config.labelWidthCheckbox,
                            click: function (id,event) {
                                if (this.getValue() == 1) {
                                    $$(ids.pageWidth).show();
                                } else {
                                    $$(ids.pageWidth).hide();
                                }
                            }
                        },
                        {
                            view: "text",
            				name:'pageWidth',
            				placeholder: L('ab.component.page.pageWidthPlaceholder', '*Set page width'),
                            label: L("ab.component.page.popupHeight", "*Page width:"),
                            labelWidth: App.config.labelWidthLarge
                        },
                        {
                            view: "richselect",
                            name:'pageBackground',
                            label: L("ab.component.page.popupHeight", "*Page background:"),
                            labelWidth: App.config.labelWidthXLarge,
                            options: [
                                { "id":"ab-background-default", "value":L('ab.component.page.pageBackgroundDefault', '*White (default)')}, 
                                { "id":"ab-background-gray", "value":L('ab.component.page.pageBackgroundDark', '*Dark')}, 
                                // { "id":"ab-background-texture", "value":L('ab.component.page.pageBackgroundTextured', '*Textured')}
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
                    padding: 10,
                    rows: [
                        {
            				name: 'permissions',
            				view: 'list',
            				select: false,
            				minHeight: 200,
            				template: "{common.markCheckbox()} #name#",
                            type:{
                                markCheckbox:function(obj ){
                                    return "<span class='check webix_icon fa fa-"+(obj.markCheckbox?"check-":"")+"square-o'></span>";
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
        $$(ids.popupWidth).setValue(view.settings.popupWidth || ABPropertyComponentDefaults.popupWidth);
        $$(ids.popupHeight).setValue(view.settings.popupHeight || ABPropertyComponentDefaults.popupHeight);
        $$(ids.pageWidth).setValue(view.settings.pageWidth || ABPropertyComponentDefaults.pageWidth);
        $$(ids.fixedPageWidth).setValue(view.settings.fixedPageWidth || ABPropertyComponentDefaults.fixedPageWidth);
        $$(ids.pageBackground).setValue(view.settings.pageBackground || ABPropertyComponentDefaults.pageBackground);

        // Disable select type of page when this page is root 
        if (view.isRoot()) {
            $$(ids.type).hide();

            // Update permission options
            $$(ids.pagePermissionPanel).show();
            this.propertyUpdatePermissionsOptions(ids, view);
        }
        else {
            $$(ids.pagePermissionPanel).hide();
            $$(ids.type).show();
        }
        
        if (view.settings.type == "popup") {
            $$(ids.popupSettings).show();
            $$(ids.pageSettings).hide();
        } else {
            $$(ids.popupSettings).hide();
            $$(ids.pageSettings).show();
        }
        
        if (view.settings.fixedPageWidth == 1) {
            $$(ids.pageWidth).show();
        } else {
            $$(ids.pageWidth).hide();
        }

    }


    static propertyEditorValues(ids, view) {

        super.propertyEditorValues(ids, view);

        view.settings.type = $$(ids.type).getValue();
        view.settings.popupWidth = $$(ids.popupWidth).getValue();
        view.settings.popupHeight = $$(ids.popupHeight).getValue();
        view.settings.pageWidth = $$(ids.pageWidth).getValue();
        view.settings.fixedPageWidth = $$(ids.fixedPageWidth).getValue();
        view.settings.pageBackground = $$(ids.pageBackground).getValue();

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
        
        var List = $$(ids.permissions);

        // make sure our list has been made into a ProgressBar
        if (!List.showProgress) {
            webix.extend(List, webix.ProgressBar);
        }
        
        List.clearAll();
        List.showProgress({type:'icon'});

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
                            r._view = view;
                            roles.push(r);
                        }
                    });
                    
                    roles = _.orderBy(roles, 'id', 'asc');
                    
                    List.parse(roles);
                    List.hideProgress();

                });

            })
            .catch(function (err) { 
                List.hideProgress();
                next(err); 
            });
        
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
            borderless: true,
            css: this.settings.pageBackground || ABPropertyComponentDefaults.pageBackground,
            body: comp.ui
        };

        var _init = (options) => {

            comp.init(options);

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

                    this.application.viewDestroy(this)
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
     * @param includeSubViews {Boolean}
     *
     * @return {Promise}
     *         .resolve( {this} )
     */
    save(includeSubViews = false) {
        return new Promise(
            (resolve, reject) => {

                // if this is our initial save()
                if (!this.id) {
                    this.id = OP.Util.uuid();   // setup default .id
                    this.name = this.name + "_" + this.id.split("-")[1]; // add a unique string to the name so it doesnt collide with a previous page name
                }

                // if name is empty
                if (!this.name) {
                    this.name = this.label + "_" + this.id.split("-")[1];
                }

                this.application.viewSave(this, includeSubViews)
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

                result = result.concat(this._pages.filter(filter));

                this._pages.forEach((p) => {
                    var subPages = p.pages(filter, deep);
                    if (subPages && subPages.length > 0) {
                        result = result.concat(subPages);
                    }
                });
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

        // make sure this is an ABViewPage or ABViewReport description
        if (values.key != ABViewDefaults.key &&
            values.key != "report")
            values.key = ABViewDefaults.key;

        // NOTE: this returns a new ABView component.  
        // when creating a new page, the 3rd param should be null, to signify 
        // the top level component.
        var page = new ABViewManager.newView(values, this.application, null);
        page.parent = this;
        return page;
    }



    /**
     * @method viewDestroy()
     *
     * remove the current ABViewPage from our list of ._pages or ._views.
     *
     * @param {ABView} view
     * @return {Promise}
     */
    viewDestroy(view) {

        var remainingPages = this.pages(function (p) { return p.id != view.id; })
        this._pages = remainingPages;
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

    updateIcon(obj) {
        // icon of page
        if (obj.settings.type == 'popup') {
            obj.icon = "clone";
        } else {
            obj.icon = ABViewDefaults.icon;
        }
        return obj;
    }
    
    
    copy(lookUpIds, parent) {

        // initial new ids of pages and components
        if (lookUpIds == null) {
            lookUpIds = {};

            let mapNewIdFn = (currView) => {

                if (!lookUpIds[currView.id])
                    lookUpIds[currView.id] = OP.Util.uuid();

                if (currView.pages) {
                    currView.pages().forEach(p => mapNewIdFn(p));
                }

                if (currView.views) {
                    currView.views().forEach(v =>  mapNewIdFn(v));
                }

            };

            // start map new ids
            mapNewIdFn(this);

        }

        // copy
        let result = super.copy(lookUpIds, parent);

        // page's name should not be duplicate
        result.name = null;

        return result;

    }

}
