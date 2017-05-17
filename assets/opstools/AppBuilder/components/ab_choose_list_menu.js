
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */


export default class ABChooseList extends OP.Component {   // (idBase, function(App) {

	constructor(App) {
		super(App, 'ab_choose_list_menu');

		var L = this.Label;

		var labels = {

			common: App.labels,

			component: {
				menu : L('ab.application.menu', "*Application Menu"),
				confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
				confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")
			}
		}


		var ids = {
			component:this.unique('menu')
		}


		this.ui = {
			view: "popup",
			id: ids.component,
			head: labels.component.menu,
			width: 100,
			body: {
				view: "list",
				borderless: true,
				data: [
					{ command: labels.common.edit, icon: "fa-pencil-square-o" },
					{ command: labels.common.export, icon: "fa-download" },
					{ command: labels.common.delete, icon: "fa-trash" }
				],
				datatype: "json",

				template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
				autoheight: true,
				select: false,
				on: {
					'onItemClick': function (timestamp, e, trg) {
						return _logic.onItemClick(timestamp, e, trg);
					}
				}
			}
		}



		this.init = function() {
			
			// we are a popup, so create our webix.ui():
			webix.ui(this.ui);
			$$(ids.component).hide();  // hidden by default
		}



		var _logic = {


			/**
			 * @function onItemClick
			 * process which item in our popup was selected.
			 */
			onItemClick: function( timestamp, e, trg) {

				// hide our popup before we trigger any other possible UI animation: (like .edit)
				// NOTE: if the UI is animating another component, and we do .hide()
				// while it is in progress, the UI will glitch and give the user whiplash.
				$$(ids.component).hide();

				var selectedApp = App.actions.getSelectedApplication();

				switch (trg.textContent.trim()) {
					case labels.common.edit:
						App.actions.transitionApplicationForm(selectedApp);
						break;

					case labels.common.delete:
						OP.Dialog.ConfirmDelete({
							title: labels.component.confirmDeleteTitle,
							text: labels.component.confirmDeleteMessage.replace('{0}', selectedApp.label),
							callback: function (result) {

								if (!result) return;

								App.actions.deleteApplication(selectedApp);									
							}
						})
						break;

					case labels.common.export:
						// Download the JSON file to disk
						window.location.assign('/app_builder/appJSON/' + selectedApp.id + '?download=1');
						break;
				}
				
				return false;
			}

		}
		this._logic = _logic;


		// expose a .show() method for this popup
		this.show = function(node) {
			$$(ids.component).show(node);
		}

	}

}
