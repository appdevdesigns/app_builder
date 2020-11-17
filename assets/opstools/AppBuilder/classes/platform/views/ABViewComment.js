const ABViewCommentCore = require("../../core/views/ABViewCommentCore");

const ABViewCommentPropertyComponentDefaults = ABViewCommentCore.defaultValues();

function L(key, altText) {
   return AD.lang.label.getLabel(key) || altText;
}

module.exports = class ABViewComment extends ABViewCommentCore {
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
      var idBase = "ABViewCommentEditorComponent";
      var CommentView = this.component(App, idBase);

      return {
         ui: CommentView.ui,
         init: CommentView.init,
         logic: CommentView.logic,
         onShow: CommentView.onShow
      };
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

      // _logic functions

      _logic.selectSource = (dcId, oldDcId) => {
         var currView = _logic.currentEditObject();

         // Update field options in property
         this.propertyUpdateUserFieldOptions(ids, currView, dcId);
         this.propertyUpdateCommentFieldOptions(ids, currView, dcId);
         this.propertyUpdateDateFieldOptions(ids, currView, dcId);
      };

      // in addition to the common .label  values, we
      // ask for:
      return commonUI.concat([
         {
            name: "dataSource",
            view: "richselect",
            label: L("ab.component.form.dataSource", "*Data Source"),
            labelWidth: App.config.labelWidthLarge,
            on: {
               onChange: _logic.selectSource
            }
         },
         {
            name: "columnUser",
            view: "richselect",
            label: L("ab.component.comment.columnUser", "*Select a user field"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "columnComment",
            view: "richselect",
            label: L(
               "ab.component.comment.columnComment",
               "*Select a comment field"
            ),
            labelWidth: App.config.labelWidthLarge
         },
         {
            name: "columnDate",
            view: "richselect",
            label: L("ab.component.comment.columnDate", "*Select a date field"),
            labelWidth: App.config.labelWidthLarge
         },
         {
            view: "counter",
            name: "height",
            label: L("ab.component.common.height", "*Height:"),
            labelWidth: App.config.labelWidthLarge
         }
      ]);
   }

   static propertyEditorPopulate(App, ids, view) {
      super.propertyEditorPopulate(App, ids, view);

      var datacollectionId = view.settings.dataviewID
         ? view.settings.dataviewID
         : null;

      this.propertyUpdateDatacollectionOptions(ids, view, datacollectionId);
      this.propertyUpdateUserFieldOptions(ids, view, datacollectionId);
      this.propertyUpdateCommentFieldOptions(ids, view, datacollectionId);
      this.propertyUpdateDateFieldOptions(ids, view, datacollectionId);

      $$(ids.dataSource).setValue(
         view.settings.dataviewID ||
            ABViewCommentPropertyComponentDefaults.dataviewID
      );
      $$(ids.columnUser).setValue(
         view.settings.columnUser ||
            ABViewCommentPropertyComponentDefaults.columnUser
      );
      $$(ids.columnComment).setValue(
         view.settings.columnComment ||
            ABViewCommentPropertyComponentDefaults.columnComment
      );
      $$(ids.columnDate).setValue(
         view.settings.columnDate ||
            ABViewCommentPropertyComponentDefaults.columnDate
      );
      $$(ids.height).setValue(
         view.settings.height || ABViewCommentPropertyComponentDefaults.height
      );
   }

   static propertyEditorValues(ids, view) {
      super.propertyEditorValues(ids, view);

      view.settings.dataviewID = $$(ids.dataSource).getValue();
      view.settings.columnUser = $$(ids.columnUser).getValue();
      view.settings.columnComment = $$(ids.columnComment).getValue();
      view.settings.columnDate = $$(ids.columnDate).getValue();
      view.settings.height = $$(ids.height).getValue();

      // Retrive the values of your properties from Webix and store them in the view
   }

   static propertyUpdateDatacollectionOptions(ids, view, dcId) {
      // Pull data collections to options
      var dcOptions = view.propertyDatacollections();
      $$(ids.dataSource).define("options", dcOptions);
      $$(ids.dataSource).define("value", dcId);
      $$(ids.dataSource).refresh();
   }

   static propertyUpdateUserFieldOptions(ids, view, dcId) {
      var datacollection = view.application.datacollections(
         (dc) => dc.id == dcId
      )[0];
      var object = datacollection ? datacollection.datasource : null;

      // Pull field list
      var fieldOptions = [];
      if (object != null) {
         fieldOptions = object
            .fields((f) => f.key == "user")
            .map((f) => {
               return {
                  id: f.id,
                  value: f.label
               };
            });
      }
      // Add a default option
      var defaultOption = { id: null, value: "[Select]" };
      fieldOptions.unshift(defaultOption);

      $$(ids.columnUser).define("options", fieldOptions);
      $$(ids.columnUser).refresh();
   }

   static propertyUpdateCommentFieldOptions(ids, view, dcId) {
      var datacollection = view.application.datacollections(
         (dc) => dc.id == dcId
      )[0];
      var object = datacollection ? datacollection.datasource : null;

      // Pull field list
      var fieldOptions = [];
      if (object != null) {
         fieldOptions = object
            .fields((f) => f.key == "string" || f.key == "LongText")
            .map((f) => {
               return {
                  id: f.id,
                  value: f.label
               };
            });
      }
      // Add a default option
      var defaultOption = { id: null, value: "[Select]" };
      fieldOptions.unshift(defaultOption);

      $$(ids.columnComment).define("options", fieldOptions);
      $$(ids.columnComment).refresh();
   }

   static propertyUpdateDateFieldOptions(ids, view, dcId) {
      var datacollection = view.application.datacollections(
         (dc) => dc.id == dcId
      )[0];
      var object = datacollection ? datacollection.datasource : null;

      // Pull field list
      var fieldOptions = [];
      if (object != null) {
         fieldOptions = object
            .fields((f) => f.key == "date")
            .map((f) => {
               return {
                  id: f.id,
                  value: f.label
               };
            });
      }
      // Add a default option
      var defaultOption = { id: null, value: "[Select]" };
      fieldOptions.unshift(defaultOption);

      $$(ids.columnDate).define("options", fieldOptions);
      $$(ids.columnDate).refresh();
   }

   /*
    * @component()
    * return a UI component based upon this view.
    * @param {obj} App
    * @return {obj} UI component
    */
   component(App) {
      var idBase = "ABViewComment_" + this.id;
      var ids = {
         component: App.unique(idBase + "_component")
      };

      let base = super.component(App);

      var userList = this.getUserData();
      var userId = this.getCurrentUserId();

      var _ui = {
         id: ids.component,
         view: "comments",
         users: userList,
         currentUser: userId,
         height: this.settings.height,
         on: {
            onBeforeAdd: function(id, obj, index) {
               _logic.addComment(obj.text, new Date());
            },
            // NOTE: no update event of comment widget !!
            // Updating event handles in .init function
            // https://docs.webix.com/api__ui.comments_onbeforeeditstart_event.html#comment-4509366150

            // onAfterEditStart: function (rowId) {
            // 	let item = this.getItem(rowId);

            // 	_logic.updateComment(rowId, item);
            // },
            onAfterDelete: function(rowId) {
               _logic.deleteComment(rowId);
            }
         }
      };

      // make sure each of our child views get .init() called
      var _init = (options) => {
         this.__dvEvents = this.__dvEvents || {};

         let $comment = $$(ids.component);
         if ($comment) {
            let $commentList = $comment.queryView({ view: "list" });
            if ($commentList) {
               // Updating comment event
               if (!this.__dvEvents.onStoreUpdated)
                  this.__dvEvents.onStoreUpdated = $commentList.data.attachEvent(
                     "onStoreUpdated",
                     (rowId, data, operate) => {
                        if (operate == "update") {
                           _logic.updateComment(rowId, (data || {}).text);
                        }
                     }
                  );

               // Implement progress bar
               webix.extend($commentList, webix.ProgressBar);
            }
         }

         var dv = this.datacollection;
         if (!dv) return;

         // bind dc to component
         // dv.bind($$(ids.component));

         if (!this.__dvEvents.create)
            this.__dvEvents.create = dv.on("create", () =>
               _logic.refreshComment()
            );

         if (!this.__dvEvents.update)
            this.__dvEvents.update = dv.on("update", () =>
               _logic.refreshComment()
            );

         if (!this.__dvEvents.delete)
            this.__dvEvents.delete = dv.on("delete", () =>
               _logic.refreshComment()
            );

         if (!this.__dvEvents.loadData)
            this.__dvEvents.loadData = dv.on("loadData", () =>
               _logic.refreshComment()
            );
      };

      var _logic = {
         getCommentData: () => {
            let dv = this.datacollection;
            if (!dv) return null;

            let userCol = this.getUserField();
            let commentCol = this.getCommentField();
            let dateCol = this.getDateField();

            if (!userCol || !commentCol) return null;

            let userColName = userCol.columnName;
            let commentColName = commentCol.columnName;
            let dateColName = dateCol ? dateCol.columnName : null;

            let dataObject = dv.getData();
            let dataList = [];

            dataObject.forEach((item, index) => {
               if (item[commentColName]) {
                  var user = this.getUserData().find((user) => {
                     return user.value == item[userColName];
                  });
                  var data = {
                     id: item.id,
                     user_id: user ? user.id : 0,
                     date: item[dateColName]
                        ? new Date(item[dateColName])
                        : null,
                     default_date: new Date(item["created_at"]),
                     text: item[commentColName]
                  };

                  dataList.push(data);
               }
            });

            dataList.sort(function(a, b) {
               if (dateColName) {
                  return (
                     new Date(a.date).getTime() - new Date(b.date).getTime()
                  );
               } else {
                  return (
                     new Date(a.default_date).getTime() -
                     new Date(b.default_date).getTime()
                  );
               }
            });

            return {
               data: dataList
            };
         },
         refreshComment: () => {
            if (this.__refreshTimeout) clearTimeout(this.__refreshTimeout);

            _logic.busy();

            this.__refreshTimeout = setTimeout(() => {
               let $comment = $$(ids.component);
               if (!$comment) return;

               // clear comments
               let $commentList = $comment.queryView({ view: "list" });
               if ($commentList) $commentList.clearAll();

               // populate comments
               let commentData = _logic.getCommentData();
               if (commentData) {
                  $$(ids.component).parse(commentData);
               }

               // scroll to the last item
               if ($commentList)
                  $commentList.scrollTo(0, Number.MAX_SAFE_INTEGER);

               delete this.__refreshTimeout;

               _logic.ready();
            }, 90);
         },
         addComment: (commentText, dateTime) => {
            this.saveData(commentText, dateTime);
         },
         updateComment: (rowId, commentText) => {
            let model = this.model();
            if (!model) return Promise.resolve();

            let commentField = this.getCommentField();
            if (!commentField) return Promise.resolve();

            let values = {};
            values[commentField.columnName] = commentText || "";

            return model.update(rowId, values);
         },
         deleteComment: (rowId) => {
            let model = this.model();
            if (!model) return;

            return model.delete(rowId);
         },
         busy: () => {
            let $comment = $$(ids.component);
            if (!$comment) return;

            let $commentList = $comment.queryView({ view: "list" });
            if (!$commentList) return;

            $commentList.disable();

            if ($commentList.showProgress)
               $commentList.showProgress({ type: "icon" });
         },
         ready: () => {
            let $comment = $$(ids.component);
            if (!$comment) return;

            let $commentList = $comment.queryView({ view: "list" });
            if (!$commentList) return;

            $commentList.enable();

            if ($commentList.hideProgress) $commentList.hideProgress();
         }
      };

      var onShow = () => {
         base.onShow();

         _logic.refreshComment();
      };

      return {
         ui: _ui,
         init: _init,
         logic: _logic,
         onShow: onShow
      };
   }

   getUsers() {
      return OP.User.userlist().map((u) => {
         var result = {
            id: u.username,
            image: u.image_id
         };

         result.value = u.username;

         return result;
      });
   }

   getCurrentUserId() {
      var userObject = this.getUsers();
      var currentUser = OP.User.username();
      //Anonymous User = 0
      var currentUserId = 0;

      if (!userObject) return;

      userObject.forEach((item, index) => {
         if (item.value == currentUser) {
            currentUserId = index + 1;
         }
      });
      return currentUserId;
   }
};
