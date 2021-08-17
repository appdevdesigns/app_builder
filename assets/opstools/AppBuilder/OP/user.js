import Comm from "./comm/comm";

class OPUser {
   initial() {
      let tasks = [];

      // get current user
      if (this.currentUser == null) {
         tasks.push(
            new Promise((resolve, reject) => {
               Comm.Service.get({ url: "/site/user/data" })
                  .then((data) => {
                     this.currentUser = data.user;
                     resolve();
                  })
                  .catch(reject);
            })
         );
      }

      // get the user list
      if (this.userList == null) {
         tasks.push(
            new Promise((resolve, reject) => {
               Comm.Service.get({ url: "/app_builder/user/list" })
                  .then((data) => {
                     this.userList = data;
                     resolve();
                  })
                  .catch(reject);
            })
         );
      }

      // get the user's scopes
      if (this.scopeList == null) {
         tasks.push(
            new Promise((resolve, reject) => {
               Comm.Service.get({ url: "/app_builder/user/myscopes" })
                  .then((data) => {
                     this.scopeList = data;
                     resolve();
                  })
                  .catch(reject);
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
