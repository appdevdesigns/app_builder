steal(
	'opstools/BuildApp/models/base/ABApplication.js',

	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/models/ABPage.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABApplication',
					{
						useSockets: true
						/*
							findAll: 'GET /app_builder/abapplication',
							findOne: 'GET /app_builder/abapplication/{id}',
							create:  'POST /app_builder/abapplication',
							update:  'PUT /app_builder/abapplication/{id}',
							destroy: 'DELETE /app_builder/abapplication/{id}',
							describe: function() {},   // returns an object describing the Model definition
							fieldId: 'id',             // which field is the ID
							fieldLabel:'name'      // which field is considered the Label
						*/
					},
					{
						// Object
						getObjects: function (cond) {
							if (!cond) cond = {};
							cond.application = this.id;

							return AD.Model.get('opstools.BuildApp.ABObject').findAll(cond);
						},

						getObject: function (objId) {
							return AD.Model.get('opstools.BuildApp.ABObject').findOne({ application: this.id, id: objId });
						},

						createObject: function (obj) {
							var q = $.Deferred(),
								self = this;

							obj.application = this.id;
							AD.Model.get('opstools.BuildApp.ABObject').create(obj)
								.fail(q.reject)
								.then(function (result) {
									if (result.translate) result.translate();

									self.objects.push(result);

									q.resolve(result);
								});

							return q;
						},



						/**
						 * @function getApplicationPages
						 * return all ABPages (Root + 1st Child) of the current application
						 * useful for when components need to offer these as selection options.
						 * @return {deferred}
						 */
						getApplicationPages: function() {

							var err = null;

							// if our .pages looks like a proper array
							if ((this.pages) && (this.pages.filter)) {
								var currPage = this.pages.filter(function(p){ return !p.parent })[0];
								if (currPage) {
									return this.getPages({ or: [{ id: currPage.id }, { parent: currPage.id }] });
								} else {
									err = new Error('application.getApplicationPages(): no root page found!');
								}
							} else {
								err = new Error('application.getApplicationPages() called with no pages defined.');
							}

							// if we get here, then we have an error:
							var dfd = AD.sal.Deferred();
							dfd.reject(err);
							return dfd;
							
						},


						getAllApplicationPages:function() {
							var _this = this;

							var dfd = AD.sal.Deferred();

							var allPages = AD.Model.get('opstools.BuildApp.ABPage').List();
							var rootPage = this.pages.filter(function(p){ return !p.parent })[0];


							// a recursive method to gather the children of the 
							// given array of parent id's
							function recursiveGetChildren(aryIDs, cb) {

								// if there are ids to process:
								if (aryIDs.length) {

									// find any children:
									_this.getPages({ parent: aryIDs })
									.fail(cb)
									.then(function(newPages){

										if (newPages.length == 0) {
											// no new Pages, we're done
											cb(null);
										} else {

											var newIDs = [];
											newPages.forEach(function(p){
												allPages.push(p);	// store in our main []
												newIDs.push(p.id);
											})
											recursiveGetChildren(newIDs, cb);
										}
									})

								} else {

									// we're done.
									cb(null);
								}

							}


							// start with our root level pages:
							this.getApplicationPages()
							.fail(dfd.reject)
							.then(function(pages) {

								// assemble all Child page.ids ( not rootPage.id)
								var childIDs = [];
								pages.forEach(function(p){
									allPages.push(p);
									if (p.id != rootPage.id) {
										childIDs.push(p.id);
									}
								})

								recursiveGetChildren(childIDs, function(err){

									if (err) {
										dfd.reject(err);
									} else {
										// allPages have full list
										dfd.resolve(allPages);
									}

								})
							})



							return dfd;
						},


						// Page
						getPages: function (cond) {
							if (!cond) cond = {};
							cond.application = this.id;

							Object.keys(AD.Model.get('opstools.BuildApp.ABPage').store).forEach(function (storeKey) {
								var storePage = AD.Model.get('opstools.BuildApp.ABPage').store[storeKey];

								if (cond.application == storePage.application.id || storePage.application)
									delete AD.Model.get('opstools.BuildApp.ABPage').store[storeKey];
							});

							return AD.Model.get('opstools.BuildApp.ABPage').findAll(cond);
						},

						getPage: function (pageId) {
							if (AD.Model.get('opstools.BuildApp.ABPage').store[pageId])
								delete AD.Model.get('opstools.BuildApp.ABPage').store[pageId];

							return AD.Model.get('opstools.BuildApp.ABPage').findOne({ application: this.id, id: pageId });
						},

						createPage: function (page) {
							var q = $.Deferred(),
								self = this;

							page.application = self.id;
							AD.Model.get('opstools.BuildApp.ABPage').create(page)
								.fail(q.reject)
								.then(function (result) {
									if (result.translate) result.translate();

									self.pages.push(result);

									q.resolve(result);
								});

							return q;
						},

						// Permission
						getPermissions: function () {
							return AD.comm.service.get({ url: '/app_builder/' + this.id + '/role' });
						},

						createPermission: function () {
							return AD.comm.service.post({ url: '/app_builder/' + this.id + '/role' });
						},

						deletePermission: function () {
							return AD.comm.service.delete({ url: '/app_builder/' + this.id + '/role' });
						},

						// id: appId,
						// isApplicationRole: true
						assignPermissions: function (permItems) {
							return AD.comm.service.put({
								url: '/app_builder/' + this.id + '/role/assign',
								data: {
									roles: permItems
								}
							})
						}



					}
				);
			});
		});
	});