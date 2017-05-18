describe('ab_work_object_list_popupEditMenu component', () => {

	var mockApp = OP.Component._newApp();
	var componentName = 'ab_work_object_list_popupEditMenu';
	var componentTarget;

	before(() => {
		OP.Component['ab'](mockApp);

		componentTarget = OP.Component[componentName](mockApp);

		// TODO: render UI function
		// buildHTML();

		// TODO: mock up parent dependencies
	});

	it('should exist component', () => {
		assert.isNotNull(componentTarget);
	});

	// UI test cases
	describe('UI testing', () => {

		it('should have ui setting', () => {
			assert.isNotNull(componentTarget.ui, "should have a ui property");
		});

		it("should be webix's popup", () => {
			assert.equal(componentTarget.ui.view, "popup");
		});

		it('should have 2 menu items', () => {
			let menuItems = componentTarget.ui.body.data;

			let labelRename = mockApp.labels.rename;
			let labelDelete = mockApp.labels['delete'];

			assert.equal(menuItems.length, 2);
			assert.equal(menuItems[0].command, labelRename, 'first menu item should be rename');
			assert.equal(menuItems[1].command, labelDelete, 'second menu item should be delete');
		});

		it('should have item click event', () => {
			var itemClickFn = componentTarget.ui.body.on.onItemClick;

			assert.isNotNull(itemClickFn, 'should have item click event');
		});

		it('should call _logic.onItemClick when a menu item is clicked', () => {
			var itemClickFn = componentTarget.ui.body.on.onItemClick;
			var spyLogicItemClick = chai.spy(componentTarget._logic.onItemClick);

			// Assume a menu item is clicked
			itemClickFn(null, null, { textContent: '' });

			// Assert _logic.onItemClick should be called in onItemClick of menu
			expect(spyLogicItemClick).to.have.been.called;
		});

	});


	describe('Init testing', () => {
		it('should have init function', () => {
			assert.isNotNull(componentTarget.init, "should have a init property");
		});

		it.skip('should create webix ui', () => {
			var spyWebixUi = chai.spy(webix.ui);

			// Call init
			componentTarget.init();

			// Should pass .ui to a parameter of webix.ui
			expect(spyWebixUi).to.have.been.called.with(componentTarget.ui, 'Should pass .ui to a parameter of webix.ui');
		});

	});

	describe('Actions testing', () => {
	});

	describe('Logic testing', () => {
	});



});