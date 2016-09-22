steal(
	// List your Controller's dependencies here:

	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/ad',
				'appdev/control/control').then(function () {
					// Namespacing conventions:
					// AD.Control.extend('[application].[controller]', [{ static },] {instance} );
					AD.Control.extend('opstools.BuildApp.DataHelper', {

						init: function (element, options) {
							this.data = {};

							this.options = AD.defaults({
							}, options);

							this._super(element, options);
						},

						setObjectList: function (objectList) {
							this.data.objectList = objectList;
						},

						populateData: function (data, linkFields, dateFields) {
							var self = this,
								result = data instanceof webix.DataCollection ? data.AD.__list : data;

							// Translate
							if (result.forEach) {
								result.forEach(function (r) {
									if (r.translate) r.translate();

									// Translate link fields
									linkFields.forEach(function (linkCol) {
										var colName = linkCol.id,
											linkObjModel = self.data.objectList.filter(function (obj) { return obj.id == (linkCol.linkObject.id || linkCol.linkObject) })[0];

										if (r.attr(colName)) {
											if (!r.attr(colName).forEach)
												r.attr(colName, new can.List([r[colName]])); // Convert to CAN list

											if (r.attr(colName).forEach) {
												r[colName].forEach(function (linkVal, index) {
													if (linkVal.translate) linkVal.translate();

													// Set data label
													linkVal.attr('dataLabel', linkObjModel.getDataLabel(linkVal.attr()));

													// FIX : CANjs attr to set nested value
													r.attr(colName + '.' + index, linkVal.attr());
												});
											}
										}

									});

									// Convert string to Date object
									if (dateFields && dateFields.length > 0) {
										dateFields.forEach(function (dateCol) {
											if (r[dateCol.id])
												r.attr(dateCol.id, new Date(r[dateCol.id]));
										});
									}
								});
							}
						}


					});
				})
		})
	}
);