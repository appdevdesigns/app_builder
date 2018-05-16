/**
 * Global adapter appbuilder
 *
 * The AppBuilder configuration file.
 *
 */
var path = require('path');

module.exports.appbuilder = {

  // Mobile Comm Center (mcc)
  // Specify the communications connection with our Public MCC
  // sails.config.appbuilder.mobileCommCenter
  mcc: {
    url:'http://localhost:1337', 
    // port:'',
    accessToken:'There is no spoon.'
  }

};
