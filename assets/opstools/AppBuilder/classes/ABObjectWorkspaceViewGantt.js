// ABObjectWorkspaceViewGantt.js
//
// Manages the settings for a Gantt Chart View in the AppBuilder Object Workspace

import ABObjectWorkspaceView from './ABObjectWorkspaceView'

import ABObjectWorkspaceViewComponent from './ABObjectWorkspaceViewComponent'

import ABFieldDate from "../classes/dataFields/ABFieldDate";
import ABFieldNumber from "../classes/dataFields/ABFieldNumber";

var defaultValues = {
	name: 'Default Gantt',
	filterConditions: [], // array of filters to apply to the data table
	startDate: '',
	duration: ''
};

export default class ABObjectWorkspaceViewGantt extends ABObjectWorkspaceView {

	constructor(attributes, object) {
		super(attributes, object, 'gantt');

		/*
			{
				id:uuid(),
				type:'gantt',  
				filterConditions:[],
			}
		
		*/

	}


	/**
	 * unique key describing this View.
	 * @return {string}
	 */
	static type() {
		return 'gantt';
	}

	/**
	 * @return {string}
	 */
	static icon() {
		return "fa fa-tasks";
	}

	static component(App, idBase) {

		let ids = {
			startDate: App.unique(idBase + "_popupGanttStartDate"),
			duration: App.unique(idBase + "_popupGanttDuration"),
		};

		let L = (key, altText) => {
			return AD.lang.label.getLabel(key) || altText;
		}

		let labels = {
			common: App.labels,
			component: {
				startDate: L("ab.gantt.startDate", "*Start Date"),
				duration: L("ab.gantt.duration", "*Duration"),

				startDatePlaceholder: L(
					"ab.gantt.startDatePlaceholder",
					"*Select a date field"
				),
				durationPlaceholder: L(
					"ab.gantt.durationPlaceholder",
					"*Select a number field"
				)

			}
		};

		return new ABObjectWorkspaceViewComponent({

			elements: () => {
				return {
					batch: "gantt",
					rows: [
						{
							id: ids.startDate,
							view: "richselect",
							label: `<span class='webix_icon fa fa-calendar'></span> ${labels.component.startDate}`,
							placeholder: labels.component.startDatePlaceholder,
							labelWidth: 180,
							name: "startDate",
							required: true,
							options: []
						},
						{
							id: ids.duration,
							view: "richselect",
							label: `<span class='webix_icon fa fa-hashtag'></span> ${labels.component.duration}`,
							placeholder: labels.component.durationPlaceholder,
							labelWidth: 180,
							name: "duration",
							required: true,
							options: []
						}
					]
				};
			},

			init: (object, view) => {

				if (!object)
					return;

				// Start date
				let dateFields = object
					.fields(f => f instanceof ABFieldDate)
					.map(({ id, label }) => ({ id, value: label }));

				$$(ids.startDate).define('options', dateFields);

				// Duration
				let numberFields = object
					.fields(f => f instanceof ABFieldNumber)
					.map(({ id, label }) => ({ id, value: label }));

				$$(ids.duration).define('options', numberFields);


				// Select view's values
				if (view.startDate) {
					$$(ids.startDate).define("value", view.startDate);
					$$(ids.startDate).refresh();
				}

				if (view.duration) {
					$$(ids.duration).define("value", view.duration);
					$$(ids.duration).refresh();
				}

			},

			values: function () {

				let result = {};

				result.startDate  = $$(ids.startDate).getValue() || null;
				result.duration = $$(ids.duration).getValue() || null;

				return result;

			}

		});


	}


	/**
	 * @method fromObj
	 * take our persisted data, and properly load it
	 * into this object instance.
	 * @param {json} data  the persisted data
	 */
	fromObj(data) {
		super.fromObj(data);

		for (var v in defaultValues) {
			this[v] = data[v] || defaultValues[v];
		}

		this.type = ABObjectWorkspaceViewGantt.type();
	}


	/**
	 * @method toObj()
	 * compile our current state into a {json} object
	 * that can be persisted.
	 */
	toObj() {
		var obj = super.toObj();

		for (var v in defaultValues) {
			obj[v] = this[v];
		}

		obj.type = 'gantt';
		return obj;
	}


	getStartDateField() {

		let viewCollection = this.object, // Should use another name property ?
			object = viewCollection.object;

		return object.fields(f => f.id == this.startDate)[0];
	}


	getDurationField() {

		let viewCollection = this.object, // Should use another name property ?
			object = viewCollection.object;

		return object.fields(f => f.id == this.duration)[0];
	}


}