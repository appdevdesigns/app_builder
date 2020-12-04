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
               if (!entry.field) return;
               switch (entry.field.key) {
                  case "boolean":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "checkbox",
                           disabled: true,
                           key: entry.key,
                           _key: entry.key,
                           input: true
                        }
                     };
                     break;
                  case "calculate":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "textfield",
                           key: entry.key,
                           _key: entry.key,
                           input: true,
                           inputType: "text",
                           disabled: true,
                           calculateValue:
                              "value = " +
                              entry.field.settings.formula
                                 .replace(/{/g, "data['")
                                 .replace(/}/g, "']")
                        }
                     };
                     break;
                  case "connectObject":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "textfield",
                           key: entry.key,
                           _key: entry.key,
                           input: true,
                           inputType: "text",
                           disabled: true,
                           calculateValue: `value = data['${entry.field.id}.format']`
                           // ,calculateValue: `value = '${entry.field.settings.textFormula}'`
                        }
                     };
                     break;

                  case "date":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "datetime",
                           disabled: true,
                           key: entry.key,
                           _key: entry.key,
                           input: true,
                           format:
                              entry.field.settings.timeFormat == 1
                                 ? "MMMM d, yyyy"
                                 : "MMMM d, yyyy h:mm a"
                        }
                     };
                     break;
                  case "email":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           disabled: true,
                           type: "email",
                           key: entry.key,
                           _key: entry.key,
                           input: true
                        }
                     };
                     break;
                  case "file":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "htmlelement",
                           tag: "a",
                           className: "btn btn-primary btn-block",
                           content:
                              "<i class='fa fa-paperclip'></i>  " +
                              "{{JSON.parse(data['" +
                              entry.key +
                              "']).filename}}",
                           attrs: [
                              {
                                 attr: "href",
                                 value:
                                    "/opsportal/file/" +
                                    entry.field.object.application.name +
                                    "/" +
                                    "{{JSON.parse(data['" +
                                    entry.key +
                                    "']).uuid}}"
                              },
                              {
                                 attr: "target",
                                 value: "_blank"
                              }
                           ],
                           refreshOnChange: true,
                           key: entry.key,
                           _key: entry.key,
                           disabled: true,
                           input: false
                        }
                     };
                     break;
                  case "image":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "htmlelement",
                           tag: "img",
                           className: "img-thumbnail max100",
                           content: "",
                           attrs: [
                              {
                                 attr: "src",
                                 value:
                                    "/opsportal/image/" +
                                    entry.field.object.application.name +
                                    "/" +
                                    "{{data['" +
                                    entry.key +
                                    "']}}"
                              }
                           ],
                           refreshOnChange: true,
                           key: entry.key,
                           _key: entry.key,
                           input: false
                        }
                     };
                     break;
                  case "list":
                     var vals = [];
                     entry.field.settings.options.forEach((opt) => {
                        vals.push({
                           label: opt.text,
                           value: opt.id
                        });
                     });
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "select",
                           key: entry.key,
                           _key: entry.key,
                           disabled: true,
                           input: true,
                           data: {
                              values: vals
                           },
                           multiple: entry.field.settings.isMultiple
                        }
                     };
                     break;
                  case "LongText":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "textarea",
                           disabled: true,
                           key: entry.key,
                           _key: entry.key,
                           input: true
                        }
                     };
                     break;
                  case "number":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           disabled: true,
                           type: "number",
                           key: entry.key,
                           _key: entry.key,
                           input: true
                        }
                     };
                     break;
                  case "TextFormula":
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "textfield",
                           key: entry.key,
                           _key: entry.key,
                           input: true,
                           inputType: "text",
                           disabled: true,
                           calculateValue:
                              "value = '" +
                              entry.field.settings.textFormula +
                              "'"
                        }
                     };
                     break;
                  default:
                     components[entry.key] = {
                        title: entry.label,
                        key: entry.key,
                        icon: entry.field.icon,
                        schema: {
                           abFieldID: entry.field.id,
                           label: entry.field.label,
                           type: "textfield",
                           disabled: true,
                           key: entry.key,
                           _key: entry.key,
                           input: true
                        }
                     };
                     break;
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
