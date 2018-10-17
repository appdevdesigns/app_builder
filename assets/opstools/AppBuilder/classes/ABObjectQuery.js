//
// ABObjectQuery
//
// A type of Object in our system that is based upon a complex relationship of multiple 
// existing Objects.  
//
// In the QueryBuilder section of App Builder, a new Query Object can be created.
// An initial Object can be chosen from our current list of Objects. After that, additional Objects
// and a specified join type can be specified.
//
// A list of fields from each specified Object can also be included as the data to be returned.
//
// A where statement is also part of the definition.
// 

import ABObject from "./ABObject"



function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}

export default class ABObjectQuery extends ABObject {

    constructor(attributes, application) {
    	super(attributes, application);
/*
{
	id: uuid(),
	name: 'name',
	labelFormat: 'xxxxx',
	isImported: 1/0,
	urlPath:'string',
	importFromObject: 'string', // JSON Schema style reference:  '#[ABApplication.id]/objects/[ABObject.id]'
								// to get other object:  ABApplication.objectFromRef(obj.importFromObject);
	translations:[
		{}
	],



	// ABOBjectQuery Specific Changes

	// we store a list of fields by their urls:
	fields:[
		{ 
			fieldURL:'#/url/to/field',
		}
	],


	// we store a list of joins:
	joins: [
		{
			objectURL:"#/...",					// the base object of the join
			fieldID:'adf3we666r77ewsfe',		// the connection field of the object we are joining with.
			type:[left, right, inner, outer]    // join type: these should match the names of the knex methods
					=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin


// maybe we'll implement this in the future:
// this can allow us to specify complex join conditions:
// on: { }
			on: { fieldAID: '', op:'=', fieldBID:''} //fieldBID: the field in the connected 

		}
	],


	where: { QBWhere }
}
*/


		// import all our ABObjects 
		this.importJoins(attributes.joins || []);
		this.importFields(attributes.fields || []); // import after joins are imported
		// this.where = attributes.where || {}; // .workspaceFilterConditions

  	}



  	///
  	/// Static Methods
  	///
  	/// Available to the Class level object.  These methods are not dependent
  	/// on the instance values of the Application.
  	///





	///
	/// Instance Methods
	///


	/// ABApplication data methods


	/**
	 * @method destroy()
	 *
	 * destroy the current instance of ABObjectQuery
	 *
	 * also remove it from our parent application
	 *
	 * @return {Promise}
	 */
	destroy () {
		return this.application.queryDestroy(this);
	}


	/**
	 * @method save()
	 *
	 * persist this instance of ABObjectQuery with it's parent ABApplication
	 *
	 * @return {Promise}
	 *						.resolve( {this} )
	 */
	save () {

		var isAdd = false;

		// if this is our initial save()
		if (!this.id) {

			this.id = OP.Util.uuid();	// setup default .id
			this.label = this.label || this.name;
			this.urlPath = this.urlPath || this.application.name + '/' + this.name;
			isAdd = true;
		}

		return this.application.querySave(this);
	}


	/**
	 * @method toObj()
	 *
	 * properly compile the current state of this ABObjectQuery instance
	 * into the values needed for saving to the DB.
	 *
	 * @return {json}
	 */
	toObj () {


		var settings = super.toObj();

		/// include our additional objects and where settings:

		settings.joins = this.exportJoins();  //objects;
		// settings.where  = this.where; // .workspaceFilterConditions


		return settings;
	}


	// /**
	//  * @method multilingualFields()
	//  *
	//  * return an array of columnnames that are multilingual.
	//  *
	//  * @return {array}
	//  */
	// multilingualFields() {
	// 	var fields = [];

	// 	var found = this.fields(function(f){ return f.isMultilingual; });
	// 	found.forEach((f)=>{

	// 		var format = "{objectName}.{columnName}"
	// 						.replace('{objectName}', f.object.name)
	// 						.replace('{columnName}', f.columnName);

	// 		fields.push(format);
	// 	})

	// 	return fields;
	// }





	///
	/// DB Migrations
	///

	/**
	 * @method migrateCreate
	 * A Query Object doesn't do anything on a migrateCreate() request.
	 * override these in case they are called for some reason.
	 */
	migrateCreate() {
		return new Promise(
			(resolve, reject) => {
				resolve();
			}
		);
	}


	/**
	 * @method migrateDrop
	 * A Query Object doesn't do anything on a migrateDrop() request.
	 * override these in case they are called for some reason.
	 */
	migrateDrop() {
		return new Promise(
			(resolve, reject) => {
				resolve();
			}
		);
	}


	///
	/// Fields
	///




