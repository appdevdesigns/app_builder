
/*
 * custom_editlist
 *
 * Create a custom webix component.
 *
 */


function L(key, altText) {
	return AD.lang.label.getLabel(key) || altText;
}


var labels = {

	component: {
		// formHeader: L('ab.application.form.header', "*Application Info"),
	}
}


var ComponentKey = 'ab_custom_editlist';
OP.CustomComponent.extend(ComponentKey, function(App, componentKey ) {
	// App 	{obj}	our application instance object.
	// componentKey {string}	the destination key in App.custom[componentKey] for the instance of this component:

	labels.common = App.labels;

	// internal list of Webix IDs to reference our UI components.
	var ids = {
		component: App.unique('custom_editlist_component'),
	}



	// Our webix UI definition:
	var _ui = {
        name: App.unique("custom_editlist")	// keep this unique for this App instance.
    };





	// our internal business logic 
	var _logic = {

	}



	// Tell Webix to create an INSTANCE of our custom component:
    webix.protoUI(_ui, webix.EditAbility, webix.ui.list);


    // current definition of our Component 
    var Component = {
		view: _ui.name,			// {string} the webix.view value for this custom component

		_logic: _logic			// {obj} 	Unit Testing
	}


	// Save our definition into App.custom.[key]
    App.custom = App.custom || {};
    App.custom[componentKey] = Component;


	// return the current definition of this component:
	return Component;

})


// After importing this custom component, you get back the .key to use to 
// lookup the OP.Component[] to create an application instance of 
export default { key: ComponentKey };