/*
 * ABView
 *
 * An ABView defines a UI display container.
 *
 */

import ABPropertyComponent from "../ABPropertyComponent"
import ABViewManager from "../ABViewManager"


var ABViewPropertyComponentDefaults = {
	label:''
}


var ABViewDefaults = {
	key: 'view',		// {string} unique key for this view
	icon:'truck',		// {string} fa-[icon] reference for this view
	labelKey:'ab.components.view' // {string} the multilingual label key for the class label
}



export default class ABView  {

	/**
	 * @param {obj} values  key=>value hash of ABView values
	 * @param {ABApplication} application the application object this view is under
	 * @param {ABView} parent the ABView this view is a child of. (can be null)
	 * @param {obj} defaultValues special sub class defined default values.
	 */
    constructor(values, application, parent, defaultValues) {

    	this.defaults = defaultValues || ABViewDefaults;

    	this.application = application;

    	
  	// 	{
  	// 		id:'uuid',					// uuid value for this obj
  	// 		key:'viewKey',				// unique key for this View Type
  	// 		icon:'font',				// fa-[icon] reference for an icon for this View Type
  	// 		label:'',					// pulled from translation

	//		settings: {					// unique settings for the type of field
	//		},

	// 		views:[],					// the child views contained by this view.

	//		translations:[]
  	// 	}
  		
  		this.fromValues(values);


    	// label is a multilingual value:
    	OP.Multilingual.translate(this, this, ['label']);


    	this.parent = parent || null;
  	}


  	static common() {
  		return ABViewDefaults;
  	}

  	viewKey() {
  		return this.defaults.key;
  	}


  	viewIcon() {
  		return this.defaults.icon;
  	}


  	/*
  	 * @method isValid
  	 * check the current values to make sure they are valid.
  	 * Here we check the default values provided by ABView.
  	 *
  	 * @return {OP.Validation.validator()}
  	 */
	isValid() {

		var validator = OP.Validation.validator();

		// // labels must be unique among views on the same parent
		var parent = this.parent;
		if (!parent) { parent = this.application; }


		var isNameUnique = (parent.views((v)=>{
			return (v.id != this.id)
					&& (v.label.toLowerCase() == this.label.toLowerCase() );
		}).length == 0);
		if (!isNameUnique) {
			validator.addError('label', L('ab.validation.view.label.unique', '*View label must be unique among peers.'));
		}

		return validator;
	}



	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABApplication
	 *
	 * also remove it from our _AllApplications
	 *
	 * @return {Promise}
	 */
	destroy () {
		return new Promise(
			(resolve, reject) => {

				// verify we have been .save()d before:
				if (this.id) {

					var parent = this.parent;
					if (!parent) parent = this.application;

					parent.viewDestroy(this)
					.then(resolve)
					.catch(reject);

				} else {

					resolve();  // nothing to do really
				}

			}
		)

	}


