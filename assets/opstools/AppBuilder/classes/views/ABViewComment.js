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
			this.propertyUpdateFieldOptions(ids, currView, dcId);

		};

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'dataSource',
				view: 'richselect',
				label: L('ab.component.form.dataSource', '*Data Source'),
				labelWidth: App.config.labelWidthLarge
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

		$$(ids.dataSource).setValue(view.settings.dataviewID || ABViewCommentPropertyComponentDefaults.dataviewID);
		$$(ids.columnUser).setValue(view.settings.columnUser || ABViewCommentPropertyComponentDefaults.columnUser);
		$$(ids.columnComment).setValue(view.settings.columnComment || ABViewCommentPropertyComponentDefaults.columnComment);
		$$(ids.height).setValue(view.settings.height || ABViewCommentPropertyComponentDefaults.height);
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataviewID = $$(ids.dataSource).getValue();
		view.settings.columnUser = $$(ids.columnUser).getValue();
		view.settings.columnComment = $$(ids.columnComment).getValue();
		view.settings.height = $$(ids.height).getValue();

		// Retrive the values of your properties from Webix and store them in the view
	}

	static propertyUpdateDataviewOptions(ids, view, dataviewId) {

		// Pull data collections to options
		var dvOptions = view.application.dataviews().map((dv) => {

			return {
				id: dv.id,
				value: dv.label
			};
		});

		dvOptions.unshift({
			id: null,
			value: '[Select]'
		});

		$$(ids.dataSource).define('options', dvOptions);
		$$(ids.dataSource).define('value', dataviewId);
		$$(ids.dataSource).refresh();

	}

	static propertyUpdateUserFieldOptions(ids, view, dvId) {

		var dataview = view.application.dataviews(dv => dv.id == dvId)[0];
		var object = dataview ? dataview.datasource : null;

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

	static propertyUpdateCommentFieldOptions(ids, view, dvId) {

		var dataview = view.application.dataviews(dv => dv.id == dvId)[0];
		var object = dataview ? dataview.datasource : null;

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

		var userList = this.getUserData();
		var userId = this.getCurrentUserId();

		var _ui = {
			id: ids.component,
			view: "comments",
			users: userList,
			currentUser: userId,
			height: this.settings.height,
			on: {
				'onBeforeAdd': function (id, obj, index) {
					_logic.addComment(obj.text);
				}
			}
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
			
			var dv = this.dataview;
			if (!dv) return;

			// bind dc to component
			dv.bind($$(ids.component));
			
			dv.__dataCollection.attachEvent("onAfterLoad", function(){
				_logic.refreshComment();
            });

		}

		var _logic = {
			refreshComment:() => {
				var commentData = this.getCommentData();
                if(commentData) {
                   $$(ids.component).parse(commentData);
                }
			},
			addComment:(commentText) => {
				this.saveData(commentText);
			}
		}

		var onShow = () => {
			var dv = this.dataview;
			if (dv &&
				dv.dataStatus == dv.dataStatusFlag.notInitial) {

				// load data when a widget is showing
				dv.loadData();
			}

			_logic.refreshComment();
			if(!$$(ids.component).hasEvent("onBeforeAdd")) {
				$$(ids.component).attachEvent("onBeforeAdd",function(id, obj, index){
					_logic.addComment(obj.text);
				});
			}
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

	getCommentData() {
		var result = { 
		}
		
		var dv = this.dataview;
		if (!dv) return null;

		var userCol = this.getUserField();
		var commentCol = this.getCommentField();

		if (!commentCol) return result;

		var userColName = userCol.columnName;
		var commentColName = commentCol.columnName;

		var dataObject = dv.getData();
		var dataList = [];

		dataObject.forEach((item, index) => {
			if(item[commentColName] != "") {
				var user = this.getUserData().find(user => { return user.value == item[userColName]});
				var data = { user_id: (user) ? user.id : 0,
							date: new Date(item["created_at"]), 
							text: item[commentColName]};
				dataList.push(data);
			}
		});

		dataList.sort(function(a, b){
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		});

		result.data = dataList;
		return result;
	}

	saveData(commentText) {
		
		var dv = this.dataview;
		if (!dv) return Promise.resolve();

		// get ABObject
		var obj = dv.datasource;
		if (obj == null) return Promise.resolve();

		// get ABModel
		var model = dv.model;
		if (model == null) return Promise.resolve();

		if (commentText == null) return Promise.resolve();

		var comment = {};
		comment[obj.fields((f) => f.id == this.settings.columnUser)[0].columnName] = OP.User.username();
		comment[obj.fields((f) => f.id == this.settings.columnComment)[0].columnName] = commentText; 

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