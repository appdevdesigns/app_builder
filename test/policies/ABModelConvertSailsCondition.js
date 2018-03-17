var assert = require('chai').assert;
var _ = require('lodash');
var path = require('path');
var policy = require(path.join('..', '..', 'api', 'policies', 'ABModelConvertSailsCondition.js'));


describe('Policy ABModelConvertSailsCondition : ', function () {

	function getReq( where ) {
		return {
			options:{
				_where:where
			}
		}
	}

	function looksLikeQBCond(where) {
		assert.property(where, 'glue', ' returned QB condition should have a .glue at the root element');

		// walk conditions and make sure no values are null:
		function walk (cond) {
			if (cond.rules) {
				cond.rules.forEach((r)=>{
					assert.isNotNull(r, ' no values are allowed to be null ');
					if (r.glue) {
						walk(r);
					}
				})
			}
		}
		walk(where);
	}

	
	it('should be there', function () {
		assert.isDefined(policy, ' --> Policy should be defined!');
	});


	it('should ignore empty where conditions :', function(done){

		this.timeout(500);
		var req = getReq(null);
		policy(req, {}, function(err) {
			assert.notExists(err, ' : no error generated.');
			done();
		})
	})


	it('should not modify a QB condition :', function(done){

		this.timeout(500);
		var QBCond = {
			glue:"and",
			rules:[
				{
					key: "name_first",
					rule: "begins_with",
					value: "Neo"
				}
			]
		}

		var req = getReq(QBCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			assert.deepEqual(QBCond, req.options._where, ' : still equals original condition');
			done();
		})

	})


	it('should not modify a Filter condition (as array):', function(done){
		this.timeout(500);
		var FilterCond = [
			{
				combineCondition: 'and',
				fieldName:'name_first',
				operator: 'equals',
				inputValue: 'Neo'	
			}
		]

		var req = getReq(FilterCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			assert.deepEqual(FilterCond, req.options._where, ' : still equals original condition');
			done();

		})

	})


	it('should not modify a Filter condition (as obj):', function(done){
		this.timeout(500);
		var FilterCond = {
			combineCondition: 'and',
			fieldName:'name_first',
			operator: 'equals',
			inputValue: 'Neo'	
		}
		

		var req = getReq(FilterCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			assert.deepEqual(FilterCond, req.options._where, ' : still equals original condition');
			done();

		})

	})




	it('should convert basic commands to QB commands:', function(done){
		this.timeout(500);


		var sailsCond = {
		  nameStartsWith 	: { startsWith: 'A' },
		  nameNotStartsWith	: { '!': { startsWith: 'M' }},
		  nameContains		: { contains: 'Neo'}, 
		  nameNotContains	: { "!": { contains: 'Smith'}},
		  nameEndsWith		: { endsWith: 'The One' },
		  nameNotEndsWith	: { '!': { endsWith: 'Agent Smith' }},
		  nameEquals		: "Neo",
		  nameNotEquals		: { '!' : "Morpheous" },
		  nameNull			: "null",
		  nameNotNull		: { '!' : "null" },
		  nameEmpty			: "",
		  nameNotEmpty		: { '!' : "" },
	      ageGT 			: {'>': 1},
	      ageGTE 			: { '>=': 10 },
	      ageLT 			: { '<': 100 },
	      ageLTE 			: { '<=': 50 },
	      ageBetween 		: { '>=': 10, '<=': 50 },   		// between 
	      ageNotBetween 	: { '!' : { '<=': 50, '>=': 10 } }	// not between
	    }
		

		var req = getReq(sailsCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			looksLikeQBCond(req.options._where);


			var expectedResults = {

				nameStartsWith: { 
					key:'nameStartsWith', 
					rule:'begins_with', 
					value:'A' 
				},

				nameNotStartsWith: { 
					key:'nameNotStartsWith', 
					rule:'not_begins_with', 
					value:'M' 
				},

				nameContains: { 
					key:'nameContains', 
					rule:'contains', 
					value:sailsCond.nameContains.contains 
				}, 

				nameNotContains: { 
					key:'nameNotContains', 
					rule:'not_contains', 
					value:sailsCond.nameNotContains['!'].contains 
				}, 

				nameEndsWith: {
					key: 'nameEndsWith',
					rule: 'ends_with',
					value: sailsCond.nameEndsWith.endsWith
				},

				nameNotEndsWith: { 
					key:'nameNotEndsWith', 
					rule:'not_ends_with', 
					value:sailsCond.nameNotEndsWith['!'].endsWith 
				},

				nameEquals: {
					key:'nameEquals',
					rule: 'equals',
					value: sailsCond.nameEquals
				},

		  		nameNotEquals: {
					key:'nameNotEquals',
					rule: 'not_equals',
					value: sailsCond.nameNotEquals['!']
				},

		  		nameNull: {
					key:'nameNull',
					rule: 'is_null',
					value: ""
				},

		  		nameNotNull: {
					key:'nameNotNull',
					rule: 'is_not_null',
					value: ""
				},

				nameEmpty: {
					key:'nameEmpty',
					rule: 'is_empty',
					value: ""
				},

		  		nameNotEmpty: {
					key:'nameNotEmpty',
					rule: 'is_not_empty',
					value: ""
				},

				ageGT: {
					key:'ageGT',
					rule: 'greater',
					value: sailsCond.ageGT['>']
				},

	      		ageGTE: {
					key:'ageGTE',
					rule: 'greater_or_equal',
					value: sailsCond.ageGTE['>=']
				},

	      		ageLT: {
					key:'ageLT',
					rule: 'less',
					value: sailsCond.ageLT['<']
				},

	      		ageLTE: {
					key:'ageLTE',
					rule: 'less_or_equal',
					value: sailsCond.ageLTE['<=']
				}, 

	      		ageBetween: {
					key:'ageBetween',
					rule: 'between',
					value: [ sailsCond.ageBetween['>='], sailsCond.ageBetween['<=']]
				},

	      		ageNotBetween: {
					key:'ageNotBetween',
					rule: 'not_between',
					value: [ sailsCond.ageNotBetween['!']['>='], sailsCond.ageNotBetween['!']['<=']]
				}
			}


			// now pull out what we got back into a hash by the key/name:
			var QBCond = {};
			req.options._where.rules.forEach((r)=>{
				QBCond[r.key] = r;
			})


			// make sure they all match.
			for (var k in expectedResults) {
				assert.deepEqual(QBCond[k], expectedResults[k], "  "+expectedResults[k].rule +" condition");
			}

			done();

		})

	})



	it('should convert basic AND structure :', function(done){
		this.timeout(500);


		var sailsCond = {
		  nameStartsWith 	: { startsWith: 'A' },
		  nameNotStartsWith	: { '!': { startsWith: 'M' }},
	    }
		

		var req = getReq(sailsCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			looksLikeQBCond(req.options._where);


			var where = req.options._where;

			// outer structure should be a:
			// {
			//	 glue: "and",
			//   rules: []
			// }

			assert.equal(where.glue, 'and', ' glue logic should be "and" ')
			assert.lengthOf(where.rules, 2, ' should have 2 rules');

			done();

		})

	})



	it('should convert basic OR structure :', function(done){
		this.timeout(500);


		var sailsCond = {
			'or': [
				{
					nameStartsWith 	: { startsWith: 'A' },
		  			nameNotStartsWith	: { '!': { startsWith: 'M' }},
		  		},
		  		{
					nameStartsWith 	: { startsWith: 'B' },
		  			nameNotStartsWith	: { '!': { startsWith: 'N' }},
		  		}
			]
	    }
		

		var req = getReq(sailsCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			looksLikeQBCond(req.options._where);


			var where = req.options._where;

			// outer structure should be a:
			// {
			//	 glue: "or",
			//   rules: []
			// }

			assert.equal(where.glue, 'or', ' glue logic should be "or" ')
			assert.lengthOf(where.rules, 2, ' should have 2 rules');

			// each embedded rule, should be "and" groupings
			where.rules.forEach((r)=>{
				assert.equal(r.glue, 'and', ' should be a basic "and" group ');
				assert.lengthOf(r.rules, 2, ' should have 2 sub conditions ');
			})

			done();

		})

	})



	it('should convert combined AND/OR structure :', function(done){
		this.timeout(500);


		var sailsCond = {

			nameStartsWith 	: { startsWith: 'A' },
		  	nameNotStartsWith	: { '!': { startsWith: 'M' }},

			'or': [
				{
					nameStartsWith 	: { startsWith: 'A' },
		  			nameNotStartsWith	: { '!': { startsWith: 'M' }},
		  		},
		  		{
					nameStartsWith 	: { startsWith: 'B' },
		  			nameNotStartsWith	: { '!': { startsWith: 'N' }},
		  		}
			]
	    }
		

		var req = getReq(sailsCond);
		policy(req, {}, function(err) {

			assert.notExists(err, ' : no error generated.');
			looksLikeQBCond(req.options._where);


			var where = req.options._where;

			// outer structure should be a:
			// {
			//	 glue: "or",
			//   rules: []
			// }

			assert.equal(where.glue, 'and', ' glue logic should be "and" ')
			assert.lengthOf(where.rules, 3, ' should have 3 rules');

			// should find an embedded 'OR' group:
			var isFound = false;
			var orGroup = null;
			where.rules.forEach((r)=>{
				if (r.glue == 'or') {
					isFound = true;
					orGroup = r;
				}
			});

			assert.ok(isFound, " found our embedded OR statement. ");
			assert.lengthOf(orGroup.rules, 2, ' OR group has 2 sub rules ');
			orGroup.rules.forEach((r)=>{
				assert.equal(r.glue, 'and', ' both child rules are "AND" rules')
			})

			done();

		})

	})


//// LEFT OFF HERE:
// now convert our QB condition format into Knex Queries:
// add IN statement handling:  ! IN  

});