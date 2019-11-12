/*
 * ABViewComment
 *
 * An ABViewComment defines a Comment view type.
 *
 */

import ABViewWidget from "./ABViewWidget"
import ABPropertyComponent from "../ABPropertyComponent"

function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

var ABViewCommentPropertyComponentDefaults = {
	dataviewID: null,
	columnUser: null,
	columnComment: null,
	columnDate: null,
	height: 300,
	label: '',	// label is required and you can add more if the component needs them
	// format:0  	// 0 - normal, 1 - title, 2 - description
}

var ABViewDefaults = {
	key: 'comment',		// {string} unique key for this view
	icon: 'comments',		// {string} fa-[icon] reference for this view
	labelKey: 'ab.components.comment' // {string} the multilingual label key for the class label
}

export default class ABViewComment extends ABViewWidget  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 */
    constructor(values, application, parent) {

    	super( values, application, parent, ABViewDefaults );

    	// OP.Multilingual.translate(this, this, ['text']);

  	}

  	static common() {
  		return ABViewDefaults;
  	}

	///
	/// Instance Methods
	///

	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABViewLabel instance
	 * into the values needed for saving.
	 *
	 * @return {json}
	 */
	toObj () {

		// OP.Multilingual.unTranslate(this, this, ['label', 'text']);

		var obj = super.toObj();

		return obj;
	}

	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

		super.fromValues(values);

    	// if this is being instantiated on a read from the Property UI,
    	// .text is coming in under .settings.label
    	// this.text = values.text || values.settings.text || '*text';

    	// this.settings.format = this.settings.format || ABViewLabelPropertyComponentDefaults.format;

    	// we are not allowed to have sub views:
    	// this._views = [];

    	// convert from "0" => 0
    	// this.settings.format = parseInt(this.settings.format);
    	// if this is being instantiated on a read from the Property UI,
		this.settings.height = parseInt(this.settings.height || 0);

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

		var idBase = 'ABViewCommentEditorComponent';
		var CommentView = this.component(App, idBase);

		return {
			ui: CommentView.ui,
			init: CommentView.init,
			logic: CommentView.logic,
			onShow: CommentView.onShow,
		}
	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// _logic functions

		_logic.selectSource = (dcId, oldDcId) => {

			var currView = _logic.currentEditObject();

			// Update field options in property
			this.propertyUpdateUserFieldOptions(ids, currView, dcId);
			this.propertyUpdateCommentFieldOptions(ids, currView, dcId);
			this.propertyUpdateDateFieldOptions(ids, currView, dcId)

		};

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'dataSource',
				view: 'richselect',
				label: L('ab.component.form.dataSource', '*Data Source'),
				labelWidth: App.config.labelWidthLarge,
				on: {
					onChange: _logic.selectSource
				}
			},
			{
				name: 'columnUser',
				view: 'richselect',
				label: L('ab.component.comment.columnUser', '*Select a user field'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'columnComment',
				view: 'richselect',
				label: L('ab.component.comment.columnComment', '*Select a comment field'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'columnDate',
				view: 'richselect',
				label: L('ab.component.comment.columnDate', '*Select a date field'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				view: 'counter',
				name: "height",
				label: L("ab.component.common.height", "*Height:"),
				labelWidth: App.config.labelWidthLarge,
			}
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);
		
		var dataviewId = (view.settings.dataviewID ? view.settings.dataviewID : null);

		this.propertyUpdateDataviewOptions(ids, view, dataviewId);
		this.propertyUpdateUserFieldOptions(ids, view, dataviewId);
		this.propertyUpdateCommentFieldOptions(ids, view, dataviewId);
		this.propertyUpdateDateFieldOptions(ids, view, dataviewId)

		$$(ids.dataSource).setValue(view.settings.dataviewID || ABViewCommentPropertyComponentDefaults.dataviewID);
		$$(ids.columnUser).setValue(view.settings.columnUser || ABViewCommentPropertyComponentDefaults.columnUser);
		$$(ids.columnComment).setValue(view.settings.columnComment || ABViewCommentPropertyComponentDefaults.columnComment);
		$$(ids.columnDate).setValue(view.settings.columnDate || ABViewCommentPropertyComponentDefaults.columnDate);
		$$(ids.height).setValue(view.settings.height || ABViewCommentPropertyComponentDefaults.height);
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

	static propertyUpdateDataviewOptions(ids, view, dcId) {

		// Pull data collections to options
		var dcOptions = view.application.datacollections().map((dc) => {

			return {
				id: dc.id,
				value: dc.label
			};
		});

		dcOptions.unshift({
			id: null,
			value: '[Select]'
		});

		$$(ids.dataSource).define('options', dcOptions);
		$$(ids.dataSource).define('value', dcId);
		$$(ids.dataSource).refresh();

	}

	static propertyUpdateUserFieldOptions(ids, view, dcId) {

		var datacollection = view.application.datacollections(dc => dc.id == dcId)[0];
		var object = datacollection ? datacollection.datasource : null;

		// Pull field list
		var fieldOptions = [];
		if (object != null) {

			fieldOptions = object.fields((f) => f.key == 'user').map(f => {

				return {
					id: f.id,
					value: f.label
				};

			});
		}
		// Add a default option
		var defaultOption = { id: null, value: '[Select]' };
		fieldOptions.unshift(defaultOption);
		
		$$(ids.columnUser).define("options", fieldOptions);
		$$(ids.columnUser).refresh();

	}

	static propertyUpdateCommentFieldOptions(ids, view, dcId) {

		var datacollection = view.application.datacollections(dc => dc.id == dcId)[0];
		var object = datacollection ? datacollection.datasource : null;

		// Pull field list
		var fieldOptions = [];
		if (object != null) {

			fieldOptions = object.fields((f) => f.key == 'string' || f.key == 'LongText').map(f => {

				return {
					id: f.id,
					value: f.label
				};

			});
		}
		// Add a default option
		var defaultOption = { id: null, value: '[Select]' };
		fieldOptions.unshift(defaultOption);
		
		$$(ids.columnComment).define("options", fieldOptions);
		$$(ids.columnComment).refresh();

	}

	static propertyUpdateDateFieldOptions(ids, view, dcId) {

		var datacollection = view.application.datacollections(dc => dc.id == dcId)[0];
		var object = datacollection ? datacollection.datasource : null;

		// Pull field list
		var fieldOptions = [];
		if (object != null) {

			fieldOptions = object.fields((f) => f.key == 'date').map(f => {

				return {
					id: f.id,
					value: f.label
				};

			});
		}
		// Add a default option
		var defaultOption = { id: null, value: '[Select]' };
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

		var idBase = 'ABViewComment_'+this.id;
		var ids = {
			component: App.unique(idBase+'_component'),
		}

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
				onBeforeAdd: function (id, obj, index) {
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
						this.__dvEvents.onStoreUpdated = $commentList.data.attachEvent("onStoreUpdated", (rowId, data, operate) => {

							if (operate == "update") {
								_logic.updateComment(rowId, (data || {}).text);
							}

						});
	
					// Implement progress bar
					webix.extend($commentList, webix.ProgressBar);
				}
			}

			var dv = this.dataview;
			if (!dv) return;

			// bind dc to component
			// dv.bind($$(ids.component));

			if (!this.__dvEvents.create) 
				this.__dvEvents.create = dv.on('create', () => _logic.refreshComment());
			
			if (!this.__dvEvents.update) 
				this.__dvEvents.update = dv.on('update', () => _logic.refreshComment());

			if (!this.__dvEvents.delete)
				this.__dvEvents.delete = dv.on('delete', () => _logic.refreshComment());

			if (!this.__dvEvents.loadData)
				this.__dvEvents.loadData = dv.on('loadData', () => _logic.refreshComment());

		}

		var _logic = {

			getCommentData: () => {

				let dv = this.dataview;
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

					if(item[commentColName]) {

						var user = this.getUserData().find(user => { return user.value == item[userColName]});
						var data = {
							id: item.id,
							user_id: (user) ? user.id : 0,
							date: item[dateColName] ? new Date(item[dateColName]) : null,
							default_date: new Date(item["created_at"]),
							text: item[commentColName]
						};

						dataList.push(data);

					}
				});

				dataList.sort(function(a, b){
					if(dateColName) {
						return new Date(a.date).getTime() - new Date(b.date).getTime();
					}
					else {
						return new Date(a.default_date).getTime() - new Date(b.default_date).getTime();
					}
				});

				return {
					data: dataList
				};
			},
			refreshComment:() => {

				if (this.__refreshTimeout)
					clearTimeout(this.__refreshTimeout);

				_logic.busy();

				this.__refreshTimeout = setTimeout(() => {

					let $comment = $$(ids.component);
					if (!$comment) return;

					// clear comments
					let $commentList = $comment.queryView({ view: "list" });
					if ($commentList)
						$commentList.clearAll();

					// populate comments
					let commentData = _logic.getCommentData();
	                if(commentData) {
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
				if (!model)
					return Promise.resolve();

				let commentField = this.getCommentField();
				if (!commentField)
					return Promise.resolve();

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

				if ($commentList.hideProgress)
					$commentList.hideProgress();

			}
		}

		var onShow = () => {

			base.onShow();

			_logic.refreshComment();
		}

		return {
			ui:_ui,
			init:_init,
			logic:_logic,
			onShow: onShow
		}
	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {
		return [];
	}

	getUserField() {
		var dv = this.dataview;
		if (!dv) return null;

		var obj = dv.datasource;
		if (!obj) return null;
		
		return obj.fields((f) => f.id == this.settings.columnUser)[0]
	}

	getCommentField() {

		var dv = this.dataview;
		if (!dv) return null;

		var obj = dv.datasource;
		if (!obj) return null;
		
		return obj.fields((f) => f.id == this.settings.columnComment)[0]
	}

	getDateField() {

		var dv = this.dataview;
		if (!dv) return null;

		var obj = dv.datasource;
		if (!obj) return null;
		
		return obj.fields((f) => f.id == this.settings.columnDate)[0]
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

		if(!userObject) return;

		userObject.forEach((item, index) => {
			if(item.value == currentUser) {
				currentUserId = index+1;
			}
		});
		return currentUserId;
	}

	getUserData() {
		var userObject = this.getUsers();
		var userList = []

		if(!userObject) return;

		userObject.forEach((item, index) => {
			var imageURL = "";
			if (item.image) {
				imageURL = "/opsportal/image/UserProfile/" + item.image;
			}
			var user = { id: index+1, value: item.value, image: imageURL };
			userList.push(user);
		});
		return userList;
	}
	
	model() {

		let dv = this.dataview;
		if (!dv) return null;

		// get ABObject
		let obj = dv.datasource;
		if (obj == null) return null;

		// get ABModel
		let model = dv.model;
		if (model == null) return null;

		return model;

	}

	saveData(commentText, dateTime) {

		if (commentText == null ||
			commentText == "") 
			return Promise.resolve();

		let dv = this.dataview;
		if (!dv) return null;

		let model = this.model();
		if (model == null) return Promise.resolve();

		let comment = {};

		let userField = this.getUserField();
		if (userField)
			comment[userField.columnName] = OP.User.username();

		let commentField = this.getCommentField();
		if (commentField)
			comment[commentField.columnName] = commentText;

		let dateField = this.getDateField();
		if (dateField)
			comment[dateField.columnName] = dateTime;

		// add parent cursor to default
		let dvLink = dv.dataviewLink;
		if (dvLink &&
			dvLink.getCursor()) {

			let objectLink = dvLink.datasource;
			let fieldLink = dv.fieldLink;

			if (objectLink && 
				fieldLink) {
				comment[fieldLink.columnName] = {};
				comment[fieldLink.columnName][objectLink.PK()] = dvLink.getCursor().id;
			}
		}

		return new Promise(
			(resolve, reject) => {
				model.create(comment)
				.catch((err) => {
					reject(err);
				})
				.then(() => {
					resolve();
				});
			}
		);
	}
}