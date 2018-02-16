export default class AB_Work_Interface_Workspace_Editor_Layout extends OP.Component {

	constructor(App) {
		super(App, 'ab_work_interface_workspace_editor_layout');
		var L = this.Label;

		var labels = {
			common: App.labels,
			component: {
				// formHeader: L('ab.application.form.header', "*Application Info"),
			}
		};


		// internal list of Webix IDs to reference our UI components.
		var ids = {
			
			component: this.unique('component'),
			editArea: this.unique('editArea')

		};


		// webix UI definition:
		this.ui = {
			view: 'scrollview',
			id: ids.component,
			body: {
				rows: [
					{
						// view:'template',
						view: 'layout',
						id: ids.editArea,
						rows: [],
						// template:'[edit Area]'							
					}
				]
			}
		};

		var CurrentView = null;
		var CurrentViewMode = 1; // preview mode by default

		// setting up UI
		this.init = function () {
		};


		// internal business logic 
		var _logic = this.logic = {


			/**
             * @function show()
             *
             * Show this component.
             */
			show: function () {
				$$(ids.component).show();
			},


			/* 
			* @method viewLoad
			* A new View has been selected for editing, so update
			* our interface with the details for this View.
			* @param {ABView} view  current view instance.
			*/
			viewLoad: function (view) {

				CurrentView = view;

				// clear edit area
				$$(ids.editArea).getChildViews().forEach((childView) => {

					if ($$(ids.editArea).removeView)
						$$(ids.editArea).removeView(childView);

				});

				// load the component's editor in our editArea
				var editorComponent;
				if (CurrentViewMode == "preview") {
					editorComponent = view.component(App);
				} else {
					editorComponent = view.editorComponent(App, "preview");
				}
				// editorComponent.ui.id = ids.editArea;
				// webix.ui(editorComponent.ui, $$(ids.editArea));
				$$(ids.editArea).addView(editorComponent.ui);
				editorComponent.init();

				if (editorComponent.onShow)
					editorComponent.onShow();

			},


			/* 
			* @method viewModeChange
			*
			*
			*/
			viewModeChange: function(viewMode) {

				CurrentViewMode = viewMode;

			}

		};


		// Expose any globally accessible Actions:
		this.actions({
		});


		// Interface methods for parent component:
		this.show = _logic.show;
		this.viewLoad = _logic.viewLoad;
		this.viewModeChange = _logic.viewModeChange;

	}

}