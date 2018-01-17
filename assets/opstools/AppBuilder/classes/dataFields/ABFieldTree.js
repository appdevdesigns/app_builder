/*
 * ABFieldTree
 *
 * An ABFieldTree defines a select list field type.
 *
 */

// import ABFieldSelectivity from "./ABFieldSelectivity"
import ABField from "./ABField"
import ABFieldComponent from "./ABFieldComponent"


function L(key, altText) {
  return AD.lang.label.getLabel(key) || altText;
}

var ABFieldTreeDefaults = {
  key: 'tree', // unique key to reference this specific DataField

  icon: 'sitemap', // font-awesome icon reference.  (without the 'fa-').  so 'user'  to reference 'fa-user'

  // menuName: what gets displayed in the Editor drop list
  menuName: L('ab.dataField.tree.menuName', '*Data Tree'),

  // description: what gets displayed in the Editor description.
  description: L('ab.dataField.tree.description', '*Data tree allows you to build a hierarchical set of selectable data. (ex: Categories and sub-categories)'),
  isSortable: false,
  isFilterable: false,
  useAsLabel: false
};

var defaultValues = {
  options: []
};

var ids = {
  options: 'ab-tree-option',
  popup: 'ab-tree-popup',
  tree: 'ab-tree'
};

var treeCol = new webix.TreeCollection({
    data: []
});

/**
 * ABFieldTreeComponent
 *
 * Defines the UI Component for this Data Field.  The ui component is responsible
 * for displaying the properties editor, populating existing data, retrieving
 * property values, etc.
 */
var ABFieldTreeComponent = new ABFieldComponent({

  fieldDefaults: ABFieldTreeDefaults,

  elements: (App, field) => {
    ids = field.idsUnique(ids, App);

    return [{
        view: "label",
        label: "<b>Options</b>"
      },
      {
        id: ids.options,
        name: 'options',
        css: 'padList',
        view: App.custom.edittree.view,
        template: "<div style='position: relative;'><i class='ab-new-field-add fa fa-plus' style='position: relative; right: 5px;'></i>#text#<i class='ab-new-field-remove fa fa-remove' style='position: absolute; top: 7px; right: 7px;'></i></div>",
        autoheight: true,
        drag: true,
        editor: "text",
        editable: true,
        editValue: "text",
        onClick: {
          "ab-new-field-remove": (e, itemId, trg) => {
            // Remove option item
            treeCol.remove(itemId);
            // stop the default click action for this item
            return false;
          },
          "ab-new-field-add": (e, thisId, trg) => {
            // Add option item
            var itemId = webix.uid().toString();
            var parentId = thisId.toString();
            treeCol.data.add({
              id: itemId,
              text: ''
            }, null, parentId);
            $$(ids.options).openAll();
            $$(ids.options).config.height = ($$(ids.options).count() * 28) + 18; // Number of pages plus 9px of padding top and bottom
            $$(ids.options).resize();
            $$(ids.options).edit(itemId);
            
            // stop the default click action for this item
            return false;
          }
        }
      },
      {
        view: "button",
        value: "Add new option",
        click: () => {
          var itemId = webix.uid().toString();
          treeCol.data.add({
            id: itemId,
            text: ''
          });
          $$(ids.options).openAll();
          $$(ids.options).config.height = ($$(ids.options).count() * 28) + 18; // Number of pages plus 9px of padding top and bottom
          $$(ids.options).resize();
          $$(ids.options).edit(itemId);
        }
      }
    ];
  },

  // defaultValues: the keys must match a .name of your elements to set it's default value.
  defaultValues: defaultValues,

  // rules: basic form validation rules for webix form entry.
  // the keys must match a .name of your .elements for it to apply
  rules: {},

  // include additional behavior on default component operations here:
  // The base routines will be processed first, then these.  Any results
  // from the base routine, will be passed on to these:
  logic: {

    clear: (ids) => {
      $$(ids.options).clearAll();
      $$(ids.options).config.height = 0;
      $$(ids.options).resize();
      $$(ids.options).refresh();
    },

    populate: (ids, field) => {
        treeCol.clearAll();
        treeCol.parse(field.settings.options);
        $$(ids.options).openAll();
        $$(ids.options).config.height = ($$(ids.options).count() * 28) + 18; // Number of pages plus 9px of padding top and bottom
        $$(ids.options).resize();
        $$(ids.options).refresh();
    },

    values: (ids, values) => {
        // Get options list from UI, then set them to settings
        values.settings.options = treeCol.serialize();
        return values;
    },
    
    show: (ids) => {
        $$(ids.options).data.sync(treeCol);
    }


  },

  // perform any additional setup actions here.
  // @param {obj} ids  the hash of id values for all the current form elements.
  // it should have your elements + the default Header elements:
  // .label, .columnName, .fieldDescription, .showIcon
  init: (ids) => {
  }


});

