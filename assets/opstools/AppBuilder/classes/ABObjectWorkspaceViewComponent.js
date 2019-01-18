// ABObjectWorkspaceViewComponent.js
//

export default class ABObjectWorkspaceViewComponent {

	constructor(options) {

		this.elements = options.elements || function () { return []; };
		this.init = options.init || function () { };
		this.values = options.values || function () { return {}; };

	}


}