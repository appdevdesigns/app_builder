

export default class ABViewFormPropertyRecordRule extends OP.Component {

	/**
	 * @param {object} App 
	 *      ?what is this?
	 * @param {string} idBase
	 *      Identifier for this component
	 */
	constructor(App, idBase) {
		super(App, idBase);
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
			}
		};

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: this.unique('component'),
		};

		// webix UI definition:
		this.ui = {
			view: "window",
			id: ids.component,
			modal: true,
			position: "center",
			resize: true,
			width: 700,
			height: 450,
			css: 'ab-main-container',
			head: {
				view: "toolbar",
				cols: [
					{ view: "label", label: L("ab.component.form.recordrule", "*Record Rules") },
					{
						view: "button", label: "Close", width: 100, align: "right",
						click: function () {

							_logic.hide();

						}
					}
				]
			},
			body: {
				view: "scrollview",
				scroll: true,
				body: {

				}
			}
		};

		var _currentObject = null;

		// for setting up UI
		this.init = (options) => {
			// register callbacks:
			for (var c in _logic.callbacks) {
				_logic.callbacks[c] = options[c] || _logic.callbacks[c];
			}

			webix.ui(this.ui);

			// webix.extend($$(ids.list), webix.ProgressBar);
		};



		// internal business logic 
		var _logic = this._logic = {

			buttonCancel: function () {
				$$(ids.component).hide();
			},

			buttonSave: function () {
			},

			callbacks: {
				onCancel: function () { console.warn('NO onCancel()!') },
				onSave: function (field) { console.warn('NO onSave()!') },
			},

			hide: function () {
				$$(ids.component).hide();
			},

			show: function () {
				$$(ids.component).show();
			},

			objectLoad: function (object) {
				_currentObject = object;
			}

		};



		// Expose any globally accessible Actions:
		this.actions({
		});

		this.objectLoad = _logic.objectLoad;
		this.show = _logic.show;

	}

}