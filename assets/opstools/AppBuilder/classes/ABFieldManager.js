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
Fields[ABFieldString.type] = ABFieldString;




export default  {


	allFields: function() {
		var fields = [];
		for (var f in Fields) {
			fields.push(Fields[f]);
		}
		return fields;
	},


	getField:function(type) {
		return Fields[type];
	},



	fieldFromName:function(name) {
		return this.allFields().filter(function(f){ return f.menuName() == name; })[0];
	},


///// LEFT OFF:
// 

	newField: function (values, object) {


		if (values.type) {
			return new Fields[values.type](values, object);
		} else {

//// TODO: what to do here?
		}

	}







}
