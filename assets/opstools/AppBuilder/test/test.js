// create window variable
global.window = global;

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

// create a test div
const dom = new JSDOM(`<div id="ab_test_div"></div>`);
window.document = dom.window.document;

require("../../../../node_modules/mocha/mocha.js");
window.assert = require("../../../../node_modules/chai/chai.js").assert;
window.sinon = require("../../../../node_modules/sinon/pkg/sinon.js");
window.Promise =require("../../../../node_modules/es6-promise/dist/es6-promise.auto.min.js");
window.moment = require("../../../../../../assets/js/moment.min.js");
require("../../../../../../assets/js/selectivity/selectivity.min.js");
window.webix = require("../../../../../../assets/js/webix/webix.js");

window.AD = require("./mock_AD.js");
window.io = require("./mock_io.js");
require("../../BuildApp/OP_Bundle.js");
require("../../BuildApp/BuildApp.js");

require("./bin/test_app_builder.js");