const ABViewCore = require("../../core/views/ABViewCore");
const ABPropertyComponent = require("../ABPropertyComponent");

const ABViewPropertyComponentDefaults = ABViewCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABView extends ABViewCore {
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);
   }

   /*
    * @method isValid
    * check the current values to make sure they are valid.
    * Here we check the default values provided by ABView.
    *
    * @return {OP.Validation.validator()}
    */
   isValid() {
      var validator = OP.Validation.validator();

      // // labels must be unique among views on the same parent
      var parent = this.parent;
      // if (!parent) { parent = this.application; }

      // if we have a parent component:
      if (parent) {
         var isNameUnique =
            parent.views((v) => {
               return (
                  v.id != this.id &&
                  v.label.toLowerCase() == this.label.toLowerCase()
               );
            }).length == 0;
         if (!isNameUnique) {
            validator.addError(
               "label",
               L(
                  "ab.validation.view.label.unique",
                  "*View label must be unique among peers."
               )
            );
         }
      }
      return validator;
   }

   /**
    * @method editorComponent
    * return the Editor for this UI component.
    * the editor should display either a "block" view or "preview" of
    * the current layout of the view.
    * @param {string} mode what mode are we in ['block', 'preview']
    * @return {Component}
    */
   editorComponent(App, mode) {
      var L = App.Label;

      var idBase = "ABViewEditorComponent";
      var ids = {
         component: App.unique(idBase + "_component"),
         view: App.unique(idBase + "_view")
      };

      var _ui = {
         rows: [
            {
               id: ids.component,
               view: App.custom.savablelayout.view,
               type: "space",
               rows: []
            }
         ]
      };

      var _init = (options) => {
         var Layout = $$(ids.component);

         var allComponents = [];

         App.eventIds = App.eventIds || {};

         // prevent .attachEvent multiple times
         if (App.eventIds["onAfterPortletMove"])
            webix.detachEvent("onAfterPortletMove");

         // listen a event of the porlet when layout is changed
         App.eventIds["onAfterPortletMove"] = webix.attachEvent(
            "onAfterPortletMove",
            (source, parent, active, target, mode) => {
               _logic.onAfterPortletMove();
            }
         );

         // attach all the .UI views:
         this.views().forEach((child) => {
            var component = child.component(App);

            var porletUI = {
               viewId: child.id, // set id to .viewId, the layout template
               view: "portlet",
               css: "ab-interface-component",
               // borderless: true,
               layoutType: "head", // Drag on icon
               body: {
                  rows: [
                     {
                        view: "template",
                        height: 30,
                        css: "ab-porlet-header",
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
                     mode == "preview"
                        ? component.ui
                        : {
                             // empty element
                             view: "spacer",
                             hidden: true
                          }
                  ]
               }
            };

            // get element in template
            var elem = Layout.queryView({ viewId: child.id });

            // If webix element is not exists in html, then destroy it.
            // NOTE : webix does not know html is missing when we redraw layout at .setState
            if (elem && !document.body.contains(elem.$view)) elem.destructor();

            if (elem) {
               // replace component to layout
               webix.ui(porletUI, elem);
            }
            // add component to rows
            else {
               Layout.addView(porletUI);
            }

            allComponents.push(component);
         });

         // in preview mode, have each child render a preview
         // of their content:
         if (mode == "preview") {
            // perform any init setups for the content:
            allComponents.forEach((component) => {
               component.init();
            });
         }
      };

      var _logic = {
         /**
          * @method template()
          * render the list template for the View
          * @param {obj} obj the current View instance
          * @param {obj} common  Webix provided object with common UI tools
          */
         template: function(child) {
            return (
               "<div>" +
               '<i class="fa fa-#icon# webix_icon_btn"></i> ' +
               " #label#" +
               '<div class="ab-component-tools">' +
               '<i class="fa fa-trash ab-component-remove"></i>' +
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
               callback: function(result) {
                  if (result) {
                     var Layout = $$(ids.component);

                     // remove UI of this component in template
                     var deletedElem = Layout.queryView({ viewId: id });
                     if (deletedElem)
                        $$(ids.component).destroyView(deletedElem);

                     // update/refresh template to ABView
                     _logic.refreshTemplate();

                     deletedView
                        .destroy()
                        .then(() => {
                           // signal the current view has been deleted.
                           deletedView.emit("destroyed", deletedView);

                           // if we don't have any views, then place a "drop here" placeholder
                           if ($$(ids.component).getChildViews().length == 0) {
                              webix.extend($$(ids.component), webix.OverlayBox);
                              $$(ids.component).showOverlay(
                                 "<div class='drop-zone'><div>" +
                                    App.labels.componentDropZone +
                                    "</div></div>"
                              );
                           }
                        })
                        .catch((err) => {
                           OP.Error.log(
                              "Error trying to delete selected View:",
                              { error: err, view: deletedView }
                           );
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

            // yeah, if the empty placeholder fires an [edit] event,
            // then ignore it.
            if (view.id == "del_me") return false;

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

         onAfterPortletMove: () => {
            _logic.refreshTemplate();

            // save template layout to ABPageView
            this.save();

            // // Reorder
            // var viewId = active.config.id;
            // var targetId = target.config.id;

            // var toPosition = this._views.findIndex((v) => v.id == targetId);

            // this.viewReorder(viewId, toPosition);
         },

         refreshTemplate: () => {
            // get portlet template UI to ABView
            this.template = $$(ids.component).getState();
         }
      };

      return {
         ui: _ui,
         init: _init
      };
   }

   static propertyEditorComponent(App) {
      var ABViewPropertyComponent = new ABPropertyComponent({
         editObject: this, // ABView

         fieldDefaults: this.common(), // ABViewDefaults,

         elements: (App, field) => {
            var ids = {
               imageWidth: "",
               imageHeight: ""
            };
            ids = field.idsUnique(ids, App);

            return [];
         },

         // defaultValues: the keys must match a .name of your elements to set it's default value.
         defaultValues: ABViewPropertyComponentDefaults,

         // rules: basic form validation rules for webix form entry.
         // the keys must match a .name of your .elements for it to apply
         rules: {
            // 'textDefault':webix.rules.isNotEmpty,
            // 'supportMultilingual':webix.rules.isNotEmpty
         },

         // include additional behavior on default component operations here:
         // The base routines will be processed first, then these.  Any results
         // from the base routine, will be passed on to these:
         // 	@param {obj} ids  the list of ids used to generate the UI.  your
         //					  provided .elements will have matching .name keys
         //					  to access them here.
         //  @param {obj} values the current set of values provided for this instance
         // 					  of ABField:
         //					  {
         //						id:'',			// if already .saved()
         // 						label:'',
         // 						columnName:'',
         //						settings:{
         //							showIcon:'',
         //
         //							your element key=>values here
         //						}
         //					  }
         //
         // 		.clear(ids)  : reset the display to an empty state
         // 		.isValid(ids, isValid): perform validation on the current editor values
         // 		.populate(ids, ABField) : populate the form with your current settings
         // 		.show(ids)   : display the form in the editor
         // 		.values(ids, values) : return the current values from the form
         logic: {},

         // perform any additional setup actions here.
         // @param {obj} ids  the hash of id values for all the current form elements.
         //					 it should have your elements + the default Header elements:
         //						.label, .columnName, .fieldDescription, .showIcon
         init: function(ids) {
            // want to hide the description? :
            // $$(ids.fieldDescription).hide();
         }
      });

      return ABViewPropertyComponent.component(App);
   }

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      return [
         // Component Label
         {
            view: "text",
            // id: ids.label,
            name: "label",
            label: App.labels.dataFieldHeaderLabel,
            placeholder: App.labels.dataFieldHeaderLabelPlaceholder,
            labelWidth: App.config.labelWidthLarge,
            css: "ab-new-label-name"
            // 				on: {
            // 					onChange: function (newVal, oldVal) {
            // console.warn('ABView.onChange()!!!');
            // 					}
            // 				}
         }
      ];
   }

   static propertyEditorPopulate(App, ids, view) {
      if (!view) return;
      $$(ids.label).setValue(view.label);
   }

   static propertyEditorValues(ids, view) {
      if (!view) return;
      view.label = $$(ids.label).getValue();
   }

   static propertyEditorSave(ids, view, includeSubViews = false) {
      this.propertyEditorValues(ids, view);

      return new Promise((resolve, reject) => {
         view
            .save(includeSubViews)
            .then(function() {
               // signal the current view has been updated.
               view.emit("properties.updated", view);

               resolve();
            })
            .catch(function(err) {
               OP.Error.log("unable to save view:", { error: err, view: view });
               reject(err);
            });
      });
   }

   /**
    * @method propertyDatacollections()
    * a convience method to return a list of available Datacollections
    * @param {bool} isGlobal
    *        true : return a list of ALL available DataCollections
    *        false: (default) only return a list of included DCs
    * @return {array}
    *        [ { id:dc.id, value:dc.label } ]
    *        this format is used by the webix select lists to choose your
    *        datasources.
    */
   propertyDatacollections(
      filter = () => true,
      isGlobal = false,
      defaultOption = null
   ) {
      if (defaultOption == null) {
         defaultOption = {
            id: "",
            value: L(
               "ab.component.label.selectDatacollection",
               "*Select a DataCollection"
            )
         };
      }

      var list = [];
      if (isGlobal) {
         list = this.application.datacollections(filter);
      } else {
         list = this.application.datacollectionsIncluded(filter);
      }
      list = list.map((dc) => {
         return {
            id: dc.id,
            value: dc.label
         };
      });
      list.unshift(defaultOption);
      return list;
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var idBase = "ABView_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      // an ABView is a collection of rows:
      var _ui = {
         id: ids.component,
         view: "layout",
         type: "space",
         rows: []
      };

      // if this form is empty, then force a minimal row height
      // so the component isn't completely hidden on the screen.
      // (important in the editor so we don't loose the ability to edit the
      // component)
      if (_ui.rows.length == 0) {
         _ui.height = 30;
      }

      // make sure each of our child views get .init() called
      var _init = (options) => {};

      return {
         ui: _ui,
         init: _init
      };
   }

   /*
    * @method componentList
    * return the list of components available on this view to display in the editor.
    * @param {bool} isEdited  is this component currently in the Interface Editor
    * @return {array} of ABView objects.
    */
   componentList(isEdited) {
      // if (this.parent) {
      // 	return this.parent.componentList(false);
      // } else {

      // views not allowed to drop onto this View:
      var viewsToIgnore = [
         "view",
         "page",
         "formpanel",
         "viewcontainer",
         // not allowed Detail's widgets
         "detailcheckbox",
         "detailcustom",
         "detailconnect",
         "detailimage",
         "detailselectivity",
         "detailtext",
         "detailtree",
         // not allowed Form's widgets
         "button",
         "checkbox",
         "connect",
         "datepicker",
         "fieldcustom",
         "textbox",
         "numberbox",
         "selectsingle",
         "formtree",
         "fieldreadonly",
         // not allowed Chart's Widgets
         "pie",
         "bar",
         "line",
         "area",
         // not allowed Report page
         "report",
         "reportPage",
         "reportPanel"
      ];

      var allComponents = this.application.viewAll(); // ABViewManager.allViews();
      var allowedComponents = allComponents.filter((c) => {
         return viewsToIgnore.indexOf(c.common().key) == -1;
      });

      return allowedComponents;

      // }
   }

   changePage(pageId) {
      this.emit("changePage", pageId);
   }

   removeField(field, cb) {
      // if this view has matching field then destroy()
      if (this.settings.fieldId == field.id) {
         this.destroy()
            .then(() => {
               // signal the current view has been deleted.
               this.emit("destroyed", this);
               cb(null, true);
            })
            .catch((err) => {
               OP.Error.log("Error trying to delete selected View:", {
                  error: err,
                  view: this
               });
               cb(err);
            });
      } else {
         // if not check for subViews then call removeField on them

         var shouldSave = false;

         var finish = () => {
            if (shouldSave) {
               this.save()
                  .then(() => {
                     cb();
                  })
                  .catch(cb);
            } else {
               cb();
            }
         };

         // for each sub view, view.removeField(field);
         var listViews = this.views();
         var done = 0;
         listViews.forEach((v) => {
            v.removeField(field, (err, updateMade) => {
               if (err) {
                  cb(err);
               } else {
                  if (updateMade) {
                     shouldSave = true;
                  }

                  done++;
                  if (done >= listViews.length) {
                     finish();
                  }
               }
            });
         });

         if (listViews.length == 0) {
            finish();
         }
      }
   }
};
