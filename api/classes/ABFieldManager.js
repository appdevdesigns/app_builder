/*
 * ABFieldManager
 *
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */
var path = require('path');

var ABFieldString = require( path.join(__dirname, "dataFields", "ABFieldString" ));
var ABFieldNumber = require( path.join(__dirname, "dataFields", "ABFieldNumber" ));
var ABFieldDate = require( path.join(__dirname, "dataFields", "ABFieldDate" ));
var ABFieldBoolean = require( path.join(__dirname, "dataFields", "ABFieldBoolean" ));
var ABFieldList = require( path.join(__dirname, "dataFields", "ABFieldList" ));
var ABFieldImage  = require( path.join(__dirname, "dataFields", "ABFieldImage"  ));
var ABFieldUser = require( path.join(__dirname, "dataFields", "ABFieldUser" ));
var ABFieldConnect = require( path.join(__dirname, "dataFields", "ABFieldConnect" ));

/*
 * Fields
 * A name => ABField  hash of the different ABFields available.
 */
var Fields = {};
Fields[ABFieldString.defaults().key] = ABFieldString;
Fields[ABFieldNumber.defaults().key] = ABFieldNumber;
Fields[ABFieldDate.defaults().key] = ABFieldDate;
Fields[ABFieldBoolean.defaults().key] = ABFieldBoolean;
Fields[ABFieldList.defaults().key] = ABFieldList;


Fields[ABFieldImage.defaults().key] = ABFieldImage;
Fields[ABFieldUser.defaults().key] = ABFieldUser;
Fields[ABFieldConnect.defaults().key] = ABFieldConnect;


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
	 * return an instance of an ABField based upon the values.type value.
	 * @return {ABField}
	 */
	newField: function (values, object) {

console.log(values);
		if (values.key) {
			return new Fields[values.key](values, object);
		} else {

//// TODO: what to do here?
		}

	}


}
