steal(function () {

	// date_year
	//
	// A function that returns the year from a given date value.
	//



	// General settings
	// 
	// To plug-in to the AppBuilder, each Function must define the following:
	//		.token 	{string}	
	//			a unique token to resolve in a given equation.
	//		.description 	{string}	
	//			a descriptive text to show as a choice for the user to enter 
	//			in an equation popdown box.
	//		.initialText 	{string}	
	//			the text that gets placed initially if chosen in the equation
	//			popdown box
	//		.returns {string}
	//			what kind of value does this fn return: 
	//				'numeric' : an integer or float value
	//				'date'	  : a date / datetime value
	// 
	var [Equation]Function = {
		token: 'year', 
		description: 'year( {datevalue} )\nReturns the year of a given date', 
		initialText: 'year( /* date */ )',  

		returns: 'numeric',  // [ 'numeric', 'date', ... ]

		exec: function(dateValue) {

		}
	};




	return [Equation]Function;
});