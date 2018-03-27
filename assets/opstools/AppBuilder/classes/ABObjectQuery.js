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
	  	this.where = attributes.where || {};

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
		settings.where  = this.where;


		return settings;
	}




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
	  	fieldSettings.forEach((field) => {
	  		newFields.push( this.application.urlResolve(field.fieldURL) );
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

		return this._joins.filter(filter);
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

		return this._objects.filter(filter);
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
	  	settings.forEach((join) => {

	  		// Convert our saved settings:
	  		// 		{
			// 			objectURL:"#/...",
			// 			fieldID:'adf3we666r77ewsfe',
			// 			type:[left, right, inner, outer]  // these should match the names of the knex methods
			// 					=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
			// 		}

	  		var object = this.application.urlResolve(join.objectURL);


	  		newJoins.push( join );
	  		newObjects.push(object);
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


	// // return the column headers for this object
	// // @param {bool} isObjectWorkspace  return the settings saved for the object workspace
	// columnHeaders (isObjectWorkspace, isEditable) {

	// 	var headers = [];
	// 	var columnNameLookup = {};

	// 	// get the header for each of our fields:
	// 	this._fields.forEach(function(f){
	// 		var header = f.columnHeader(isObjectWorkspace, null, isEditable);
	// 		if (f.settings.width != 0) {
	// 			// set column width to the customized width
	// 			header.width = f.settings.width;
	// 		} else {
	// 			// set column width to adjust:true by default;
	// 			header.adjust = true;
	// 		}
	// 		headers.push(header);
	// 		columnNameLookup[header.id] = f.columnName;	// name => id
	// 	})


	// 	// update our headers with any settings applied in the Object Workspace
	// 	if (isObjectWorkspace) {

	// 		// hide any hiddenfields
	// 		if (this.workspaceHiddenFields.length > 0) {
	// 			this.workspaceHiddenFields.forEach((hfID)=>{
	// 				headers.forEach((h)=> {
	// 					if (columnNameLookup[h.id] == hfID){
	// 						h.hidden = true;
	// 					}
	// 				})
	// 			});
	// 		}
	// 	}

	// 	return headers;
	// }



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
