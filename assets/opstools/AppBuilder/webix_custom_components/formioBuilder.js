/*
 * formioBuilder
 *
 * Create a custom webix component.
 *
 */

module.exports = class ABCustomFormIOBuilder {
   get key() {
      return "formiobuilder";
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
         component: App.unique(this.key)
      };

      // We need to reference this on the save so lets put it in a global var
      var formBuilder;

      // Our webix UI definition:
      var _ui = {
         name: this.key,
         defaults: {
            css: "scrolly forceOpen",
            hidden: false,
            autofit: true
         },
         $init: function(config) {
            var comp = _logic.parseDataFields(config.dataFields);
            var formComponents = config.formComponents
               ? config.formComponents
               : {};
            Formio.builder(this.$view, formComponents, {
               builder: {
                  basic: false,
                  advanced: false,
                  // data: false,
                  customBasic: false,
                  premium: false,
                  custom: {
                     title: "Fields",
                     weight: 0,
                     default: true,
                     components: comp
                  },
                  layout: {
                     components: {
                        table: true
                     }
                  }
               }
            }).then(function(builder) {
               // now that it is set up we can push it into the global var
               // builder.submission = {
               //     data: {
               //         Name: "James",
               //         "Number Field": 3
               //     }
               // };
               formBuilder = builder;
            });
         },
         // set up a function that can be called to request the form schema
         getFormData: () => {
            return formBuilder.schema;
         }
      };
      this.view = this.key;

      // our internal business logic
      var _logic = {
         /** @method fieldSchema
          *
          * @param field
          * @param appName
          * @param prefix
          */
         fieldSchema: (field, appName, source = "data", key) => {
            if (!field && !field.key) return;
            let fieldKey = field.key;
            if (key) {
               fieldKey = key;
            }
            switch (field.key) {
               case "boolean":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "checkbox",
                     disabled: true,
                     key: fieldKey,
                     _key: fieldKey,
                     input: true
                  };
                  break;
               case "calculate":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "textfield",
                     key: fieldKey,
                     _key: fieldKey,
                     input: true,
                     inputType: "text",
                     disabled: true
                  };
                  break;
               case "connectObject":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "textfield",
                     key: fieldKey,
                     _key: fieldKey,
                     input: true,
                     inputType: "text",
                     disabled: true,
                     calculateValue: `value = ${source}['${fieldKey}.format']`
                  };
                  break;

               case "date":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "datetime",
                     disabled: true,
                     key: fieldKey,
                     _key: fieldKey,
                     input: true,
                     enableTime: false
                  };
                  break;
               case "datetime":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "datetime",
                     disabled: true,
                     key: fieldKey,
                     _key: fieldKey,
                     input: true
                  };
                  break;
               case "email":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     disabled: true,
                     type: "email",
                     key: fieldKey,
                     _key: fieldKey,
                     input: true
                  };
                  break;
               case "file":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "htmlelement",
                     tag: "a",
                     className: "btn btn-primary btn-block",
                     content:
                        "<i class='fa fa-paperclip'></i>  " +
                        "{{JSON.parse(" +
                        source +
                        "['" +
                        fieldKey +
                        "']).filename}}",
                     attrs: [
                        {
                           attr: "href",
                           value:
                              "/opsportal/file/" +
                              appName +
                              "/" +
                              "{{JSON.parse(" +
                              source +
                              "['" +
                              fieldKey +
                              "']).uuid}}"
                        },
                        {
                           attr: "target",
                           value: "_blank"
                        }
                     ],
                     refreshOnChange: true,
                     key: fieldKey,
                     _key: fieldKey,
                     disabled: true,
                     input: false
                  };
                  break;
               case "image":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "htmlelement",
                     tag: "img",
                     className: "img-thumbnail max100",
                     content: "",
                     attrs: [
                        {
                           attr: "src",
                           value:
                              "/opsportal/image/" +
                              appName +
                              "/" +
                              "{{" +
                              source +
                              "['" +
                              fieldKey +
                              "']}}"
                        }
                     ],
                     refreshOnChange: true,
                     key: fieldKey,
                     _key: fieldKey,
                     input: false
                  };
                  break;
               case "list":
                  var vals = [];
                  field.settings.options.forEach((opt) => {
                     vals.push({
                        label: opt.text,
                        value: opt.id
                     });
                  });
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "select",
                     key: fieldKey,
                     _key: fieldKey,
                     disabled: true,
                     input: true,
                     data: {
                        values: vals
                     },
                     multiple: field.settings.isMultiple
                  };
                  break;
               case "LongText":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "textarea",
                     disabled: true,
                     key: fieldKey,
                     _key: fieldKey,
                     input: true
                  };
                  break;
               case "number":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     disabled: true,
                     type: "number",
                     key: fieldKey,
                     _key: fieldKey,
                     input: true
                  };
                  break;
               case "TextFormula":
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "textfield",
                     key: fieldKey,
                     _key: fieldKey,
                     input: true,
                     inputType: "text",
                     disabled: true
                  };
                  break;
               default:
                  return {
                     abFieldID: field.id,
                     label: field.label,
                     type: "textfield",
                     disabled: true,
                     key: fieldKey,
                     _key: fieldKey,
                     input: true
                  };
                  break;
            }
         },

         /**
          * @method parseDataObjects
          *
          * @param store {webix.TreeCollection}
          * @param elem {Object} the webix element
          * @param parentId {integer - nullable} id of parent id
          */
         parseDataFields: (fields) => {
            var components = {};
            // objects.forEach((obj) => {
            //     var fields = obj.fields();
            //     console.log(fields);
            fields.forEach((entry) => {
               // check to see if we are given a set of plucked data
               // check to see if we are not given any field information
               // if so this is an array of objects that we want to display
               // in an accrodian.
               if (!entry.field && entry.set == true) {
                  let objectFields = entry.object.fields();
                  let fieldSchemas = [];
                  let fieldLabels = [];
                  objectFields.forEach((cof) => {
                     fieldSchemas.push(
                        _logic.fieldSchema(
                           cof,
                           entry.object.application.name,
                           "row",
                           cof.columnName
                        )
                     );
                     fieldLabels.push("{{ row['" + cof.label + "'] }}");
                  });

                  components[entry.key + "_accordion"] = {
                     title: entry.label + " Accordion",
                     key: entry.key + "_accordion",
                     icon: "list",
                     schema: {
                        label: entry.label,
                        customClass: "customList",
                        disableAddingRemovingRows: true,
                        templates: {
                           header: "<h4>" + entry.label + "</h4>",
                           row:
                              "<div class='editRow'>" +
                              fieldLabels.join(" - ") +
                              "</div>"
                        },
                        key: entry.key,
                        type: "editgrid",
                        hideLabel: true,
                        disabled: true,
                        input: false,
                        components: fieldSchemas,
                        path: entry.key
                     }
                  };
               } else if (entry.field && entry.set == true) {
                  // Check if this is a set of data and if we do have a field
                  // if so this is an array of values and we need to display
                  // them in an accordian.
                  let fieldSchemas = [];
                  fieldSchemas.push(
                     _logic.fieldSchema(
                        entry.field,
                        entry.object.application.name,
                        "row",
                        entry.key
                     )
                  );

                  components[entry.key + "_accordion"] = {
                     title: entry.label + " Accordion",
                     key: entry.key + "_accordion",
                     icon: "list",
                     schema: {
                        label: entry.label,
                        customClass: "customList",
                        disableAddingRemovingRows: true,
                        templates: {
                           header: "<h4>" + entry.label + "</h4>",
                           row: "<div class='editRow'></div>"
                        },
                        key: entry.key,
                        type: "editgrid",
                        hideLabel: true,
                        disabled: true,
                        input: false,
                        components: fieldSchemas,
                        path: entry.key
                     }
                  };
               } else {
                  if (!entry.field) return;
                  // all other fields we display as single form components
                  switch (entry.field.key) {
                     case "boolean":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "calculate":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "connectObject":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;

                     case "date":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "datetime":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "email":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "file":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "image":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "list":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "LongText":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "number":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     case "TextFormula":
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                     default:
                        components[entry.key] = {
                           title: entry.label,
                           key: entry.key,
                           icon: entry.field.icon,
                           schema: _logic.fieldSchema(
                              entry.field,
                              entry.object.application.name
                           )
                        };
                        break;
                  }
               }
            });
            // });
            components["approveButton"] = {
               title: "Approve Button",
               key: "approve",
               icon: "check-square",
               schema: {
                  label: "Approve",
                  type: "button",
                  key: "approve",
                  event: "approve",
                  block: true,
                  size: "lg",
                  input: false,
                  leftIcon: "fa fa-thumbs-up",
                  action: "event",
                  theme: "success"
               }
            };
            components["denyButton"] = {
               title: "Deny Button",
               key: "deny",
               icon: "ban",
               schema: {
                  label: "Deny",
                  type: "button",
                  key: "deny",
                  event: "deny",
                  block: true,
                  size: "lg",
                  input: false,
                  leftIcon: "fa fa-thumbs-down",
                  action: "event",
                  theme: "danger"
               }
            };
            components["customButton"] = {
               title: "Custom Action Button",
               key: "custom",
               icon: "cog",
               schema: {
                  label: "Custom Name",
                  type: "button",
                  key: "custom",
                  event: "yourEvent",
                  block: true,
                  size: "lg",
                  input: false,
                  leftIcon: "fa fa-cog",
                  action: "event",
                  theme: "primary"
               }
            };
            return components;
         }
      };
      this._logic = _logic;

      // Tell Webix to create an INSTANCE of our custom component:
      webix.protoUI(_ui, webix.ui.popup);
   }
};
