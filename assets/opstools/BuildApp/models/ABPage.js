steal(
	'opstools/BuildApp/controllers/page_components/componentManager.js',
	'opstools/BuildApp/controllers/utils/DataCollectionHelper.js',

	'opstools/BuildApp/models/base/ABPage.js',
	'opstools/BuildApp/models/ABPageComponent.js',

	function (componentManager, dataCollectionHelper) {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				function unique() {
					var args = Array.prototype.slice.call(arguments); // Convert to Array
					return args.join('_');
				}

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABPage',
					{
						// useSockets: true
						/*
							findAll: 'GET /app_builder/abpage',
							findOne: 'GET /app_builder/abpage/{id}',
							create:  'POST /app_builder/abpage',
							update:  'PUT /app_builder/abpage/{id}',
							destroy: 'DELETE /app_builder/abpage/{id}',
							describe: function() {},   // returns an object describing the Model definition
							fieldId: 'id',             // which field is the ID
							fieldLabel:'title'      // which field is considered the Label
						*/
					},
					{
						getItemTemplate: function () {
							var page = this,
								comTemplate = '';

							if (page.components.sort)
								page.components.sort(function (a, b) { return a.weight - b.weight });

							page.components.forEach(function (item) {
								item.domID = unique('ab_live_item', page.id, item.id);

								comTemplate += '<div id="#domID#"></div>'.replace('#domID#', item.domID);
								comTemplate += '<div style="height: 30px;"></div>'; // Gap between components
							});

							return comTemplate;
						},

						display: function (application) {
							var page = this,
								q = $.Deferred(),
								tasks = [];

							page.components.forEach(function (item) {
								tasks.push(function (next) {
									page.renderComponent(application, item).then(function () {
										next();
									}, next);
								});
							});

							async.series(tasks, function (err) {
								if (err)
									q.reject(err);
								else
									q.resolve();
							});

							return q;
						},

						renderComponent: function (application, item) {
							var page = this,
								q = $.Deferred(),
								componentInstance = componentManager.getComponent(item.component),
								view = componentInstance.getView(),
								viewId = unique('ab_live_item', page.id, item.id),
								setting = item.setting,
								dataCollection,
								linkedDataCollection;

							if (!page.comInstances) page.comInstances = {};

							if (page.comInstances[item.id]) {
								if (page.comInstances[item.id].onDisplay)
									page.comInstances[item.id].onDisplay();

								q.resolve(false); // return value is not a new component
								return q;
							}

							// Create component instance
							page.comInstances[item.id] = new componentInstance(
								application, // Current application
								viewId, // the view id
								item.id // the component data id
							);

							if (view && setting && $('#' + viewId).length > 0) {
								var setting = setting.attr ? setting.attr() : setting,
									editable = false,
									showAll = false;

								view = $.extend(true, {}, view);
								view.id = viewId;
								view.container = view.id;
								view.autowidth = true;

								$('#' + view.id).html('');

								webix.ui(view);

								async.series([
									// Get data collection
									function (next) {
										if (setting.object) {
											dataCollectionHelper.getDataCollection(application, setting.object)
												.then(function (result) {
													dataCollection = result;
													next();
												}, next);
										}
										else
											next();
									},
									// Get data collection of connected data
									function (next) {
										if (setting.linkedTo) {
											dataCollectionHelper.getDataCollection(application, setting.linkedTo)
												.then(function (result) {
													linkedDataCollection = result;
													next();
												}, next);
										}
										else
											next();
									},
									// Render component
									function (next) {
										page.comInstances[item.id].render(item.setting, editable, showAll, dataCollection, linkedDataCollection)
											.then(function () { next(); }, next);

									},
									// Update state on load
									function (next) {
										if (page.comInstances[item.id].onDisplay)
											page.comInstances[item.id].onDisplay();

										next();
									}
								], function (err) {
									if (err)
										q.reject(err);
									else
										q.resolve(true);
								});
							}
							else {
								q.resolve(true);
							}

							return q;
						},

						changeType: function (pageType) {
							if (pageType == 'page' || pageType == 'modal') {
								this.attr('type', pageType);
								return this.save();
							}
							else {
								var q = $.Deferred();
								q.reject('Invalid page type');
								return q;
							}
						},

						getComponents: function () {
							return AD.Model.get('opstools.BuildApp.ABPageComponent').findAll({ page: this.id });
						},
						createComponent: function (component) {
							component.page = this.id;
							return AD.Model.get('opstools.BuildApp.ABPageComponent').create(component);
						},
						sortComponents: function (data, cb) {
							return AD.comm.service.put({
								url: '/app_builder/page/sortComponents/' + this.id,
								data: {
									components: data
								}
							}, cb);
						},

						getTabs: function (cond) {
							if (!cond) cond = {};
							cond.parent = this.id;
							cond.type = 'tab';

							return AD.Model.get('opstools.BuildApp.ABPage').findAll(cond);
						},
						getTab: function (tabId) {
							if (!tabId) {
								var q = $.Deferred();
								q.resolve();
								return q;
							}

							return AD.Model.get('opstools.BuildApp.ABPage').findAll(
								{
									parent: this.id,
									id: tabId,
									type: 'tab'
								});
						},
						createTab: function (tab) {
							var self = this,
								q = $.Deferred();

							tab.parent = self.id;
							tab.application = self.application.id;
							tab.type = 'tab';

							AD.Model.get('opstools.BuildApp.ABPage').create(tab)
								.fail(q.reject)
								.then(function (result) {
									if (result.translate) result.translate();

									if (AD.classes.AppBuilder.currApp)
										AD.classes.AppBuilder.currApp.pages.push(result);

									q.resolve(result);
								});

							return q;
						}

					});
			});
		});
	});