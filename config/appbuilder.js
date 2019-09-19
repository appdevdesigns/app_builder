/**
 * Global adapter appbuilder
 *
 * The AppBuilder configuration file.
 *
 */
var path = require('path');

module.exports.appbuilder = {


  // BaseURL
  // the base url to get to this site.  Will be used for multiple references
  // in how to communicate back to the server the AppBuilder is on.
  //
  // sails.config.appbuilder.baseURL
  baseURL:'http://localhost:1337',


  // Deeplink base url
  // The url that will be used to initialize our mobile app.
  // the URL is used in 2 ways:
  // the base url will be used to access: 
  //    /.well-known/assetlinks.json,           : android deeplink config
  //    /.well-known/apple-app-site-association : ios deeplink config
  // The encoded deeplink url sent to users will be the deeplinkbase url +
  // ?settings={config:settings}.  Once the mobile app receives the above
  // config file, it will know which local app to send the data to.  The
  // included settings param will have the initial app setup data.
  //
  // NOTE: if the value is null, then the baseURL will be used.
  // this is set in app_builder/config/bootstrap.js
  //
  // sails.config.appbuilder.deeplink
  deeplink:null,


  // 
  // Mobile Comm Center (mcc)
  // Specify the communications connection with our Public MCC
  //
  // sails.config.appbuilder.mcc
  mcc: {
    enabled:true,                      // is communicating with our MCC enabled?
    url:'http://localhost:1337',       // url connection to our MCC (include Port)
    accessToken:'There is no spoon.',  // required accessToken
    pollFrequency: 1000 * 5,           // frequency in ms that we should poll the MCC 
    maxPacketSize: 1024 * 1024         // the max size of an encrypted packet we want to send to the MCC
  },


  // pathFiles : directory any AppBuilder files are stored (think Android APK files)
  // specified from the sails.config.appPath: [sails]/data/app_builder
  //
  // sails.config.appbuilder.pathFiles
  pathFiles: path.join('data', 'app_builder'),

  graphDB: {
    url: 'http://127.0.0.1:8529',
    databaseName: 'appBuilder',
    user: '',
    pass: ''
  }

};
