/*
 * ABViewPagePlugin
 *
 * An ABView that represents a "Page" in the system.
 *
 * Pages are 
 *	- allowed to be displayed in the interface list
 *	- return a full list of components that can be added to the view editor
 * 
 *
 */

import ABViewPage from "./ABViewPage"
import ABViewManager from "../ABViewManager"


function L(key, altText) {
    return AD.lang.label.getLabel(key) || altText;
}

var ABPropertyComponentDefaults = {
    type: 'page', // 'page' or 'popup'
}

var ABViewDefaults = {
    key: 'pageplugin',		// unique key identifier for this ABView
    icon: 'plug',		    // icon reference: (without 'fa-' )

}

export default class ABViewPagePlugin extends ABViewPage {

    constructor(values, application, parent) {

        super(values, application, parent, ABViewDefaults);


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

        if (values.plugin) {
            this.settings.plugin = values.plugin;  // keep track of this
        } else {
            this.settings.plugin = values.settings.plugin;
        }
        
    }


    static common() {
        return ABViewDefaults;
    }


    /**
     * @method toObj()
     *
     * properly compile the current state of this ABViewPagePlugin instance
     * into the values needed for saving to the DB.
     *
     * @return {json}
     */
    toObj() {

        var obj = super.toObj();

//// TODO: 
//// store the plugin information and settings
        obj.plugin = this.settings.plugin;
        obj.settings.plugin = this.settings.plugin;

console.warn('ABViewPagePlugin.toObj():', obj);

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

        this.PluginClass = null;
        this.plugin = null;
        OP.UIPlugins.get(values.plugin || values.settings.plugin)
        .then((PluginClass)=>{
            this.PluginClass = PluginClass;
        })
        .catch((err)=>{
            OP.Error.log('Error trying to load plugin: '+values.plugin, {error:err, values:values });
        })
        
    }


    initPlugin(App) {
        if (this.plugin == null) {
            if (this.PluginClass) {
                this.plugin = new this.PluginClass(App, this);
            }
        }
    }



    views(filter) {
        filter = filter || function() { return true; };

        if (!this.plugin) {
            this.initPlugin(this.application.App);
        }
        
        return [ this.plugin ].filter(filter);
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
        this.initPlugin(App);

        return super.editorComponent(App, mode);

    }



    //// 
    //// Property Editor Interface
    ////



    /** 
     * @method propertyEditorFieldsPage
     * return an array of webix UI fields to handle the settings of this
     * ABViewPage. 
     * This method should make any modifications to ids, logic, and init
     * as needed to support the new fields added in this routine.
     * @param {App} App  The global App object for the current Application instance
     * @param {obj} ids  A hash of the settings ids for our fields.
     * @param {obj} logic  a hash of fn() called by our webix components
     * @return {array}  of webix UI definitions.
     */
    propertyEditorFieldsPage(App, ids, _logic) { 

        var components = super.propertyEditorFieldsPage(App, ids, _logic);

        this.initPlugin(App);
        var pluginFields = this.plugin.propertyEditorFields(App, ids, _logic);
        
        components = components.concat([
            {
                // id: ids.plugin,
                name: 'plugin',
                view: 'text',
                label: L('ab.components.page.type', "*Plugin"),
                disabled:true
            }
        ])
        .concat(pluginFields);




        // // init()
        // // perform any initialization of the Property Editor
        // // fields.
        // // @param {obj} data  key=>value of our view's settings;
        // var superInit = options.init;
        // options.init = ( data ) => {
        //     if (superInit) superInit(data);  // call the super() first

        //     $$(ids.plugin).setValue(data.plugin);      

        //     // initialize our plugin
        //     pluginUIComponent.init(data, this);      
        // }

        return components;
    }



    /** 
     * @method propertyEditorDefaultValues
     * return an object of [name]:[value] data to set the your fields to a 
     * default (unused) state.
     * @return {obj}  
     */
    propertyEditorDefaultValues() {
        var defaults = super.propertyEditorDefaultValues();
        for(var d in ABPropertyComponentDefaults) {
            defaults[d] = ABPropertyComponentDefaults[d];
        }

        var pluginDefaults = this.plugin? this.plugin.propertyEditorDefaultValues(): {};
        for(var d in pluginDefaults) {
            defaults[d] = pluginDefaults[d];
        }

        return defaults;
    }



