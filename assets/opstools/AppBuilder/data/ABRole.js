// Namespacing conventions:
// OP.Model.extend('[application].[Model]', {static}, {instance} );  --> Object
OP.Model.extend('opstools.BuildApp.ABRole',
	{
		useSockets: true,
		restURL: '/app_builder/role',

		// ** Roles

		roleFind: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/role`,
				params: cond
			});

		},

		roleUsers: function (roleId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/role/${roleId}/users`
			});

		},

		roleGet: function (roleId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/role/${roleId}`
			});

		},

		roleSave: function (role) {

			return OP.Comm.Service.put({
				url: `/app_builder/role`,
				data: {
					role: role
				}
			});
		},

		roleDestroy: function (roleId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/role/${roleId}`
			});

		},

		rolesOfUser: function (username) {

			return OP.Comm.Socket.get({
				url: `/app_builder/user/${username}/roles`
			});

		},

		addUser: function (roleId, username) {

			return OP.Comm.Service.post({
				url: `/app_builder/role/${roleId}/username/${username}`
			});

		},

		removeUser: function (roleId, username) {

			return OP.Comm.Service.delete({
				url: `/app_builder/role/${roleId}/username/${username}`
			});

		},

		// ** Scopes

		scopeFind: function (cond) {

			return OP.Comm.Socket.get({
				url: `/app_builder/scope`,
				params: cond
			});

		},

		scopeOfRole: function (roldId) {

			return OP.Comm.Socket.get({
				url: `/app_builder/role/${roldId}/scope`
			});

		},

		scopeSave: function (scope, roleId) {

			return OP.Comm.Service.put({
				url: `/app_builder/scope?roleID=${roleId}`,
				data: {
					scope: scope
				}
			});
		},

		scopeDestroy: function (scopeId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/scope/${scopeId}`
			});

		},

		scopeImport: function (roleId, scopeId) {

			return OP.Comm.Service.put({
				url: `/app_builder/role/${roleId}/scope/${scopeId}`
			});

		},

		scopeExclude: function (roleId, scopeId) {

			return OP.Comm.Service.delete({
				url: `/app_builder/role/${roleId}/scope/${scopeId}`
			});

		},
	},
	{
		// instance Methods

	}
);