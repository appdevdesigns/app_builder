steal(
	'opstools/BuildApp/models/base/ABColumn.js',

	'opstools/BuildApp/models/ABList.js',
	function () {
		System.import('appdev').then(function () {
			steal.import('appdev/model/model').then(function () {

				// Namespacing conventions:
				// AD.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
				AD.Model.extend('opstools.BuildApp.ABColumn',
					{
						useSockets: true,
						/*
							findAll: 'GET /app_builder/abcolumn',
							findOne: 'GET /app_builder/abcolumn/{id}',
							create:  'POST /app_builder/abcolumn',
							update:  'PUT /app_builder/abcolumn/{id}',
							destroy: 'DELETE /app_builder/abcolumn/{id}',
							describe: function() {},   // returns an object describing the Model definition
							fieldId: 'id',             // which field is the ID
							fieldLabel:'label'      // which field is considered the Label
						*/
						
						
                        /**
                         * Create an AppBuilder column entry. This is separate from building the
                         * generated app's model.
                         *
                         * Examples:
                         *     ABColumn.createColumn('number', { name: 'Population', object: 10 })
                         *     ABColumn.createColumn('string', { 
                         *         name: 'Hello', 
                         *         object: 11, 
                         *         language_code: 'zh-hans', 
                         *         label: '你好'
                         *     })
                         *     ABColumn.createColumn('number', { name: 'Price', object: 123, type: 'float', language_code: 'en' })
                         *     ABColumn.createColumn('text', { name: 'Description', object: 123 })
                         *     ABColumn.createColumn('list', {
                         *         name: 'Toppings',
                         *         object: 123,
                         *         weight: 3,
                         *         setting: {
                         *             options: [
                         *                 {dataId: 46, id: "Crushed peanuts"},
                         *                 {dataId: 47, id: "Pickled chili peppers"},
                         *                 {dataId: 48, id: "Ketchup"}
                         *             ]
                         *         }
                         *     })
                         *
                         * @param {string} type
                         *     One of the following: 
                         *         boolean, date, number, list, string, text,
                         *         attachment, image.
                         *
                         *     Default values for `data` will be populated based on this. 
                         *     See /api/services/data_fields/*.js
                         *
                         *     Note that this `type` parameter is different from `data.type` or
                         *     `data.fieldName` in some situations.
                         *     For connections to other objects, use ABColumn.createLink() instead.
                         *
                         * @param {object} data
                         * @param {string} data.name
                         *     The name of the column. Required.
                         * @param {integer} data.object
                         *     The primary key ID of the ABObject that this column belongs to.
                         *     Required.
                         * @param {string} [data.language_code]
                         * @param {string} [data.type]
                         *     Optional. If you want to override the default for some reason.
                         *     Such as specifying a 'float' type for a number field.
                         * @param {string} [data.fieldName]
                         *     Optional. If you want to override the default for some reason.
                         * @param {integer} [data.weight]
                         *     Optional. Default is to put the column at the bottom.
                         * @param {string/object} [data.setting]
                         *     Stringified JSON, or JSON basic object.
                         * @return Deferred
                         *     Resolves with the new column's data.
                         */
						createColumn: function (type, data) {
                            data.language_code = data.language_code || AD.lang.currentLanguage;
				            return AD.comm.service.post({
				                url: '/app_builder/column/createColumn',
				                contentType: 'application/json',
				                data: JSON.stringify({
				                    type: type,
				                    data: data
				                })
				            });
						},
						
						
                        /**
                         * Create a connection column, together with the optional return connection
                         * column.
                         * It is possible for both the source and target to be same object.
                         *
                         * Examples:
                         *
                         * ABColumn.createLink({
                         *     name: 'MyLinkName',
                         *     sourceObjectID: 5,
                         *     targetObjectID: 7,
                         *     sourceRelation: 'one',
                         *     targetRelation: 'many',
                         *     language_code: 'zh-hans'
                         * }).then( ... )
                         *
                         * ABColumn.createLink({
                         *     name: 'AnotherLinkName',
                         *     sourceObjectID: 8,
                         *     targetObjectID: 9,
                         *     targetRelation: 'many'
                         * }).then( ... )
                         *
                         * @param {object} data
                         * @param {string} data.name
                         * @param {integer} data.sourceObjectID
                         *     The primary key value of the object containing the column.
                         * @param {integer} data.targetObjectID
                         *     The primary key value of the object being linked to.
                         * @param {string} [data.sourceRelation]
                         *     Optional. Either "one" or "many".
                         *     If omitted, then the retun connection column will not be created.
                         * @param {string} data.targetRelation
                         *     Either "one" or "many". Required.
                         * @param {string} [data.language_code]
                         * @return Deferred
                         *     Resolves with (sourceObjectColumn, targetObjectColumn)
                         */
						createLink: function (data) {
				            return AD.comm.service.post({
				                url: '/app_builder/column/createLink',
				                data: {
				                    name: data.name,
                                    language_code: data.language_code || AD.lang.currentLanguage,
				                    sourceObjectID: data.sourceObjectID,
				                    targetObjectID: data.targetObjectID,
				                    sourceRelation: data.sourceRelation,
				                    targetRelation: data.targetRelation
				                }
				            });
						}
					},
					{
						setWidth: function (width) {
							var q = AD.sal.Deferred();

							AD.comm.service.put({
								url: '/app_builder/column/' + this.id + '/width',
								data: {
									width: width
								}
							}, function (err, result) {
								if (err)
									q.reject(err);
								else
									q.resolve(result);
							});

							return q;
						},
						getList: function () {
							return AD.Model.get('opstools.BuildApp.ABList').findAll({ column: this.id });
						}
					}
				);
			});
		});
	});