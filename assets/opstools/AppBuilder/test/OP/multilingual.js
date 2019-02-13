import AB from '../../components/ab'
import OP from "../../OP/OP"

import _ from "../../../../../node_modules/lodash/lodash.min"


describe("OP.multilingual unit tests", () => {

	function L(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}

	var sandbox;


	var objNoTranslations = {
		name:'name'
	}

	var testObj = {
		name:'test',
		translations:[
			{ language_code:'en', field1:'A', field2:'B', field3:'C' },
			{ language_code:'cn', field1:'a', field2:'b', field3:'c' }
		]
	}


	var fields = ['field1', 'field2' ];


	// before(() => {

	// });


	// after(() => {

	// });

	/* User field test cases */
	describe('OP.multilingual.translate', () => {

		// it should not fail if missing parameters.
		it('should not fail if missing parameters', () => {
			assert.doesNotThrow(OP.Multilingual.translate, ' --> does not crash');
		})


		// it should not alter the object if no fields are given
		it('should not alter the object if no fields are given', () =>{
			var currObj = _.clone(testObj);
			OP.Multilingual.translate(currObj, currObj, []);
			assert.ok( _.isEqual(currObj, testObj), ' --> object not altered');
		})

		// it should not alter the object if no translations are present
		it('should not alter the object if no translations are present', () =>{
			var currObj = _.clone(objNoTranslations);
			OP.Multilingual.translate(currObj, currObj, fields);
			// assert.ok( _.isEqual(currObj, objNoTranslations), ' --> object not altered');
			assert.isUndefined( objNoTranslations.translations, ' --> object not altered');
			assert.isDefined( currObj.translations, ' --> object should have translations property');
		})

		// it should pull the proper data translations into top level of obj
		it('should pull the proper data translations into top level of obj', () => {
			var currObj = _.clone(testObj);
			OP.Multilingual.translate(currObj, currObj, fields);
			assert.property(currObj, 'field1', 		' --> found 1st translation field');
			assert.equal(currObj.field1, 'A', 		' --> populated proper value');
			assert.property(currObj, 'field2', 		' --> found 2nd translation field');
			assert.equal(currObj.field2, 'B', 		' --> populated proper value');
			assert.notProperty(currObj, 'field3', 	' --> did not pull 3rd field');
		})

		// it should pull the proper data translations into top level of obj
		it('should pull the proper data translations into top level of obj', () => {
			var currObj = _.clone(testObj);

			var defaultLang = AD.lang.currentLanguage;
			AD.lang.currentLanguage = 'cn';		// switch to 2nd language

			OP.Multilingual.translate(currObj, currObj, fields);
			assert.property(currObj, 'field1', 		' --> found 1st translation field');
			assert.equal(currObj.field1, 'a', 		' --> populated proper value');
			assert.property(currObj, 'field2', 		' --> found 2nd translation field');
			assert.equal(currObj.field2, 'b', 		' --> populated proper value');
			assert.notProperty(currObj, 'field3', 	' --> did not pull 3rd field');

			AD.lang.currentLanguage = defaultLang;
		})

		// it should return a copy of existing data when asking for a unknown language:
		it('should return a copy of existing data when asking for a unknown language', () => {
			var currObj = _.clone(testObj);

			var defaultLang = AD.lang.currentLanguage;
			AD.lang.currentLanguage = 'zz';		// switch to unknown language

			OP.Multilingual.translate(currObj, currObj, fields);
			assert.property(currObj, 'field1', 		' --> found 1st translation field');
			assert.equal(currObj.field1, '[zz]A', 		' --> populated proper value');
			assert.property(currObj, 'field2', 		' --> found 2nd translation field');
			assert.equal(currObj.field2, '[zz]B', 		' --> populated proper value');
			assert.notProperty(currObj, 'field3', 	' --> did not pull 3rd field');

			AD.lang.currentLanguage = defaultLang;
		})

	});

	describe('OP.multilingual.unTranslate', () => {

		// it should not fail if missing parameters.
		it('should not fail if missing parameters', () => {
			assert.doesNotThrow(OP.Multilingual.unTranslate, ' --> does not crash');
		})


		// it should not alter the object if no fields are given
		it('should not alter the object if no fields are given', () =>{
			var currObj = _.clone(testObj);
			OP.Multilingual.unTranslate(currObj, currObj, []);
			assert.ok( _.isEqual(currObj, testObj), ' --> object not altered');
		})

		// it should alter the object if no translations are present
		it('should alter the object if no translations are present', () =>{
			var currObj = _.clone(objNoTranslations);
			OP.Multilingual.unTranslate(currObj, currObj, fields);
			// assert.isNotOk( _.isEqual(currObj, objNoTranslations), ' --> object was altered');
			assert.property(currObj, 'translations', ' --> translations array created');

			assert.isArray(currObj.translations, ' --> translations is an array');

			var found = false
			currObj.translations.forEach((t) => {
				if (t.language_code == AD.lang.currentLanguage) {
					found = true;
				}
			})

			assert.isOk(found, ' --> found a translation entry for the current language');
		})

		// it should update an existing translation entry
		it('should update an existing translation entry', () =>{
			var currObj = _.clone(testObj);

			currObj.field1 = 'A1';
			currObj.field2 = 'B2';
			currObj.field3 = 'C2';  // trick!  don't update this translation

			OP.Multilingual.unTranslate(currObj, currObj, fields);
			
			assert.property(currObj, 'translations', ' --> translations array created');
			assert.isArray(currObj.translations, ' --> translations is an array');
			
			var found = false
			currObj.translations.forEach((t) => {
				if (t.language_code == AD.lang.currentLanguage) {
					found = t;
				}
			})

			assert.isOk(found, ' --> found a translation entry for the current language');
			assert.equal(found.field1, currObj.field1, ' --> field was updated properly');
			assert.equal(found.field2, currObj.field2, ' --> field was updated properly');
			assert.notEqual(found.field3, currObj.field3, ' --> field was NOT updated');

		})

		// it should create a new entry when current language is new
		it('should update an existing translation entry', () =>{
			var currObj = _.clone(testObj);

			currObj.field1 = 'X';
			currObj.field2 = 'Y';
			currObj.field3 = 'Z';  // trick!  don't update this translation

			var defaultLang = AD.lang.currentLanguage;
			AD.lang.currentLanguage = 'zz';		// switch to unknown language

			OP.Multilingual.unTranslate(currObj, currObj, fields);
			
			assert.property(currObj, 'translations', ' --> translations array created');
			assert.isArray(currObj.translations, ' --> translations is an array');
			
			var found = false
			currObj.translations.forEach((t) => {
				if (t.language_code == AD.lang.currentLanguage) {
					found = t;
				}
			})

			assert.isOk(found, ' --> found a translation entry for the current language');
			assert.equal(found.field1, currObj.field1, ' --> field was updated properly');
			assert.equal(found.field2, currObj.field2, ' --> field was updated properly');
			assert.notProperty(found, 'field3', ' --> non entries in fields array not created');


			AD.lang.currentLanguage = defaultLang;

			//
			// verify we did not update the 'en' entry.
			//
			var found = false
			currObj.translations.forEach((t) => {
				if (t.language_code == AD.lang.currentLanguage) {
					found = t;
				}
			})

			assert.isOk(found, ' --> found a translation entry for the current language');
			assert.notEqual(found.field1, currObj.field1, ' --> field was not updated ');
			assert.notEqual(found.field2, currObj.field2, ' --> field was not updated ');
		})

	});

});