	/**
	 * @method importFields
	 * instantiate a set of fields from the given attributes.
	 * Our attributes are a set of field URLs That should already be created in their respective
	 * ABObjects.
	 * @param {array} fieldSettings The different field urls for each field
	 *					{ }
	 */
	importFields(fieldSettings) {
		var newFields = [];
	  	(fieldSettings || []).forEach((fieldInfo) => {

			var field = this.application.urlResolve(fieldInfo.fieldURL);

			// should be a field of base/join objects
			if (field && this.canFilterField(field) &&
				// check duplicate
				newFields.filter(f => f.urlPointer() == fieldInfo.fieldURL).length < 1) { 

				newFields.push( field );
			}

		})
	  	this._fields = newFields;
	}


	/**
	 * @method exportFields
	 * convert our array of fields into a settings object for saving to disk.
	 * @return {array}
	 */
	exportFields() {
		var currFields = [];
		this._fields.forEach((field) => {
			currFields.push( { fieldURL: field.urlPointer() })
		})
		return currFields;
	}


	/**
	 * @method fields()
	 *
	 * return an array of all the ABFields for this ABObject.
	 *
	 * @return {array}
	 */
	fields (filter) {

		var fields = _.cloneDeep(super.fields(filter));

		return fields.map(f => {

			// include object name {objectName}.{columnName}
			// to use it in grid headers & hidden fields
			f.columnName = '{objectName}.{columnName}'
							.replace('{objectName}', f.object.name)
							.replace('{columnName}', f.columnName);

			return f;
		});

	}




	///
	/// Joins & Objects
	///


	/**
	 * @method joins()
	 *
	 * return an array of all the ABObjects for this Query.
	 *
	 * @return {array}
	 */
	joins (filter) {

		filter = filter || function(){ return true; };

		return (this._joins || []).filter(filter);
	}


	/**
	 * @method objects()
	 *
	 * return an array of all the ABObjects for this Query.
	 *
	 * @return {array}
	 */
	objects (filter) {

		filter = filter || function(){ return true; };

		return (this._objects || []).filter(filter);
	}


	/**
	 * @method objectBase
	 * return the origin object
	 * 
	 * @return {ABObject}
	 */
	objectBase () {

		return this.objects()[0];

	}


	/**
	 * @method importJoins
	 * instantiate a set of joins from the given attributes.
	 * Our joins contain a set of ABObject URLs that should already be created in our Application.
	 * @param {array} settings The different field urls for each field
	 *					{ }
	 */
	importJoins(settings) {
		var newJoins = [];
		var newObjects = [];
		function storeSingle(object) {
			var inThere = newObjects.filter((o)=>{ return o.id == object.id}).length > 0;
			if (!inThere) {
				newObjects.push(object);
			}
		}
	  	settings.forEach((join) => {

	  		// Convert our saved settings:
	  		// 		{
			// 			objectURL:"#/...",
			// 			fieldID:'adf3we666r77ewsfe',
			// 			type:[left, right, inner, outer]  // these should match the names of the knex methods
			// 					=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
			// 		}

			// track our base object
			var object = this.application.urlResolve(join.objectURL);
			if (!object) {

				// flag this query is disabled
				this.disabled = true;
				return;
			}

			storeSingle(object);

	  		// track our linked object
			var linkField = object.fields((f)=>{ return f.id == join.fieldID; })[0];
			if (linkField) {
				var linkObject = linkField.datasourceLink;
				storeSingle(linkObject);
			}


	  		newJoins.push( join );
	  	})
	  	this._joins = newJoins;
	  	this._objects = newObjects;
	}


	/**
	 * @method exportObjects
	 * save our list of objects into our format for persisting on the server
	 * @param {array} settings 
	 */
	exportJoins() {

		var joins = [];
		this._joins.forEach((join)=>{
			joins.push(join);
		})
		return joins;
	}



	///
	/// Working with Client Components:
	///


	/**
	 * @method canFilterObject
	 * evaluate the provided object to see if it can directly be filtered by this
	 * query.
	 * @param {ABObject} object
	 * @return {bool} 
	 */
	canFilterObject(object) {

		if (!object) return false;

		// I can filter this object if it is one of the objects in my joins
		return this.objects((o)=>{ return o.id == object.id; }).length > 0;

	}

