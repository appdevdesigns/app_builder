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
	dataSource: null,
	columnUser: null,
	columnComment: null,
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
		this.settings.dataSource = this.settings.dataSource || ABViewCommentPropertyComponentDefaults.dataSource;

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
		var ids = {
			component: App.unique(idBase + '_component')
		}

		var component = this.component(App);
		var _ui = component.ui;
		_ui.id = ids.component;

		var _init = (options) => {

			if(this.settings.dataSource) {
				let dc = this.dataCollection; // get from a function or a (get) property

                dc.__dataCollection.attachEvent("onAfterLoad", function(){
					_logic.refreshComment();
                });

				if (dc &&
					dc.dataStatus == dc.dataStatusFlag.notInitial) {
	
					// load data when a widget is showing
					dc.loadData();
	
				}
			}
			
		}

		var _logic = {
			refreshComment:() => {
				var commentData = this.getCommentData();
                if(commentData.data) {
                   $$(ids.component).parse(commentData);
                }
			}
		} 

		var onShow = () => {
			
			var commentData = this.getCommentData();
			if(commentData.data) {
				$$(ids.component).parse(commentData);
			}
			
			$$(ids.component).attachEvent("onBeforeAdd",function(id, obj, index){
				var comment = obj.text;
			});
		}
		return {
			ui:_ui,
			init:_init,
			logic:_logic,

			onShow: onShow
		}
	}

	//
	// Property Editor
	// 

	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var commonUI = super.propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults);

		// in addition to the common .label  values, we 
		// ask for:
		return commonUI.concat([
			{
				name: 'dataSource',
				view: 'richselect',
				label: L('ab.component.comment.dataSource', '*Data Source'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'columnUser',
				view: 'richselect',
				label: L('ab.component.comment.columnUser', '*User Column'),
				labelWidth: App.config.labelWidthLarge
			},
			{
				name: 'columnComment',
				view: 'richselect',
				label: L('ab.component.comment.columnComment', '*Comment Column'),
				labelWidth: App.config.labelWidthLarge
			},
		]);

	}

	static propertyEditorPopulate(App, ids, view) {

		super.propertyEditorPopulate(App, ids, view);

		this.populateDataCollection(ids, view);
		this.populateFieldOptions(ids, view);

		$$(ids.dataSource).setValue(view.settings.dataSource || ABViewCommentPropertyComponentDefaults.dataSource);
		$$(ids.columnUser).setValue(view.settings.columnUser || ABViewCommentPropertyComponentDefaults.columnUser);
		$$(ids.columnComment).setValue(view.settings.columnComment || ABViewCommentPropertyComponentDefaults.columnComment);

		// Make sure you set the values for this property editor in Webix
	}


	static propertyEditorValues(ids, view) {

		super.propertyEditorValues(ids, view);

		view.settings.dataSource = $$(ids.dataSource).getValue();
		view.settings.columnUser = $$(ids.columnUser).getValue();
		view.settings.columnComment = $$(ids.columnComment).getValue();

		this.populateFieldOptions(ids, view);

		// Retrive the values of your properties from Webix and store them in the view
	}

	static populateDataCollection(ids, view) {

		// Set the objects you can choose from in the list
		var objectOptions = view.pageRoot().dataCollections().map((dc) => {
			return {
				id: dc.id,
				value: dc.label
			};
		});

		// Add a default option
		var defaultOption = { id: '', value: L('ab.component.label.selectObject', '*Select an object') };
		objectOptions.unshift(defaultOption);

		$$(ids.dataSource).define("options", objectOptions);
		$$(ids.dataSource).refresh();

	}

	static populateFieldOptions(ids, view) {

		// clear options
		$$(ids.columnUser).define("options", []);
		$$(ids.columnUser).refresh();

		$$(ids.columnComment).define("options", []);
		$$(ids.columnComment).refresh();

		var dc = view.dataCollection;
		if (dc == null) return;

		var obj = dc.datasource;
		if (obj == null) return;

		var userFields = obj.fields((f) => f.key == 'user');
		var textFields = obj.fields((f) => f.key == 'string' || f.key == 'LongText');


		var convertOption = (opt) => {
			return {
				id: opt.id,
				value: opt.columnName,
				key: opt.key
			}
		};

		var userFieldsOptions = userFields.map(convertOption);
		var textFieldsOptions = textFields.map(convertOption);

		var defaultOption = { id: '', value: L('ab.component.label.selectColumn', '*Select a column'), key: '' };
		userFieldsOptions.unshift(defaultOption);
		textFieldsOptions.unshift(defaultOption);

		$$(ids.columnUser).define("options", userFieldsOptions);
		$$(ids.columnUser).refresh();
		$$(ids.columnUser).enable();

		$$(ids.columnComment).define("options", textFieldsOptions);
		$$(ids.columnComment).refresh();
		$$(ids.columnComment).enable();

	}

	/*
	 * @component()
	 * return a UI component based upon this view.
	 * @param {obj} App 
	 * @return {obj} UI component
	 */
	component(App) {

		// get a UI component for each of our child views
		var viewComponents = [];
		this.views().forEach((v)=>{
			viewComponents.push(v.component(App));
		})

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
			on: {
				'onBeforeAdd': function (id, obj, index) {
					_logic.addComment(obj.text);
				}
			}
		};

		// make sure each of our child views get .init() called
		var _init = (options) => {
			
			if(this.settings.dataSource) {

				let dc = this.dataCollection; // get from a function or a (get) property

                dc.__dataCollection.attachEvent("onAfterLoad", function(){
					_logic.refreshComment();
                });

				if (dc &&
					dc.dataStatus == dc.dataStatusFlag.notInitial) {
	
					// load data when a widget is showing
					dc.loadData();
	
				}
			}
		}

		var _logic = {
			refreshComment:() => {
				var commentData = this.getCommentData();
                if(commentData.data) {
                   $$(ids.component).parse(commentData);
                }
			},
			addComment:(commentText) => {
				this.saveData(commentText);
			}
		}

		var onShow = () => {

			var commentData = this.getCommentData();
			if(commentData.data) {
				$$(ids.component).parse(commentData);
			}

			$$(ids.component).attachEvent("onBeforeAdd",function(id, obj, index){
				_logic.addComment(obj.text);
			});
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

	/**
	 * @property dataCollection
	 * return ABViewDataCollection of this form
	 * 
	 * @return {ABViewDataCollection}
	 */
	get dataCollection() {
		return this.pageRoot().dataCollections((dc) => dc.id == this.settings.dataSource)[0];
	}

	getUserField() {
		var dc = this.dataCollection;
		if (!dc) return null;

		var obj = dc.datasource;
		if (!obj) return null;
		
		return obj.fields((f) => f.id == this.settings.columnUser)[0]
	}

	getCommentField() {
		var dc = this.dataCollection;
		if (!dc) return null;

		var obj = dc.datasource;
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

		var dc = this.dataCollection;
		if (dc == null) return result;

		var userCol = this.getUserField();
		var commentCol = this.getCommentField();

		if (!commentCol) return result;

		var userColName = userCol.columnName;
		var commentColName = commentCol.columnName;

		var dataObject = dc.getData();
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
		
		// get ABViewDataCollection
		var dc = this.dataCollection;
		if (dc == null) return Promise.resolve();

		// get ABObject
		var obj = dc.datasource;
		if (obj == null) return Promise.resolve();

		// get ABModel
		var model = dc.model;
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