const ABObjectSystem = require("../classes/platform/ABObjectSystem");

const ABFieldString = require("../classes/platform/dataFields/ABFieldString");
const ABFieldLongText = require("../classes/platform/dataFields/ABFieldLongText");
const ABFieldConnect = require("../classes/platform/dataFields/ABFieldConnect");
const ABFieldUser = require("../classes/platform/dataFields/ABFieldUser");

module.exports = class ABObjectRole extends ABObjectSystem {

	constructor() {

		let attributes = {};
		attributes.id = "AB_ROLE";
		attributes.name = "ROLE";
		attributes.tableName = "AB_SYSTEM_ROLE";
		attributes.primaryColumnName = "uuid";

		super(attributes);

	}

	initFields() {

		// add fields
		this._fields = [];

		// scope
		this._fields.push(new ABFieldConnect({
			id: "AB_ROLE_SCOPES_FIELD",
			label: "Scopes",
			columnName: "scopes",
			settings: {
				linkObject: "AB_SCOPE",
				linkType: "many",
				linkViaType: "many",
				linkColumn: "AB_SCOPE_ROLE_FIELD",
				isSource: 0
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

		// user
		this._fields.push(new ABFieldUser({
			label: "Users",
			columnName: "users",
			settings: {
				isMultiple: 1,
				isShowProfileImage: 0
			}
		}, this));

	}

}