/* eslint-disable no-undef */
const cron = require("node-cron");
const ABProcessTriggerTimer = require("../classes/platform/process/tasks/ABProcessTriggerTimer");

let JOB_POOLS = {};

module.exports = {
   startAll: () => {
      ABServerApp.processes((p) => {
         if (!p) return;

         let triggerTimers = p.elements(
            (e) => e instanceof ABProcessTriggerTimer
         );

         if (triggerTimers && triggerTimers.length) {
            triggerTimers.forEach((e) => {
               ABProcessTimer.start(e);
            });
         }
      });
   },

   stopAll: () => {
      Object.keys(JOB_POOLS || {}).forEach((elementId) => {
         ABProcessTimer.stop(elementId);
      });
   },

   /**
    * @function start
    *
    * @param {ABProcessTriggerTimer} element
    */
   start: (element) => {
      if (element == null || JOB_POOLS[element.id] != null) return;

      let cronExpression = element.getCronExpression();
      sails.log.info(`::: Start CRON job [${cronExpression}] - ${element.id}`);

      JOB_POOLS[element.id] = cron.schedule(cronExpression, () => {
         // start the processs task
         sails.log.info(
            `::: Trigger CRON job [${cronExpression}] - ${element.id}`
         );
         ABProcess.trigger(element.triggerKey).then(() => {});
      });
   },

   /**
    * @function stop
    *
    * @param {uuid} elementId - the id of ABProcessTriggerTimer
    */
   stop: (elementId) => {
      if (elementId == null || JOB_POOLS[elementId] == null) return;

      sails.log.info(`::: Stop CRON job - ${elementId}`);
      JOB_POOLS[elementId].stop();
      delete JOB_POOLS[elementId];
   },

   /**
    * @function isRunning
    *
    * @param {uuid} elementId - the id of ABProcessTriggerTimer
    */
   isRunning: (elementId) => {
      return JOB_POOLS[elementId] ? true : false;
   }
};
