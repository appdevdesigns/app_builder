steal(
	// Dependencies
	'opstools/BuildApp/controllers/EquationManager.js',
    'js/moment.min.js',
	function (EquationManager, moment) {
		//Define the unit tests
		describe('testing Equation Manager', function () {
            it("should have a parse function", function () {
                assert.equal(true, typeof EquationManager.parse == "function");
            });

            function executeEquation(equation, context) {
                return EquationManager.parse(equation)(context || {});
            }

            it("should add", function(){
                assert.equal(5, executeEquation("2 + 3"));
            });
            it("should take variables from the given context", function (){
                assert.equal(5, executeEquation("2 + price", {price: 3}));
            });
            it("should have a max function", function(){
                assert.equal(5, executeEquation("max(1, 2, 5)"));
            });
            it("should be able to calculate an age", function(){
                var lastYear = moment().subtract(1, "years").toDate();
                //lastYear is a js date
                assert.equal("1 years old", executeEquation('age(dob) + " years old"', {dob: lastYear}));
            });
            it("should have a year function", function () { 
                var date = moment("1992-05-06").toDate();
                assert.equal(1992, executeEquation("year(dob)", {dob: date}));
            });
            it("should have a month function", function () { 
                var date = moment("1992-05-06").toDate();
                assert.equal(5, executeEquation("month(dob)", {dob: date}));
            });
            it("should have a formatDate function", function () { 
                var date = moment("1992-05-06").toDate();
                assert.equal("06-05-1992", executeEquation('formatDate(dob, "DD-MM-YYYY")', {dob: date}));
            });
            it("should have a mean function", function (){ 
                assert.equal(5, executeEquation("mean(1, 6, 8)"));
            });
            it("should have a absolute value function", function (){ 
                assert.equal(10, executeEquation("abs(5) + abs(-5)"));
            });
        });
	}
);