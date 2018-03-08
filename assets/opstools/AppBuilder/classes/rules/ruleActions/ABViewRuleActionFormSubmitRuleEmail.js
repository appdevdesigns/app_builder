//
// ABViewRuleActionFormSubmitRuleWebsite
//
//
//
import ABViewRuleAction from "../ABViewRuleAction"


export default class ABViewRuleActionFormSubmitRuleEmail extends ABViewRuleAction {

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
		this.key = 'ABViewRuleActionFormSubmitRuleEmail';
		this.label = L('ab.component.ruleaction.abviewruleActionFormSubmitRuleEmail', '*Send a custom email');


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

		var ids = {
			form: idBase + 'form',
		};

		this._ui = {
			ui: {
				id: ids.form,
				view: 'form',
				elements: [
					{
						view: 'text',
						label: 'From Name', 
						labelWidth: 100
					},
					{
						view: 'text',
						label: 'From Email',
						labelWidth: 100
					},
					{
						view: 'text',
						label: 'Subject',
						labelWidth: 100
					},
					{
						view: 'forminput',
						label: 'Message',
						css: "ab-rich-text",
						labelWidth: 100,
						height: 200,
						body: {
							view: 'tinymce-editor'
						}
					}
				]
			},

			init: () => {
			},

			_logic: _logic,

			fromSettings: (valueRules) => { _logic.fromSettings(valueRules); },
			toSettings: () => { return _logic.toSettings() },

		}

		var _logic = {

			fromSettings: (valueRules) => {

				valueRules = valueRules || {};

				$$(ids.website).setValue(valueRules.website || '');

			},

			toSettings: () => {

				// return the confirm message
				return {
					website: $$(ids.website).getValue() || ''
				}

			}
		};


		return this._ui;

	}


	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options
	process(options) {

		return new Promise((resolve, reject) => {

			// TODO: send a email


			resolve();

		});

	}


	// fromSettings
	// initialize this Action from a given set of setting values.
	// @param {obj}  settings
	fromSettings(settings) {
		settings = settings || {};
		super.fromSettings(settings); // let the parent handle the QB


		// if we have a display component, then populate it:
		if (this._ui) {

			// now we handle our valueRules:{} object settings.
			// pass the settings off to our DisplayList component:
			this._ui.fromSettings(settings.valueRules);
		}
	}


	// toSettings
	// return an object that represents the current state of this Action
	// @return {obj}
	toSettings() {

		// settings: {
		//	message:''
		// }

		// let our parent store our QB settings
		var settings = super.toSettings();

		settings.valueRules = this._ui.toSettings();

		return settings;
	}


}
