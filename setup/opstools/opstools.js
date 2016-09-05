/**
 * This file specifies any default Ops Portal Tool Definitions 
 * provided by this modlue.
 *  
 */
module.exports = [

    { 
        key:'appbuilder.designer', 
        permissions:'appbuilder.designer.view', 
        icon:'fa-object-group', 
        controller:'BuildApp',
        label:'App Builder',
        context:'opsportal',
        isController:true, 
        options:{}, 
        version:'0' 
    }

];
