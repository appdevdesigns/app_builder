/*
 * ab_common_popupEditMenu
 *
 * Many of our Lists offer a gear icon that allows a popup menu to select
 * a set of options for this entry.  This is a common Popup Editor for those
 * options.
 *
 */

const ABComponent = require("../classes/platform/ABComponent");

module.exports = class ABCommonPopupEditMenu extends ABComponent {
   constructor(App, idBase) {
      idBase = idBase || "ab_common_popupEditMenu";

      super(App, idBase);

      var L = this.Label;

      var labels = {
         common: App.labels,

         component: {
            copy: L("ab.page.copy", "*Copy"),
            exclude: L("ab.object.exclude", "*Exclude"),

            menu: L("ab.application.menu", "*Application Menu"),
            confirmDeleteTitle: L(
               "ab.application.delete.title",
               "*Delete application"
            ),
            confirmDeleteMessage: L(
               "ab.application.delete.message",
               "*Do you want to delete <b>{0}</b>?"
            )
         }
      };

      // since multiple instances of this component can exists, we need to
      // make each instance have unique ids => so add webix.uid() to them:
      var uid = webix.uid();
      var ids = {
         menu: this.unique("menu") + uid,
         list: this.unique("list") + uid
      };

      this.ui = {
         view: "popup",
         id: ids.menu,
         head: labels.component.menu,
         width: 120,
         body: {
            view: "list",
            id: ids.list,
            borderless: true,
            data: [],
            datatype: "json",
            template: "<i class='fa #icon#' aria-hidden='true'></i> #label#",
            autoheight: true,
            select: false,
            on: {
               onItemClick: function(timestamp, e, trg) {
                  return _logic.onItemClick(trg);
               }
            }
         }
      };

      var Popup = null;
      var _menuOptions = [
         {
            label: labels.common.rename,
            icon: "fa fa-pencil-square-o",
            command: "rename"
         },
         {
            label: labels.component.copy,
            icon: "fa fa-files-o",
            command: "copy"
         },
         {
            label: labels.component.exclude,
            icon: "fa fa-reply",
            command: "exclude"
         },
         { label: labels.common.delete, icon: "fa fa-trash", command: "delete" }
      ];

      this.init = (options) => {
         options = options || {};

         if (Popup == null) Popup = webix.ui(this.ui); // the current instance of this editor.

         _logic.hide();
         _logic.menuOptions(_menuOptions);

         // register our callbacks:
         for (var c in _logic.callbacks) {
            if (options && options[c]) {
               _logic.callbacks[c] = options[c] || _logic.callbacks[c];
            }
         }

         // hide "copy" item
         if (options.hideCopy) {
            let itemCopy = $$(ids.list).data.find(
               (item) => item.label == labels.component.copy
            )[0];
            if (itemCopy) {
               $$(ids.list).remove(itemCopy.id);
               $$(ids.list).refresh();
            }
         }

         // hide "exclude" item
         if (options.hideExclude) {
            let hideExclude = $$(ids.list).data.find(
               (item) => item.label == labels.component.exclude
            )[0];
            if (hideExclude) {
               $$(ids.list).remove(hideExclude.id);
               $$(ids.list).refresh();
            }
         }
      };

      var _logic = (this._logic = {
         callbacks: {
            onClick: function(action) {}
         },

         /**
          * @function menuOptions
          * override the set of menu options.
          * @param {array} menuOptions an array of option entries:
          *				  .label {string} multilingual label of the option
          *				  .icon  {string} the font awesome icon reference
          *				  .command {string} the command passed back when selected.
          */
         menuOptions: function(menuOptions) {
            $$(ids.list).clearAll();

            _menuOptions = menuOptions;
            var data = [];
            menuOptions.forEach((mo) => {
               data.push({ label: mo.label, icon: mo.icon });
            });
            $$(ids.list).parse(data);
            $$(ids.list).refresh();
         },

         /**
          * @function onItemClick
          * process which item in our popup was selected.
          */
         onItemClick: function(itemNode) {
            // hide our popup before we trigger any other possible UI animation: (like .edit)
            // NOTE: if the UI is animating another component, and we do .hide()
            // while it is in progress, the UI will glitch and give the user whiplash.

            // switch (itemNode.textContent.trim()) {
            // 	case labels.common.rename:
            // 		this.callbacks.onClick('rename');
            // 		break;
            // 	case labels.common['delete']:
            // 		this.callbacks.onClick('delete');
            // 		break;
            // }
            var label = itemNode.textContent.trim();
            var option = _menuOptions.filter((mo) => {
               return mo.label == label;
            })[0];
            if (option) {
               this.callbacks.onClick(option.command);
            }

            this.hide();

            return false;
         },

         show: function(itemNode) {
            if (Popup && itemNode) Popup.show(itemNode);
         },

         hide: function() {
            if (Popup) Popup.hide();
         }
      });

      // external interface:
      this.menuOptions = _logic.menuOptions;
      this.show = _logic.show;
   }
};
