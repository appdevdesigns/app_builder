var async = require('async');

module.exports = {

	init: function () {
		// create a listner for when our entries are approved
		ADCore.queue.subscribe('appbuilder.approved', function (message, data) {

			// Update approve status
			ABApprovalStatus.update(
				{
					object: data.reference.objectId,
					rowId: data.reference.rowId
				},
				{
					status: data.status
				})
				.exec(function () { });

		});
	},

	postApproval: function (user, object, rowData, detailTitle, headerData, headerTitle) {
		if (object == null) {
			throw new Error('Object data is required');
		}

		if (rowData == null) {
			throw new Error('Row data is required');
		}

		var request = {

			menu: {
				icon: "fa-gear",
				action: {
					key: "appbuilder.approval.title",
					context: "app_builder"
				},
				instanceRef: "label", // TODO
				createdBy: 'App Builder',
				date: new Date()
			},


			form: {
				view: "/opstools/BuildApp/views/ProcessApproval/itemApproval.ejs",
				data: rowData,
				viewData: {
					title: {
						header: headerTitle || '',
						detail: detailTitle || ''
					},
					headerInfo: headerData || {}
				}
			},


			relatedInfo: {
				view: "/opstools/BuildApp/views/ProcessApproval/itemApprovalRelated.ejs",
				// "viewData": {
				// 	"user": {
				// 		"displayName": creator.displayName(),
				// 		"avatar": creator.avatar,
				// 		"teams": ministryTeams
				// 	},
				// 	"teamID": activity.team,
				// 	"createdAt": createdAt
				// }
			},


			callback: {
				// Required
				message: "appbuilder.approved",
				reference: {
					objectId: object.id,
					rowId: rowData.id
				}
			},


			permission: {
				// Required
				actionKey: 'appbuilder.approval',
				// Required
				userID: user.GUID()
			}

		};

		ADCore.queue.publish('opsportal.approval.create', request);
	}

};