/* 
 * ABFieldManager
 * 
 * An interface for managing the different ABFields available in our AppBuilder.
 *
 */


import ABFieldString from "./dataFields/ABFieldString"


/* 
 * Fields
 * A type => ABField  hash of the different ABFields available.
 */
var Fields = {};
Fields[ABFieldString.defaults().type] = ABFieldString;




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
	 * return an instance of an ABField based upon the values.type value.
	 * @return {ABField}
	 */
	newField: function (values, object) {

		if (values.type) {
			return new Fields[values.type](values, object);
		} else {

//// TODO: what to do here?
		}

	}


}
