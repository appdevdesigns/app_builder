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
			editArea: this.unique('editArea'),
			editAreaContainer: this.unique('editAreaContainer'),
			editAreaLeft: this.unique('editAreaLeft'),
			editAreaRight: this.unique('editAreaRight'),
			editAreaTop: this.unique('editAreaTop'),
			editAreaBottom: this.unique('editAreaBottom'),
			editAreaSamplePopup: this.unique('editAreaSamplePopup')
		};


		// webix UI definition:
		this.ui = {
			view: 'scrollview',
			id: ids.component,
			body: {
				cols: [
					{
						id: ids.editAreaLeft,
						width: 1
					},
					{
						id: ids.editAreaContainer,
						type: "clean",
						rows: [
							{
								id: ids.editAreaTop,
								height: 1
							},
							{
								id: ids.editAreaSamplePopup,
								view: "toolbar",
								css: "webix_dark",
								hidden: true,
								cols: [
									{},
									{
										view: "label",
										label: "Sample Popup"
									},
									{}
								]
							},
							{
								// view:'template',
								view: 'layout',
								id: ids.editArea,
								borderless: true,
								rows: [],
								// template:'[edit Area]'
							},
							{
								id: ids.editAreaBottom,
								height: 1
							}
						]
					},
					{
						id: ids.editAreaRight,
						width: 1
					}
				]
			}
		};

		var CurrentView = null;
		var CurrentViewMode = 1; // preview mode by default

		// setting up UI
		this.init = function () {

			let EditArea = $$(ids.editArea);
			if (EditArea)
				webix.extend(EditArea, webix.ProgressBar);

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
					console.log(CurrentView);
					if (CurrentView.settings.type == "popup" && CurrentView.settings.popupWidth && CurrentView.settings.popupHeight) {
						$$(ids.editAreaContainer).define({width: parseInt(CurrentView.settings.popupWidth)});
						$$(ids.editArea).define({height: parseInt(CurrentView.settings.popupHeight)});
						webix.html.addCss($$(ids.editAreaLeft).getNode(), "preview_item");
						webix.html.addCss($$(ids.editAreaRight).getNode(), "preview_item");
						webix.html.addCss($$(ids.editAreaTop).getNode(), "preview_item");
						webix.html.addCss($$(ids.editAreaBottom).getNode(), "preview_item");
						$$(ids.editAreaLeft).define({width: 0});
						$$(ids.editAreaRight).define({width: 0});
						$$(ids.editAreaTop).define({height: 0});
						$$(ids.editAreaBottom).define({height: 0});
						$$(ids.editAreaSamplePopup).show();
					} else if (CurrentView.settings.type == "page" && CurrentView.settings.fixedPageWidth == 1 && CurrentView.settings.pageWidth) {
						$$(ids.editAreaContainer).define({width: parseInt(CurrentView.settings.pageWidth)});
						$$(ids.editArea).define({height: 0});
						webix.html.removeCss($$(ids.editAreaLeft).getNode(), "preview_item");
						webix.html.removeCss($$(ids.editAreaRight).getNode(), "preview_item");
						webix.html.removeCss($$(ids.editAreaTop).getNode(), "preview_item");
						webix.html.removeCss($$(ids.editAreaBottom).getNode(), "preview_item");
						$$(ids.editAreaLeft).define({width: 0});
						$$(ids.editAreaRight).define({width: 0});
						$$(ids.editAreaTop).define({height: 1});
						$$(ids.editAreaBottom).define({height: 1});
						$$(ids.editAreaSamplePopup).hide();
					} else {
						$$(ids.editAreaContainer).define({width: 0});
						$$(ids.editArea).define({height: 0});
						webix.html.removeCss($$(ids.editAreaLeft).getNode(), "preview_item");
						webix.html.removeCss($$(ids.editAreaRight).getNode(), "preview_item");
						webix.html.removeCss($$(ids.editAreaTop).getNode(), "preview_item");
						webix.html.removeCss($$(ids.editAreaBottom).getNode(), "preview_item");
						$$(ids.editAreaLeft).define({width: 1});
						$$(ids.editAreaRight).define({width: 1});
						$$(ids.editAreaTop).define({height: 1});
						$$(ids.editAreaBottom).define({height: 1});
						$$(ids.editAreaSamplePopup).hide();
					}
				} else {
					editorComponent = view.editorComponent(App, "preview");
					$$(ids.editAreaContainer).define({width: 0});
					$$(ids.editArea).define({height: 0});
					webix.html.removeCss($$(ids.editAreaLeft).getNode(), "preview_item");
					webix.html.removeCss($$(ids.editAreaRight).getNode(), "preview_item");
					webix.html.removeCss($$(ids.editAreaTop).getNode(), "preview_item");
					webix.html.removeCss($$(ids.editAreaBottom).getNode(), "preview_item");
					$$(ids.editAreaLeft).define({width: 1});
					$$(ids.editAreaRight).define({width: 1});
					$$(ids.editAreaTop).define({height: 1});
					$$(ids.editAreaBottom).define({height: 1});
					$$(ids.editAreaSamplePopup).hide();
				}
				// editorComponent.ui.id = ids.editArea;
				// webix.ui(editorComponent.ui, $$(ids.editArea));
				$$(ids.editArea).addView(editorComponent.ui);
				editorComponent.init();

				if (editorComponent.onShow)
					editorComponent.onShow();

				setTimeout(() => {
					$$(ids.component).adjust();
					$$(ids.editAreaContainer).adjust();
				}, 250);

			},


			/* 
			* @method viewModeChange
			*
			*
			*/
			viewModeChange: function(viewMode) {

				CurrentViewMode = viewMode;

			},

			busy: () => {

				let EditArea = $$(ids.editArea);
				if (EditArea) {

					EditArea.disable();

					if (EditArea.showProgress)
						EditArea.showProgress({ type: "icon" });

				}

			},

			ready: () => {

				let EditArea = $$(ids.editArea);
				if (EditArea) {

					EditArea.enable();

					if (EditArea.hideProgress)
						EditArea.hideProgress();

				}

			}

		};


		// Expose any globally accessible Actions:
		this.actions({
		});


		// Interface methods for parent component:
		this.show = _logic.show;
		this.viewLoad = _logic.viewLoad;
		this.viewModeChange = _logic.viewModeChange;

		this.busy = _logic.busy;
		this.ready = _logic.ready;

	}

}