class ABFieldTree extends ABField {
  constructor(values, object) {

    super(values, object, ABFieldTreeDefaults);
    

    // we're responsible for setting up our specific settings:
    for (var dv in defaultValues) {
      this.settings[dv] = values.settings[dv] || defaultValues[dv];
    }

  }

  // return the default values for this DataField
  static defaults() {
    return ABFieldTreeDefaults;
  }

  /*
   * @function propertiesComponent
   *
   * return a UI Component that contains the property definitions for this Field.
   *
   * @param {App} App the UI App instance passed around the Components.
   * @return {Component}
   */
  static propertiesComponent(App) {
    return ABFieldTreeComponent.component(App);
  }

  ///
  /// Instance Methods
  ///


  isValid() {

    var validator = super.isValid();

    // validator.addError('columnName', L('ab.validation.object.name.unique', 'Field columnName must be unique (#name# already used in this Application)').replace('#name#', this.name) );

    return validator;
  }


  /**
   * @method fromValues()
   *
   * initialze this object with the given set of values.
   * @param {obj} values
   */
  fromValues(values) {
      
      super.fromValues(values);
      
      // translate options list
      if (this.settings.options && this.settings.options.length > 0) {
          this.settings.options.forEach(function (opt) {
              OP.Multilingual.translate(opt, opt, ["text"]);
          });
      }

      
  }


  /**
   * @method toObj()
   *
   * properly compile the current state of this ABApplication instance
   * into the values needed for saving to the DB.
   *
   * Most of the instance data is stored in .json field, so be sure to
   * update that from all the current values of our child fields.
   *
   * @return {json}
   */
   toObj() {

       var obj = super.toObj();
       
       console.log(obj.settings);
       // Un-translate options list
       obj.settings.options.forEach(function (opt) {
           OP.Multilingual.unTranslate(opt, opt, ["text"]);
       });
       
       return obj;

  }




  ///
  /// Working with Actual Object Values:
  ///
  idCustomContainer(obj) {
    return "#columnName#-#id#-tree"
      .replace('#id#', obj.id)
      .replace('#columnName#', this.columnName.replace(/ /g, '_'));
  }

