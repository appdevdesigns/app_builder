
/*
 * ab_work_process_list
 *
 * Manage the Process List
 *
 */
import ABCommonList from "./ab_common_list";
import ABListNewProcess from "./ab_work_process_list_newProcess";


const ABProcess = require("../classes/ABProcess");

export default class AB_Work_Process_List extends OP.Component {   //.extend(idBase, function(App) {

	constructor(App) {
		super(App, 'ab_work_process_list');
		var L = this.Label;

		// There is a Popup for adding a new Process:
		var ListComponent = new ABCommonList(App, {
			idBase: this.idBase,
			labels:{
				addNew: L('ab.process.addNew', '*Add new process'),
				confirmDeleteTitle: L('ab.process.delete.title', "*Delete Process"),
				title: L('ab.process.list.title', '*Processes'),
				searchPlaceholder: L('ab.process.list.search.placeholder', "*Process name")
			},
			templateListItem:"<div class='ab-object-list-item'>#label#{common.iconGear}</div>"
		});


		// Our webix UI definition:
		this.ui = ListComponent.ui;



		var CurrentApplication = null;
		var processList = null;

		var AddForm = new ABListNewProcess(App);
			// the popup form for adding a new process


		// Our init() function for setting up our UI
		this.init = (options) => {


			//
			// List of Processes
			//
			ListComponent.init();
    
    		ListComponent.on("selected", (process)=>{
    			this.emit("selected", process);
    		});

    		ListComponent.on("addNew", (selectNew)=>{
    			this._logic.clickNewProcess(selectNew);
    		});

    		ListComponent.on("removed", (process)=>{
    			
    		});

    		ListComponent.on("exclude", (process)=>{
    			this._logic.exclude(process)
    		});

    		ListComponent.on("copied", (data)=>{
    			this._logic.copy(data)
    		});


    		// ListComponent.on("menu", (data)=>{
    		// 	console.log(data);
    		// 	switch (data.command) {
    		// 		case "exclude":
    		// 			this._logic.exclude(process);
    		// 			break;

    		// 		case "copy":
    		// 			break;
    		// 	}
    		// })


    		//
    		// Add Form
    		//
    		AddForm.init();

    		AddForm.on("cancel", ()=>{
    			AddForm.hide();
    		});

    		AddForm.on("save", (values)=>{

				AddForm.busy();
				CurrentApplication.processCreate(values)
				.then((newProcess)=>{
					ListComponent.dataLoad(CurrentApplication.processes());
					AddForm.ready();
					AddForm.clear();
    				AddForm.hide();
    				ListComponent.select(newProcess.id);
				})
				.catch((err)=>{
console.error(err);
					// TODO: create a validation object here:
					AddForm.errors( null );
				})
    			
    		});
		}



		// our internal business logic
		var _logic = this._logic = {


			/**
			 * @function applicationLoad
			 *
			 * Initialize the Process List from the provided ABApplication
			 *
			 * If no ABApplication is provided, then show an empty form. (create operation)
			 *
			 * @param {ABApplication} application  	[optional] The current ABApplication
			 *										we are working with.
			 */
			applicationLoad : function(application){

				CurrentApplication = application;

				ListComponent.applicationLoad(application);
				ListComponent.dataLoad(application.processes());

				// get a DataCollection of all our object

			},


			/**
			 * @function callbackNewProcess
			 *
			 * Once a New Process was created in the Popup, follow up with it here.
			 */
			callbackNewProcess:function(err, object, selectNew, callback){

				if (err) {
					OP.Error.log('Error creating New Process', {error: err});
					return;
				}

				let objects = CurrentApplication.objects();
				processList.parse(objects);

				// if (processList.exists(object.id))
				// 	processList.updateItem(object.id, object);
				// else
				// 	processList.add(object);

				if (selectNew != null && selectNew == true) {
					$$(ids.list).select(object.id);
				}
				else if (callback) {
					callback();
				}

			},


			/**
			 * @function clickNewProcess
			 *
			 * Manages initiating the transition to the new Process Popup window
			 */
			clickNewProcess:function(selectNew) {
				// show the new popup
console.log(".clickNewProcess(): show popup here!  SelectNew:"+selectNew);
				AddForm.show();

			},

			/*
			 * @function copy
			 * the list component notified us of a copy action and has
			 * given us the new data for the copied item.
			 * 
			 * now our job is to create a new instance of that Item and
			 * tell the list to display it
			 */
			copy: function(data) {

				ListComponent.busy();

				CurrentApplication.processCreate(data.item)
					.then((newProcess) => {
						ListComponent.ready();
						ListComponent.dataLoad(CurrentApplication.processes());
						ListComponent.select(newProcess.id);
					});

			},

			/*
			 * @function exclude
			 * the list component notified us of an exclude action and which
			 * item was chosen.
			 * 
			 * perform the removal and update the UI.
			 */
			exclude: function(process) {

				ListComponent.busy();
				CurrentApplication.processRemove(process)
					.then(() => {
						ListComponent.dataLoad(CurrentApplication.processes());
						// clear object workspace
						this.emit("selected", null);
					});
			},

		}


		// Expose any globally accessible Actions:
		this.actions({


			/**
			 * @function getSelectedProcess
			 *
			 * returns which ABProcess is currently selected.
			 * @return {ABProcess}  or {null} if nothing selected.
			 */
			getSelectedProcess:function() {
				return $$(ids.list).getSelectedItem();
			},

			addNewProcess:function(selectNew, callback) {
				_logic.clickNewProcess(selectNew, callback);
			}

		})


		// 
		// Define our external interface methods:
		// 
		this.applicationLoad = _logic.applicationLoad;
		this.busy = ListComponent.busy;
		this.ready = ListComponent.ready;
		this.count = ListComponent.count;

	}

}