	/**
	 * @method canFilterField
	 * evaluate the provided field to see if it can be filtered by this
	 * query.
	 * @param {ABObject} object
	 * @return {bool} 
	 */
	canFilterField(field) {

		if (!field) return false;

		// I can filter a field if it's object OR the object it links to can be filtered:
		var object = field.object;
		var linkedObject = field.datasourceLink;

		return this.canFilterObject(object) || this.canFilterObject(linkedObject);
	}


	
	// return the column headers for this object
	// @param {bool} isObjectWorkspace  return the settings saved for the object workspace
	columnHeaders (isObjectWorkspace, isEditable, summaryColumns, countColumns) {
		
		var headers = super.columnHeaders(isObjectWorkspace, isEditable, summaryColumns, countColumns);

		headers.forEach(h => {

			var field = this.application.urlResolve(h.fieldURL);
			if (field) {

				// include object name {objectName}.{columnName}
				// to use it in grid headers & hidden fields
				h.id = '{objectName}.{columnName}'
						.replace('{objectName}', field.object.name)
						.replace('{columnName}', field.columnName);

				// label
				h.header = '{objectLabel}.{fieldLabel}'
							.replace('{objectLabel}', field.object.label)
							.replace('{fieldLabel}', field.label);

				// icon
				if (field.settings &&
					field.settings.showIcon) {
					h.header = '<span class="webix_icon fa-{icon}"></span>'.replace('{icon}', field.fieldIcon() ) + h.header;
				}

				h.adjust = true;
				h.minWidth = 220;
			}

		});

		return headers;
	}


	/**
	 * @method urlPointer()
	 * return the url pointer that references this object. This url pointer
	 * should be able to be used by this.application.urlResolve() to return 
	 * this object.
	 * 
	 * @param {boolean} acrossApp - flag to include application id to url
	 * 
	 * @return {string} 
	 */
	urlPointer(acrossApp) {
		return this.application.urlQuery(acrossApp) + this.id;
	}



	/**
	 * @method isDisabled()
	 * check this contains removed objects or fields
	 * 
	 * @return {boolean}
	 */
	isDisabled() {

		return this.disabled || false;

	}



	// // after a component has rendered, tell each of our fields to perform
	// // any custom display operations
	// // @param {Webix.DataStore} data a webix datastore of all the rows effected
	// //        by the render.
	// customDisplays(data, App, DataTable, ids, isEditable) {
	// 	var fields = this.fields();

	// 	if (!data || !data.getFirstId) return;

	// 	if (ids != null) {
	// 		var ids = ids;
	// 		ids.forEach((id)=>{
	// 			var row = data.getItem(id);
	// 			fields.forEach((f)=>{
	// 				if (this.objectWorkspace.hiddenFields.indexOf(f.columnName) == -1) {
	// 					var node = DataTable.getItemNode({ row: row.id, column: f.columnName });
	// 					f.customDisplay(row, App, node, isEditable);
	// 				}
	// 			});
	// 		});
	// 	} else {
	// 		var id = data.getFirstId();
	// 		while(id) {
	// 			var row = data.getItem(id);
	// 			fields.forEach((f)=>{
	// 				if (this.objectWorkspace.hiddenFields.indexOf(f.columnName) == -1) {
	// 					var node = DataTable.getItemNode({ row: row.id, column: f.columnName });
	// 					f.customDisplay(row, App, node, isEditable);
	// 				}
	// 			})
	// 			id = data.getNextId(id);
	// 		}
	// 	}

	// }


	// // Display data with label format of object
	// displayData(rowData) {

	// 	if (rowData == null) return '';

	// 	// translate multilingual
	// 	var mlFields = this.multilingualFields();
	// 	OP.Multilingual.translate(rowData, rowData, mlFields);

	// 	var labelData = this.labelFormat || '';
		
	// 	// default label
	// 	if (!labelData && this._fields.length > 0) {

	// 		var defaultField = this.fields(f => f.fieldUseAsLabel())[0];
	// 		if (defaultField)
	// 			labelData = '{' + defaultField.id + '}';
	// 		else
	// 			labelData = 'ID: ' + rowData.id; // show id of row
	// 	}

	// 	// get column ids in {colId} template
	// 	// ['{colId1}', ..., '{colIdN}']
	// 	var colIds = labelData.match(/\{[^}]+\}/g);

	// 	if (colIds && colIds.forEach) {
	// 		colIds.forEach((colId) => {
	// 			var colIdNoBracket = colId.replace('{', '').replace('}', '');

	// 			var field = this.fields((f) => f.id == colIdNoBracket)[0]
	// 			if (field == null) return;

	// 			labelData = labelData.replace(colId, field.format(rowData) || '');
	// 		});
	// 	}

	// 	return labelData;
	// }




	///
	/// Working with data from server
	///

	// /**
	//  * @method model
	//  * return a Model object that will allow you to interact with the data for
	//  * this ABObject.
	//  */
	// model() {

	// 	if (!this._model) {

	// 		if (this.isImported) {
	// 			var obj = ABApplication.objectFromRef(this.importFromObject);
	// 			this._model = new ABModel(obj);
	// 		}
	// 		else {
	// 			this._model = new ABModel(this);
	// 		}
	// 	}

	// 	return this._model;
	// }


}
