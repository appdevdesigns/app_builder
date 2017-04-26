steal(function () {
	var componentIds = {
		propertyView: 'ab-form-submit-rules-property-view',

		submitRuleList: 'ab-form-new-submit-rule'
	};

	var submit_rules_tab = function () {
		var self = this;

		function getRuleTemplate(rule) {
			rule = rule || {};

			var pages = self.data.pages.attr ? self.data.pages.attr() : self.data.pages;
			pages = pages.map(function (p) {
				return {
					id: p.id,
					value: p.label
				};
			});

			var whenTemplates = [];
			if (rule.whens && rule.whens.length > 0) {
				rule.whens.forEach(function (when) {
					whenTemplates.push(getWhenTemplate(when));
				});
			}
			else {
				whenTemplates = [getWhenTemplate()];
			}

			var template = {
				view: 'accordionitem',
				header: "Rule",
				body: {
					view: 'layout',
					rows: [
						{
							label: 'Action',
							labelWidth: 80,
							view: 'select',
							value: rule.action || "confirm_message",
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
									rows: whenTemplates
								}
							]
						},
						// Confirm message
						{
							label: 'Message',
							labelWidth: 80,
							height: 60,
							view: 'textarea',
							value: rule.confirmMessage || ""
						},
						// Redirect to an existing page
						{
							view: 'richselect',
							label: 'Page',
							hidden: true,
							labelWidth: 80,
							value: rule.redirectPageId || '',
							options: pages
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

			return template;
		}

		function getWhenTemplate(when) {
			when = when || {};

			var columns = self.data.columns.attr ? self.data.columns.attr() : self.data.columns;
			columns = columns.map(function (col) {
				return {
					id: col.id,
					value: col.label
				};
			});

			return {
				cols: [
					{
						view: 'richselect',
						options: columns,
						value: when.columnId || ''
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
						],
						value: when.condition || ''
					},
					{
						view: 'text',
						value: when.compareValue || ''
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

		self.getEditView = function () {
			return {
				rows: [
					{
						id: componentIds.submitRuleList,
						view: "accordion",
						css: 'ab-scroll-y white-bg',
						paddingX: 12,
						rows: [],
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
									var newRole = getRuleTemplate();
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
				view: 'property',
				id: componentIds.propertyView,
				elements: []
			};
		};

		self.getSettings = function () {
			var submitRules = [];

			$$(componentIds.submitRuleList).getChildViews().forEach(function (ruleTemplate) {
				var ruleItem = ruleTemplate.getChildViews()[0];
				var rule = {};
				rule.action = ruleItem.getChildViews()[0].getValue();
				rule.confirmMessage = ruleItem.getChildViews()[2].getValue();
				rule.redirectPageId = ruleItem.getChildViews()[3].getValue();
				rule.whens = [];

				ruleItem.getChildViews()[1].getChildViews()[1].getChildViews().forEach(function (whenTemplate) {
					rule.whens.push({
						columnId: whenTemplate.getChildViews()[0].getValue(),
						condition: whenTemplate.getChildViews()[1].getValue(),
						compareValue: whenTemplate.getChildViews()[2].getValue()
					})

				});

				submitRules.push(rule);
			});

			return {
				submitRules: submitRules
			};
		};

		self.populateSettings = function (setting, showAll, additionalData) {
			self.data = additionalData;

			// Clear submit rule items
			var ruleItemIds = $$(componentIds.submitRuleList).getChildViews().map(function (item) { return item.config.id; });
			ruleItemIds.forEach(function (ruleId) {
				if ($$(ruleId))
					$$(componentIds.submitRuleList).removeView(ruleId);
			});

			// Render submit rule items
			if (setting && setting.submitRules && setting.submitRules.length > 0) {
				setting.submitRules.forEach(function (rule) {

					var ruleTemplate = getRuleTemplate(rule);

					$$(componentIds.submitRuleList).addView(ruleTemplate);
				});
			}
			else {
				var newRole = getRuleTemplate();
				$$(componentIds.submitRuleList).addView(newRole);
			}

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