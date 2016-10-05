steal(
	// List your Controller's dependencies here:
	'opstools/BuildApp/models/ABObject.js',
	'opstools/BuildApp/controllers/utils/ModelCreator.js',
	'opstools/BuildApp/controllers/utils/DataHelper.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control',
				'OpsPortal/classes/OpsWebixDataCollection').then(function () {

					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataCollectionHelper', {

						init: function (element, options) {
							var self = this;

							// Call parent init
							self._super(element, self.options);

							self.Model = {
								ABObject: AD.Model.get('opstools.BuildApp.ABObject')
							};

							self.data = {};
							self.data.dataCollections = {};

							self.initControllers();
						},

						initControllers: function () {
							var ModelCreator = AD.Control.get('opstools.BuildApp.ModelCreator'),
								DataHelper = AD.Control.get('opstools.BuildApp.DataHelper');

							this.controllers = {
								ModelCreator: new ModelCreator(),
								DataHelper: new DataHelper()
							};
						},

						setApp: function (app) {
							this.controllers.ModelCreator.setApp(app);
							this.controllers.DataHelper.setApp(app);
						},

						setObjectList: function (objectList) {
							this.controllers.DataHelper.setObjectList(objectList);
						},

						getDataCollection: function (objectId) {
							var self = this,
								q = $.Deferred();

							if (!objectId) {
								q.reject("Object id is required.");
								return;
							}

							if (!self.data.dataCollections[objectId]) {
								async.waterfall([
									// Get object info
									function (next) {
										self.Model.ABObject.findOne({ id: objectId })
											.fail(function (err) { next(err); })
											.then(function (objInfo) {
												next(null, objInfo);
											});
									},
									// Get object model
									function (objInfo, next) {
										self.controllers.ModelCreator.getModel(objInfo.attr('name'))
											.fail(function (err) { next(err); })
											.then(function (objectModel) {
												next(null, objInfo, objectModel);
											});
									},
									// Find data
									function (objInfo, objModel, next) {
										// Get link columns
										var linkCols = objInfo.columns.filter(function (col) { return col.linkObject != null }),
											linkColObjs = linkCols.map(function (col) {
												return {
													name: col.name,
													linkObject: col.linkObject
												};
											});

										// Get date & datetime columns
										var dateCols = objInfo.columns.filter(function (col) { return col.setting.editor === 'date' || col.setting.editor === 'datetime'; });

										objModel.findAll({})
											.fail(next)
											.then(function (data) {

												// Populate labels & Convert string to Date object
												self.controllers.DataHelper.normalizeData(data, linkColObjs, dateCols)
													.then(function (result) {
														if (!self.data.dataCollections[objectId])
															self.data.dataCollections[objectId] = AD.op.WebixDataCollection(result);

														next(null, self.data.dataCollections[objectId], linkColObjs, dateCols);
													});
											});
									},
									// Listen change data event to update data label
									function (dataCollection, linkColObjs, dateCols, next) {
										linkColObjs.forEach(function (linkCol) {
											dataCollection.AD.__list.bind('change', function (ev, attr, how, newVal, oldVal) {
												var attName = attr.indexOf('.') > -1 ? attr.split('.')[1] : attr, // 0.attrName
													hasUpdateLink = linkColObjs.filter(function (col) { return col.name == attName; }).length > 0;

												if (hasUpdateLink && newVal) {
													// Update connected data
													self.controllers.DataHelper.normalizeData(ev.target, linkColObjs, dateCols)
														.then(function (result) { });
												}
											});
										});

										next();
									}
								], function (err) {
									if (err) {
										q.reject(err);
										return;
									}

									q.resolve(self.data.dataCollections[objectId]);
								});
							}
							else {
								q.resolve(self.data.dataCollections[objectId]);
							}

							return q;
						}

					});

				});
		})
	}
);