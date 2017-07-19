
/*
 * AB
 *
 * The base AppBuilder component.  It manages these components:
 *   - ab_choose :  choose an application to work with
 *   - ab_work   :  load an application into the work area
 *
 */

// import '../OP/OP'

import AB_Choose from './ab_choose'
import AB_Work from './ab_work'

// Import our Custom Components here:
import ActiveList from '../webix_custom_components/activelist'
import EditTree from '../webix_custom_components/edittree'
import EditList from '../webix_custom_components/editlist'
import DateTimePicker from '../webix_custom_components/datetimepicker'

import style from "../AppBuilder.css"

export default class AB extends OP.Component {    //('ab', function(App) {


	constructor(App) {
		super(App, 'ab');

		App = this.App;
		var L = this.Label;


		// setup the common labels for our AppBuilder Application.
		App.labels = {
			add: L('ab.common.add', "*Add"),
			create: L('ab.common.create', "*Create"),
			"delete": L('ab.common.delete', "*Delete"),
			edit: 	  L('ab.common.edit', "*Edit"),
			"export": L('ab.common.export', "*Export"),
			formName: L('ab.common.form.name', "*Name"),
			"import": L('ab.common.import', "*Import"),
			rename: L('ab.common.rename', "*Rename"),
			ok: 	  L('ab.common.ok', "*Ok"),

			cancel:   L('ab.common.cancel', "*Cancel"),
			save: 	  L('ab.common.save', "*Save"),

			yes: 	  L('ab.common.yes', "*Yes"),
			no: 	  L('ab.common.no', "*No"),

			createErrorMessage:   L('ab.common.create.error', "*System could not create <b>{0}</b>."),
			createSuccessMessage: L('ab.common.create.success', "*<b>{0}</b> is created."),

			updateErrorMessage:  L('ab.common.update.error', "*System could not update <b>{0}</b>."),
			updateSucessMessage: L('ab.common.update.success', "*<b>{0}</b> is updated."),

			deleteErrorMessage:   L('ab.common.delete.error', "*System could not delete <b>{0}</b>."),
			deleteSuccessMessage: L('ab.common.delete.success', "*<b>{0}</b> is deleted."),

			renameErrorMessage: L('ab.common.rename.error', "*System could not rename <b>{0}</b>."),
			renameSuccessMessage: L('ab.common.rename.success', "*<b>{0}</b> is renamed."),


			// Data Field  common Property labels:
			dataFieldHeaderLabel: L('ab.dataField.common.headerLabel', '*Label'),
			dataFieldHeaderLabelPlaceholder: L('ab.dataField.common.headerLabelPlaceholder', '*Header Name'),

			dataFieldColumnName: L('ab.dataField.common.columnName', '*Name'),
			dataFieldColumnNamePlaceholder: L('ab.dataField.common.columnNamePlaceholder', '*Column Name'),

			dataFieldShowIcon: L('ab.dataField.common.showIcon', '*show icon?'),
			
			componentDropZone: L('ab.common.componentDropZone', '*drop components here')
		}


		// make instances of our Custom Components:
		new ActiveList(App, 'activelist');	// ->  App.custom.activelist  now exists
		new EditList(App, 'editlist');	// ->  App.custom.editlist  now exists
		new EditTree(App, 'edittree');	// ->  App.custom.edittree  now exists
		new DateTimePicker(App, 'datetimepicker'); // ->  App.custom.datetimepicker  now exists


		var ids = {
			component:this.unique('root')
		}


		// Define the external components used in this Component:
		var AppChooser = new AB_Choose(App);
		var AppWorkspace = new AB_Work(App);


		// This component's UI definition:
		// Application multi-views
		this.ui = {
			id: ids.component,
			view:"multiview",
			borderless:true,
			animate: false,
// height : 800,
			rows:[
				AppChooser.ui,
				AppWorkspace.ui
			]
		};


		this.init = function() {

			AppChooser.init();
			AppWorkspace.init();

			// start off only showing the App Chooser:
			App.actions.transitionApplicationChooser();

			// perform an initial resize adjustment
			$$(ids.component).adjust();
		}



		this.actions({

		})



		this._app = App;  // for unit testing.

	}

};






//// REFACTORING TODOs:
// TODO: AppForm-> Permissions : refresh permission list, remove AppRole permission on Application.delete().
