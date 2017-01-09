steal(
	function () {

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
	// 
	var yearFunction = {
		token: 'year', 
		description: 'year( {datevalue} )\nReturns the year of a given date', 
		initialText: 'year( /* date */ )',

		returns: 'numeric',  

		exec: function(dateValue) {

			if (typeof moment == 'undefined') {
				console.error('Shoot!  moment not defined before trying to use this!');
			}

			// if no dateValue given, assume today:
			if (!dateValue) {
				dateValue = new Date();
			}
			
			return moment(dateValue).year();
		}
	};


	return yearFunction;
});