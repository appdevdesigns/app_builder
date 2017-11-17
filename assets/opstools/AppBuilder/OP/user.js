class OPUser {

	constructor() {

		// get current user
		if (this.currentUser == null) {
			OP.Comm.Service.get({ url: "/site/user/data" }).then((data) => {


				this.currentUser = data.user;

			});
		}

		// get the user list
		if (this.userList == null) {
			OP.Comm.Service.get({ url: "/appdev-core/siteuser" }).then((data) => {

				this.userList = data;

			});
		}

	}
}

export default {

	init: function () {

		if (!this.__user)
			this.__user = new OPUser();

	},

	user: function () {
		return this.__user.currentUser || {};
	},

	username: function () {
		return this.user().username;
	},

	userlist: function() {
		return this.__user.userList || [];
	}


}