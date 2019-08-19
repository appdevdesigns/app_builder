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

io.socket.on("ab.query.update", function (msg) {

	AD.comm.hub.publish("ab.query.update", {
		queryId: msg.queryId,
		data: msg.data
	});

});

// io.socket.on("ab.query.delete", function (msg) {
// });

export default class ABObjectQuery extends ABObject {

	constructor(attributes, application) {
		super(attributes, application);

		this.fromValues(attributes);

		// listen
		AD.comm.hub.subscribe("ab.query.update", (msg, data) => {

			if (this.id == data.queryId)
				this.fromValues(data.data);

		});

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

	fromValues (attributes) {

		super.fromValues(attributes);

		// populate connection objects
		this._objects = {};

		(attributes.objects || []).forEach(obj => {
			this._objects[obj.alias] = new ABObject(obj, this.application);
		});


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

			objects: [{ABObject}]

			// ABOBjectQuery Specific Changes
			// we store a list of fields by their urls:
			fields:[
			{
				alias: "",
				fieldID:'uuid',
			}
			],


			// we store a list of joins:
			joins:{
			alias: "",							// the alias name of table - use in SQL command
			objectID: "uuid",					// id of the connection object
			links: [
				{
					alias: "",							// the alias name of table - use in SQL command
					fieldID: "uuid",					// the connection field of the object we are joining with.
					type:[left, right, inner, outer]	// join type: these should match the names of the knex methods
							=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
					links: [
						...
					]
				}
			]

			},


			where: { QBWhere },
			settings: {
				grouping: false							// Boolean
			}
		}
		*/


		// import all our ABObjects 
		this.importJoins(attributes.joins || {});
		this.importFields(attributes.fields || []); // import after joins are imported
		// this.where = attributes.where || {}; // .workspaceFilterConditions

		this.settings = this.settings || {};

		if (attributes.settings) {

			// convert from "0" => true/false
			this.settings.grouping = JSON.parse(attributes.settings.grouping || false);
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
	toObj () {

		var result = super.toObj();

		result.settings = this.settings;

		return result;

	}


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

		// var isAdd = false;

		// if this is our initial save()
		if (!this.id) {

			// this.id = OP.Util.uuid();	// setup default .id
			this.label = this.label || this.name;
			this.urlPath = this.urlPath || this.application.name + '/' + this.name;
			// isAdd = true;
		}

		return new Promise((resolve, reject) => {
			this.application.querySave(this)
				.then(newQuery => {

					if (newQuery && 
						newQuery.id &&
						!this.id)
						this.id = newQuery.id;

					// populate connection objects
					this._objects = this._objects || {};
					(newQuery.objects || []).forEach(obj => {

						if (this._objects[obj.alias] == null)
							this._objects[obj.alias] = new ABObject(obj, this.application);

					});

					resolve(this);

				})
				.catch(function(err){
					reject(err);
				});
		});
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


		var result = super.toObj();

		/// include our additional objects and where settings:

		result.joins = this.exportJoins();  //objects;
		// settings.where  = this.where; // .workspaceFilterConditions

		result.settings = this.settings;

		return result;
	}

	get isGroup() {
		return this.settings.grouping || false;
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
	  	(fieldSettings || []).forEach((fieldInfo) => {

			if (fieldInfo == null) return;

			// pull object by alias name
			let object = this.objectByAlias(fieldInfo.alias);
			if (!object) return;

			let field = object.fields(f => f.id == fieldInfo.fieldID, true)[0];

			// should be a field of base/join objects
			if (field && this.canFilterField(field) &&
				// check duplicate
				newFields.filter(f => f.alias == fieldInfo.alias && f.field.id == fieldInfo.fieldID).length < 1) { 

				let clonedField = _.clone(field, false);
		
				clonedField.alias = fieldInfo.alias;
	
				// NOTE: query v1
				let alias = "";
				if (Array.isArray(this.joins())) {
					alias = field.object.name;
				}
				else {
					alias = fieldInfo.alias;
				}
	
				// include object name {aliasName}.{columnName}
				// to use it in grid headers & hidden fields
				clonedField.columnName = '{aliasName}.{columnName}'
								.replace('{aliasName}', alias)
								.replace('{columnName}', clonedField.columnName);


				newFields.push({
					alias: fieldInfo.alias,
					field: clonedField
				});
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
		this._fields.forEach((fieldInfo) => {
			currFields.push( {
				alias: fieldInfo.alias,
				objectID: fieldInfo.field.object.id,
				fieldID: fieldInfo.field.id
			})
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

		filter = filter || function() { return true; };

		return this._fields.map(f => f.field).filter(result => filter(result));

	}




	///
	/// Joins & Objects
	///


	/**
	 * @method joins()
	 *
	 * return an object of joins for this Query.
	 *
	 * @return {Object}
	 */
	joins() {

		return this._joins || {};
	}


	/**
	 * @method objects()
	 *
	 * return an array of all the ABObjects for this Query.
	 *
	 * @return {array}
	 */
	objects (filter) {

		if (!this._objects) return [];

		filter = filter || function(){ return true; };

		// get all objects (values of a object)
		let objects = Object.keys(this._objects).map(key => { return this._objects[key]; });

		return (objects || []).filter(filter);
	}


	/**
	 * @method objectBase
	 * return the origin object
	 * 
	 * @return {ABObject}
	 */
	objectBase () {

		if (!this._joins.objectID)
			return null;

		return this.objects(obj => obj.id == this._joins.objectID)[0] || null;

	}

	/**
	 * @method objectByAlias()
	 * return ABClassObject search by alias name
	 *
	 * @param {string} - alias name
	 * @return {ABClassObject}
	 */
	objectByAlias(alias) {

		return (this._objects || {})[alias];

	}



	/**
	 * @method links()
	 *
	 * return an array of links for this Query.
	 *
	 * @return {array}
	 */
	links(filter) {

		filter = filter || function(){ return true; };

		return (this._links || []).filter(filter);

	}


	/**
	 * @method importJoins
	 * instantiate a set of joins from the given attributes.
	 * Our joins contain a set of ABObject URLs that should already be created in our Application.
	 * @param {Object} settings The different field urls for each field
	 *					{ }
	 */
	importJoins(settings) {

		// copy join settings
		this._joins = _.cloneDeep(settings);

		var newObjects = {};
		var newLinks = [];

		let storeObject = (object, alias) => {
			if (!object) return;

			// var inThere = newObjects.filter(obj => obj.id == object.id && obj.alias == alias ).length > 0;
			// if (!inThere) {
			newObjects[alias] = object;
			// newObjects.push({
			// 	alias: alias,
			// 	object: object
			// });
			// }
		}

		let storeLinks = (links) => {

			(links || []).forEach(link => {

				// var inThere = newLinks.filter(l => l.fieldID == link.fieldID).length > 0;
				// if (!inThere) {
				newLinks.push(link);
				// }
	
			});

		}

		let processJoin = (baseObject, joins) => {

			if (!baseObject) return;

			(joins || []).forEach((link) => {

				// Convert our saved settings:
				//	{
				//		alias: "",							// the alias name of table - use in SQL command
				//		objectID: "uuid",					// id of the connection object
				//		links: [
				//			{
				//				alias: "",							// the alias name of table - use in SQL command
				//				fieldID: "uuid",					// uhe connection field of the object we are joining with.
				//				type:[left, right, inner, outer]	// join type: these should match the names of the knex methods
				//						=> innerJoin, leftJoin, leftOuterJoin, rightJoin, rightOuterJoin, fullOuterJoin
				//				links: [
				//					...
				//				]
				//			}
				//		]
				//	},

				var linkField = baseObject.fields(f => f.id == link.fieldID, true)[0];
				if (!linkField) return;

				// track our linked object
				var linkObject = this.objects(obj => obj.id == linkField.settings.linkObject)[0];
				if (!linkObject) return;

				storeObject(linkObject, link.alias);

				storeLinks(link.links);

				processJoin(linkObject, link.links);

			});

		}

		// if (!this._joins.objectURL)
		// 	// TODO: this is old query version
		// 	return;

		// store the root object
		var rootObject = this.objectBase();
		if (!rootObject) {
			this._objects = newObjects;
			return;
		}

		storeObject(rootObject, "BASE_OBJECT");

		storeLinks(settings.links);

		processJoin(rootObject, settings.links);

		this._objects = newObjects;
		this._links = newLinks;
	}


	/**
	 * @method exportObjects
	 * save our list of objects into our format for persisting on the server
	 * @param {array} settings 
	 */
	exportJoins() {

		return _.cloneDeep(this._joins || {});

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
		return this.objects((obj)=>{ return obj.id == object.id; }).length > 0;

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
		let object = field.object;
		let linkedObject = this.objects(obj => obj.id == field.settings.linkObject)[0];

		return this.canFilterObject(object) || this.canFilterObject(linkedObject);
	}


	
	// return the column headers for this object
	// @param {bool} isObjectWorkspace  return the settings saved for the object workspace
	columnHeaders (isObjectWorkspace, isEditable, summaryColumns, countColumns, hiddenFieldNames) {
		
		var headers = super.columnHeaders(isObjectWorkspace, isEditable, summaryColumns, countColumns, hiddenFieldNames);

		headers.forEach(h => {

			// pull object by alias
			let object = this.objectByAlias(h.alias);
			if (!object) return;

			let field = object.fields(f => f.id == h.fieldID, true)[0];
			if (!field) return;

			// NOTE: query v1
			let alias = "";
			if (Array.isArray(this.joins())) {
				alias = field.object.name;
			}
			else {
				alias = h.alias;
			}

			// include object name {aliasName}.{columnName}
			// to use it in grid headers & hidden fields
			h.id = '{aliasName}.{columnName}'
					.replace('{aliasName}', alias)
					.replace('{columnName}', field.columnName);

			// label
			h.header = '{objectLabel}.{fieldLabel}'
						.replace('{objectLabel}', field.object.label)
						.replace('{fieldLabel}', field.label);

			// icon
			if (field.settings &&
				field.settings.showIcon) {
				h.header = '<span class="webix_icon fa fa-{icon}"></span>'.replace('{icon}', field.fieldIcon() ) + h.header;
			}

			// If this query supports grouping, then add folder icon to display in grid
			if (this.isGroup) {
				let originTemplate = h.template;

				h.template = (item, common) => {
					if (item[h.id])
						return common.treetable(item, common) + (originTemplate ? originTemplate(item, common) : item[h.id]);
					else
						return "";
				};
			}

			h.adjust = true;
			h.minWidth = 220;

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
	 * @method isReadOnly
	 * 
	 * @return {boolean}
	 */
	get isReadOnly() {
		return true;
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

}
