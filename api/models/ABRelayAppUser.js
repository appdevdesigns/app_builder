/**
 * ABRelayAppUser
 * @module      :: Model
 * An individual ABRelayUser in the system can have numerous Mobile App setups. (one on a Phone, an iPad, etc...)
 *
 * Each instance of a Mobile App will generate a unique AppUUID + AES key combo.
 * incoming requests need to resolve the provided appUUID into an AES Key
 * and ABRelayUser value.
 *
 */


module.exports = {
    
    tableName: 'appbuilder_relay_appuser',
    
    autoCreatedAt: false,
    autoUpdatedAt: false,
    autoPK: false,
    // migrate: 'safe',
migrate:'alter',
    
    attributes: {
        id: {
            type: 'integer',
            size: 11,
            primaryKey: true,
            autoIncrement: true
        },
        

        // user: a uuid that is sent to the mobile client.
        // each data packet sent from the client will reference this uuid
        relayUser: {
            model: 'abrelayuser'
        },


        // aes: the AES key used to decode the message.
        aes: {
            type: 'mediumtext'
        },
        

        // appUUID
        // the unique key identifying which instance of an app is communicating 
        // with us.
        appUUID: {
            type: 'mediumtext'
        },


        // appID
        // the reference to the registered mobile app generated by our system.
        appID:{
            type:'mediumtext'
        }

    },
    
    ////
    //// Life cycle callbacks
    ////
    
    
    
    ////
    //// Model class methods
    ////
   

};