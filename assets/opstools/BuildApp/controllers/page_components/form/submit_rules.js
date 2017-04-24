steal(function () {
	var componentIds = {
		submitRuleList: 'ab-form-new-submit-rule'
	};

	function getNewRoleTemplate() {
		return {
			view: 'accordionitem',
			header: "Rule - Show a confirmation message",
			body: {
				view: 'layout',
				rows: [
					{
						label: 'Action',
						labelWidth: 80,
						view: 'select',
						value: 1,
						options: [
							{ "id": "confirm_message", "value": "Show a confirmation message" },
							{ "id": "parent_page", "value": "Redirect to the parent page" },
							{ "id": "exists_page", "value": "Redirect to an existing page" }
						],
						on: {
							onChange: function (newVal, oldVal) {
								var self = this;
								var confirmText = self.getParentView().getChildViews()[2];
								var existsPages = self.getParentView().getChildViews()[3];

								switch (newVal) {
									case "confirm_message":
										confirmText.show();
										existsPages.hide();
										break;
									case "parent_page":
										confirmText.hide();
										existsPages.hide();
										break;
									case "exists_page":
										confirmText.hide();
										existsPages.show();
										break;
								}

								var selectedOpt = self.config.options.filter(function (opt) { return opt.id == newVal })[0];
								self.getParentView().getParentView().define('header', function () { return 'Rule - {option}'.replace('{option}', selectedOpt.value); });
								self.getParentView().getParentView().refresh();
							}
						}
					},
					{
						cols: [
							{
								view: 'label',
								label: 'When',
								width: 80,
								css: {
									'font-weight': 'bold',
									'padding-left': '4px'
								}
							},
							{
								css: {
									'background-color': '#F0F1F3'
								},
								rows: [getWhenTemplate()]
							}
						]
					},
					// Confirm message
					{
						label: 'Message',
						labelWidth: 80,
						height: 60,
						view: 'textarea'
					},
					// Redirect to an existing page
					{
						view: 'richselect',
						label: 'Page',
						hidden: true,
						labelWidth: 80,
						options: [
							{
								id: 1,
								value: 'test'
							}
						]
					},

					{
						cols: [
							{},
							{
								view: 'button',
								width: 130,
								label: 'Delete this rule',
								click: function () {
									var ruleView = this.getParentView().getParentView().getParentView();

									$$(componentIds.submitRuleList).removeView(ruleView.config.id);
								}
							}
						]
					}
				]
			}
		};
	}

	function getWhenTemplate() {
		return {
			cols: [
				{
					view: 'richselect',
					options: [
						{ id: 1, value: 'Name' },
						{ id: 2, value: 'Age' }
					]
				},
				{
					view: 'richselect',
					options: [
						{ value: 'contains' },
						{ value: 'does not contain' },
						{ value: 'is' },
						{ value: 'is not' },
						{ value: 'starts with' },
						{ value: 'end with' },
						{ value: 'is blank' },
						{ value: 'is not blank' }
					]
				},
				{
					view: 'text'
				},
				{
					view: "button",
					type: "icon",
					icon: "plus",
					width: 30,
					click: function () {
						var whenItem = this.getParentView(),
							whenContainer = whenItem.getParentView();

						whenContainer.addView(getWhenTemplate());
					}
				},
				{
					view: "button",
					type: "icon",
					icon: "minus",
					width: 30,
					click: function () {
						var whenItem = this.getParentView(),
							whenContainer = whenItem.getParentView();

						whenContainer.removeView(whenItem.config.id);

						// There has always 1 item 
						if (whenContainer.getChildViews().length < 1) {
							whenContainer.addView(getWhenTemplate());
						}
					}
				}
			]
		};
	}

	var submit_rules_tab = function (formComponent) {
		var self = this;

		self.getEditView = function () {
			return {
				rows: [
					{
						id: componentIds.submitRuleList,
						view: "accordion",
						css: 'ab-scroll-y white-bg',
						paddingX: 12,
						rows: [getNewRoleTemplate()],
						height: 230
					},
					{
						cols: [
							{},
							{
								view: 'button',
								label: 'Add a new role',
								width: 300,
								click: function () {
									var newRole = getNewRoleTemplate();

									$$(componentIds.submitRuleList).addView(newRole);
								}
							}
						]
					}
				]
			};
		};

		self.getPropertyView = function (componentManager) {
			return {
				view: 'property'
			};
		};

		self.getSettings = function () {
			return {};
		};

		self.resize = function (height) {
			if ($$(componentIds.submitRuleList)) {
				$$(componentIds.submitRuleList).define('height', height - 240);
				$$(componentIds.submitRuleList).resize();
			}
		};

		return self;
	}

	return submit_rules_tab;
});