/* 
 * ABViewManager
 * 
 * An interface for managing the different ABViews available in our AppBuilder.
 *
 */

const ABView = require("./views/ABView");
const ABViewCarousel = require("./views/ABViewCarousel");
const ABViewChart = require("./views/ABViewChart");
const ABViewChartPie = require("./views/ABViewChartPie");
const ABViewChartBar = require("./views/ABViewChartBar");
const ABViewChartLine = require("./views/ABViewChartLine");
const ABViewChartArea = require("./views/ABViewChartArea");
const ABViewComment = require("./views/ABViewComment");
const ABViewConditionalContainer = require("./views/ABViewConditionalContainer");
const ABViewContainer = require("./views/ABViewContainer");
const ABViewDocxBuilder = require("./views/ABViewDocxBuilder");
const ABViewDatacollection = require("./views/ABViewDatacollection");
const ABViewPage = require("./views/ABViewPage");
const ABViewPivot = require("./views/ABViewPivot");
const ABViewLabel = require("./views/ABViewLabel");
const ABViewLayout = require("./views/ABViewLayout");
const ABViewList = require("./views/ABViewList");
const ABViewMenu = require("./views/ABViewMenu");
const ABViewGrid = require("./views/ABViewGrid");
const ABViewImage = require("./views/ABViewImage");
const ABViewTab = require("./views/ABViewTab");
const ABViewText = require("./views/ABViewText");
const ABViewKanban = require("./views/ABViewKanban");

const ABViewDetail = require("./views/ABViewDetail");
const ABViewDetailCheckbox = require("./views/ABViewDetailCheckbox");
const ABViewDetailCustom = require("./views/ABViewDetailCustom");
const ABViewDetailImage = require("./views/ABViewDetailImage");
const ABViewDetailSelectivity = require("./views/ABViewDetailSelectivity");
const ABViewDetailText = require("./views/ABViewDetailText");
const ABViewDetailTree = require("./views/ABViewDetailTree");

const ABViewForm = require("./views/ABViewForm");
const ABViewFormButton = require("./views/ABViewFormButton");
const ABViewFormCheckbox = require("./views/ABViewFormCheckbox");
const ABViewFormConnect = require("./views/ABViewFormConnect");
const ABViewFormCustom = require("./views/ABViewFormCustom");
const ABViewFormDatepicker = require("./views/ABViewFormDatepicker");
const ABViewFormNumber = require("./views/ABViewFormNumber");
const ABViewFormSelectSingle = require("./views/ABViewFormSelectSingle");
const ABViewFormReadonly = require("./views/ABViewFormReadonly");
const ABViewFormTextbox = require("./views/ABViewFormTextbox");
const ABViewFormTree = require("./views/ABViewFormTree");

// const ABViewReport = require("./views/ABViewReport");
// const ABViewReportPage = require("./views/ABViewReportPage");
// const ABViewReportPanel = require("./views/ABViewReportPanel");

// const ABViewFormText = require("./views/ABViewFormText");

/* 
 * Views
 * A name => ABView  hash of the different ABViews available.
 */
var Views = {};
Views[ABView.common().key] = ABView;

Views[ABViewCarousel.common().key] = ABViewCarousel;
Views[ABViewChart.common().key] = ABViewChart;
Views[ABViewChartPie.common().key] = ABViewChartPie;
Views[ABViewChartBar.common().key] = ABViewChartBar;
Views[ABViewChartLine.common().key] = ABViewChartLine;
Views[ABViewChartArea.common().key] = ABViewChartArea;

Views[ABViewComment.common().key] = ABViewComment;
Views[ABViewConditionalContainer.common().key] = ABViewConditionalContainer;
Views[ABViewContainer.common().key] = ABViewContainer;
Views[ABViewDatacollection.common().key] = ABViewDatacollection;
Views[ABViewDocxBuilder.common().key] = ABViewDocxBuilder;
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
Views[ABViewKanban.common().key] = ABViewKanban;

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
Views[ABViewFormReadonly.common().key] = ABViewFormReadonly;
Views[ABViewFormTextbox.common().key] = ABViewFormTextbox;
Views[ABViewFormTree.common().key] = ABViewFormTree;
// Views[ABViewForm.common().key] = ABViewForm;
// Views[ABViewFormText.common().key] = ABViewFormText;

// Views[ABViewReport.common().key] = ABViewReport;
// Views[ABViewReportPage.common().key] = ABViewReportPage;
// Views[ABViewReportPanel.common().key] = ABViewReportPanel;



module.exports = {


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
