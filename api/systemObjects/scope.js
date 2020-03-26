const ABObjectSystem = require("../classes/platform/ABObjectSystem");

const ABFieldString = require("../classes/platform/dataFields/ABFieldString");
const ABFieldLongText = require("../classes/platform/dataFields/ABFieldLongText");
const ABFieldConnect = require("../classes/platform/dataFields/ABFieldConnect");
const ABFieldUser = require("../classes/platform/dataFields/ABFieldUser");
const ABFieldJson = require("../classes/platform/dataFields/ABFieldJson");
const ABFieldBoolean = require("../classes/platform/dataFields/ABFieldBoolean");

module.exports = class ABObjectScope extends ABObjectSystem {

	constructor() {

		let attributes = {};
		attributes.id = "AB_SCOPE";
		attributes.name = "SCOPE";
		attributes.tableName = "AB_SYSTEM_SCOPE";
		attributes.primaryColumnName = "uuid";

		super(attributes);

	}

	initFields() {

		// add fields
		this._fields = [];

		// role
		this._fields.push(new ABFieldConnect({
			id: "AB_SCOPE_ROLE_FIELD",
			label: "Role",
			columnName: "role",
			settings: {
				linkObject: "AB_ROLE",
				linkType: "many",
				linkViaType: "many",
				linkColumn: "AB_ROLE_SCOPES_FIELD",
				isSource: 1
			}
		}, this));

		// name
		this._fields.push(new ABFieldString({
			label: "Name",
			columnName: "name",
			settings: {
				supportMultilingual: true
			}
		}, this));

		// description
		this._fields.push(new ABFieldLongText({
			label: "Description",
			columnName: "description",
			settings: {
				supportMultilingual: true
			}
		}, this));

		// created by
		this._fields.push(new ABFieldUser({
			label: "Created By",
			columnName: "createdBy",
			settings: {
				isMultiple: 1,
				isShowProfileImage: 0
			}
		}, this));

		// filter
		this._fields.push(new ABFieldJson({
			label: "Filter",
			columnName: "filter"
		}, this));

		// allowAll
		this._fields.push(new ABFieldBoolean({
			label: "Allow All",
			columnName: "allowAll"
		}, this));

		// TODO: objectIds

	}

}