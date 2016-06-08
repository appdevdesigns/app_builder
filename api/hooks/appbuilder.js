/**
 * Set up the `appBuilder` connection to use the same credentials
 * as the default site connection.
 */

module.exports = function(sails) {
    return {
        configure: function() {
            
            sails.config.connections['appBuilder'] = sails.config.connections['appBuilder'] || {};
            
            var defaultConnName = sails.config.models.connection;
            var connDefault = sails.config.connections[defaultConnName];
            var connAppBuilder = sails.config.connections['appBuilder'];
            
            connAppBuilder.adapter = connAppBuilder.adapter || connDefault.adapter;
            connAppBuilder.host = connAppBuilder.host || connDefault.host;
            connAppBuilder.port = connAppBuilder.port || connDefault.port;
            connAppBuilder.user = connAppBuilder.user || connDefault.user;
            connAppBuilder.password = connAppBuilder.password ||connDefault.password;
            connAppBuilder.database = connAppBuilder.database || 'appbuilder';
            
        }
    }
};