    /** 
     * @method propertyEditorInit
     * perform any setup instructions on the fields you are displaying.
     * this is a good time to populate any select lists with data you need to 
     * look up.  
     * @param {App} App  The global App object for the current Application instance
     * @param {obj} ids the id.[name] references to our fields 
     * @param {obj} _logic A hash of fn() called by our webix components
     */
     propertyEditorInit(App, ids, _logic) {
        super.propertyEditorInit(App, ids, _logic);

        this.plugin.propertyEditorInit(App, ids, _logic);
     }



    /** 
     * @method propertyEditorPopulate
     * set the initial values of the fields you are displaying.
     * @param {App} App the common App object shared among our UI components.
     * @param {obj} ids the id.[name] references to our fields 
     * @param {data} data the initial settings data for this object
     */
    propertyEditorPopulate(App, ids, data) {
        super.propertyEditorPopulate(App, ids, data);
        
        $$(ids.plugin).setValue(data.plugin);  
        this.plugin.propertyEditorPopulate(App, ids, data);
    }



    /** 
     * @method propertyEditorValues
     * pull the values from the Propery Editor and store them in our object.
     * @param {obj} ids the id.[name] references to our fields 
     */
    propertyEditorValues(ids) {
        super.propertyEditorValues(ids);

        // this.settings.plugin = $$(ids.plugin).getValue();

        this.plugin.propertyEditorValues(ids);
    }



    /** 
     * @method propertyEditorRemove
     * clean up our property editor before it is deleted.
     */
    propertyEditorRemove() {
        super.propertyEditorRemove();
        this.plugin.propertyEditorRemove();
    }



    ////
    //// Live View
    ////



    /*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
    component(App) {

        // make sure the plugin is loaded:
        this.initPlugin(App);

        return super.component(App);
    }



    // /**
    //  * @method destroy()
    //  *
    //  * destroy the current instance of ABApplication
    //  *
    //  * also remove it from our _AllApplications
    //  *
    //  * @return {Promise}
    //  */
    // destroy() {
    //     return new Promise(
    //         (resolve, reject) => {

    //             // verify we have been .save() before:
    //             if (this.id) {

    //                 this.application.pageDestroy(this)
    //                     .then(() => {

    //                         // remove the page in list
    //                         var parent = this.parent || this.application;
    //                         var remainingPages = parent.pages((p) => { return p.id != this.id; })
    //                         parent._pages = remainingPages;

    //                         resolve();
    //                     })
    //                     .catch(reject);

    //             } else {

    //                 resolve();  // nothing to do really
    //             }

    //         }
    //     )

    // }


    // /**
    //  * @method save()
    //  *
    //  * persist this instance of ABViewPagePlugin with it's parent
    //  *
    //  *
    //  * @return {Promise}
    //  *         .resolve( {this} )
    //  */
    // save() {
    //     return new Promise(
    //         (resolve, reject) => {

    //             // if this is our initial save()
    //             if (!this.id) {
    //                 this.id = OP.Util.uuid();   // setup default .id
    //             }

    //             this.application.pageSave(this)
    //                 .then(() => {

    //                     // persist the current ABViewPagePlugin in our list of ._pages.
    //                     var parent = this.parent || this.application;
    //                     var isIncluded = (parent.pages((p) => { return p.id == this.id }).length > 0);
    //                     if (!isIncluded) {
    //                         parent._pages.push(this);
    //                     }

    //                     resolve();
    //                 })
    //                 .catch(reject)
    //         }
    //     )
    // }



    ///
    /// Pages
    ///


    // /**
    //  * @method pages()
    //  *
    //  * return an array of all the ABViewPages for this ABViewPage.
    //  *
    //  * @param {fn} filter		a filter fn to return a set of ABViewPages that this fn
    //  *							returns true for.
    //  * @param {boolean} deep	flag to find in sub pages
    //  * 
    //  * @return {array}			array of ABViewPages
    //  */
    // pages(filter, deep) {

    //     var result = [];

    //     // find into sub-pages recursively
    //     if (filter && deep) {

    //         if (this._pages && this._pages.length > 0) {

    //             result = this._pages.filter(filter);

    //             if (result.length < 1) {
    //                 this._pages.forEach((p) => {
    //                     var subPages = p.pages(filter, deep);
    //                     if (subPages && subPages.length > 0) {
    //                         result = subPages;
    //                     }
    //                 });
    //             }
    //         }

    //     }
    //     // find root pages
    //     else {

    //         filter = filter || function () { return true; };

    //         result = this._pages.filter(filter);

    //     }

    //     return result;

    // }



