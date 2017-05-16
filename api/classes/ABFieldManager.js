/* 
 * ABFieldManager
 * 
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */
var path = require('path');

var ABFieldString = require( path.join(__dirname, "dataFields", "ABFieldString" ));
var ABFieldNumber = require( path.join(__dirname, "dataFields", "ABFieldNumber" )); 


var ABFieldImage  = require( path.join(__dirname, "dataFields", "ABFieldImage"  )); 

/* 
 * Fields
 * A name => ABField  hash of the different ABFields available.
 */
var Fields = {};
Fields[ABFieldString.defaults().key] = ABFieldString;
Fields[ABFieldNumber.defaults().key] = ABFieldNumber;


Fields[ABFieldImage.defaults().key] = ABFieldImage;



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

		if (values.key) {
			return new Fields[values.key](values, object);
		} else {

//// TODO: what to do here?
		}

	}


}
