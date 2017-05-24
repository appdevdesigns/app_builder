
export default class UIComponent {
    
    /**
     * @param {object} App 
     *      ?what is this?
     * @param {string} idBase
     *      Identifier for this component
     */
	constructor(App, idBase) {

		if (!App) {
			App = {

				uuid: webix.uid(),

				/*
				 * actions:
				 * a hash of exposed application methods that are shared among our
				 * components, so one component can invoke an action that updates
				 * another component.
				 */
				actions:{

				},


				/*
				 * config
				 * webix configuration settings for our current browser
				 */
				config:OP.Config.config(),

				/*
				 * custom
				 * a collection of custom components for this App Instance.
				 */
				custom:{

				},

				/*
				 * labels
				 * a collection of labels that are common for the Application.
				 */
				labels:{

				},

				/*
				 * unique()
				 * A function that returns a globally unique Key.
				 * @param {string} key   The key to modify and return.
				 * @return {string}
				 */
				unique: function(key) { return key+this.uuid; },

			}
		}

		this.App = App;

		this.idBase = idBase || '?idbase?';
	}


	actions(_actions) {
		if (_actions){
			for(var a in _actions) {
				this.App.actions[a] = _actions[a];
			}
		}
	}


	Label(key, altText) {
		return AD.lang.label.getLabel(key) || altText;
	}


	unique(key) {
		return this.App.unique(this.idBase + '_' + key);
	}


}