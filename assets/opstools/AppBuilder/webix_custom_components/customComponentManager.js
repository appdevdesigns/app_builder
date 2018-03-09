
/*
 * custom_savablelayout
 *
 * Create a custom webix component.
 *
 */

// Import our Custom Components here:
import ActiveList from '../webix_custom_components/activelist'
import DateTimePicker from '../webix_custom_components/datetimepicker'
import EditList from '../webix_custom_components/editlist'
import EditTree from '../webix_custom_components/edittree'
import EditUnitList from '../webix_custom_components/editunitlist'
import FocusableTemplate from '../webix_custom_components/focusableTemplate'
import NumberText from '../webix_custom_components/numbertext'
// import SavableLayout from '../webix_custom_components/savablelayout'

var componentList = [
	ActiveList, 
	DateTimePicker, 
	EditList, 
	EditTree, 
	EditUnitList,
	FocusableTemplate,
	NumberText
	// SavableLayout
]

export default class ABCustomComponentManager {

	constructor() {
	

	}

	initComponents(App) {

		App.custom = App.custom || {};

		componentList.forEach((Component) => {
			var component = new Component(App);
			App.custom[component.key] = component;
		})

	}
}