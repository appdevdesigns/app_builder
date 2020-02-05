const ABComponent = require("../classes/platform/ABComponent");
const AB_Admin_Role = require('./ab_admin_role');
const AB_Admin_User = require('./ab_admin_user');

module.exports = class ABChoose extends ABComponent {

	constructor(App) {
		super(App, 'ab_admin');

		let L = this.Label;
		let labels = {
			common: App.labels,
			component: {
				backToApplication: L('ab.application.backToApplication', "*Back to Applications page"),
				administration: L('ab.application.administration', "*Administration"),
			}
		}

		let ids = {
			component: this.unique('component'),
			toolbar: this.unique('toolbar'),
		}


		// Define the external components used in this Component:
		let AppRole = new AB_Admin_Role(App);
		let AppUser = new AB_Admin_User(App);

		this.ui = {
			id: ids.component,
			rows: [
				{
					view: "toolbar",
					id: ids.toolbar,
					autowidth: true,
					elements: [
						{
							view: "button",
							label: labels.component.backToApplication,
							autowidth: true,
							align: "left",
							type: "icon",
							icon: "fa fa-arrow-left",
							align: "left",
							click: function () {
								App.actions.transitionApplicationChooser();
							}
						},
						{},
						{
							view: "label",
							css: "appTitle",
							align: "center",
							label: labels.component.administration
						},
						{}
					]
				},
				{
					cols: [
						{
							view: "list",
							template: '<span class="fa #icon#"></span> #value#',
							data: [
								{
									id: AppRole.ui.id,
									icon: "fa-user-md",
									value: "Roles"
								},
								{
									id: AppUser.ui.id,
									icon: "fa-users",
									value: "Users"
								}
							],
							width: 120,
							select: true,
							scroll: false,
							on: {
								onAfterSelect: function (id) {
									webix.$$(id).show();
								}
							},
							ready: function () {
								this.select(this.getFirstId());
							}
						},
						{
							view: "multiview",
							animate: false,
							cells: [
								AppRole.ui,
								AppUser.ui
							]
						}
					]
				}
			]
		};


		// This component's Init definition:
		this.init = function () {

			AppRole.init();
			AppUser.init();
		}

		let _logic = {

			show: () => {

				if ($$(ids.component))
					$$(ids.component).show();

				AppRole.show();

			}

		}

		this.actions({
			transitionAdministration: _logic.show
		});


		this._logic = _logic;

	}

};