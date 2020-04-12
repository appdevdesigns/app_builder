var Database = require("arangojs").Database;
var fs = require("fs");
var path = require("path");

var conn;

module.exports = {
   database: () => {
      if (conn != null) return conn;

      let url = sails.config.appbuilder.graphDB.url,
         databaseName = sails.config.appbuilder.graphDB.databaseName,
         user = sails.config.appbuilder.graphDB.user,
         pass = sails.config.appbuilder.graphDB.pass;

      conn = new Database(url);
      conn.useDatabase(databaseName);
      conn.useBasicAuth(user, pass);

      return conn;
   },

   initial: () => {
      return (
         Promise.resolve()

            // Initial database
            .then(() => {
               return new Promise((next, err) => {
                  let db = ABGraphDB.database();

                  db.exists().then((exists) => {
                     if (exists) return next();

                     let url = sails.config.appbuilder.graphDB.url,
                        databaseName =
                           sails.config.appbuilder.graphDB.databaseName,
                        user = sails.config.appbuilder.graphDB.user,
                        pass = sails.config.appbuilder.graphDB.pass;

                     let newDB = new Database(url);
                     newDB.useBasicAuth(user, pass);
                     newDB
                        .createDatabase(databaseName, [
                           { username: user, passwd: pass }
                        ])
                        .then(() => {
                           conn = null;

                           next();
                        }, err);
                  });
               });
            })

            // Initial collections
            .then(() => {
               let tasks = [];

               let db = ABGraphDB.database();

               let modelsPath = path.join(__dirname, "..", "graphModels");

               fs.readdirSync(modelsPath).forEach((fileName) => {
                  if (fileName == "ABModelBase.js") return;

                  let model = require(path.join(modelsPath, fileName));

                  // Initial collections
                  tasks.push(
                     () =>
                        new Promise((next, err) => {
                           let collection = db.collection(model.collectionName);

                           Promise.resolve()
                              .then(() => {
                                 return new Promise((ok, error) => {
                                    collection
                                       .exists()
                                       .catch(error)
                                       .then((exists) => ok(exists));
                                 });
                              }, err)
                              .then((exists) => {
                                 return new Promise((ok, error) => {
                                    if (exists) return ok();

                                    collection
                                       .create()
                                       .catch(error)
                                       .then(() => ok());
                                 });
                              }, err)
                              .then(() => next());
                        })
                  );

                  // Initial edges
                  Object.keys(model.relations || {}).forEach((relationName) => {
                     let edgeName = (model.relations || {})[relationName]
                        .edgeName;

                     tasks.push(
                        () =>
                           new Promise((next, err) => {
                              let edge = db.edgeCollection(edgeName);

                              Promise.resolve()
                                 .then(() => {
                                    return new Promise((ok, error) => {
                                       edge
                                          .exists()
                                          .catch(error)
                                          .then((exists) => ok(exists));
                                    });
                                 }, err)
                                 .then((exists) => {
                                    if (exists) return Promise.resolve();
                                    else return edge.create();
                                 }, err)
                                 .then(() => next());
                           })
                     );
                  });
               });

               return tasks.reduce((promiseChain, currTask) => {
                  return promiseChain.then(currTask);
               }, Promise.resolve());
            })
      );
   }
};
