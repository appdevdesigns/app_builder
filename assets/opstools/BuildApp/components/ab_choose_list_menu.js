
/*
 * AB Choose List
 *
 * Display a list of Applications for the user to select.
 *
 */


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}



var labels = {

	application: {
		menu : L('ab.application.menu', "*Application Menu"),
		confirmDeleteTitle : L('ab.application.delete.title', "*Delete application"),
		confirmDeleteMessage : L('ab.application.delete.message', "*Do you want to delete <b>{0}</b>?")		
	}
}



OP.Component.extend('ab_choose_list_menu', function(App) {

	labels.common = App.labels.common;

	var id = {
		menu:App.unique('ab-app-list-menu')
	}

	var _ui = {
		view: "popup",
		id: id.menu,
		head: labels.application.menu,
		width: 100,
		body: {
			view: "list",
			data: [
				{ command: labels.common.edit, icon: "fa-pencil-square-o" },
				{ command: labels.common.delete, icon: "fa-trash" },
				{ command: labels.common.export, icon: "fa-download" }
			],
			datatype: "json",

			template: "<i class='fa #icon#' aria-hidden='true'></i> #command#",
			autoheight: true,
			select: false,
			on: {
				'onItemClick': function (timestamp, e, trg) {
					var selectedApp = App.actions.getSelectedApplication();

					switch (trg.textContent.trim()) {
						case labels.common.edit:
// TODO:
							App.actions.editApplication(selectedApp);
							break;

						case labels.common.delete:
							OP.Dialog.ConfirmDelete({
								title: labels.application.confirmDeleteTitle,
								text: labels.application.confirmDeleteMessage.replace('{0}', selectedApp.label),
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

					$$(id.menu).hide();
				}
			}
		}
	}



	var _data={};


	var _logic = {

		init: function() {
			
		}
		
	}

							

	return {
		ui: _ui,
		logic: _logic
	}
})