	/**
	 * @method save()
	 *
	 * persist this instance of ABField with it's parent ABObject
	 *
	 *
	 * @return {Promise}
	 *						.resolve( {this} )
	 */
	save () {
		return new Promise(
			(resolve, reject) => {

				// if this is our initial save()
				if (!this.id) {
					this.id = OP.Util.uuid();	// setup default .id
				}

				// if this is not a child of another view then tell it's
				// application to save this view.
				var parent = this.parent;
				if (!parent) parent = this.application;

				parent.viewSave(this)
				.then(resolve)
				.catch(reject)
			}
		)
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABField instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj () {

		OP.Multilingual.unTranslate(this, this, ['label']);

		// // for each Object: compile to json
		var views = [];
		this._views.forEach((view) => {
			views.push(view.toObj())
		})

		return {
			id : this.id,
			key : this.key,
			icon : this.icon,

// parent: this.parent,

			settings: this.settings || {},
			translations:this.translations || [],
			views:views

		}
	}


	/**
	 * @method fromValues()
	 *
	 * initialze this object with the given set of values.
	 * @param {obj} values
	 */
	fromValues (values) {

 		this.id = values.id;			// NOTE: only exists after .save()
    	this.key = values.key || this.viewKey();
    	this.icon = values.icon || this.viewIcon();

// this.parent = values.parent || null;

		values.settings = values.settings || {};

    	// if this is being instantiated on a read from the Property UI,
    	// .label is coming in under .settings.label
    	this.label = values.label || values.settings.label || '?label?';


    	this.translations = values.translations || [];

    	this.settings = values.settings || {};


    	var views = [];
    	(values.views || []).forEach((child) => {
    		views.push(ABViewManager.newView(child, this.application, this));
    	})
    	this._views = views;

    	// convert from "0" => 0

	}



	isRoot() {
		return this.parent == null;
	}





	///
	/// Views
	///


	/**
	 * @method views()
	 *
	 * return an array of all the ABViews children
	 *
	 * @param {fn} filter  	a filter fn to return a set of ABViews that this fn
	 *						returns true for.
	 * @return {array} 	array of ABViews
	 */
	views (filter) {

		filter = filter || function() {return true; };

		return this._views.filter(filter);

	}



	/**
	 * @method viewDestroy()
	 *
	 * remove the current ABView from our list of ._views.
	 *
	 * @param {ABView} view
	 * @return {Promise}
	 */
	viewDestroy( view ) {

		var remainingViews = this.views(function(v) { return v.id != view.id;})
		this._views = remainingViews;
		return this.save();
	}



	/**
	 * @method viewSave()
	 *
	 * persist the current ABView in our list of ._views.
	 *
	 * @param {ABView} object
	 * @return {Promise}
	 */
	viewSave( view ) {
		var isIncluded = (this.views(function(v){ return v.id == view.id }).length > 0);
		if (!isIncluded) {
			this._views.push(view);
		}

		return this.save();
	}






	//
	//	Editor Related
	//

	mapLabel() {

		var label = '';
		if (!this.isRoot()) {
			if (this.parent) {
				label = this.parent.mapLabel();
				label += ' > ';
			}
		}

		label += this.label;

		return label;
	}


	/** 
	 * @method editorComponent
	 * return the Editor for this UI component.
	 * the editor should display either a "block" view or "preview" of 
	 * the current layout of the view.
	 * @param {string} mode what mode are we in ['block', 'preview']
	 * @return {Component} 
	 */
	editorComponent(App, mode) {

		function L(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		var idBase = 'ABViewEditorComponent';
		var ids = {
			component: App.unique(idBase+'_component'),
			view: App.unique(idBase+'_view')
		}

//// TODO:
// explore activeContent option:
// - forEach child=> add ui.activeContent[child.id] = child.ui
// - template(): <div>{common.[child.id]}</div>


		var _ui = {
			view: 'list',
			drag: true,
			select: false,
			template:function(obj, common) {
				return _logic.template(obj, common);
			},
			on: {
				// onAfterRender: function () {
				// 	self.generateComponentsInList();
				// },
				onBeforeDrop: function (context, ev) {
					return _logic.onBeforeDrop(context,ev);
				},
				onAfterDrop: function (context, ev) {
					// if (context.from.config.id === self.componentIds.componentList) {
					// 	$$(self.componentIds.componentList).showProgress({ type: 'icon' });

					// 	var componentIndexes = [];

					// 	// Sort data
					// 	for (var index = 0; index < $$(self.componentIds.componentList).count(); index++) {
					// 		var comId = $$(self.componentIds.componentList).getIdByIndex(index),
					// 			com = AD.classes.AppBuilder.currApp.currPage.components.filter(function (c) { return c.id == comId });

					// 		if (com && com.length > 0) {
					// 			componentIndexes.push({
					// 				id: com[0].id,
					// 				index: index
					// 			});

					// 		}
					// 	}

					// 	// Call sort components api
					// 	AD.classes.AppBuilder.currApp.currPage.sortComponents(componentIndexes, function (err, result) {
					// 		$$(self.componentIds.componentList).hideProgress();

					// 		if (err) {
					// 			// TODO : show error message
					// 		}
					// 		else {
					// 			self.element.trigger(self.options.sortComponentEvent, {
					// 				page: AD.classes.AppBuilder.currApp.currPage
					// 			});
					// 		}
					// 	});
					// }
				}
			},
			externalData: function (data, id, oldData) {
				return _logic.externalData(data, id, oldData);
			}

		}


		var _init = (options) => {

// this.children = [
// 	{
// 		id:'child1',
// 		icon: 'cube',
// 		label: 'Child 1',
// 		component:function(app) {
// 			return {
// 				ui:{
// 					id:'child1component',
// 					view:'template',
// 					template:'template child 1',
// 					height:20
// 				},
// 				init:function() { console.log('init child 1') }
// 			}
// 		}
// 	},
// 	{
// 		id:'child2',
// 		icon: 'cubes',
// 		label: 'Child 2',
// 		component:function(app) {
// 			return {
// 				ui:{
// 					id:'child2component',
// 					view:'template',
// 					template:'template child 2',
// 					height:20
// 				},
// 				init:function() { console.log('init child 2') }
// 			}
// 		}
// 	}
// ]
			var viewList = this.views();
			if (viewList.length == 0) {
				viewList.push({
					id:'del_me',
					icon:'',
					label:L('drop here', 'drop here'),
					component:function(app) {
						return {
							ui:{
								id:'child2component',
								view:'template',
								template:'drop here',
								height:20
							},
							init:function() { console.log('init child 2') }
						}
					}
				})
			}
			var List = $$(_ui.id);
			List.parse(viewList);

			// in preview mode, have each child render a preview 
			// of their content:
			if (mode == 'preview') {

				var allComponents = [];

				// attach all the .UI views:
				this.views().forEach((child) => {
					var component = child.component(App);
					var id = ids.view + '_' + child.id;
					component.ui.container = id;
					webix.ui(component.ui);
					allComponents.push(component);
				})

				// perform any init setups for the content:
				allComponents.forEach((component) => {
					component.init();
				})
			}

		}


		var _logic = {

			/* 
			 * @method externalData()
			 * this method is called by webix on the context.from.copy() command
			 * in .onBeforeDrop() event.  It is for you to create a new instance
			 * of the item being dropped.
			 */
			externalData:  (data, id, oldData) => {

console.log('externalData', data, id, oldData);

				// if oldData is an instance of our ABView object,
				// then we have already made the instance and should return that:
				if (oldData instanceof ABView) {
					return oldData;
				}


				// otherwise this is our 1st time through:
				// find the key to make a new instance from:
				var key;

				// 1st time through we should have a Class object:
				if (data.common) key = data.common().key;

				// but, if for some reason we have an instance:
				if (data.defaults) key = data.defaults.key;


				// var View = ABViewManager.allViews(function(V){ return V.common().key == key})[0];
				var View = ABViewManager.newView({ key: key }, this.application, this);
console.log('key:',View.defaults.key);
				return View;
			},

			onBeforeDrop: (context, ev) => {

				// if this was dropped from our own list, then skip
				if (context.from.config.id === _ui.id) {
					return true;
				} else {

					for (var i = 0; i < context.source.length; i++) {
						var uid = webix.uid();
						context.from.copy(context.source[i], context.index, $$(_ui.id), uid);

						$$(_ui.id).remove('del_me');
						var newID = $$(_ui.id).getIdByIndex(context.index);
						var droppedViewObj = $$(_ui.id).getItem(newID);
						droppedViewObj.id = null;
						droppedViewObj.save();
console.log(droppedViewObj);
					}
				}

				return false;
			},

			template:function(obj, common) {

				var template;
				if (mode == 'preview'){
					return _template.replace('#objID#', obj.id);
				} else {
					return _templateBlock
						.replace('#objID#', obj.id)
						.replace('#icon#', obj.icon)
						.replace('#label#', obj.label)
				}
			}
		} 


		var _template = [
			'<div class="ab-component-in-page">',
				'<div id="'+ids.view+'_#objID#" ></div>',
				'<div class="">',
					'<i class="fa fa-edit ab-component-edit"></i>',
					'<i class="fa fa-trash ab-component-remove"></i>',
				'</div>',
			'</div>'
		].join('');

		var _templateBlock = [
			'<div class="ab-component-in-page">',
				'<div id="'+ids.view+'_#objID#" >',
					'<i class="fa fa-#icon#"></i>',
					'#label#',
				'</div>',
				'<div class="">',
					'<i class="fa fa-edit ab-component-edit"></i>',
					'<i class="fa fa-trash ab-component-remove"></i>',
				'</div>',
			'</div>'
		].join('');


		return {
			ui:_ui,
			init:_init
		}
	}


	static propertyEditorComponent(App) {
		return ABViewPropertyComponent.component(App);
	}


	static propertyEditorDefaultElements(App, ids, _logic, ObjectDefaults) {

		var _ui = {
			rows: [
				{
					view: "text",
					id: ids.label,
					name:'label',
					label: App.labels.dataFieldHeaderLabel,
					placeholder: App.labels.dataFieldHeaderLabelPlaceholder,
					labelWidth: App.config.labelWidthMedium,
					css: 'ab-new-label-name',
					on: {
						onChange: function (newVal, oldVal) {
							// onChange(newVal, oldVal);
						}
					}
				}
			]
		}

		return _ui;

	}


	static propertyEditorPopulate(ids, view) {

		$$(ids.label).setValue(view.label);

	}


	/*
	 * @method componentList
	 * return the list of components available on this view to display in the editor.
	 */
	componentList() {

		// views not allowed to drop onto this View:
		var viewsToIgnore = [ 'view', 'page' ];

		var allComponents = ABViewManager.allViews();
		var allowedComponents = [];

		allComponents.forEach((c)=>{
			if (viewsToIgnore.indexOf(c.common().key) == -1) {
				allowedComponents.push(c);
			}
		})

allowedComponents.push({
	common:function(){
		return {
			key:'view',
			icon:'cube',
			label: 'ab.test.component.1'
		}
	}
})
allowedComponents.push({
	common:function(){
		return {
			key:'page',
			icon:'cubes',
			label: 'ab.test.component.2'
		}
	}
})
		return allowedComponents;

	}

}





var ABViewPropertyComponent = new ABPropertyComponent({

	editObject: ABView,
	
	fieldDefaults: ABViewDefaults,

	elements:(App, field) => {

		var ids = {
			imageWidth: '',
			imageHeight: ''
		}
		ids = field.idsUnique(ids, App);

		return []
	},

	// defaultValues: the keys must match a .name of your elements to set it's default value.
	defaultValues: ABViewPropertyComponentDefaults,

	// rules: basic form validation rules for webix form entry.
	// the keys must match a .name of your .elements for it to apply
	rules:{
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
	// 		.populate(ids, ABField) : populate the form with your current settings
	// 		.show(ids)   : display the form in the editor
	// 		.values(ids, values) : return the current values from the form
	logic:{

	},

	// perform any additional setup actions here.
	// @param {obj} ids  the hash of id values for all the current form elements.
	//					 it should have your elements + the default Header elements:
	//						.label, .columnName, .fieldDescription, .showIcon
	init:function(ids) {
		// want to hide the description? :
		// $$(ids.fieldDescription).hide();
	}

})

