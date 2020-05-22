/*
 * custom_savablelayout
 *
 * Create a custom webix component.
 *
 */

var ComponentKey = "savablelayout";
module.exports = class ABCustomSavableLayout {
   get key() {
      return ComponentKey;
   }

   constructor(App) {
      // App 	{obj}	our application instance object.
      // key {string}	the destination key in App.custom[componentKey] for the instance of this component:

      // super(App, key);

      var L = App.Label;

      var labels = {
         common: App.labels,

         component: {}
      };

      // internal list of Webix IDs to reference our UI components.
      var ids = {
         component: App.unique(ComponentKey)
      };

      // Our webix UI definition:
      var _ui = {
         name: ComponentKey,

         getState: function() {
            var store = new webix.TreeCollection();
            webix.extend(
               store,
               {
                  name: "EditorState",
                  $init: function() {
                     // overwrite .serialize to export element format
                     this.serialize = function(e, t) {
                        var rootId = this.getFirstId();
                        var rootItem = this.getItem(rootId);

                        return _logic.normalize(this, rootItem);
                     };
                  }
               },
               true
            );

            // save children views to TreeCollection
            _logic.saveChildren(store, this);

            // get JSON of elements
            var result = store.serialize();

            return result;
         },

         setState: function(state, prefix) {
            var views = state ? state.rows || state.cols || [] : [];

            // rebuild layout
            this.reconstruct();

            // Add rows/cols definition
            views.forEach((v) => {
               // Ignore empty element
               if (!v.id && !v.rows && !v.cols) return;

               var copyv = Object.assign(v, {});

               if (!copyv.view) {
                  copyv.gravity = 0;
                  copyv.width = 0;
                  copyv.height = 0;
                  copyv.maxWidth = 0;
                  copyv.maxHeight = 0;
               }

               this.addView(copyv);
            });
         },

         destroyView: function(deleteView) {
            if (typeof deleteView == "string") {
               deleteView = $$(deleteView);
            }

            if (deleteView == null) return;

            var parent = deleteView.getParentView();
            parent.removeView(deleteView);
         }
      };
      this.view = ComponentKey;

      // our internal business logic
      var _logic = {
         /**
          * @method saveChildren
          *
          * @param store {webix.TreeCollection}
          * @param elem {Object} the webix element
          * @param parentId {integer - nullable} id of parent id
          */
         saveChildren: function(store, elem, parentId) {
            var vals = {};

            // get required properties
            ["id", "viewId", "rows", "cols"].forEach(function(propName) {
               if (propName in elem.config)
                  vals[propName] = elem.config[propName];
            });

            // add to TreeStore
            store.add(vals, null, parentId || null);

            // get sub-children
            if (elem && elem.getChildViews) {
               elem.getChildViews().forEach(function(e) {
                  // call sub-children
                  _logic.saveChildren(store, e, elem.config.id);
               });
            }
         },

         /**
          * @method normalize
          * Move .data to .rows/.cols property
          * TreeCollection stores sub-data in .data, then we should move to UI rows/cols
          *
          * @param store {webix.TreeCollection}
          * @param item {object}
          */
         normalize: function(store, item) {
            var result = {};

            if (item.viewId) {
               result.viewId = item.viewId;
            }

            // get sub-children
            var children = [];
            store.data.eachChild(
               item.id,
               function(subitem) {
                  var subResult = _logic.normalize(store, subitem);
                  children.push(subResult);
               },
               store.data,
               false
            );

            // If the element has .rows property
            if ("rows" in item) {
               result.rows = children;
            }
            // Else if the element has .cols property
            else if ("cols" in item) {
               result.cols = children;
            }

            return result;
         }
      };
      this._logic = _logic;

      // Tell Webix to create an INSTANCE of our custom component:
      webix.protoUI(_ui, webix.ui.layout, webix.UIManager);
   }
};
