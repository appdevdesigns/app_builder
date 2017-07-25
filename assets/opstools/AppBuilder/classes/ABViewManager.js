/* 
 * ABViewManager
 * 
 * An interface for managing the different ABViews available in our AppBuilder.
 *
 */

import ABView from "./views/ABView"
import ABViewPage from "./views/ABViewPage"
import ABViewLabel from "./views/ABViewLabel"
import ABViewLayout from "./views/ABViewLayout"
import ABViewMenu from "./views/ABViewMenu"

import ABViewForm from "./views/ABViewForm"
import ABViewButton from "./views/ABViewButton"
import ABViewSelectSingle from "./views/ABViewSelectSingle"
import ABViewTextbox from "./views/ABViewTextbox"
/* 
 * Views
 * A name => ABView  hash of the different ABViews available.
 */
var Views = {};
Views[ABView.common().key] = ABView;
Views[ABViewPage.common().key] = ABViewPage;
Views[ABViewLabel.common().key] = ABViewLabel;
Views[ABViewLayout.common().key] = ABViewLayout;
Views[ABViewMenu.common().key] = ABViewMenu;

Views[ABViewForm.common().key] = ABViewForm;
Views[ABViewButton.common().key] = ABViewButton;
Views[ABViewSelectSingle.common().key] = ABViewSelectSingle;
Views[ABViewTextbox.common().key] = ABViewTextbox;



export default  {


	/*
	 * @function allViews
	 * return all the currently defined ABViews in an array.
	 * @return [{ABView},...]
	 */
	allViews: function(fn) {
		fn = fn || function() { return true; }

		var views = [];
		for (var v in Views) {
			var V = Views[v];
			if (fn(V)) {
				views.push(V);
			}
		}
		return views;
	},


	/*
	 * @function newView
	 * return an instance of an ABView based upon the values.key value.
	 * @return {ABView}
	 */
	newView: function (values, application, parent) {

		parent = parent || null;
		
		if (values.key) {
			return new Views[values.key](values, application, parent);
		} else {
			var err = new Error('unknown view key');
			OP.Error.log('Unknown view key ['+values.key+']:', {error:err, values:value, application: application });
			return null;
		}

	}


}
