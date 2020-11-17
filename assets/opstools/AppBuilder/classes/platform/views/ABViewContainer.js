const ABViewContainerCore = require("../../core/views/ABViewContainerCore");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

const ABPropertyComponentDefaults = ABViewContainerCore.defaultValues();

module.exports = class ABViewContainer extends ABViewContainerCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
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
      var idBase = "ABViewContainerEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component")
      };

      var subComponents = {}; // { viewId: viewComponent, ..., viewIdn: viewComponent }

      var cellHeight = 250;
      // if (this.key == "form" || this.key == "detail") {
      // 	cellHeight = 80;
      // }

      var _ui = {
         rows: [
            {
               id: ids.component,
               view: "dashboard",
               css: "ab-" + this.key + "-container",
               cellHeight: cellHeight,
               gridColumns:
                  this.settings.columns || ABPropertyComponentDefaults.columns
            }
         ]
      };

      var _init = (options) => {
         var Dashboard = $$(ids.component);
         if (Dashboard) {
            webix.extend(Dashboard, webix.OverlayBox);
            webix.extend(Dashboard, webix.ProgressBar);
         }

         // this.views().reverse().forEach((child) => {

         // NOTE: need to sorting before .addView because there is a render position bug in webix 5.1.7
         // https://webix.com/snippet/404cf0c7
         var childViews = this.viewsSortByPosition();

         // attach all the .UI views:
         childViews.forEach((child) => {
            var component = child.component(App);

            // store
            subComponents[child.id] = component;

            let view = "panel";
            if (child.settings.movable == false) view = "scrollview";

            Dashboard.addView({
               view: view,

               // specific viewId to .name, it will be used to save view position
               name: child.id,
               icon: "fa fa-arrows",
               css: "ab-widget-container",
               body: {
                  rows: [
                     {
                        view: "template",
                        height: 30,
                        css: "ab-widget-header",
                        template: _logic.template(child),
                        onClick: {
                           "ab-component-edit": (e, id, trg) => {
                              _logic.viewEdit(e, child.id, trg);
                           },
                           "ab-component-remove": (e, id, trg) => {
                              _logic.viewDelete(e, child.id, trg);
                           }
                        }
                     },
                     component.ui
                     // (mode == 'preview' ? component.ui : {
                     // 	// empty element
                     // 	view: 'spacer',
                     // 	hidden: true,
                     // })
                  ]
               },

               // dx: _logic.validatePosition(child.position.dx, 1, Dashboard.config.gridColumns),
               // dy: _logic.validatePosition(child.position.dy, 1, Dashboard.config.gridRows),

               dx: child.position.dx || 1,
               dy: child.position.dy || 1,
               x: _logic.validatePosition(
                  child.position.x,
                  0,
                  Dashboard.config.gridColumns - 1
               ),
               y: child.position.y || 0
            });

            // initial sub-component
            component.init(null, 2); // when in editor allow full access
         });

         // listen onChange event
         // NOTE: listen after populate views by .addView
         if (this._onChangeId) Dashboard.detachEvent(this._onChangeId);
         this._onChangeId = Dashboard.attachEvent("onChange", () => {
            _logic.onReorder();
         });

         // show "drop here" panel
         _logic.showEmptyPlaceholder();

         Dashboard.adjust();
      };

      var _logic = {
         /**
          * @method template()
          * render the list template for the View
          * @param {obj} obj the current View instance
          * @param {obj} common  Webix provided object with common UI tools
          */
         template: (child) => {
            return (
               "<div>" +
               '<i class="fa fa-#icon# webix_icon_btn"></i> ' +
               " #label#" +
               '<div class="ab-component-tools">' +
               (child.settings.removable == false
                  ? ""
                  : '<i class="fa fa-trash ab-component-remove"></i>') +
               '<i class="fa fa-edit ab-component-edit"></i>' +
               "</div>" +
               "</div>"
            )
               .replace("#icon#", child.icon)
               .replace("#label#", child.label);
         },

         /**
          * @method viewDelete()
          * Called when the [delete] icon for a child View is clicked.
          * @param {obj} e the onClick event object
          * @param {integer} id the id of the element to delete
          * @param {obj} trg  Webix provided object
          */
         viewDelete: (e, id, trg) => {
            var deletedView = this.views((v) => v.id == id)[0];

            if (!deletedView) return false;

            OP.Dialog.Confirm({
               title: L(
                  "ab.interface.component.confirmDeleteTitle",
                  "*Delete component"
               ),
               text: L(
                  "ab.interface.component.confirmDeleteMessage",
                  "Do you want to delete <b>{0}</b>?"
               ).replace("{0}", deletedView.label),
               callback: (result) => {
                  if (result) {
                     // let Dashboard = $$(ids.component);

                     // // remove UI of this component in template
                     // var deletedElem = Dashboard.queryView({ name: id });
                     // if (deletedElem) {

                     // 	// store the removed view to signal event in .onChange
                     // 	this.__deletedView = deletedView;

                     // 	// remove view
                     // 	var remainingViews = this.views((v) => { return v.id != deletedView.id; })
                     // 	this._views = remainingViews;

                     // 	// this calls the remove REST to API server
                     // 	Dashboard.removeView(deletedElem);
                     // }

                     _logic.busy();

                     deletedView
                        .destroy()
                        .then(() => {
                           // signal the current view has been deleted.
                           deletedView.emit("destroyed", deletedView);

                           let Dashboard = $$(ids.component);

                           // Update UI
                           var deletedElem = Dashboard.queryView({ name: id });
                           if (deletedElem) {
                              Dashboard.blockEvent();
                              Dashboard.removeView(deletedElem);
                              Dashboard.unblockEvent();
                           }

                           _logic.showEmptyPlaceholder();

                           _logic.ready();
                        })
                        .catch((err) => {
                           OP.Error.log(
                              "Error trying to delete selected View:",
                              { error: err, view: deletedView }
                           );

                           _logic.ready();
                        });
                  }
               }
            });
            e.preventDefault();
         },

         /**
          * @method viewEdit()
          * Called when the [edit] icon for a child View is clicked.
          * @param {obj} e the onClick event object
          * @param {integer} id the id of the element to edit
          * @param {obj} trg  Webix provided object
          */
         viewEdit: (e, id, trg) => {
            var view = this.views((v) => v.id == id)[0];

            if (!view) return false;

            // NOTE: let webix finish this onClick event, before
            // calling .populateInterfaceWorkspace() which will replace
            // the interface elements with the edited view.  (apparently
            // that causes errors.)
            setTimeout(() => {
               App.actions.populateInterfaceWorkspace(view);
            }, 50);

            e.preventDefault();

            return false;
         },

         onReorder: () => {
            return new Promise((resolve, reject) => {
               _logic.busy();

               var Dashboard = $$(ids.component);

               // ignore in "preview" mode
               // if (Dashboard == null || Dashboard.config.view != "dashboard") return;

               var viewState = Dashboard.serialize();

               var allViewUpdates = [];

               // save view position state to views
               this.views().forEach((v) => {
                  var state = viewState.filter((vs) => vs.name == v.id)[0];
                  if (state) {
                     v.position.x = state.x;
                     v.position.y = state.y;

                     // validate position data
                     if (v.position.x < 0) v.position.x = 0;
                     if (v.position.y < 0) v.position.y = 0;

                     allViewUpdates.push(v.save());
                  }
               });

               // save template layout
               // this.saveReorder()
               Promise.all(allViewUpdates)
                  .then(() => {
                     return this.save();
                  })
                  .catch((err) => {
                     OP.Error.log("Error trying to save selected View:", {
                        error: err,
                        view: this
                     });

                     _logic.ready();

                     reject(err);
                  })
                  .then(() => {
                     // // signal the current view has been deleted.
                     // // this variable is stored in .viewDelete
                     // if (this.__deletedView) {
                     // 	this.__deletedView.emit('destroyed', this.__deletedView);

                     // 	// clear
                     // 	delete this.__deletedView;
                     // }

                     _logic.ready();

                     resolve();
                  });
            });
         },

         showEmptyPlaceholder: () => {
            var Dashboard = $$(ids.component);

            // if we don't have any views, then place a "drop here" placeholder
            if (Dashboard.getChildViews().length == 0) {
               Dashboard.showOverlay(
                  "<div class='drop-zone'><div>" +
                     App.labels.componentDropZone +
                     "</div></div>"
               );
            }
         },

         validatePosition: (curPosition, minPosition, maxPosition) => {
            if (curPosition < minPosition) return minPosition;
            if (curPosition > maxPosition) return maxPosition;
            else return curPosition;
         },

         busy: () => {
            let Dashboard = $$(ids.component);
            if (Dashboard) {
               Dashboard.disable();

               if (Dashboard.showProgress)
                  Dashboard.showProgress({ type: "icon" });
            }
         },

         ready: () => {
            let Dashboard = $$(ids.component);
            if (Dashboard) {
               Dashboard.enable();

               if (Dashboard.hideProgress) Dashboard.hideProgress();
            }
         }
      };

      var _onShow = () => {
         this.views().forEach((v) => {
            var component = subComponents[v.id];

            if (component && component.onShow) {
               component.onShow();
            }
         });

         let dc = this.datacollection;
         if (dc && dc.dataStatus == dc.dataStatusFlag.notInitial) {
            // load data when a widget is showing
            dc.loadData();
         }
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,

         onShow: _onShow
      };
   }

   //
   // Property Editor
   //

   // static propertyEditorComponent(App) {
   // 	return ABViewPropertyComponent.component(App);
   // }

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      _logic.addColumnGravity = (newVal, oldVal) => {
         var pos = $$(ids.gravity)
            .getParentView()
            .index($$(ids.gravity));
         $$(ids.gravity)
            .getParentView()
            .addView(
               {
                  view: "counter",
                  value: "1",
                  min: 1,
                  label: "Column " + newVal + " Gravity",
                  labelWidth: App.config.labelWidthXLarge,
                  css: "gravity_counter",
                  on: {
                     onChange: () => {
                        logic.onChange();
                     }
                  }
               },
               pos
            );
      };

      _logic.removeColumnGravity = (newVal, oldVal) => {
         $$(ids.gravity)
            .getParentView()
            .removeView(
               $$(ids.gravity)
                  .getParentView()
                  .getChildViews()[
                  $$(ids.gravity)
                     .getParentView()
                     .index($$(ids.gravity)) - 1
               ]
            );
      };

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            name: "columns",
            view: "counter",
            min: 1,
            label: L("ab.components.container.columns", "*Columns"),
            labelWidth: App.config.labelWidthXLarge,
            on: {
               onChange: function(newVal, oldVal) {
                  if (newVal > 8) $$(ids.columns).setValue(8);

                  if (newVal > oldVal) {
                     _logic.addColumnGravity(newVal, oldVal);
                  } else if (newVal < oldVal) {
                     _logic.removeColumnGravity(newVal, oldVal);
                  }
               }
            }
         },
         {
            view: "text",
            name: "gravity",
            height: 1
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view, logic) {
      super.propertyEditorPopulate(App, ids, view, logic);
      this._App = App;

      $$(ids.columns).setValue(
         view.settings.columns || ABPropertyComponentDefaults.columns
      );

      var gravityCounters = $$(ids.gravity)
         .getParentView()
         .queryView({ css: "gravity_counter" }, "all")
         .map((counter) =>
            $$(ids.gravity)
               .getParentView()
               .removeView(counter)
         );

      for (var step = 1; step <= $$(ids.columns).getValue(); step++) {
         var pos = $$(ids.gravity)
            .getParentView()
            .index($$(ids.gravity));
         $$(ids.gravity)
            .getParentView()
            .addView(
               {
                  view: "counter",
                  value: "1",
                  min: 1,
                  label: "Column " + step + " Gravity",
                  labelWidth: App.config.labelWidthXLarge,
                  css: "gravity_counter",
                  value:
                     view.settings.gravity && view.settings.gravity[step - 1]
                        ? view.settings.gravity[step - 1]
                        : ABPropertyComponentDefaults.gravity,
                  on: {
                     onChange: () => {
                        logic.onChange();
                     }
                  }
               },
               pos
            );
      }

      // NOTE : Move to .propertyEditorSave
      // // when a change is made in the properties the popups need to reflect the change
      // this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
      // if (!this.updateEventIds[view.id]) {
      // 	this.updateEventIds[view.id] = true;

      // 	// refresh dashboard to update "position.x" and "position.y" of child views
      // 	view.addListener('properties.updated', function () {

      // 		setTimeout(() => {
      // 			view.editorComponent(App).logic.onChange();
      // 		}, 100)

      // 	}, this);
      // }
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.columns = $$(ids.columns).getValue();

      var gravity = [];
      $$(ids.gravity)
         .getParentView()
         .queryView({ css: "gravity_counter" }, "all")
         .map((counter) => gravity.push($$(counter).getValue()));
      view.settings.gravity = gravity;
   }

   static propertyEditorSave(ids, view) {
      return Promise.resolve()
         .then(() => {
            this.propertyEditorValues(ids, view);

            // Save .settings of container
            return view.save();
         })
         .then(() => {
            // signal the current view has been updated.
            view.emit("properties.updated", view);

            // Save reorder of subviews
            let editorComponent = view.editorComponent(this._App);
            return editorComponent.logic.onReorder();
         });
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @param {string} idPrefix
    *
    * @return {obj} UI component
    */
   component(App, idPrefix) {
      var idBase = "ABViewContainer_" + (idPrefix || "") + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      this.viewComponents = this.viewComponents || {}; // { viewId: viewComponent, ..., viewIdn: viewComponent }

      var _logic = {
         changePage: (pageId) => {
            this.changePage(pageId);
         },

         callbacks: {},

         getElements: (views) => {
            var rows = [];
            var curRowIndex;
            var curColIndex;

            views.forEach((v) => {
               let component = this.viewComponents[v.id];
               // if (!component) {
               component = v.component(App, idPrefix);
               this.viewComponents[v.id] = component;
               // }

               // if key == "form" or "button" register the callbacks to the parent
               // NOTE this will only work on the last form of a page!
               if (v.key == "form" && v._logic.callbacks) {
                  _logic.callbacks = v._logic.callbacks;
               }

               // Create a new row
               if (v.position.y == null || v.position.y != curRowIndex) {
                  curRowIndex = v.position.y || rows.length;
                  curColIndex = 0;

                  var rowNew = {
                     cols: []
                  };

                  // Create columns following setting value
                  var colNumber =
                     this.settings.columns ||
                     ABPropertyComponentDefaults.columns;
                  for (var i = 0; i < colNumber; i++) {
                     var grav =
                        this.settings.gravity && this.settings.gravity[i]
                           ? parseInt(this.settings.gravity[i])
                           : ABPropertyComponentDefaults.gravity;
                     rowNew.cols.push({
                        gravity: grav
                     });
                  }

                  rows.push(rowNew);
               }

               // Get the last row
               var curRow = rows[rows.length - 1];

               var newPos = v.position.x || 0;
               var getGrav = 1;

               if (curRow.cols[newPos] && curRow.cols[newPos].gravity) {
                  var getGrav = curRow.cols[newPos].gravity;
               }

               component.ui.gravity = getGrav;

               // Add ui of sub-view to column
               curRow.cols[newPos] = component.ui;

               curColIndex += 1;

               // Trigger 'changePage' event to parent
               this.eventAdd({
                  emitter: v,
                  eventName: "changePage",
                  listener: _logic.changePage
               });
            });

            return rows;
         }
      };

      // Generate rows & cols of views to .layout
      var views = this.viewsSortByPosition();
      var rowViews = _logic.getElements(views);

      var _ui = {
         id: ids.component,
         view: "layout",
         rows: rowViews
      };

      // make sure each of our child views get .init() called
      var _init = (options, parentAccessLevel = 0) => {
         // register our callbacks:
         if (options) {
            for (var c in _logic.callbacks) {
               _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }
         }

         // see access by CSS class
         if ($$(ids.component))
            $$(ids.component).define("css", "accessLevel-" + parentAccessLevel);

         // attach all the .UI views:
         for (var key in this.viewComponents) {
            // skip when the view is removed.
            if (this.views((v) => v.id == key)[0] == null) return;

            var component = this.viewComponents[key];

            // Initial component along with options in case there are callbacks we need to listen for
            if (parentAccessLevel > 0) {
               component.init(options, parentAccessLevel);
            } else {
               $$(component.ui.id).hide();
            }
         }
      };

      var _onShow = () => {
         let dv = this.datacollection; // get from a function or a (get) property
         if (dv && dv.dataStatus == dv.dataStatusFlag.notInitial) {
            // load data when a widget is showing
            dv.loadData();
         }

         // calll .onShow in child components
         this.views().forEach((v) => {
            var component = this.viewComponents[v.id];

            if (component && component.onShow) {
               component.onShow();
            }
         });

         // if ($$(this.id) && $$(this.id).resize)
         // 	setTimeout(() => {
         // 		$$(this.id).resize();
         // 	}, 100);
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,

         onShow: _onShow
      };
   }
};
