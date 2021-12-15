var ABFieldUserCore = require("../../core/dataFields/ABFieldUserCore");
var ABFieldComponent = require("./ABFieldComponent");

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

var ids = {
   editable: "ab-user-editable",
   isMultiple: "ab-user-multiple-option",
   isCurrentUser: "ab-user-current-user-option",
   isShowProfileImage: "ab-user-show-profile-image-option",
   isShowUsername: "ab-user-show-username-option"
};

/**
 * ABFieldUserComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldUserComponent = new ABFieldComponent({
   fieldDefaults: ABFieldUserCore.defaults(),

   elements: function(App, field) {
      ids = field.idsUnique(ids, App);

      return [
         {
            view: "checkbox",
            name: "isMultiple",
            id: ids.isMultiple,
            disallowEdit: true,
            labelRight: L(
               "ab.dataField.user.isMultiple",
               "*Allow multiple users"
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "isCurrentUser",
            id: ids.isCurrentUser,
            labelRight: L(
               "ab.dataField.user.isCurrentUser",
               "*Default value as current user"
            ),
            labelWidth: App.config.labelWidthCheckbox,
            on: {
               onChange: function(newValue, oldValue) {
                  if (newValue == 0) {
                     $$(ids.editable).setValue(1);
                     $$(ids.editable).hide();
                  } else {
                     $$(ids.editable).setValue(1);
                     $$(ids.editable).show();
                  }
               }
            }
         },
         {
            view: "checkbox",
            name: "editable",
            hidden: true,
            id: ids.editable,
            labelRight: L("ab.dataField.user.editableLabel", "*Editable"),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "isShowProfileImage",
            id: ids.isShowProfileImage,
            labelRight: L(
               "ab.dataField.user.isShowProfileImage",
               "*Show Profile Image"
            ),
            labelWidth: App.config.labelWidthCheckbox
         },
         {
            view: "checkbox",
            name: "isShowUsername",
            id: ids.isShowUsername,
            labelRight: L("ab.dataField.user.showUsername", "*Show Username"),
            labelWidth: App.config.labelWidthCheckbox
         }
      ];
   },

   // defaultValues: the keys must match a .name of your elements to set it's default value.
   defaultValues: ABFieldUserCore.defaultValues(),

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
   // 		.populate(ids, values) : populate the form with your current settings
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

module.exports = class ABFieldUser extends ABFieldUserCore {
   constructor(values, object) {
      super(values, object);
   }

   /*
    * @function propertiesComponent
    *
    * return a UI Component that contains the property definitions for this Field.
    *
    * @param {App} App the UI App instance passed around the Components.
    * @param {stirng} idBase
    * @return {Component}
    */
   static propertiesComponent(App, idBase) {
      return ABFieldUserComponent.component(App, idBase);
   }

   ///
   /// Working with Actual Object Values:
   ///

   // return the grid column header definition for this instance of ABFieldUser
   columnHeader(options) {
      options = options || {};

      var config = super.columnHeader(options);
      var field = this;
      var App = App;

      var editable = options.editable;
      var width = options.width;

      // Multiple select list
      if (field.settings.isMultiple) {
         config.template = (row) => {
            if (row.$group) return row[field.columnName];

            var node = document.createElement("div");
            node.classList.add("list-data-values");
            if (typeof width != "undefined") {
               node.style.marginLeft = width + "px";
            }

            var domNode = node;

            var readOnly = false;
            if (editable != null && editable == false) {
               readOnly = true;
            }

            var placeholder = "";
            if (field.settings.editable && readOnly == false) {
               placeholder = L(
                  "ab.dataField.user.placeHolder_single",
                  "*Select users"
               );
            }

            var data = row[field.columnName];
            if (data == "") data = [];

            field.selectivityRender(
               domNode,
               {
                  multiple: true,
                  placeholder: placeholder,
                  data: data,
                  isUsers: true,
                  readOnly: readOnly
               },
               App,
               row
            );

            return node.outerHTML;
         };
      }
      // Single select list
      else {
         var formClass = "";
         var placeHolder = "";
         if (editable) {
            formClass = " form-entry";
            placeHolder =
               "<span style='color: #CCC; padding: 0 5px;'>" +
               L("ab.dataField.user.placeholder_single", "*Select user") +
               "</span>";
         }

         config.template = (obj) => {
            if (obj.$group) return obj[field.columnName];

            var myHex = "#666666";
            var myText = placeHolder;
            var imageId = "";
            var users = field.getUsers();

            users.forEach((h) => {
               if (h.id == obj[field.columnName]) {
                  myText = h.value;
                  imageId = h.image;
               }
            });
            if (obj[field.columnName]) {
               var removeIcon = editable
                  ? ' <a class="selectivity-multiple-selected-item-remove" style="color: #333;"><i class="fa fa-remove"></i></a>'
                  : "";
               var profileImage =
                  '<i style="opacity: 0.6;" class="fa fa-user"></i> ';
               if (field.settings.isShowProfileImage && imageId) {
                  profileImage =
                     "<img src='/opsportal/image/UserProfile/" +
                     imageId +
                     "' style='border-radius:100%; object-fit: cover; margin: 0 5px 0 -10px;' width='28' height='28' />";
               }
               if (!field.settings.isShowUsername) {
                  myText = "";
               }
               return (
                  '<span class="selectivity-multiple-selected-item rendered" style="background-color:#eee !important; color: #666 !important; box-shadow: inset 0px 1px 1px #333;">' +
                  profileImage +
                  myText +
                  removeIcon +
                  " </span>"
               );
            } else {
               return myText;
            }
         };

         if ((field.settings.editable = 1)) {
            config.editor = "combo";
            config.options = field.getUsers();
         }
      }
      return config;
   }

   /*
    * @function customDisplay
    * perform any custom display modifications for this field.
    * @param {object} row is the {name=>value} hash of the current row of data.
    * @param {App} App the shared ui App object useful more making globally
    *					unique id references.
    * @param {HtmlDOM} node  the HTML Dom object for this field's display.
    */
   customDisplay(row, App, node, options) {
      // sanity check.
      if (!node) {
         return;
      }

      options = options || {};

      if (this.settings.isMultiple) {
         var readOnly = false;
         if (options.editable != null && options.editable == false) {
            readOnly = true;
         }

         var domNode = node.querySelector(".list-data-values");

         // var readOnly = true;
         var placeholder = "";
         if (this.settings.editable && readOnly == false) {
            // readOnly = false;
            placeholder = L(
               "ab.dataField.user.placeHolder_multiple",
               "*Select users"
            );
         }

         var data = row[this.columnName];
         if (data == "") data = [];

         this.selectivityRender(
            domNode,
            {
               multiple: true,
               placeholder: placeholder,
               data: data,
               items: this.getUsers(),
               isUsers: true,
               // ajax: {
               // 	url: 'It will call url in .getOptions function', // require
               // 	minimumInputLength: 0,
               // 	quietMillis: 0,
               // 	fetch: (url, init, queryOptions) => {
               // 		return this.getUsers().then(function (data) {
               // 			return {
               // 				results: data
               // 			};
               // 		});
               // 	}
               // },
               readOnly: readOnly
            },
            App,
            row
         );

         if (domNode && row.id && node) {
            // Listen event when selectivity value updates
            domNode.addEventListener(
               "change",
               (e) => {
                  // update just this value on our current this.model
                  var values = {};
                  values[this.columnName] = this.selectivityGet(domNode);

                  // pass null because it could not put empty array in REST api
                  if (values[this.columnName].length == 0)
                     values[this.columnName] = [];

                  if (row.id) {
                     this.object
                        .model()
                        .update(row.id, values)
                        .then(() => {
                           // update the client side data object as well so other data changes won't cause this save to be reverted
                           if ($$(node) && $$(node).updateItem)
                              $$(node).updateItem(row.id, values);
                        })
                        .catch((err) => {
                           node.classList.add("webix_invalid");
                           node.classList.add("webix_invalid_cell");

                           OP.Error.log("Error updating our entry.", {
                              error: err,
                              row: row,
                              values: values
                           });
                        });
                  }
               },
               false
            );
         }
      } else {
         if (!node.querySelector) return;

         var clearButton = node.querySelector(
            ".selectivity-multiple-selected-item-remove"
         );
         if (clearButton) {
            clearButton.addEventListener("click", (e) => {
               e.stopPropagation();
               var values = {};
               values[this.columnName] = "";
               this.object
                  .model()
                  .update(row.id, values)
                  .then(() => {
                     // update the client side data object as well so other data changes won't cause this save to be reverted
                     if ($$(node) && $$(node).updateItem)
                        $$(node).updateItem(row.id, values);
                  })
                  .catch((err) => {
                     node.classList.add("webix_invalid");
                     node.classList.add("webix_invalid_cell");

                     OP.Error.log("Error updating our entry.", {
                        error: err,
                        row: row,
                        values: ""
                     });
                  });
            });
         }
      }
   }

   /*
    * @function customEdit
    *
    * @param {object} row is the {name=>value} hash of the current row of data.
    * @param {App} App the shared ui App object useful more making globally
    *					unique id references.
    * @param {HtmlDOM} node  the HTML Dom object for this field's display.
    */
   customEdit(row, App, node) {
      if (this.settings.isMultiple == true) {
         var domNode = node.querySelector(".list-data-values");

         if (domNode.selectivity != null) {
            // Open selectivity
            domNode.selectivity.open();
            return false;
         }
         return false;
      }
   }

   /*
    * @funciton formComponent
    * returns a drag and droppable component that is used on the UI
    * interface builder to place form components related to this ABField.
    *
    * an ABField defines which form component is used to edit it's contents.
    * However, what is returned here, needs to be able to create an instance of
    * the component that will be stored with the ABViewForm.
    */
   formComponent() {
      // NOTE: what is being returned here needs to mimic an ABView CLASS.
      // primarily the .common() and .newInstance() methods.
      var formComponentSetting = super.formComponent();

      // .common() is used to create the display in the list
      formComponentSetting.common = () => {
         if (this.settings.isMultiple) {
            return {
               key: "fieldcustom"
            };
         } else {
            return {
               key: "selectsingle",
               options: this.getUsers()
            };
         }
      };

      return formComponentSetting;
   }

   detailComponent() {
      var detailComponentSetting = super.detailComponent();

      detailComponentSetting.common = () => {
         return {
            key: this.settings.isMultiple ? "detailselectivity" : "detailtext"
         };
      };

      return detailComponentSetting;
   }

   getValue(item, rowData) {
      var values = {};
      if (this.settings.isMultiple) {
         var domNode = item.$view.querySelector(".list-data-values");
         values = this.selectivityGet(domNode);
      } else {
         values = $$(item).getValue();
      }
      return values;
   }

   setValue(item, rowData) {
      var val = rowData[this.columnName];
      // Select "[Current user]" to update
      if (val == "ab-current-user") val = OP.User.username();

      if (this.settings.isMultiple) {
         // get selectivity dom
         var domSelectivity = item.$view.querySelector(".list-data-values");
         // set value to selectivity
         this.selectivitySet(domSelectivity, val, this.App);
      } else {
         item.setValue(rowData[this.columnName]);
      }
   }

   getUsers() {
      return OP.User.userlist().map((u) => {
         var result = {
            id: u.username,
            image: u.image_id
         };

         if (this.settings.isMultiple) {
            result.text = u.username;
         } else {
            result.value = u.username;
         }

         return result;
      });
   }
};
