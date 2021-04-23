const ABViewFormConnectCore = require("../../core/views/ABViewFormConnectCore");
const ABViewPropertyAddPage = require("./viewProperties/ABViewPropertyAddPage");
const ABViewPropertyEditPage = require("./viewProperties/ABViewPropertyEditPage");

const ABViewFormConnectPropertyComponentDefaults = ABViewFormConnectCore.defaultValues();

const RowFilter = require("../RowFilter");

let FilterComponent = null;

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

function _onShow(App, compId, instance, component) {
   let elem = $$(compId);
   if (!elem) return;

   let field = instance.field();
   if (!field) return;

   let rowData = {},
      node = elem.$view;

   // we need to use the element id stored in the settings to find out what the
   // ui component id is so later we can use it to look up its current value
   let filterValue = null;
   // we also need the id of the field that we are going to filter on
   let filterKey = null;
   // the value stored is hash1:hash2 hash1 = component view id of the element
   // we want to get the value from and hash2 = the id of the field we are using
   // to filter our options
   if (
      instance.settings.filterConnectedValue &&
      instance.settings.filterConnectedValue.indexOf(":") > -1
   ) {
      filterValue =
         instance.parent.viewComponents[
            instance.settings.filterConnectedValue.split(":")[0]
         ].ui.id;
      filterKey = instance.settings.filterConnectedValue.split(":")[1];
   }

   field.customDisplay(rowData, App, node, {
      editable: true,
      formView: instance.settings.formView,
      filters: instance.settings.objectWorkspace.filterConditions,
      filterValue: filterValue,
      filterKey: filterKey,
      editable: instance.settings.disable == 1 ? false : true,
      editPage:
         !instance.settings.editForm || instance.settings.editForm == "none"
            ? false
            : true
   });

   // listen 'editPage' event
   if (!instance._editPageEvent) {
      instance._editPageEvent = true;
      field.on("editPage", component.logic.goToEditPage);
   }
}

