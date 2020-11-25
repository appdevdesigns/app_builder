// import ABApplication from "./ABApplication"
// const ABApplication = require("./ABApplication"); // NOTE: change to require()
const path = require("path");
const ABProcessCore = require(path.join(
   __dirname,
   "..",
   "core",
   "ABProcessCore.js"
));

const ABProcessEngine = require(path.join(
   __dirname,
   "process",
   "ABProcessEngine"
));
const convert = require("xml-js");

module.exports = class ABProcess extends ABProcessCore {
   constructor(attributes, application) {
      super(attributes, application);

      // listen
   }

   ///
   /// Static Methods
   ///
   /// Available to the Class level object.  These methods are not dependent
   /// on the instance values of the Application.
   ///

   /**
    * context()
    * Return an initial context data structure for use with a running
    * instance.
    * @param {obj} data the initial data passed into the process
    * @return {Promise}
    */
   context(data) {
      return {
         input: data,
         taskState: {}
      };
   }

   /**
    * @method exportIDs()
    * export any relevant .ids for the necessary operation of this application.
    * @param {array} ids
    *        the array of ids to store our relevant .ids into.
    */
   exportIDs(ids) {
      // make sure we don't get into an infinite loop:
      if (ids.indexOf(this.id) > -1) return;

      ids.push(this.id);

      // store our elements:
      this.elements().forEach((e) => {
         e.exportIDs(ids);
      });
   }

   /**
    * instanceClose()
    * Mark the current instance as having been completed.
    * @param {obj} instance the instance we are working with.
    * @return {Promise}
    */
   instanceClose(instance) {
      instance.status = "completed";
      return this.instanceUpdate(instance);
   }

   /**
    * instanceError()
    * Mark the current instance as having an error.
    * @param {obj} instance the instance we are working with.
    * @param {ABProcessTask} task the task with the error
    * @return {Promise}
    */
   instanceError(instance, task, error) {
      instance.status = "error";
      if (task) {
         instance.errorTasks = instance.errorTasks || {};
         instance.errorTasks[task.diagramID] = error.toString();
      }
      return this.instanceUpdate(instance);
   }

   /**
    * instanceNew()
    * create a new running Instance of a process.
    * @param {obj} data the context data to send to the process.
    * @param {Knex.Transaction} dbTransaction
    * @return {Promise}
    */
   instanceNew(data, dbTransaction) {
      var context = data;

      this.elements().forEach((t) => {
         if (t.initState) {
            t.initState(context);
         }
      });

      var newInstance = {
         processID: this.id,
         xmlDefinition: this.xmlDefinition,
         context: context,
         status: "created",
         log: ["created"]
      };

      return Promise.resolve()
         .then(
            () =>
               new Promise((next, bad) =>
                  ABProcessInstance.create(newInstance)
                     .then((newInstance) => {
                        next(newInstance);
                     })
                     .catch((error) => {
                        console.error(error);
                        bad(error);
                     })
               )
         )
         .then((newInstance) => this.run(newInstance, dbTransaction));
   }

   /**
    * instanceReset()
    * Reset the given instance.
    * @param {obj} instance the instance we are working with.
    * @param {string} taskID the diagramID of the task we are resetting
    * @return {Promise}
    */
   instanceReset(instance, taskID) {
      instance.status = "running";
      var task = this.elementForDiagramID(taskID);
      if (task) {
         task.reset(instance);
      }

      return this.run(instance);
   }

   /**
    * instanceUpdate()
    * Save the current instance.
    * @param {obj} instance the instance we are working with.
    * @return {Promise}
    */
   instanceUpdate(instance) {
      return ABProcessInstance.update(instance.id, instance).then((data) => {
         // console.log("after Update: ", data);
         return data;
      });
   }

   /**
    * run()
    * Step through the current process instance and have any pending tasks
    * perform their actions.
    * @param {obj} instance the instance we are working with.
    * @param {Knex.Transaction} dbTransaction
    * @return {Promise}
    */
   run(instance, dbTransaction) {
      // make sure the current instance is runnable:
      if (instance.status != "error" && instance.status != "completed") {
         var Engine = new ABProcessEngine(instance, this);
         // Engine.pendingTasks().then((listOfPendingTasks) => {
         // });

         return Promise.resolve()
            .then(() => Engine.pendingTasks())
            .then((listOfPendingTasks) => {
               // if we have no more pending tasks, then we are done.
               if (listOfPendingTasks.length == 0) {
                  return this.instanceClose(instance);
               }

               // else give each task a chance to do it's thing
               return new Promise((next, bad) => {
                  async.map(
                     listOfPendingTasks,
                     (task, cb) => {
                        task
                           .do(instance, dbTransaction)
                           .then((isDone) => {
                              // if the task returns it is done,
                              // pass that along

                              if (isDone) {
                                 // make sure the next tasks know they are
                                 // ready to run (again if necessary)
                                 var nextTasks = task.nextTasks(instance);
                                 if (nextTasks) {
                                    nextTasks.forEach((t) => {
                                       t.reset(instance);
                                    });
                                    cb(null, isDone);
                                 } else {
                                    // if null was returned then an error
                                    // happened during the .nextTask() fn
                                    var error = new Error(
                                       "error parsing next task"
                                    );
                                    this.instanceError(
                                       instance,
                                       task,
                                       error
                                    ).then(() => {
                                       cb();
                                    });
                                 }
                              } else {
                                 cb(null, false);
                              }
                           })
                           .catch((err) => {
                              task.onError(instance, err);
                              this.instanceError(instance, task, err).then(
                                 () => {
                                    cb();
                                 }
                              );
                           });
                     },
                     (err, results) => {
                        // if at least 1 task has reported back it is done
                        // we try to run this again and process another task.
                        var hasProgress = false;
                        if (results) {
                           results.forEach((res) => {
                              if (res) hasProgress = true;
                           });
                        }
                        if (hasProgress) {
                           // repeat this process allowing new tasks to .do()
                           this.run(instance, dbTransaction)
                              .catch(bad)
                              .then(() => next());
                        } else {
                           // update instance (and end .run())
                           this.instanceUpdate(instance)
                              .catch(bad)
                              .then(() => next());
                        }
                     }
                  );
               });
            });
      } else {
         return Promise.resolve();
      }
   }

   /**
    * @method save()
    *
    * persist this instance of ABObject with it's parent ABApplication
    *
    *
    * @return {Promise}
    *						.resolve( {this} )
    */
   save() {
      // if this is an update:
      // if (this.id) {
      // 	return ABDefinition.update(this.id, this.toDefinition());
      // } else {

      // 	return ABDefinition.create(this.toDefinition());
      // }

      return this.toDefinition()
         .save()
         .then((data) => {
            // if I didn't have an .id then this was a create()
            // and I need to update my data with the generated .id

            if (!this.id) {
               this.id = data.id;
            }
         });
   }

   isValid() {
      var isValid =
         this.application.processes((o) => {
            return o.name.toLowerCase() == this.name.toLowerCase();
         }).length == 0;
      return isValid;
   }
};
