const ABEmitter = require("./ABEmitter");

module.exports = class ABComponent extends ABEmitter {

	/**
	 * @param {object} App 
	 *      ?what is this?
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {
		super();

		var L = this.Label;

		if (!App) {
			App = {

				uuid: webix.uid(),

				/*
				 * actions:
				 * a hash of exposed application methods that are shared among our
				 * components, so one component can invoke an action that updates
				 * another component.
				 */
				actions: {

				},


				/*
				 * config
				 * webix configuration settings for our current browser
				 */
				config: OP.Config.config(),

				/*
				 * custom
				 * a collection of custom components for this App Instance.
				 */
				custom: {

				},

                /*
                 * Icons
                 * this will provide you with the list of avaialbe font awesome 4.7.0 icons to use in interface building
                 */
				icons: OP.Icons.icons,


				Label: L,


				/*
				 * labels
				 * a collection of labels that are common for the Application.
				 */
				labels: {
					add: L('ab.common.add', "*Add"),
					create: L('ab.common.create', "*Create"),
					"delete": L('ab.common.delete', "*Delete"),
					edit: L('ab.common.edit', "*Edit"),
					"export": L('ab.common.export', "*Export"),
					formName: L('ab.common.form.name', "*Name"),
					"import": L('ab.common.import', "*Import"),
					rename: L('ab.common.rename', "*Rename"),
					ok: L('ab.common.ok', "*Ok"),

					cancel: L('ab.common.cancel', "*Cancel"),
					save: L('ab.common.save', "*Save"),

					yes: L('ab.common.yes', "*Yes"),
					no: L('ab.common.no', "*No"),

					none: L('ab.common.none', "*None"),
					close: L('ab.common.close', "*Close"),

					default: L('ab.common.default', '*Default'),
					defaultPlaceholder: L('ab.common.defaultPlaceholder', '*Enter default value'),

					disable: L('ab.common.disable', '*Disable'),

					required: L('ab.common.required', '*Required'),
					unique: L('ab.common.unique', '*Unique'),

					invalidMessage: {
						required: L('ab.common.invalid_message.required', "*This field is required"),
					},

					createErrorMessage: L('ab.common.create.error', "*System could not create <b>{0}</b>."),
					createSuccessMessage: L('ab.common.create.success', "*<b>{0}</b> is created."),

					updateErrorMessage: L('ab.common.update.error', "*System could not update <b>{0}</b>."),
					updateSucessMessage: L('ab.common.update.success', "*<b>{0}</b> is updated."),

					deleteErrorMessage: L('ab.common.delete.error', "*System could not delete <b>{0}</b>."),
					deleteSuccessMessage: L('ab.common.delete.success', "*<b>{0}</b> is deleted."),

					renameErrorMessage: L('ab.common.rename.error', "*System could not rename <b>{0}</b>."),
					renameSuccessMessage: L('ab.common.rename.success', "*<b>{0}</b> is renamed."),


					// Data Field  common Property labels:
					dataFieldHeaderLabel: L('ab.dataField.common.headerLabel', '*Section Title'),
					dataFieldHeaderLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Section Name'),

					dataFieldLabel: L('ab.dataField.common.fieldLabel', '*Label'),
					dataFieldLabelPlaceholder: L('ab.dataField.common.fieldLabelPlaceholder', '*Label'),

					dataFieldColumnName: L('ab.dataField.common.columnName', '*Field Name'),
					dataFieldColumnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Database field name'),

					dataFieldShowIcon: L('ab.dataField.common.showIcon', '*show icon?'),

					componentDropZone: L('ab.common.componentDropZone', '*add widgets here')
				},

				/*
				 * unique()
				 * A function that returns a globally unique Key.
				 * @param {string} key   The key to modify and return.
				 * @return {string}
				 */
				unique: function (key) { return key + this.uuid; },

			}
		}

		// var componentManager = new CustomComponentManager();
		// componentManager.initComponents(App);

		this.App = App;

		this.idBase = idBase || '?idbase?';
	}


	actions(_actions) {
		if (_actions) {
			for (var a in _actions) {
				this.App.actions[a] = _actions[a];
			}
		}
	}


	Label(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}


	unique(key) {
		return this.App.unique(this.idBase + '_' + key);
	}


};