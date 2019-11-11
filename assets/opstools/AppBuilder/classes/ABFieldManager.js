/*
 * ABFieldManager
 *
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */


const ABFieldString = require("./dataFields/ABFieldString");
const ABFieldLongText = require("./dataFields/ABFieldLongText");
const ABFieldNumber = require("./dataFields/ABFieldNumber");
const ABFieldDate = require("./dataFields/ABFieldDate");
const ABFieldBoolean = require("./dataFields/ABFieldBoolean");
const ABFieldList = require("./dataFields/ABFieldList");
const ABFieldTree = require("./dataFields/ABFieldTree");
const ABFieldEmail = require("./dataFields/ABFieldEmail");
const ABFieldImage = require("./dataFields/ABFieldImage");
const ABFieldFile = require("./dataFields/ABFieldFile");
const ABFieldUser = require("./dataFields/ABFieldUser");
const ABFieldConnect = require("./dataFields/ABFieldConnect");
const ABFieldCalculate = require("./dataFields/ABFieldCalculate");
const ABFieldTextFormula = require("./dataFields/ABFieldTextFormula");
const ABFieldFormula = require("./dataFields/ABFieldFormula");
const ABFieldAutoIndex = require("./dataFields/ABFieldAutoIndex");
const ABFieldJson = require("./dataFields/ABFieldJson");

/*
 * Fields
 * A name => ABField  hash of the different ABFields available.
 */
var Fields = {};
Fields[ABFieldString.defaults().key] = ABFieldString;
Fields[ABFieldLongText.defaults().key] = ABFieldLongText;
Fields[ABFieldNumber.defaults().key] = ABFieldNumber;
Fields[ABFieldDate.defaults().key] = ABFieldDate;
Fields[ABFieldBoolean.defaults().key] = ABFieldBoolean;
Fields[ABFieldList.defaults().key] = ABFieldList;
Fields[ABFieldTree.defaults().key] = ABFieldTree;
Fields[ABFieldEmail.defaults().key] = ABFieldEmail;
Fields[ABFieldImage.defaults().key] = ABFieldImage;
Fields[ABFieldFile.defaults().key] = ABFieldFile;
Fields[ABFieldUser.defaults().key] = ABFieldUser;
Fields[ABFieldConnect.defaults().key] = ABFieldConnect;
Fields[ABFieldCalculate.defaults().key] = ABFieldCalculate;
Fields[ABFieldTextFormula.defaults().key] = ABFieldTextFormula;
Fields[ABFieldFormula.defaults().key] = ABFieldFormula;
Fields[ABFieldAutoIndex.defaults().key] = ABFieldAutoIndex;
Fields[ABFieldJson.defaults().key] = ABFieldJson;


module.exports = {


	/*
	 * @function allFields
	 * return all the currently defined ABFields in an array.
	 * @return [{ABField},...]
	 */
	allFields: function() {
		var fields = [];
		for (var f in Fields) {
			fields.push(Fields[f]);
		}
		return fields;
	},


	/*
	 * @function newField
	 * return an instance of an ABField based upon the values.key value.
	 * @return {ABField}
	 */
	newField: function (values, object) {
		if (values.key) {
			return new Fields[values.key](values, object);
		} else {

//// TODO: what to do here?
		}

	}


}
