const SubProcessCore = require("../../../core/process/tasks/ABProcessTaskSubProcessCore");
const ABProcessTriggerCore = require("../../../core/process/tasks/ABProcessTriggerCore");
const ABProcessEngine = require("../ABProcessEngine");

const AB = require("ab-utils");
const reqAB = AB.reqAB({}, {});
reqAB.jobID = "SubProcess";

module.exports = class SubProcess extends SubProcessCore {
   ////
   //// Process Instance Methods
   ////

   /**
    * @method do()
    * this method actually performs the action for this task.
    * @param {obj} instance  the instance data of the running process
    * @param {Knex.Transaction?} trx - [optional]
    *
    * @return {Promise}
    *      resolve(true/false) : true if the task is completed.
    *                            false if task is still waiting
    */
   do(instance, trx) {
      if (!this.isEnable || !this.parameterId) {
         this.stateCompleted(instance);
         return Promise.resolve();
      }

      let processData = this.process.processData(this, [
         instance,
         this.parameterId
      ]);

      if (processData == null) {
         this.stateCompleted(instance);
         return Promise.resolve();
      } else if (processData && !Array.isArray(processData)) {
         processData = [processData];
      }

      let dbTransaction = trx; // TODO
      let context = this.process.context(processData);
      this.elements().forEach((t) => {
         if (t.initState) {
            t.initState(context);
         }
      });

      return (
         Promise.resolve()
            // Create a Instance of the Sub Process
            // .then(() =>
            //    ABProcessInstance.create({
            //       processID: this.id,
            //       xmlDefinition: this.process.xmlDefinition,
            //       context: context,
            //       status: "created",
            //       log: ["created"]
            //    })
            // )
            // .then((sInstance) => {
            // Define ABProcessEngine
            .then(() => {
               let processEngine = new ABProcessEngine(instance, this);
               processEngine.startTask = () => {
                  let firstConnection = this.connections()[0];
                  if (firstConnection == null) return;

                  let startElement = this.elementForDiagramID(
                     firstConnection.from
                  );
                  if (startElement == null) {
                     startElement = this.elementForDiagramID(
                        firstConnection.to
                     );
                  }

                  if (startElement instanceof ABProcessTriggerCore) {
                     startElement.wantToDoSomething = () => false; // Don't need to .do function of the trigger
                  }

                  return startElement;
               };

               let bpmnProcess =
                  instance.jsonDefinition["bpmn2:definitions"]["bpmn2:process"];
               let bpmnSubProcess;

               for (let key in bpmnProcess) {
                  if (bpmnProcess[key] == null || bpmnSubProcess) continue;

                  let bpmnAttrs = bpmnProcess[key];
                  if (!Array.isArray(bpmnAttrs)) bpmnAttrs = [bpmnAttrs];

                  bpmnAttrs.forEach((bpmnA) => {
                     if (
                        bpmnA["_attributes"] &&
                        bpmnA["_attributes"].id == this.diagramID
                     ) {
                        bpmnSubProcess = bpmnA;
                     }
                  });
               }

               processEngine.setHashDiagramObjects(bpmnSubProcess);

               return processEngine;
            })
            .then((processEngine) => {
               let processTasks = [];

               processData.forEach((data) => {
                  processTasks.push(
                     () =>
                        new Promise((next) => {
                           var value = {};
                           value.data = data;
                           this.stateUpdate(instance, value);

                           let taskElements = [];

                           let doTasks = (subTasks) => {
                              // No pending tasks, then go to next step
                              if (!subTasks || subTasks.length < 1) {
                                 // Reset states of task elements for the next row
                                 taskElements.forEach((t) => {
                                    t.reset(instance);
                                 });
                                 next();
                                 return;
                              }

                              let tasks = [];

                              subTasks.forEach((t) => {
                                 taskElements.push(t);
                                 tasks.push(
                                    new Promise((good, bad) => {
                                       t.do(instance, dbTransaction)
                                          .then((isDone) => {
                                             if (isDone) {
                                                let nextTasks = t.nextTasks(
                                                   instance
                                                );
                                                if (nextTasks) {
                                                   nextTasks.forEach((t) => {
                                                      t.reset(instance);
                                                   });
                                                }
                                             }
                                             good();
                                          })
                                          .catch((error) => {
                                             t.onError(instance, error);
                                             bad(error);
                                          });
                                    })
                                 );
                              });

                              Promise.all(tasks).then(() => {
                                 processEngine
                                    .pendingTasks()
                                    .then((subTasks) => {
                                       doTasks(subTasks);
                                    })
                                    .catch((error) => {
                                       ABProcessInstance.update(
                                          instance.id,
                                          instance
                                       ).then(() => {});
                                    });
                              });
                           };

                           processEngine.pendingTasks().then((subTasks) => {
                              doTasks(subTasks);
                           });
                        })
                  );
               });

               return processTasks.reduce((promiseChain, currTask) => {
                  return promiseChain.then(currTask);
               }, Promise.resolve([]));
            })
            // Complete
            .then(
               () =>
                  new Promise((next, bad) => {
                     this.stateCompleted(instance);
                     next(true);
                  })
            )
      );
   }
};
