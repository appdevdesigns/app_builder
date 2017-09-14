/* 
 * ABViewManager
 * 
 * An interface for managing the different ABViews available in our AppBuilder.
 *
 */

import ABView from "./views/ABView"
import ABViewDataSource from "./views/ABViewDataSource"
import ABViewPage from "./views/ABViewPage"
import ABViewLabel from "./views/ABViewLabel"
import ABViewLayout from "./views/ABViewLayout"
import ABViewMenu from "./views/ABViewMenu"
import ABViewGrid from "./views/ABViewGrid"
import ABViewTab from "./views/ABViewTab"

import ABViewDetail from "./views/ABViewDetail"
import ABViewDetailCustom from "./views/ABViewDetailCustom"
import ABViewDetailText from "./views/ABViewDetailText"

import ABViewForm from "./views/ABViewForm"
import ABViewFormButton from "./views/ABViewFormButton"
import ABViewFormCheckbox from "./views/ABViewFormCheckbox"
import ABViewFormCustom from "./views/ABViewFormCustom"
import ABViewFormDatepicker from "./views/ABViewFormDatepicker"
import ABViewFormNumber from "./views/ABViewFormNumber"
import ABViewFormSelectSingle from "./views/ABViewFormSelectSingle"
import ABViewFormTextbox from "./views/ABViewFormTextbox"
// import ABViewFormText from "./views/ABViewFormText"

/* 
 * Views
 * A name => ABView  hash of the different ABViews available.
 */
var Views = {};
Views[ABView.common().key] = ABView;
Views[ABViewDataSource.common().key] = ABViewDataSource;
Views[ABViewPage.common().key] = ABViewPage;
Views[ABViewLabel.common().key] = ABViewLabel;
Views[ABViewLayout.common().key] = ABViewLayout;
Views[ABViewMenu.common().key] = ABViewMenu;
Views[ABViewGrid.common().key] = ABViewGrid;
Views[ABViewTab.common().key] = ABViewTab;

Views[ABViewDetail.common().key] = ABViewDetail;
Views[ABViewDetailCustom.common().key] = ABViewDetailCustom;
Views[ABViewDetailText.common().key] = ABViewDetailText;

Views[ABViewForm.common().key] = ABViewForm;
Views[ABViewFormButton.common().key] = ABViewFormButton;
Views[ABViewFormCheckbox.common().key] = ABViewFormCheckbox;
Views[ABViewFormCustom.common().key] = ABViewFormCustom;
Views[ABViewFormDatepicker.common().key] = ABViewFormDatepicker;
Views[ABViewFormNumber.common().key] = ABViewFormNumber;
Views[ABViewFormSelectSingle.common().key] = ABViewFormSelectSingle;
Views[ABViewFormTextbox.common().key] = ABViewFormTextbox;
// Views[ABViewForm.common().key] = ABViewForm;
// Views[ABViewFormText.common().key] = ABViewFormText;


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
			OP.Error.log('Unknown view key ['+values.key+']:', {error:err, values:values, application: application });
			return null;
		}

	}


}
