/**
 * ABEmitter
 *
 * This is the platform dependent implementation of an Emitter object.
 *
 */

var EventEmitter = require("events").EventEmitter;

module.exports = class ABEmitter extends EventEmitter {
   constructor() {
      super(/*{ maxListeners: 0 }*/);
   }
};
