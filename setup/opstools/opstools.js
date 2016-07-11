/**
 * This file specifies any default Ops Portal Tool Definitions 
 * provided by this modlue.
 *  
 */
module.exports = [

    { 
        key:'appbuilder.designer', 
        permissions:'appbuilder.designer.view, adcore.developer', 
        icon:'fa-object-group', 
        controller:'BuildApp',
        label:'tool.appBuilder',
        context:'opsportal',
        isController:true, 
        options:{}, 
        version:'0' 
    }

];
