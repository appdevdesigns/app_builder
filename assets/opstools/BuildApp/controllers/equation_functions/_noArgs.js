steal(
	function () {

	// noArgs
	//
	// An internal function to enable us to have empty () in our equations.
	// this is applied by teh 
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
	var noArgsFunction = {
		token: 'noArgs', 
		description: 'noArgs()\nInternal fn, you should not see this.', 
		initialText: 'these are not the droids your looking for.  Move along.',

		isHidden: true,
		returns: 'null',  

		exec: function() {
			return null;
		}
	};


	return noArgsFunction;
});