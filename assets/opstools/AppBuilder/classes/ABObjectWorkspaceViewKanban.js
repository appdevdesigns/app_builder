// ABObjectWorkspaceViewKanban.js
//
// Manages the settings for a Data Grid View in the AppBuilder Object Workspace

import ABObjectWorkspaceView from './ABObjectWorkspaceView'

var defaultValues = {
		name: 'Default Kanban',
		filterConditions:[], // array of filters to apply to the data table
		verticalGroupingField: null,
		horizontalGroupingField: null,
		ownerField: null,
	};

export default class ABObjectWorkspaceViewKanban extends ABObjectWorkspaceView {

	constructor(attributes, object) {
		super(attributes, object, 'kanban');

/*
	{
		id:uuid(),
		type:'kanban',  
		filterConditions:[],
	}

*/


	}


	/**
	 * unique key describing this View.
	 * @return {string}
	 */
	static type() {
		return 'kanban';
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

		this.type = ABObjectWorkspaceViewKanban.type();
	}


	/**
	 * @method toObj()
	 * compile our current state into a {json} object
	 * that can be persisted.
	 */
	toObj () {
		var obj = super.toObj();

		for (var v in defaultValues) {
			obj[v] = this[v];
		}

		obj.type = 'kanban';
		return obj;
	}
}

