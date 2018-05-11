//
// ABViewRuleActionFormSubmitRuleWebsite
//
//
//
import ABViewRuleAction from "../ABViewRuleAction"
import ABFieldConnect from "../../dataFields/ABFieldConnect"
import ABFieldEmail from "../../dataFields/ABFieldEmail"


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
								view: 'textarea',
								id: ids.message,
								name: 'message',
								label: 'Message',
								width: 320,
								height: 400
							}
							// {
							// 	view: 'label',
							// 	label: 'Message',
							// 	css: { 'font-weight': 'bold' }
							// },
							// {
							// 	view: 'forminput',
							// 	id: ids.message,
							// 	name: 'message',
							// 	label: 'Message',
							// 	css: "ab-rich-text",
							// 	width: 320,
							// 	height: 400,
							// 	body: {
							// 		view: 'tinymce-editor'
							// 	}
							// }
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

				if (this.queryObject) {
					$$(ids.list).parse(this.queryObject.fields(f => f.fieldUseAsLabel()));
					$$(ids.list).refresh();
				}

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
					_logic.toEmailAdd({
						type: r.type, // 'to', 'cc' or 'bcc'
						emailType: r.emailType,  // 'email' or 'field'
						value: r.value
					});
				});

				_logic.refreshUI();

			},

			toSettings: () => {

				var formVals = $$(ids.form).getValues() || {};

				// Get recipients
				var recipients = [];
				$$(ids.toEmails).getChildViews().forEach(e => {

					// var type = e.queryView({ name: 'type' }).getValue();
					var type = "to"; // TODO
					var emailType = e.queryView({ name: 'emailType' }).getValue();
					var value = e.queryView({ name: emailType }).getValue();

					recipients.push({
						type: type,
						emailType: emailType,
						value: value
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

			/**
			 * @method toEmailTemplate
			 * 
			 * @param settings - {
			 * 			type: string, // 'to', 'cc' or 'bcc'
			 * 			emailType: string, // 'email' or 'field'
			 * 			value: string
			 * }
			 */
			toEmailTemplate: (settings) => {

				settings = settings || {};

				return {
					width: 320,
					cols: [
						// {
						// 	view: 'richselect',
						// 	name: 'type',
						// 	value: settings.type || 'to',
						// 	width: 80,
						// 	options: [
						// 		{ id: 'to', value: "To:" },
						// 		// EmailNotification does not support cc, bcc and reply.
						// 		// { id: 'cc', value: "Cc:" },
						// 		// { id: 'bcc', value: "Bcc:" },
						// 		// { id: 'reply', value: "Reply-To:" }
						// 	]
						// },
						{
							view: 'richselect',
							name: 'emailType',
							value: settings.emailType || 'email',
							width: 150,
							options: [
								{ id: 'email', value: "a custom email address" },
								{ id: 'field', value: "an email field" },
							],
							on: {
								onChange: function (newVal, oldVal) {

									_logic.emailTypeChange(newVal, this);
								}
							}
						},
						{
							width: 150,
							name: 'emailValue',
							visibleBatch: settings.emailType || 'email',
							cols: [
								{
									view: 'text',
									name: 'email',
									batch: 'email',
									value: (settings.emailType == 'email' ? settings.value : ''),
									validate: webix.rules.isEmail,
									width: 150,
									on: {
										onChange: function (newVal, oldVal) {

											_logic.toEmailValidate();
										}
									}
								},
								{
									view: 'richselect',
									name: 'field',
									batch: 'field',
									value: (settings.emailType == 'field' ? settings.value : ''),
									options: _logic.emailFieldOptions(),
									width: 150
								},
							]
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

			toEmailAdd: (settings) => {

				var count = $$(ids.toEmails).getChildViews().length;

				$$(ids.toEmails).addView(_logic.toEmailTemplate(settings), count);

				_logic.refreshUI();

			},

			emailTypeChange: (type, $select) => {

				var $recipient = $select.getParentView();
				var $emailValue = $recipient.queryView({ name: 'emailValue' });

				if (type == 'field') {

					$emailValue.showBatch('field');

				}
				// type == 'email'
				else {

					$emailValue.showBatch('email');

				}

				$$(ids.toEmailsContainer).adjust();

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

			emailFieldOptions: () => {

				var existsObjIds = [this.queryObject.id];
				var options = [];

				var fnAddOptions = (currObj) => {

					var emailFields = currObj.fields(f => f instanceof ABFieldEmail).map(f => {
						return {
							id: f.urlPointer(), // field's url
							value: "{objLabel}.{fieldLabel}"
								.replace("{objLabel}", currObj.label)
								.replace("{fieldLabel}", f.label)
						};
					});

					// TODO: prevent duplicate

					options = options.concat(emailFields);


					currObj.connectFields().forEach(f => {

						// prevent looping
						if (// - prevent include connect objects of the base object
							this.queryObject.connectFields().filter(fConnect => fConnect.id != f.id && fConnect.datasourceLink.id == f.datasourceLink.id).length > 0 ||
							// - check duplicate include objects
							existsObjIds.indexOf(f.datasourceLink.id) > -1)
							return;

						// store
						existsObjIds.push(f.datasourceLink.id);

						// add email fields of link object
						fnAddOptions(f.datasourceLink);

					});

				};

				fnAddOptions(this.queryObject);

				return options;

			},

			enterField: (field) => {

				var focusElem = webix.UIManager.getFocus();
				var val = "";

				if (focusElem.config.view != 'text' ||
					focusElem.config.view != 'textarea') {

					if (focusElem.getValue)
						val = focusElem.getValue();

					if (focusElem.setValue)
						focusElem.setValue(val + '{#label#}'.replace('#label#', field.label));

					webix.UIManager.setFocus(focusElem);

				}

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

		// validate sender's email is invalid
		if (!webix.rules.isEmail(this.valueRules.fromEmail)) {
			return Promise.resolve();
		}

		var recipients = [];

		return Promise.resolve()
			.then(() => {

				// Pull recipients data
				return new Promise((resolve, reject) => {

					var tasks = [];

					this.valueRules.toEmails.forEach(rec => {

						tasks.push(new Promise((next, err) => {

							// TODO: Cc, Bcc

							// field
							if (rec.emailType == 'field') {

								var emailFieldUrl = rec.value;
								var emailField = this.queryObject.application.urlResolve(emailFieldUrl);
								if (emailField) {

									let linkedFields = this.queryObject.fields(f => f instanceof ABFieldConnect && f.settings.linkObject == emailField.object.id);
									linkedFields.forEach(f => {

										var linkedData = options.data[f.relationName()] || [];

										// convert to an array
										if (linkedData && !Array.isArray(linkedData))
											linkedData = [linkedData];

										// pull email address
										linkedData.forEach(d => {

											var email = d[emailField.columnName];
											if (email)
												recipients = recipients.concat(email);

										});

									});

									next();

									// var model = emailField.object.model();
									// model.findAll({
									// 	where: {
									// 		glue: 'and',
									// 		rules: [{
									// 			key: emailField.id,
									// 			rule: "is_not_null"
									// 		}]
									// 	}
									// })
									// 	.catch(err)
									// 	.then(result => {

									// 		var emails = result.data
									// 			.filter(d => d[emailField.columnName])
									// 			.map(d => d[emailField.columnName]);

									// 		recipients = recipients.concat(emails);

									// 		next();
									// 	});

								}
								else {
									next();
								}
							}
							// email
							else {
								recipients.push(rec.value);
								next();
							}

						}));

					});


					Promise.all(tasks)
						.catch(reject)
						.then(resolve);

				});
			})
			.then(() => {

				// send out
				return new Promise((resolve, reject) => {

					recipients = _.uniq(recipients).filter(r => r);

					if (!recipients || recipients.length < 1)
						return resolve();

					// replace form value to template
					var fromName = this.valueRules.fromName,
						subject = this.valueRules.subject,
						message = this.valueRules.message;

					this.queryObject.fields(f => f.fieldUseAsLabel())
						.forEach(f => {

							var template = new RegExp('{' + f.label + '}', 'g'),
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
							recipients: _.uniq(recipients)
						}
					})
						.then(() => {

							resolve();

						})
						.catch(reject);
				});

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
