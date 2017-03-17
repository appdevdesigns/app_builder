
/*
 * AB Choose
 *
 * When choosing an initial application to work with, we can
 *   - select an application from a list  :  ab_choose_list
 *   - create an application from a form  :  ab_choose_form
 *
 */


import './ab_choose_list'




// Application multi-views
var ab_choose_ui = {
	id: 'self.webixUiId.appView',
	autoheight: true,
	cells: [
		OP.UI['ab_choose_list'],
		// appFormControl
	]
};

OP.UI.extend('ab_choose', ab_choose_ui);





var ab_choose_logic = {

	init: function() {
		OP.Logic['ab_choose_list'].init();
	}
}
OP.Logic.extend('ab_choose', ab_choose_logic);


