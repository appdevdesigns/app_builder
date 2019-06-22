/*
 * ABFieldManager
 *
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */


import ABFieldString from "./dataFields/ABFieldString"
import ABFieldLongText from "./dataFields/ABFieldLongText"
import ABFieldNumber from "./dataFields/ABFieldNumber"
import ABFieldDate from "./dataFields/ABFieldDate"
import ABFieldBoolean from "./dataFields/ABFieldBoolean"
import ABFieldList from "./dataFields/ABFieldList"
import ABFieldTree from "./dataFields/ABFieldTree"
import ABFieldEmail from "./dataFields/ABFieldEmail"
import ABFieldImage from "./dataFields/ABFieldImage"
import ABFieldFile from "./dataFields/ABFieldFile"
import ABFieldUser from "./dataFields/ABFieldUser"
import ABFieldConnect from "./dataFields/ABFieldConnect"
import ABFieldCalculate from "./dataFields/ABFieldCalculate"
import ABFieldTextFormula from "./dataFields/ABFieldTextFormula"
import ABFieldFormula from "./dataFields/ABFieldFormula"
import ABFieldAutoIndex from "./dataFields/ABFieldAutoIndex" 

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


export default  {


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
