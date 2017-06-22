
/**
 * @class OP
 * @parent index 4
 *
 * ###Client side global OpsPortal (OP) namespace.
 *
 * This file defines standard functions and calls for OpsPortal
 * objects on the client side.
 */

// Create our OP  Namespace only if it hasn't been created already

//// TODO: how to disable 'use strict'?  or perform this check without an error
//// in 'use strict' ?

// if (!window.OP) {

import Comm from "./comm/comm"
import Component from "./component"
import Config from "./config/config"
import CustomComponent from "./customComponent"
import DateTime from "./dateTime"
import Model from "./model"
import Multilingual from "./multilingual"
import Test from "./test"
import Util  from "./util"
import Validation from "./validation"


    window.OP = OP;


    // OP.xxxx      These properties hold the defined Class/Controller/Model definitions
    //              for our loaded projects.

    OP.Comm = Comm;	// communication routines (AJAX calls)

    OP.Component = Component;  // our defined components

    OP.Config = Config;		// configuration Settings for our current environment.

    OP.CustomComponent = CustomComponent;  // Webix Custom Components
    
    OP.DateTime = DateTime;

	OP.Dialog = AD.op.Dialog;

	OP.Error = AD.error;

	OP.Model = Model;

	OP.Multilingual = Multilingual;

	OP.Test = Test;
	
	OP.Util = Util;

	OP.Validation = Validation;
	

	export default OP;
// }


// import "./model.js"
