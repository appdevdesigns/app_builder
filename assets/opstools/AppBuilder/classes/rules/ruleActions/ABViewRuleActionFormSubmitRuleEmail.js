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


		this.queryObject = null;  // the object this Action is tied to.

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

		if (this.queryObject) {
			this.queryObject.fields().forEach((f) => {

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
			popup: idBase + 'popup',
			list: idBase + 'fieldList',
			toEmailsContainer: idBase + 'toEmailsContainer',
			toEmails: idBase + 'toEmails',
			message: idBase + 'message'
		};

		this._ui = {
			ui: {
				id: ids.form,
				view: 'form',
				width: 450,
				elementsConfig: {
					labelPosition: "top",
					labelWidth: 100
				},
				cols: [
					// email form
					{
						width: 330,
						rows: [
							{
								view: 'text',
								name: 'fromName',
								label: 'From Name'
							},
							{
								view: 'text',
								name: 'fromEmail',
								label: 'From Email',
								validate: webix.rules.isEmail,
								on: {
									onChange: function (newVal, oldVal) {

										if (this.getValue() && !this.validate()) {
											$$(ids.form).markInvalid('fromEmail', 'Email is invalid');
										}
										else {
											$$(ids.form).markInvalid('fromEmail', false);
										}

									}
								}
							},
							{
								id: ids.toEmailsContainer,
								view: 'forminput',
								name: 'toEmails',
								label: 'Send',
								css: "ab-rich-text",
								width: 320,
								body: {
									width: 320,
									rows: [
										{
											height: 25
										},
										{
											id: ids.toEmails,
											width: 320,
											view: 'layout',
											rows: []
										},
										{
											view: "button",
											type: "icon",
											icon: "plus",
											label: "Add a recipient",
											width: 150,
											click: () => {
												_logic.toEmailAdd();
											}
										}
									]
								}
							},
							{
								view: 'text',
								name: 'subject',
								label: 'Subject'
							},
							{
								view: 'label',
								label: 'Message',
								css: { 'font-weight': 'bold' }
							},
							{
								view: 'forminput',
								id: ids.message,
								name: 'message',
								label: 'Message',
								css: "ab-rich-text",
								width: 320,
								height: 400,
								body: {
									view: 'tinymce-editor'
								}
							}
						]
					},
					// field list
					{
						rows: [
							{
								view: "template",
								type: "header",
								template: "Fields"
							},
							{
								id: ids.list,
								view: 'list',
								width: 120,
								css: { 'background-color': '#fff !important;' },
								template: function (obj, common) {
									return _logic.fieldTemplate(obj, common);
								},
								on: {
									onItemClick: function (id, e, node) {
										var component = this.getItem(id);

										_logic.enterField(component);
									}
								}
							}
						]
					}
				]
			},

			init: () => {

				$$(ids.list).parse(this.queryObject.fields(f => f.fieldUseAsLabel()));
				$$(ids.list).refresh();

				_logic.refreshUI();

			},

			_logic: _logic,

			fromSettings: (valueRules) => { _logic.fromSettings(valueRules); },
			toSettings: () => { return _logic.toSettings() },

		}

		var _logic = {

			fromSettings: (valueRules) => {

				valueRules = valueRules || {};

				$$(ids.form).setValues(valueRules);

				// Populate recipients
				var recipients = valueRules.toEmails || [];
				recipients.forEach((r) => {
					_logic.toEmailAdd(r.type, r.email);
				});

				_logic.refreshUI();

			},

			toSettings: () => {

				var formVals = $$(ids.form).getValues() || {};

				// Get recipients
				var recipients = [];
				$$(ids.toEmails).getChildViews().forEach(e => {

					var type = e.queryView({ name: 'type' }).getValue();
					var email = e.queryView({ name: 'email' }).getValue();

					recipients.push({
						type: type,
						email: email
					});

				});

				// return the confirm message
				return {
					fromName: formVals['fromName'],
					fromEmail: formVals['fromEmail'],
					toEmails: recipients,
					subject: formVals['subject'],
					message: formVals['message']
				};
			},

			toEmailTemplate: (type, email) => {

				return {
					width: 320,
					cols: [
						{
							view: 'richselect',
							name: 'type',
							value: type || 'to',
							width: 80,
							options: [
								{ id: 'to', value: "To:" },
								// EmailNotification does not support cc, bcc and reply.
								// { id: 'cc', value: "Cc:" },
								// { id: 'bcc', value: "Bcc:" },
								// { id: 'reply', value: "Reply-To:" }
							]
						},
						{
							view: 'text',
							name: 'email',
							value: email || '',
							validate: webix.rules.isEmail,
							width: 200,
							on: {
								onChange: function (newVal, oldVal) {

									_logic.toEmailValidate();
								}
							}
						},
						{
							view: "button",
							type: "icon",
							icon: "trash-o",
							width: 32,
							click: function () {

								var $toView = this.getParentView();

								_logic.toEmailRemove($toView);
							}
						}
					]
				};

			},

			toEmailAdd: (type, email) => {

				var count = $$(ids.toEmails).getChildViews().length;

				$$(ids.toEmails).addView(_logic.toEmailTemplate(type, email), count);

				_logic.refreshUI();

			},

			toEmailRemove: ($toView) => {

				$$(ids.toEmails).removeView($toView);

				_logic.refreshUI();

			},

			toEmailValidate: () => {

				var isAllValid = true;


				$$(ids.toEmails).getChildViews().forEach((v) => {

					let emailText = v.queryView({ name: "email" });
					if (emailText.getValue() && !emailText.validate()) {
						isAllValid = false;
					}

				});

				if (isAllValid)
					$$(ids.form).markInvalid('toEmails', false);
				else
					$$(ids.form).markInvalid('toEmails', 'Email is invalid');

			},

			fieldTemplate: (field, common) => {
				return "<i class='fa fa-#icon# webix_icon_btn' aria-hidden='true'></i> #label#"
					.replace("#icon#", field.icon)
					.replace("#label#", field.label);
			},

			enterField: (field) => {

				var focusElem = webix.UIManager.getFocus();
				var val = "";

				if (focusElem.config.view != 'text') return;

				if (focusElem.getValue)
					val = focusElem.getValue();

				if (focusElem.setValue)
					focusElem.setValue(val + '{#label#}'.replace('#label#', field.label));

				webix.UIManager.setFocus(focusElem);

			},

			refreshUI: () => {
				$$(ids.toEmailsContainer).adjust();
				$$(ids.message).adjust();
			}

		};


		return this._ui;

	}


	// process
	// gets called when a form is submitted and the data passes the Query Builder Rules.
	// @param {obj} options - {
	//							data: {obj} rowData,
	//							form: {ABViewForm}
	//						}
	process(options) {

		return new Promise((resolve, reject) => {

			// If sender email is invalid
			if (!webix.rules.isEmail(this.valueRules.fromEmail)) {
				resolve();
				return;
			}

			var recipients = (this.valueRules.toEmails || [])
				// TODO: Cc, Bcc
				.map(r => r.email);

			// replace form value to template
			var fromName = this.valueRules.fromName,
				subject = this.valueRules.subject,
				message = this.valueRules.message;

			this.queryObject.fields(f => f.fieldUseAsLabel())
				.forEach(f => {

					var template = new RegExp('{' + f.columnName + '}', 'g'),
						data = f.format(options.data);

					fromName = fromName.replace(template, data);
					subject = subject.replace(template, data);
					message = message.replace(template, data);

				});

			// send a email
			OP.Comm.Service.post({
				url: "/app_builder/email",
				params: {
					fromName: fromName,
					fromEmail: this.valueRules.fromEmail,
					subject: subject,
					message: message,
					recipients: recipients
				}
			})
				.then(() => {

					resolve();

				})
				.catch(reject);

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
