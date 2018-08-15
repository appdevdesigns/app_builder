/* 
 * ABViewManager
 * 
 * An interface for managing the different ABViews available in our AppBuilder.
 *
 */

import ABView from "./views/ABView"
import ABViewChart from "./views/ABViewChart"
import ABViewChartPie from "./views/ABViewChartPie"
import ABViewChartBar from "./views/ABViewChartBar"
import ABViewChartLine from "./views/ABViewChartLine"
import ABViewChartArea from "./views/ABViewChartArea"
import ABViewConditionalContainer from "./views/ABViewConditionalContainer"
import ABViewContainer from "./views/ABViewContainer"
import ABViewDataCollection from "./views/ABViewDataCollection"
import ABViewDataview from "./views/ABViewDataview"
import ABViewPage from "./views/ABViewPage"
import ABViewPivot from "./views/ABViewPivot"
import ABViewLabel from "./views/ABViewLabel"
import ABViewLayout from "./views/ABViewLayout"
import ABViewList from "./views/ABViewList"
import ABViewMenu from "./views/ABViewMenu"
import ABViewGrid from "./views/ABViewGrid"
import ABViewImage from "./views/ABViewImage"
import ABViewTab from "./views/ABViewTab"
import ABViewText from "./views/ABViewText"

import ABViewDetail from "./views/ABViewDetail"
import ABViewDetailCheckbox from "./views/ABViewDetailCheckbox"
import ABViewDetailCustom from "./views/ABViewDetailCustom"
import ABViewDetailImage from "./views/ABViewDetailImage"
import ABViewDetailSelectivity from "./views/ABViewDetailSelectivity"
import ABViewDetailText from "./views/ABViewDetailText"
import ABViewDetailTree from "./views/ABViewDetailTree"

import ABViewForm from "./views/ABViewForm"
import ABViewFormButton from "./views/ABViewFormButton"
import ABViewFormCheckbox from "./views/ABViewFormCheckbox"
import ABViewFormConnect from "./views/ABViewFormConnect"
import ABViewFormCustom from "./views/ABViewFormCustom"
import ABViewFormDatepicker from "./views/ABViewFormDatepicker"
import ABViewFormNumber from "./views/ABViewFormNumber"
import ABViewFormSelectSingle from "./views/ABViewFormSelectSingle"
import ABViewFormTextbox from "./views/ABViewFormTextbox"
import ABViewFormTree from "./views/ABViewFormTree"

import ABViewReport from "./views/ABViewReport"
import ABViewReportPage from "./views/ABViewReportPage"
import ABViewReportPanel from "./views/ABViewReportPanel"

// import ABViewFormText from "./views/ABViewFormText"

/* 
 * Views
 * A name => ABView  hash of the different ABViews available.
 */
var Views = {};
Views[ABView.common().key] = ABView;

Views[ABViewChart.common().key] = ABViewChart;
Views[ABViewChartPie.common().key] = ABViewChartPie;
Views[ABViewChartBar.common().key] = ABViewChartBar;
Views[ABViewChartLine.common().key] = ABViewChartLine;
Views[ABViewChartArea.common().key] = ABViewChartArea;

Views[ABViewConditionalContainer.common().key] = ABViewConditionalContainer;
Views[ABViewContainer.common().key] = ABViewContainer;
Views[ABViewDataCollection.common().key] = ABViewDataCollection;
Views[ABViewDataview.common().key] = ABViewDataview;
Views[ABViewPage.common().key] = ABViewPage;
Views[ABViewPivot.common().key] = ABViewPivot;
Views[ABViewLabel.common().key] = ABViewLabel;
Views[ABViewLayout.common().key] = ABViewLayout;
Views[ABViewList.common().key] = ABViewList;
Views[ABViewMenu.common().key] = ABViewMenu;
Views[ABViewGrid.common().key] = ABViewGrid;
Views[ABViewImage.common().key] = ABViewImage;
Views[ABViewTab.common().key] = ABViewTab;
Views[ABViewText.common().key] = ABViewText;

Views[ABViewDetail.common().key] = ABViewDetail;
Views[ABViewDetailCheckbox.common().key] = ABViewDetailCheckbox;
Views[ABViewDetailCustom.common().key] = ABViewDetailCustom;
Views[ABViewDetailImage.common().key] = ABViewDetailImage;
Views[ABViewDetailSelectivity.common().key] = ABViewDetailSelectivity;
Views[ABViewDetailText.common().key] = ABViewDetailText;
Views[ABViewDetailTree.common().key] = ABViewDetailTree;

Views[ABViewForm.common().key] = ABViewForm;
Views[ABViewFormButton.common().key] = ABViewFormButton;
Views[ABViewFormCheckbox.common().key] = ABViewFormCheckbox;
Views[ABViewFormConnect.common().key] = ABViewFormConnect;
Views[ABViewFormCustom.common().key] = ABViewFormCustom;
Views[ABViewFormDatepicker.common().key] = ABViewFormDatepicker;
Views[ABViewFormNumber.common().key] = ABViewFormNumber;
Views[ABViewFormSelectSingle.common().key] = ABViewFormSelectSingle;
Views[ABViewFormTextbox.common().key] = ABViewFormTextbox;
Views[ABViewFormTree.common().key] = ABViewFormTree;
// Views[ABViewForm.common().key] = ABViewForm;
// Views[ABViewFormText.common().key] = ABViewFormText;

Views[ABViewReport.common().key] = ABViewReport;
Views[ABViewReportPage.common().key] = ABViewReportPage;
Views[ABViewReportPanel.common().key] = ABViewReportPanel;



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
		
		if ((values.key) && (Views[values.key])) {
			return new Views[values.key](values, application, parent);
		} else {
			var err = new Error('unknown view key');
			OP.Error.log('Unknown view key ['+values.key+']:', {error:err, values:values, application: application });
			return null;
		}

	}


}
