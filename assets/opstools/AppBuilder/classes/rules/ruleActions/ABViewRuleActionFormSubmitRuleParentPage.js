//
// ABViewRuleActionFormSubmitRuleParentPage
//
//
//
const ABViewRuleAction = require("../ABViewRuleAction");


module.exports = class ABViewRuleActionFormSubmitRuleParentPage extends ABViewRuleAction {

	/**
	 * @param {object} App 
	 *      The shared App object that is created in OP.Component
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {

		super();
		var L = function (key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		this.App = App;
		this.key = 'ABViewRuleActionFormSubmitRuleParentPage';
		this.label = L('ab.component.ruleaction.abviewพuleActionFormSubmitRuleParentPage', '*Redirect to the parent page');


		this.currentObject = null;  // the object this Action is tied to.

		this.formRows = [];	// keep track of the Value Components being set
		// [
		//		{ fieldId: xxx, value:yyy, type:key['string', 'number', 'date',...]} 
		// ]

		// Labels for UI components
		var labels = this.labels = {
			// common: App.labels,
			component: {
			}
		};

	}


	conditionFields() {

		var fieldTypes = ['string', 'number', 'date'];

		var currFields = [];

		if (this.currentObject) {
			this.currentObject.fields().forEach((f) => {

				if (fieldTypes.indexOf(f.key) != -1) {

					// NOTE: the .id value must match the obj[.id]  in the data set
					// so if your object data looks like:
					// 	{
					//		name_first:'Neo',
					//		name_last: 'The One'
					//  },
					// then the ids should be:
					// { id:'name_first', value:'xxx', type:'string' }
					currFields.push({
						id: f.columnName,
						value: f.label,
						type: f.key
					});


				}
			})
		}

		return currFields;

	}


	// valueDisplayComponent
	// Return an ABView to display our values form.
	// 
	valueDisplayComponent(idBase) {


		this._ui = {
			ui: {
				view: 'label',
				label: this.label
			},

			init: () => {
			},

			_logic: _logic
		}

		var _logic = {
		};


		return this._ui;

	}


	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	process(options) {

		return new Promise((resolve, reject) => {

			var pageCurrent = options.form.pageParent();
			var pageParent = pageCurrent.pageParent();

			// redirect page
			options.form.changePage(pageParent.id);

			resolve();

		});

	}


}