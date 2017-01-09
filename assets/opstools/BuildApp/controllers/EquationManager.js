steal(
	'js/filtrex.js',
	'opstools/BuildApp/controllers/equation_functions/_noArgs.js',
	'opstools/BuildApp/controllers/equation_functions/date_year.js',

	function (filtrex) {
		var self = {};

		self.equations = {};  // hash of parsed equations:  'equation' : fn(data)


		// steal() will pass in each of the above loaded objects
		// as parameters to this function().


		// convert the provided plugins into a [functions]
		var functions = $.map(arguments, function(fn,indx){
			return [fn];
		}).filter(function(fn) {
			return (fn.token);
		});


		var hashFunctions = {};

		// Listen save event
		functions.forEach(function (fn) {
			hashFunctions[fn.token] = fn.exec;
		});



		/*
		 * @function getDescriptions
		 * return an array of all the available function descriptions
		 *
		 * @return {array}
		 */
		self.getDescriptions = function() {
			return $.map(functions.filter(function(fn){ return !fn.isHidden; }), function(fn, indx){
				return [fn.description];
			});
		}


		self.parse = function(equation, data ) {
			// var data = {
			// 	birthdate:new Date()
			// }

			// filtrex doesn't handle empty (), so let's replace them with ( noArgs(0) )
			equation = equation.replace(/[(]+[\s]*[)]+/g, '( noArgs(0) )');

			var myFilter = this.equations[equation];
			if (!myFilter) {

				// var contextualAdditions = $.extend({},hashFunctions);
				// for (var d in data) {
				// 	(function (key) { contextualAdditions[key] = function(){ return data[key]; } })(d);
				// }
				// var equation = '1+year( birthdate )';

				myFilter = filtrex(equation, hashFunctions);

				this.equations[equation] = myFilter;
			}
			return myFilter;
			// return 'in egnMgr';
		}


		return self;
	}
);


//// LEFT OFF:
// test out loading EquationManager
// display a list of our descriptions
// have a test data_field load the equation manager, and use it
// add in our parser
// 