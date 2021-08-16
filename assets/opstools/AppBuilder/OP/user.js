import Comm from "./comm/comm";

class OPUser {
   initial() {
      let tasks = [];

      // get current user
      if (this.currentUser == null) {
         tasks.push(
            new Promise((resolve, reject) => {
               Comm.Service.get({ url: "/site/user/data" })
                  .catch(reject)
                  .then((data) => {
                     this.currentUser = data.user;
                     resolve();
                  });
            })
         );
      }

      // get the user list
      if (this.userList == null) {
         tasks.push(
            new Promise((resolve, reject) => {
               Comm.Service.get({ url: "/app_builder/user/list" })
                  .catch(reject)
                  .then((data) => {
                     this.userList = data;
                     resolve();
                  });
            })
         );
      }

      // get the user's scopes
      if (this.scopeList == null) {
         tasks.push(
            new Promise((resolve, reject) => {
               Comm.Service.get({ url: "/app_builder/user/myscopes" })
                  .catch(reject)
                  .then((data) => {
                     this.scopeList = data;
                     resolve();
                  });
            })
         );
      }

      return Promise.all(tasks).then(() => {
         this.__isInitial = true;
         return Promise.resolve();
      });
   }

   get isInitial() {
      return this.__isInitial || false;
   }
}

export default {
   id: function() {
      return this.user().id;
   },

   init: function() {
      if (!this.__user || !this.__user.isInitial) {
         this.__user = new OPUser();
         return this.__user.initial();
      } else {
         return Promise.resolve();
      }
   },

   user: function() {
      return this.__user.currentUser || {};
   },

   username: function() {
      return this.user().username;
   },

   userlist: function() {
      return this.__user.userList || [];
   },

   scopes: function() {
      return this.__user.scopeList || [];
   }
};
