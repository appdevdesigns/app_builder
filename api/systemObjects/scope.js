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
		attributes.id = "af10e37c-9b3a-4dc6-a52a-85d52320b659";
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
			id: "e3670083-befb-4139-ae40-c375efe8da4e",
			label: "Roles",
			columnName: "roles",
			settings: {
				linkObject: "c33692f3-26b7-4af3-a02e-139fb519296d",
				linkType: "many",
				linkViaType: "many",
				linkColumn: "4585d5cb-0eea-461d-a326-61187c88520f",
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