module.exports = class ABViewFormConnect extends ABViewFormConnectCore {
   /**
    * @param {obj} values  key=>value hash of ABView values
    * @param {ABApplication} application the application object this view is under
    * @param {ABView} parent the ABView this view is a child of. (can be null)
    */
   constructor(values, application, parent, defaultValues) {
      super(values, application, parent, defaultValues);

      // Set filter value
      this.__filterComponent = new RowFilter();
      this.__filterComponent.applicationLoad(application);
      this.__filterComponent.fieldsLoad(
         this.datasource ? this.datasource.fields() : [],
         this.datasource ? this.datasource : null
      );

      this.__filterComponent.setValue(
         this.settings.objectWorkspace.filterConditions ||
            ABViewFormConnectPropertyComponentDefaults.objectWorkspace
               .filterConditions
      );
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
      let idBase = "ABViewFormConnectEditorComponent";
      let ids = {
         component: App.unique(idBase + "_component")
      };

      let baseComp = this.component(App);
      let templateElem = baseComp.ui;
      templateElem.id = ids.component;

      var _ui = {
         rows: [templateElem, {}]
      };

      return {
         ui: _ui,
         init: baseComp.init,
         logic: baseComp.logic,
         onShow: () => {
            _onShow(App, ids.component, this, baseComp);
         }
      };
   }

   ///
   /// Instance Methods
   ///

   /**
    * @method fromValues()
    *
    * initialze this object with the given set of values.
    * @param {obj} values
    */
   fromValues(values) {
      super.fromValues(values);

      this.addPageTool.fromSettings(this.settings);
      this.editPageTool.fromSettings(this.settings);
   }

   //
   // Property Editor
   //

   static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {
      var commonUI = super.propertyEditorDefaultElements(
         App,
         ids,
         _logic,
         ObjectDefaults
      );

      let idBase = "ABViewFormConnectPropertyEditor";
      this.App = App;
      this.idBase = idBase;

      _logic.showFilterPopup = ($view) => {
         this.filter_popup.show($view, null, { pos: "top" });
      };

      _logic.onFilterChange = () => {
         let view = _logic.currentEditObject();
         let filterValues = FilterComponent.getValue() || {};

         let allComplete = true;
         (filterValues.rules || []).forEach((f) => {
            // if all 3 fields are present, we are good.
            if (f.key && f.rule && f.value) {
               allComplete = allComplete && true;
            } else {
               // else, we found an entry that wasn't complete:
               allComplete = false;
            }
         });

         // only perform the update if a complete row is specified:
         if (allComplete) {
            // we want to call .save() but give webix a chance to properly update it's
            // select boxes before this call causes them to be removed:
            setTimeout(() => {
               this.propertyEditorSave(ids, view);
            }, 10);
         }
      };

      // create filter & sort popups
      this.initPopupEditors(App, ids, _logic);

      let onSave = () => {
         let currView = _logic.currentEditObject();
         if (currView) {
            // refresh settings
            this.propertyEditorValues(ids, currView);

            // trigger a save()
            this.propertyEditorSave(ids, currView);
         }
      };

      this.addPageProperty.init({
         onSave: () => {
            onSave();
         }
      });

      this.editPageProperty.init({
         onSave: () => {
            onSave();
         }
      });

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         this.addPageProperty.ui,
         this.editPageProperty.ui,
         {
            view: "fieldset",
            name: "addNewSettings",
            label: L(
               "ab.component.connect.addNewSettings",
               "*Add New Popup Settings:"
            ),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     view: "text",
                     name: "popupWidth",
                     placeholder: L(
                        "ab.component.connect.popupWidthPlaceholder",
                        "*Set popup width"
                     ),
                     label: L("ab.component.page.popupWidth", "*Width:"),
                     labelWidth: App.config.labelWidthLarge,
                     validate: webix.rules.isNumber
                  },
                  {
                     view: "text",
                     name: "popupHeight",
                     placeholder: L(
                        "ab.component.connect.popupHeightPlaceholder",
                        "*Set popup height"
                     ),
                     label: L("ab.component.page.popupHeight", "*Height:"),
                     labelWidth: App.config.labelWidthLarge,
                     validate: webix.rules.isNumber
                  }
               ]
            }
         },
         {
            view: "fieldset",
            name: "advancedOption",
            label: L(
               "ab.component.connect.advancedOptions",
               "*Advanced Options:"
            ),
            labelWidth: App.config.labelWidthLarge,
            body: {
               type: "clean",
               padding: 10,
               rows: [
                  {
                     cols: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.connect.filterData",
                              "*Filter Options:"
                           ),
                           width: App.config.labelWidthLarge
                        },
                        {
                           view: "button",
                           name: "buttonFilter",
                           css: "webix_primary",
                           label: L(
                              "ab.component.connect.settings",
                              "*Settings"
                           ),
                           icon: "fa fa-gear",
                           type: "icon",
                           badge: 0,
                           click: function() {
                              _logic.showFilterPopup(this.$view);
                           }
                        }
                     ]
                  },
                  {
                     rows: [
                        {
                           view: "label",
                           label: L(
                              "ab.component.connect.filterConnectedValue",
                              "*Filter by Connected Field Value:"
                           )
                        },
                        {
                           view: "combo",
                           name: "filterConnectedValue",
                           options: [] // we will add these in propertyEditorPopulate
                        }
                     ]
                  }
               ]
            }
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      // Default set of options for filter connected combo
      let filterConnectedOptions = [{ id: "", value: "" }];
      // get the definitions for the connected field
      let fieldDefs = view.application.definitionForID(view.settings.fieldId);
      // get the definition for the object that the field is related to
      let objectDefs = view.application.definitionForID(
         fieldDefs.settings.linkObject
      );
      // we need these definitions later as we check to find out which field
      // we are filtering by so push them into an array for later
      let fieldsDefs = [];
      objectDefs.fieldIDs.forEach((fld) => {
         fieldsDefs.push(view.application.definitionForID(fld));
      });
      // find out what connected objects this field has
      let connectedObjs = view.application.connectedObjects(
         fieldDefs.settings.linkObject
      );
      // loop through the form's elements (need to ensure that just looking at parent is okay in all cases)
      view.parent.views().forEach((element) => {
         // identify if element is a connected field
         if (element.key == "connect") {
            // we need to get the fields defs to find out what it is connected to
            let formElementsDefs = view.application.definitionForID(
               element.settings.fieldId
            );
            // loop through the connected objects discovered above
            connectedObjs.forEach((connObj) => {
               // see if the connected object matches the connected object of the form element
               if (connObj.id == formElementsDefs.settings.linkObject) {
                  // get the ui id of this component that matches the link Object
                  let fieldToCheck;
                  fieldsDefs.forEach((fdefs) => {
                     if (
                        fdefs.settings.linkObject &&
                        fdefs.settings.linkType == "one" &&
                        fdefs.settings.linkObject ==
                           formElementsDefs.settings.linkObject
                     ) {
                        fieldToCheck = fdefs.id;
                     }
                  });
                  // only add optinos that have a fieldToCheck
                  if (fieldToCheck) {
                     // get the component we are referencing so we can display its label
                     let formComponent = view.parent.viewComponents[element.id]; // need to ensure that just looking at parent is okay in all cases
                     filterConnectedOptions.push({
                        id: element.id + ":" + fieldToCheck, // store the element id because the ui id changes on each load
                        value: formComponent.ui.name // should be the translated field label
                     });
                  }
               }
            });
         }
      });

      // Set the options of the possible edit forms
      this.addPageProperty.setSettings(view, view.settings);
      this.editPageProperty.setSettings(view, view.settings);
      $$(ids.filterConnectedValue).define("options", filterConnectedOptions);
      $$(ids.filterConnectedValue).setValue(view.settings.filterConnectedValue);

      $$(ids.popupWidth).setValue(
         view.settings.popupWidth ||
            ABViewFormConnectPropertyComponentDefaults.popupWidth
      );
      $$(ids.popupHeight).setValue(
         view.settings.popupHeight ||
            ABViewFormConnectPropertyComponentDefaults.popupHeight
      );

      // initial populate of popups
      this.populatePopupEditors(view);

      // inform the user that some advanced settings have been set
      this.populateBadgeNumber(ids, view);

      // when a change is made in the properties the popups need to reflect the change
      this.updateEventIds = this.updateEventIds || {}; // { viewId: boolean, ..., viewIdn: boolean }
      if (!this.updateEventIds[view.id]) {
         this.updateEventIds[view.id] = true;

         view.addListener("properties.updated", () => {
            this.populatePopupEditors(view);
            this.populateBadgeNumber(ids, view);
         });
      }
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.popupWidth = $$(ids.popupWidth).getValue();
      view.settings.popupHeight = $$(ids.popupHeight).getValue();
      view.settings.filterConnectedValue = $$(
         ids.filterConnectedValue
      ).getValue();
      view.settings.objectWorkspace = {
         filterConditions: FilterComponent.getValue()
      };

      view.settings = this.addPageProperty.getSettings(view);
      view.settings = this.editPageProperty.getSettings(view);

      // refresh settings of app page tool
      view.addPageTool.fromSettings(view.settings);
      view.editPageTool.fromSettings(view.settings);
   }

   static populateBadgeNumber(ids, view) {
      if (
         view.settings.objectWorkspace &&
         view.settings.objectWorkspace.filterConditions &&
         view.settings.objectWorkspace.filterConditions.rules
      ) {
         $$(ids.buttonFilter).define(
            "badge",
            view.settings.objectWorkspace.filterConditions.rules.length || null
         );
         $$(ids.buttonFilter).refresh();
      } else {
         $$(ids.buttonFilter).define("badge", null);
         $$(ids.buttonFilter).refresh();
      }
   }

   static initPopupEditors(App, ids, _logic) {
      var idBase = "ABViewFormConnectPropertyEditor";

      FilterComponent = new RowFilter(App, idBase + "_filter");
      FilterComponent.init({
         // when we make a change in the popups we want to make sure we save the new workspace to the properties to do so just fire an onChange event
         onChange: _logic.onFilterChange
      });

      this.filter_popup = webix.ui({
         view: "popup",
         width: 800,
         hidden: true,
         body: FilterComponent.ui
      });
   }

   static populatePopupEditors(view) {
      let filterConditions =
         ABViewFormConnectPropertyComponentDefaults.objectWorkspace
            .filterConditions;

      if (
         view.settings.objectWorkspace &&
         view.settings.objectWorkspace.filterConditions
      )
         filterConditions = view.settings.objectWorkspace.filterConditions;

      // Populate data to popups
      // FilterComponent.objectLoad(objectCopy);
      let field = view.field();
      if (field) {
         let linkedObj = field.datasourceLink;
         if (linkedObj)
            FilterComponent.fieldsLoad(linkedObj.fields(), linkedObj);
      }

      FilterComponent.applicationLoad(view.application);
      FilterComponent.setValue(filterConditions);
   }

   static get addPageProperty() {
      return ABViewPropertyAddPage.propertyComponent(this.App, this.idBase);
   }

   static get editPageProperty() {
      return ABViewPropertyEditPage.propertyComponent(this.App, this.idBase);
   }

   /**
    * @method component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var field = this.field();
      // this field may be deleted
      if (!field) return super.component(App);

      var component = {};
      var form = this.parentFormComponent();
      var idBase = this.parentFormUniqueID(
         "ABViewFormConnect_" + this.id + "_f_"
      );
      var ids = {
         component: App.unique(idBase + "_component"),
         popup: App.unique(idBase + "_popup_add_new"),
         editpopup: App.unique(idBase + "_popup_edit_form_popup_add_new")
      };

      var settings = {};
      if (form) settings = form.settings;

      var requiredClass = "";
      if (field.settings.required == true || this.settings.required == true) {
         requiredClass = "webix_required";
      }
      var templateLabel = "";
      if (settings.showLabel) {
         if (settings.labelPosition == "top")
            templateLabel =
               '<label style="display:block; text-align: left; margin: 0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_top_label ' +
               requiredClass +
               '">#label#</label>';
         else
            templateLabel =
               '<label style="width: #width#px; display: inline-block; line-height: 32px; float: left; margin: 0; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;" class="webix_inp_label ' +
               requiredClass +
               '">#label#</label>';
      }

      var newWidth = settings.labelWidth;
      if (this.settings.formView && this.settings.formView != "none") {
         newWidth += 40;
      } else if (
         settings.showLabel == true &&
         settings.labelPosition == "top"
      ) {
         newWidth = 0;
      }

      let addPageComponent = this.addPageTool.component(App, idBase);
      let editPageComponent;

      let template = (
         '<div class="customField">' +
         templateLabel +
         "#plusButton##template#" +
         "</div>"
      )
         .replace(/#width#/g, settings.labelWidth)
         .replace(/#label#/g, field.label)
         .replace(/#plusButton#/g, addPageComponent.ui)
         .replace(
            /#template#/g,
            field
               .columnHeader({
                  width: newWidth,
                  editable: true,
                  skipRenderSelectivity: true
               })
               .template({})
         );

      component.init = (options) => {
         addPageComponent.applicationLoad(this.application);
         addPageComponent.init({
            onSaveData: component.logic.callbackSaveData,
            onCancelClick: component.logic.callbackCancel,
            clearOnLoad: component.logic.callbackClearOnLoad
         });

         editPageComponent = this.editPageTool.component(App, idBase);
         editPageComponent.applicationLoad(this.application);
         editPageComponent.init({
            onSaveData: component.logic.callbackSaveData,
            onCancelClick: component.logic.callbackCancel,
            clearOnLoad: component.logic.callbackClearOnLoad
         });
      };

      component.logic = {
         /**
          * @function callbackSaveData
          *
          */
         callbackSaveData: (saveData) => {
            // find the selectivity component
            var elem = $$(ids.component);
            if (!elem) return;

            // get the linked Object for current field
            // var linkedObj = field.datasourceLink;
            // isolate the connected field data that was saved
            // var savedItem = linkedObj.displayData(saveData);
            // repopulate the selectivity options now that there is a new one added
            // var filters = {};
            // if (this.settings.objectWorkspace && this.settings.objectWorkspace.filterConditions) {
            // 	filters = this.settings.objectWorkspace.filterConditions;
            // }

            field
               .getOptions(this.settings.objectWorkspace.filterConditions, "")
               .then(function(data) {
                  // find option with the matching id to the savedData
                  var myOption = data.filter((d) => d.id == saveData.id)[0];
                  if (myOption == null) {
                     if ($$(ids.popup)) $$(ids.popup).close();
                     if ($$(ids.editpopup)) $$(ids.editpopup).close();
                     return;
                  }

                  let fieldVal = field.getValue(elem);
                  if (Array.isArray(fieldVal)) {
                     // Keep selected items
                     fieldVal.push(myOption);
                  } else {
                     fieldVal = myOption;
                  }

                  var values = {};
                  // retrieve the related field name
                  var relatedField = field.relationName();
                  // format payload to the setValue requirements
                  values[relatedField] = fieldVal;
                  // set the value of selectivity to the matching item that was just created
                  field.setValue(elem, values);

                  // close the popup when we are finished
                  if ($$(ids.popup)) $$(ids.popup).close();
                  if ($$(ids.editpopup)) $$(ids.editpopup).close();
               });
         },

         callbackCancel: () => {
            $$(ids.popup).close();
            return false;
         },

         callbackClearOnLoad: () => {
            return true;
         },

         getValue: (rowData) => {
            var elem = $$(ids.component);

            return field.getValue(elem, rowData);
         },

         formBusy: ($form) => {
            if (!$form) return;

            if ($form.disable) $form.disable();

            if ($form.showProgress) $form.showProgress({ type: "icon" });
         },

         formReady: ($form) => {
            if (!$form) return;

            if ($form.enable) $form.enable();

            if ($form.hideProgress) $form.hideProgress();
         },

         goToEditPage: (rowId) => {
            if (!this.settings.editForm) return;

            let editForm = this.application.urlResolve(this.settings.editForm);
            if (!editForm) return;

            let $form;
            let $elem = $$(ids.component);
            if ($elem) {
               $form = $elem.getFormView();
            }

            component.logic.formBusy($form);

            setTimeout(() => {
               // Open the form popup
               editPageComponent.onClick().then(() => {
                  let dc = editForm.datacollection;
                  if (dc) {
                     dc.setCursor(rowId);

                     if (!this.__editFormDcEvent) {
                        this.__editFormDcEvent = dc.on(
                           "initializedData",
                           () => {
                              dc.setCursor(rowId);
                           }
                        );
                     }
                  }

                  component.logic.formReady($form);
               });
            }, 50);
         }
      };

      component.ui = {
         id: ids.component,
         view: "forminput",
         labelWidth: 0,
         paddingY: 0,
         paddingX: 0,
         css: "ab-custom-field",
         name: field.columnName,
         body: {
            view: App.custom.focusabletemplate.view,
            css: "webix_el_box",
            borderless: true,
            template: template,
            onClick: {
               customField: (id, e, trg) => {
                  if (this.settings.disable == 1) return;

                  var rowData = {};

                  if ($$(ids.component)) {
                     var node = $$(ids.component).$view;
                     field.customEdit(rowData, App, node);
                  }
               },
               "ab-connect-add-new-link": function(e, id, trg) {
                  e.stopPropagation();
                  // var topParentView = this.getTopParentView();
                  // component.logic.openFormPopup(topParentView.config.left, topParentView.config.top);

                  let $form = this.getFormView();
                  component.logic.formBusy($form);

                  let dc = form.datacollection;

                  setTimeout(() => {
                     addPageComponent.onClick(dc).then(() => {
                        component.logic.formReady($form);
                     });
                  }, 50);

                  return false;
               }
            }
         }
      };

      if (settings.showLabel == true && settings.labelPosition == "top") {
         component.ui.body.height = 80;
      } else {
         component.ui.body.height = 38;
      }

      component.onShow = () => {
         _onShow(App, ids.component, this, component);
      };

      return component;
   }

   get addPageTool() {
      if (this.__addPageTool == null)
         this.__addPageTool = new ABViewPropertyAddPage();

      return this.__addPageTool;
   }

   get editPageTool() {
      if (this.__editPageTool == null)
         this.__editPageTool = new ABViewPropertyEditPage();

      return this.__editPageTool;
   }
};
