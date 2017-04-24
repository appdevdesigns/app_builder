steal(function () {
	var componentIds = {
		submitRuleList: 'ab-form-new-submit-rule'
	};

	function getNewRoleTemplate(name) {
		return {
			view: 'accordionitem',
			header: name || 'Role',
			body: {
				view: 'layout',
				rows: [

					{
						label: 'Action',
						labelWidth: 80,
						view: 'select',
						value: 1,
						options: [
							{ "id": 1, "value": "Show a confirmation message" },
							{ "id": 2, "value": "Redirect to the parent page" },
							{ "id": 3, "value": "Redirect to an existing page" },
							{ "id": 4, "value": "Redirect to another website URL" }
						]
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
								css: { 'background-color': '#DDDDDD' },
								rows: [
									{
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
												width: 30
											},
											{
												view: "button",
												type: "icon",
												icon: "minus",
												width: 30
											}
										]
									}
								]
							}
						]
					},
					// Confirm message
					{
						label: 'Message',
						labelWidth: 80,
						view: 'textarea'
					},
					// // Redirect to an existing page
					// {
					// 	view: 'richselect',
					// 	label: 'Page',
					// 	labelWidth: 80,
					// 	options: [
					// 		{
					// 			id: 1,
					// 			value: 'test'
					// 		}
					// 	]
					// },
					// // Redirect to website URL
					// {
					// 	view: 'text',
					// 	label: 'Redirect',
					// 	labelWidth: 80
					// },

					{
						cols: [
							{},
							{
								view: 'button',
								width: 130,
								label: 'Delete this role'
							}
						]
					}
				]
			}
		};
	}

	var submit_rules_tab = function () {
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