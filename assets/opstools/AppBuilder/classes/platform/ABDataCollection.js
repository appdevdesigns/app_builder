const ABObjectQuery = require("./ABObjectQuery");
const ABDataCollectionCore = require("../core/ABDataCollectionCore");

module.exports = class ABDataCollection extends ABDataCollectionCore {
   constructor(attributes, application) {
      super(attributes, application);
   }

   /**
    * @method save()
    *
    * persist this instance of ABDataCollection with it's parent
    *
    *
    * @return {Promise}
    *			.resolve( {this} )
    */
   save() {
      return super.save().then((myView) => {
         // when it is done, then publish the update:
         AD.comm.hub.publish("ab.datacollection.update", {
            datacollectionId: this.id
         });

         return myView;
      });
   }

   ///
   /// Cursor
   ///

   /**
    * currentUserUsername
    * must return the proper value for the current user that would match a "user" field
    * in an object.
    * This is platform dependent, so must be implemented by a child object.
    * @return {string}
    */
   currentUserUsername() {
      return OP.User.username();
   }

   ///
   /// Data
   ///

   init() {
      // prevent initialize many times
      if (this.initialized) return;
      // this.initialized = true;  // <<---- DO NOT SET THIS HERE

      super.init();

      //// Now connect our platform hub to our Object Triggers:

      // events
      AD.comm.hub.subscribe("ab.datacollection.create", (msg, data) => {
         // debugger;
         this.emit("ab.datacollection.create", msg, data);
      });

      AD.comm.hub.subscribe("ab.datacollection.update", (msg, data) => {
         // debugger;
         this.emit("ab.datacollection.update", msg, data);
      });

      // We are subscribing to notifications from the server that an item may be stale and needs updating
      // We will improve this later and verify that it needs updating before attempting the update on the client side
      AD.comm.hub.subscribe("ab.datacollection.stale", (msg, data) => {
         // debugger;
         this.emit("ab.datacollection.stale", msg, data);
      });

      AD.comm.hub.subscribe("ab.datacollection.delete", (msg, data) => {
         // debugger;
         this.emit("ab.datacollection.delete", msg, data);
      });

      this.bindParentDc();
   }

   bindParentDc() {
      // if we pass the master datacollection and the field it is linked to
      // we want to bind it witht hat field as second param so dataFeed is
      // used on the slave datacollection
      let dataCollectionLink = this.datacollectionLink;
      let fieldLink = this.fieldLink;
      if (!this.settings.loadAll && dataCollectionLink && fieldLink) {
         let dc = this.__dataCollection;
         // the second param is the field id we bind the data to the master with
         dc.bind(dataCollectionLink.__dataCollection, fieldLink.id);
         // defining dataFeed allows us to query the database when the table is scrolled
         dc.define("dataFeed", (value, params) => {
            // copy current wheres
            var wheres = JSON.parse(
               JSON.stringify(this.settings.objectWorkspace.filterConditions)
            );
            // add bind items data as a filter to wheres
            if (value) {
               wheres = {
                  glue: "and",
                  rules: [
                     wheres,
                     {
                        alias: fieldLink.alias, // ABObjectQuery
                        key: Object.keys(params)[0],
                        rule: fieldLink.alias ? "contains" : "equals", // NOTE: If object is query, then use "contains" because ABOBjectQuery return JSON
                        value: fieldLink.getRelationValue(
                           dataCollectionLink.__dataCollection.getItem(value)
                        )
                     }
                  ]
               };
               // wheres.rules.push({
               //    alias: fieldLink.alias, // ABObjectQuery
               //    key: Object.keys(params)[0],
               //    rule: fieldLink.alias ? "contains" : "equals", // NOTE: If object is query, then use "contains" because ABOBjectQuery return JSON
               //    value: fieldLink.getRelationValue(
               //       dataCollectionLink.__dataCollection.getItem(value)
               //    )
               // });
            }

            // this is the same item that was already bound...don't reload data
            if (JSON.stringify(this.__reloadWheres) == JSON.stringify(wheres)) {
               return;
            } else {
               // now that we have the modified wheres the dataCollections wheres
               // need to be modified for subsequent loads on scroll so lets set them
               this.reloadWheres(wheres);
               // reload data
               this.reloadData(0, 20);
            }
         });
      }
   }

   loadData(start, limit = 20) {
      return super.loadData(start, limit).catch((err) => {
         // hideProgressOfComponents() is a platform specific action.
         this.hideProgressOfComponents();

         // propagate the error here:
         if (err) {
            throw err;
         }
      });
   }

   /**
    * processIncomingData()
    * is called from loadData() once the data is returned.  This method
    * allows the platform to make adjustments to the data based upon any
    * platform defined criteria.
    * @param {obj} data  the data as it was returned from the Server
    *        which should be in following format:
    *        {
    *          status: "success", // or "error"
    *          data:[ {ABObjectData}, {ABObjectData}, ...]
    *        }
    */
   processIncomingData(data) {
      // Web Platform:
      // standardize the heights

      // calculate default value of $height of rows
      var obj = this.datasource;
      var defaultHeight = 0;
      var minHeight = 0;
      var imageFields = obj.fields((f) => f.key == "image");
      imageFields.forEach(function(f) {
         if (
            parseInt(f.settings.useHeight) == 1 &&
            parseInt(f.settings.imageHeight) > minHeight
         ) {
            minHeight = parseInt(f.settings.imageHeight) + 20;
         }
      });
      if (minHeight > 0) {
         defaultHeight = minHeight;
      }

      data.data.forEach((d) => {
         // define $height of rows to render in webix elements
         if (
            d.properties != null &&
            d.properties.height != "undefined" &&
            parseInt(d.properties.height) > 0
         ) {
            d.$height = parseInt(d.properties.height);
         } else if (defaultHeight > 0) {
            d.$height = defaultHeight;
         }
      });

      return super.processIncomingData(data).then(() => {
         // Web Platform:
         // when that is done:
         this.hideProgressOfComponents();
      });
   }

   ///
   /// Components
   ///

   /**
    * @method bind
    *
    *
    * @param {Object} component - a webix element instance
    */
   bind(component) {
      var dc = this.__dataCollection;

      // prevent bind many times
      if (
         this.__bindComponentIds.indexOf(component.config.id) > -1 &&
         $$(component.config.id).data &&
         $$(component.config.id).data.find &&
         $$(component.config.id).data.find({}).length > 0
      )
         return;
      // keep component id to an array
      else this.__bindComponentIds.push(component.config.id);

      if (
         component.config.view == "datatable" ||
         component.config.view == "dataview" ||
         component.config.view == "treetable" ||
         component.config.view == "kanban"
      ) {
         if (dc) {
            var items = dc.count();
            if (
               items == 0 &&
               (this._dataStatus == this.dataStatusFlag.notInitial ||
                  this._dataStatus == this.dataStatusFlag.initializing) &&
               component.showProgress
            ) {
               component.showProgress({ type: "icon" });
            }

            component.define("datafetch", 20);
            component.define("datathrottle", 500);

            // initial data of treetable
            if (component.config.view == "treetable") {
               if (
                  this.datasource &&
                  this.datasource.isGroup &&
                  this.__treeCollection
               ) {
                  component.define("data", this.__treeCollection);
                  component.refresh();
               } else {
                  // NOTE: tree data does not support dynamic loading when scrolling
                  // https://forum.webix.com/discussion/3078/dynamic-loading-in-treetable
                  component.define("data", []);
                  component.parse(dc.find({}));
               }
            } else {
               component.data.sync(dc);
            }

            // Implement .onDataRequest for paging loading
            if (!this.settings.loadAll) {
               component.___AD = component.___AD || {};
               // if (component.___AD.onDataRequestEvent) component.detachEvent(component.___AD.onDataRequestEvent);
               if (!component.___AD.onDataRequestEvent) {
                  component.___AD.onDataRequestEvent = component.attachEvent(
                     "onDataRequest",
                     (start, count) => {
                        if (component.showProgress)
                           component.showProgress({ type: "icon" });

                        // load more data to the data collection
                        dc.loadNext(count, start);

                        return false; // <-- prevent the default "onDataRequest"
                     }
                  );
               }

               // // NOTE : treetable should use .parse or TreeCollection
               // // https://forum.webix.com/discussion/1694/tree-and-treetable-using-data-from-datacollection
               // if (
               //    component.config.view == "treetable" &&
               //    !this.datasource.isGroup
               // ) {
               //    component.___AD = component.___AD || {};
               //    if (!component.___AD.onDcLoadData) {
               //       component.___AD.onDcLoadData = () => {
               //          component.parse(dc.find({}));
               //       };

               //       this.on("loadData", component.___AD.onDcLoadData);
               //    }
               // }
            }
         } else {
            component.data.unsync();
         }
      } else if (component.bind) {
         if (dc) {
            // Do I need to check if there is any data in the collection before binding?
            component.bind(dc);
         } else {
            component.unbind();
         }

         if (component.refresh) component.refresh();
      }
   }

   unbind(component) {
      if (!component) return;

      component.detachEvent("onDataRequest");
      if (component.___AD) {
         if (component.___AD.onDataRequestEvent)
            delete component.___AD.onDataRequestEvent;

         if (component.___AD.onDcLoadData) {
            if (this.off) this.off("loadData", component.___AD.onDcLoadData);
            delete component.___AD.onDcLoadData;
         }
      }

      if (component.data && component.data.unsync) {
         component.data.unsync();
         component.define("data", []);
      }

      if (component.unbind) component.unbind();

      if (component.refresh) component.refresh();

      // remove from array
      this.__bindComponentIds = (this.__bindComponentIds || []).filter(
         (id) => id != component.config.id
      );
   }

   hideProgressOfComponents() {
      this.__bindComponentIds.forEach((comId) => {
         if ($$(comId) && $$(comId).hideProgress) $$(comId).hideProgress();
      });
   }

   /** Private methods */

   /**
    * @method _dataCollectionNew
    * Get webix.DataCollection
    *
    * @return {webix.DataCollection}
    *
    * @param {Array} data - initial data
    */
   _dataCollectionNew(data) {
      // get a webix data collection
      let dc = new webix.DataCollection({
         data: data || []
      });

      this._extendCollection(dc);

      return dc;
   }

   /**
    * @method _treeCollectionNew
    * Get webix.TreeCollection
    *
    * @return {webix.TreeCollection}
    *
    */
   _treeCollectionNew() {
      // get a webix data collection
      let treeStore = new webix.TreeCollection();

      this._extendCollection(treeStore);

      return treeStore;
   }

   _extendCollection(dataStore) {
      // Apply this data collection to support multi-selection
      // https://docs.webix.com/api__refs__selectionmodel.html
      webix.extend(dataStore, webix.SelectionModel);

      dataStore.___AD = dataStore.___AD || {};

      // Implement .onDataRequest for paging loading
      if (!this.settings.loadAll) {
         if (!dataStore.___AD.onDataRequestEvent) {
            dataStore.___AD.onDataRequestEvent = dataStore.attachEvent(
               "onDataRequest",
               (start, count) => {
                  if (start < 0) start = 0;

                  // load more data to the data collection
                  this.loadData(start, count);

                  return false; // <-- prevent the default "onDataRequest"
               }
            );
         }

         if (!dataStore.___AD.onAfterLoadEvent) {
            dataStore.___AD.onAfterLoadEvent = dataStore.attachEvent(
               "onAfterLoad",
               () => {
                  this.emit("loadData", {});
               }
            );
         }
      }

      // override unused functions of selection model
      dataStore.addCss = function() {};
      dataStore.removeCss = function() {};
      dataStore.render = function() {};

      if (!dataStore.___AD.onAfterLoad) {
         dataStore.___AD.onAfterLoad = dataStore.attachEvent(
            "onAfterLoad",
            () => {
               this.hideProgressOfComponents();
            }
         );
      }
   }

   parseTreeCollection(data = {}) {
      if (
         !(this.__datasource instanceof ABObjectQuery) ||
         !this.__datasource.isGroup ||
         !this.__treeCollection
      )
         return;

      let addRowToTree = (join = {}, parentAlias = null) => {
         let alias = join.alias;

         (data.data || []).forEach((row) => {
            let dataId = row[`${alias}.uuid`] || row[`${alias}.id`];
            if (!dataId) return;

            // find parent nodes
            let parentItemIds = [];
            let parentId =
               row[`${parentAlias}.uuid`] || row[`${parentAlias}.id`];
            if (parentId) {
               parentItemIds = this.__treeCollection
                  .find(
                     (item) =>
                        item._alias == parentAlias && item._dataId == parentId
                  )
                  .map((item) => item.id);
            }

            // check exists
            let exists = this.__treeCollection.find((item) => {
               return (
                  item._alias == alias &&
                  item._dataId == dataId &&
                  (parentItemIds.length == 0 ||
                     parentItemIds.indexOf(item.$parent) > -1)
               );
            }, true);
            if (exists) return;

            let treeNode = {};
            treeNode._alias = alias;
            treeNode._dataId = dataId;
            treeNode._itemId = row.id; // Keep row id for set cursor to data collection

            Object.keys(row).forEach((propName) => {
               // Pull value from alias
               if (propName.indexOf(`${alias}.`) == 0) {
                  treeNode[propName] = row[propName];
               }
            });

            if (row.translations) treeNode.translations = row.translations;

            // child nodes
            if (parentItemIds.length > 0)
               parentItemIds.forEach((parentItemId) => {
                  this.__treeCollection.add(treeNode, null, parentItemId);
               });
            // root node
            else this.__treeCollection.add(treeNode, null);
         });

         // Sub-joins
         (join.links || []).forEach((link) => {
            addRowToTree(link, alias);
         });
      };

      // Show loading cursor
      (this.__bindComponentIds || []).forEach((comId) => {
         //// Webix Command here:
         let boundComp = $$(comId);
         if (boundComp && boundComp.showProgress)
            boundComp.showProgress({ type: "icon" });

         if (boundComp.data && boundComp.data.unsync) boundComp.data.unsync();
      });

      addRowToTree(this.__datasource.joins());

      // Hide loading cursor
      (this.__bindComponentIds || []).forEach((comId) => {
         let boundComp = $$(comId);
         if (boundComp && boundComp.hideProgress) boundComp.hideProgress();
         boundComp.define("data", this.__treeCollection);
      });
   }

   get userScopes() {
      if (!OP || !OP.User) return [];
      return OP.User.scopes();
   }
};


