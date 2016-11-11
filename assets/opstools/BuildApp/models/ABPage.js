steal(
	'opstools/BuildApp/models/base/ABPage.js',

	'opstools/BuildApp/models/ABPageComponent.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABPage',
					{
						useSockets: true
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