  // return the grid column header definition for this instance of ABFieldTree
  columnHeader(isObjectWorkspace, width, isForm) {
    var config = super.columnHeader(isObjectWorkspace);
    var field = this;
    
    var formClass = "";
    var placeHolder = "";
    if (isForm) {
        formClass = " form-entry";
        placeHolder = "<span style='color: #CCC; padding: 0 5px;'>"+L('ab.dataField.tree.placeholder', '*Select items')+"</span>";
    }

    
    config.template = function (obj) {
        var branches = [];
        var options = _.cloneDeep(field.settings.options);
        options = new webix.TreeCollection({
          data: options
        });

        var values = obj;
        if (obj[field.columnName] != null) {
          values = obj[field.columnName];
        }

        options.data.each(function(obj) {
          if (typeof values.indexOf != "undefined" && values.indexOf(obj.id) != -1) {
            var html = "";

            var rootid = obj.id;
            while (this.getParentId(rootid)) {
              options.data.each(function(par) {
                if (options.data.getParentId(rootid) == par.id) {
                  html = par.text + ": " + html;
                }
              });
              rootid = this.getParentId(rootid);
            }

            html += obj.text;
            branches.push(html);
          }
        });

        var myHex = "#4CAF50";
        var nodeHTML = "";
        nodeHTML += "<div class='list-data-values'>";
        if (branches.length == 0) {
            nodeHTML += placeHolder;
        } else {
            branches.forEach(function(item) {
                nodeHTML += '<span class="selectivity-multiple-selected-item rendered" style="background-color:' + myHex + ' !important;">' + item + '</span>';
            });
        }
        nodeHTML += "</div>";

        // field.setBadge(node, App, row);
        
        if (width) {
          return '<div style="margin-left: ' + width + 'px;" class="list-data-values'+formClass+'">'+nodeHTML+'</div>';
        } else {
          return '<div class="list-data-values'+formClass+'">'+nodeHTML+'</div>';
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
  customDisplay(row, App, node, editable, isForm) {
    // sanity check.
    if (!node) {
      return
    }
    
    var field = this;

    if (isForm) {
        if (!row || row.length == 0) {
          node.innerHTML = "<div class='list-data-values form-entry'><span style='color: #CCC; padding: 0 5px;'>"+L('ab.dataField.tree.placeholder', '*Select items')+"</span></div>";
          return
        }

        var row = row;
        var branches = [];
        var options = _.cloneDeep(field.settings.options);
        options = new webix.TreeCollection({
          data: options
        });

        var values = row;
        if (row[field.columnName] != null) {
          values = row[field.columnName];
        }

        options.data.each(function(obj) {
          if (typeof values.indexOf != "undefined" && values.indexOf(obj.id) != -1) {
            var html = "";

            var rootid = obj.id;
            while (this.getParentId(rootid)) {
              options.data.each(function(par) {
                if (options.data.getParentId(rootid) == par.id) {
                  html = par.text + ": " + html;
                }
              });
              rootid = this.getParentId(rootid);
            }

            html += obj.text;
            branches.push(html);
          }
        });

        var myHex = "#4CAF50";
        var nodeHTML = "";
        nodeHTML += "<div class='list-data-values form-entry'>";
        branches.forEach(function(item) {
          nodeHTML += '<span class="selectivity-multiple-selected-item rendered" style="background-color:' + myHex + ' !important;">' + item + '</span>';
        });
        nodeHTML += "</div>";

        node.innerHTML = nodeHTML;
    }

    field.setBadge(node, App, row);

  }

  /*
   * @function customEdit
   * 
   * @param {object} row is the {name=>value} hash of the current row of data.
   * @param {App} App the shared ui App object useful more making globally
   *					unique id references.
   * @param {HtmlDOM} node  the HTML Dom object for this field's display.
   */
  customEdit(row, App, node, component) {
    var idBase = App.unique(this.idCustomContainer(row));
    var idPopup = idBase + '-popup';
    var idTree = idBase + '-tree';
    var App = App;
    // var node = node;
    var view = $$(node);
    var field = this;
    var parentComponent = component;
    var values = {};
    var options = {};
    var row = row;
    var firstRender = true;
    
    function getValues(field, row) {
        var values = {};
        if (typeof field != "undefined" && typeof field.columnName != "undefined" && typeof row[field.columnName] != "undefined") {
            values = row[field.columnName];
        }
        return values;
    }
    
    function populateTree(field, vals) {
        values = getValues(field, vals);
        
        $$(idTree).blockEvent(); // prevents endless loop
      
        var options = _.cloneDeep(field.settings.options);
        $$(idTree).clearAll();
        $$(idTree).parse(options);
        $$(idTree).refresh();
        $$(idTree).uncheckAll();
        $$(idTree).openAll();
      
        if (values != null && values.length) {
          values.forEach(function(id) {
            if ($$(idTree).exists(id)) {
                $$(idTree).checkItem(id);
                var dom = $$(idTree).getItemNode(id);
                dom.classList.add("selected");
            }
          });
        }
        $$(idTree).unblockEvent();
    }
    
    if ($$(idPopup)) {
      $$(idPopup).show();
      populateTree(this, row);
    } else {
      webix.ui({
        id: idPopup,
        view: "popup",
        width: 500,
        height: 400,
        on: {
          onShow: () => {
              if (firstRender == true)
                populateTree(this, row);
                
              firstRender = false;
          }
        },
        body: {
          id: idTree,
          view: "tree",
          css: "ab-data-tree",
          template: function(obj, common) {
            return "<label>" + common.checkbox(obj, common) + "&nbsp;" + obj.text + "</label>";
          },
          on: {
            onItemCheck: function(id, value, event) {
              var dom = this.getItemNode(id);
              var tree = this;
              if (value == true) {
                dom.classList.add("selected");
              } else {
                dom.classList.remove("selected");
              }
              // works for the same-level children only
              // except root items
              if (this.getParentId(id)) {
                tree.blockEvent(); // prevents endless loop

                var rootid = id;
                while (this.getParentId(rootid)) {
                  rootid = this.getParentId(rootid);
                  if (rootid != id)
                    tree.uncheckItem(rootid);
                }

                this.data.eachSubItem(rootid, function(item) {
                  if (item.id != id)
                    tree.uncheckItem(item.id);
                });

                tree.unblockEvent();
              } else {
                tree.blockEvent(); // prevents endless loop
                this.data.eachSubItem(id, function(obj) {
                  if (obj.id != id)
                    tree.uncheckItem(obj.id);
                }); 
                tree.unblockEvent();
              };
              var values = {};
              values[field.columnName] = $$(idTree).getChecked();


              if (row.id) {
                // pass null because it could not put empty array in REST api
                if (values[field.columnName].length == 0)
                    values[field.columnName] = "";

                field.object.model().update(row.id, values)
                  .then(() => {
                    // update the client side data object as well so other data changes won't cause this save to be reverted
                    if (view && view.updateItem) {
                      view.updateItem(row.id, values);
                    }
                  })
                  .catch((err) => {

                    node.classList.add('webix_invalid');
                    node.classList.add('webix_invalid_cell');

                    OP.Error.log('Error updating our entry.', {
                      error: err,
                      row: row,
                      values: values
                    });
                    console.error(err);
                  })
              } else {

                var rowData = {};
                rowData[field.columnName] = $$(idTree).getChecked();

                field.setValue($$(parentComponent.ui.id), rowData);

              }
            },
          }
        }
      }).show(node, {
        x: -7
      });
    }
    return false;
  }

  setBadge(domNode, App, row) {
    var field = this;
    domNode = domNode.querySelector(".list-data-values");
    var innerHeight = domNode.scrollHeight;
    var outerHeight = domNode.parentElement.clientHeight;
    if (innerHeight - outerHeight > 5) {
      var count = 0;
      if (row[field.columnName] && row[field.columnName].length)
        count = row[field.columnName].length;
      else
        count = 0;

      if (count > 1) {
        var badge = domNode.querySelector('.webix_badge.selectivityBadge');
        if (badge != null) {
          badge.innerHTML = count;
        } else {
          var anchor = document.createElement("A");
          anchor.href = "javascript:void(0);";
          anchor.addEventListener('click', function(event) {
            App.actions.onRowResizeAuto(row.id, innerHeight);
            event.stopPropagation();
          });
          var node = document.createElement("SPAN");
          var textnode = document.createTextNode(count);
          node.classList.add("webix_badge", "selectivityBadge");
          node.appendChild(textnode);
          anchor.appendChild(node);
          domNode.appendChild(anchor);
        }
      }
    }
  }

  /**
   * @method defaultValue
   * insert a key=>value pair that represent the default value
   * for this field.
   * @param {obj} values a key=>value hash of the current values.
   */
  defaultValue(values) {


  }




  /**
   * @method isValidData
   * Parse through the given data and return an error if this field's
   * data seems invalid.
   * @param {obj} data  a key=>value hash of the inputs to parse.
   * @param {OPValidator} validator  provided Validator fn
   * @return {array} 
   */
  isValidData(data, validator) {


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
      return {
        key: 'formtree'
      }
    };

    return formComponentSetting;
  }


  detailComponent() {

    var detailComponentSetting = super.detailComponent();

    detailComponentSetting.common = () => {
      return {
        key: 'detailtree'
      }
    };

    return detailComponentSetting;
  }


  getValue(item, rowData) {
    var values = {};
    values = item.getValues();
    return values;
  }

  setValue(item, rowData) {
    var val = rowData[this.columnName] || [];
    
    item.setValues(val);
    // get dom
    var dom = item.$view.querySelector('.list-data-values');

    if (!dom) return false;

    // set value to selectivity
    this.customDisplay(val, this.App, dom, true, true);

    setTimeout(function() {
        var height = 33;
        if (dom.scrollHeight > 33) {
          height = dom.scrollHeight;
        }
        item.config.height = height + 5;
        item.resize();        
    }, 200)
  }


}


export default ABFieldTree;