
/*
 * custom_savablelayout
 *
 * Create a custom webix component.
 *
 */


var ComponentKey = 'ab_custom_savablelayout';
export default class ABCustomSavableLayout extends OP.CustomComponent {

	constructor(App, key) {
		// App 	{obj}	our application instance object.
		// key {string}	the destination key in App.custom[componentKey] for the instance of this component:

		super(App, key);

		var L = this.Label;


		var labels = {

			common: App.labels,

			component: {

			}

		}

		// internal list of Webix IDs to reference our UI components.
		var ids = {
			component: App.unique(ComponentKey),
		}



		// Our webix UI definition:
		var _ui = {
			name: ComponentKey,
			getState: function () {

				var store = new webix.TreeCollection();
				webix.extend(store, {
					name: "EditorState",
					$init: function () {
						// overwrite .serialize to export element format
						this.serialize = function (e, t) {

							var rootId = this.getFirstId();
							var rootItem = this.getItem(rootId);

							return _logic.normalize(this, rootItem);

						}
					}
				}, true);


				// save children views to TreeCollection
				_logic.saveChildren(store, this);

				// get JSON of elements
				var result = store.serialize();

				return result;
			},
			setState: function (state, prefix) {

				var views = state ? (state.rows || state.cols || []) : [];

				// rebuild layout
				this.reconstruct();

				// Add rows/cols definition
				views.forEach((v) => {

					this.addView(v);
				});

			}
		};
		this.view = ComponentKey;



		// our internal business logic 
		var _logic = {

			/**
			 * @method saveChildren
			 * 
			 * @param store {webix.TreeCollection}
			 * @param elem {Object} the webix element
			 * @param parentId {integer - nullable} id of parent id
			 */
			saveChildren: function (store, elem, parentId) {

				var vals = {};

				// get required properties
				['id', 'rows', 'cols'].forEach(function (propName) {
					if (propName in elem.config)
						vals[propName] = elem.config[propName];
				});

				// add to TreeStore
				store.add(vals, null, parentId || null);

				// get sub-children
				if (elem && elem.getChildViews) {

					elem.getChildViews().forEach(function (e) {

						// call sub-children
						_logic.saveChildren(store, e, elem.config.id);

					});

				}
			},


			/**
			 * @method normalize
			 * Move .data to .rows/.cols property
			 * TreeCollection stores sub-data in .data, then we should move to UI rows/cols
			 * 
			 * @param store {webix.TreeCollection}
			 * @param item {object}
			 */
			normalize: function (store, item) {

				var result = {};

				// get sub-children
				var children = [];
				store.data.eachChild(item.id, function (subitem) {
					var subResult = _logic.normalize(store, subitem);
					children.push(subResult);
				});

				// If the element has .rows property
				if ('rows' in item) {
					result.rows = children;
				}
				// Else if the element has .cols property
				else if ('cols' in item) {
					result.cols = children;
				}

				// Check if it is id of a component, then should set to result
				// Check by uuid format
				var uuidFormat = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
				if (uuidFormat.test(item.id))
					result.id = item.id;

				return result;

			}

		}
		this._logic = _logic;


		// Tell Webix to create an INSTANCE of our custom component:
		webix.protoUI(_ui, webix.ui.layout, webix.UIManager);

	}

}