    // /**
    //  * @method pageNew()
    //  *
    //  * return an instance of a new (unsaved) ABViewPage that is tied to this
    //  * ABViewPage.
    //  *
    //  * NOTE: this new page is not included in our this.pages until a .save()
    //  * is performed on the page.
    //  *
    //  * @return {ABViewPage}
    //  */
    // pageNew(values) {

    //     // make sure this is an ABViewPage description
    //     values.key = values.key || ABViewDefaults.key;

    //     // NOTE: this returns a new ABView component.  
    //     // when creating a new page, the 3rd param should be null, to signify 
    //     // the top level component.
    //     var page = new ABViewManager.newView(values, this.application, null);
    //     page.parent = this;
    //     return page;
    // }



    // /**
    //  * @method pageDestroy()
    //  *
    //  * remove the current ABViewPage from our list of ._pages.
    //  *
    //  * @param {ABViewPage} page
    //  * @return {Promise}
    //  */
    // pageDestroy(page) {

    //     var remainingPages = this.pages(function (p) { return p.id != page.id; })
    //     this._pages = remainingPages;
    //     return this.save();
    // }



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
    // dataCollections(filter) {

    //     if (!this._dataCollections) return [];

    //     filter = filter || function () { return true; };

    //     return this._dataCollections.filter(filter);

    // }



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
    // dataCollectionNew(values) {

    //     values = values || {};
    //     values.key = 'datacollection';

    //     // NOTE: this returns a new ABViewDataCollection component.  
    //     // when creating a new page, the 3rd param should be null, to signify 
    //     // the top level component.
    //     var dataCollection = new ABViewManager.newView(values, this.application, this);
    //     dataCollection.parent = this;

    //     return dataCollection;
    // }



    /**
     * @method dataCollectionDestroy()
     *
     * remove the current ABViewDataCollection from our list of ._dataCollections.
     *
     * @param {ABViewDataCollection} dataCollection
     * @return {Promise}
     */
    // dataCollectionDestroy(dataCollection) {

    //     var remainingDataCollections = this.dataCollections(function (data) { return data.id != dataCollection.id; })
    //     this._dataCollections = remainingDataCollections;
    //     return this.save();
    // }



    /**
     * @method dataCollectionSave()
     *
     * persist the current ABViewDataCollection in our list of ._dataCollections.
     *
     * @param {ABViewDataCollection} object
     * @return {Promise}
     */
    // dataCollectionSave(dataCollection) {
    //     var isIncluded = (this.dataCollections(function (data) { return data.id == dataCollection.id }).length > 0);
    //     if (!isIncluded) {
    //         this._dataCollections.push(dataCollection);
    //     }

    //     return this.save();
    // }




    /**
     * @method urlView()
     * return the url pointer for views in this application.
     * @return {string} 
     */
    // urlPage() {
    //     return this.urlPointer() + '/_pages/'
    // }


    /**
     * @method urlPointer()
     * return the url pointer that references this view.  This url pointer
     * should be able to be used by this.application.urlResolve() to return 
     * this view object.
     * @return {string} 
     */
    // urlPointer() {
    //     if (this.parent) {
    //         return this.parent.urlPage() + this.id;
    //     } else {
    //         return this.application.urlPage() + this.id;
    //     }
    // }
    
    // removeFieldSubPages(field, cb) {
    //     var done = 0;
        
    //     // for each subpage, removeField(field)
    //     var subPages = this.pages();
    //     subPages.forEach((sp)=>{
    //         sp.removeField(field, (err)=>{
    //             if (err) {
    //                 cb(err);
    //             } else {
    //                 done ++;
    //                 if (done >= subPages.length) {
    //                     cb();
    //                 }
    //             }
    //         })
    //     });

    //     if (subPages.length == 0) {
    //         cb();
    //     }

    // }


 //    removeField(field, cb) {
		
 //        super.removeField(field, (err)=>{
            
 //            if (err) {
 //                cb(err);
 //            } else {
 //                var done = 0;
                
 //                // for each data collection, removeField(field)
 //                var listDC = this.dataCollections();
 //                listDC.forEach((dc)=>{
 //                    dc.removeField(field, (err)=>{
 //                        if (err) {
 //                            cb(err);
 //                        } else {
 //                            done ++;
 //                            if (done >= listDC.length) {
 //                                // for each subpage, removeField(field)
 //                                this.removeFieldSubPages(field, cb);
 //                            }
 //                        }
 //                    })
 //                });
                
 //                if (listDC.length == 0) {
 //                    this.removeFieldSubPages(field, cb);
 //                }
 //            }
 //        });
        
	// }        

}
