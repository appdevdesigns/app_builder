/*
 * ab_work_object_workspace_model
 *
 * Manage the Object Workspace area.
 *
 */

export default class ABWorkProcessWorkspaceModel extends OP.Component {
    /**
     * @param {object} App
     * @param {string} idBase
     */
    constructor(App, idBase) {
        idBase = idBase || "ab_work_process_workspace_model";

        super(App, idBase);
        var L = this.Label;

        var labels = {
            common: App.labels,
            component: {
                label: L("ab.process.model.label", "*Model")
            }
        };

        // default settings

        // internal list of Webix IDs to reference our UI components.
        var ids = {
            component: this.unique("_component")
        };

        // Our webix UI definition:
        this.ui = {
            view: "multiview",
            id: ids.component,
            rows: [
                {
                    id: "model",
                    rows: [
                        {
                            maxHeight: App.config.xxxLargeSpacer,
                            hidden: App.config.hideMobile
                        },
                        {
                            view: "label",
                            align: "center",
                            height: 200,
                            label:
                                "<div style='display: block; font-size: 180px; background-color: #666; color: transparent; text-shadow: 0px 1px 1px rgba(255,255,255,0.5); -webkit-background-clip: text; -moz-background-clip: text; background-clip: text;' class='fa fa-database'></div>"
                        },
                        {
                            view: "label",
                            align: "center",
                            label: labels.component.label
                        },
                        {
                            maxHeight: App.config.xxxLargeSpacer,
                            hidden: App.config.hideMobile
                        }
                    ]
                }
            ]
        };

        // Our init() function for setting up our UI
        this.init = function() {
            // $$(ids.noSelection).show();
        };

        var CurrentApplication = null;
        var CurrentProcess = null;

        // our internal business logic
        var _logic = {
            ////

            /**
             * @function applicationLoad
             *
             * Initialize the Object Workspace with the given ABApplication.
             *
             * @param {ABApplication} application
             */
            applicationLoad: (application) => {
                CurrentApplication = application;
            },

            /**
             * @function clearWorkspace()
             *
             * Clear the object workspace.
             */
            clearWorkspace: function() {
                // NOTE: to clear a visual glitch when multiple views are updating
                // at one time ... stop the animation on this one:
                $$(ids.noSelection).show(false, false);
            },

            /**
             * @function populateWorkspace()
             *
             * Initialize the Object Workspace with the provided ABObject.
             *
             * @param {ABObject} object     current ABObject instance we are working with.
             */
            populateWorkspace: function(process) {
                $$(ids.selectedItem).show();

                CurrentProcess = process;
            },

            /**
             * @function show()
             *
             * Show this component.
             */
            show: function() {
                $$(ids.component).show();
            },

            loadData: function() {}
        };
        this._logic = _logic;

        //
        // Define our external interface methods:
        //
        this.applicationLoad = this._logic.applicationLoad;
        this.populateWorkspace = this._logic.populateWorkspace;
        this.clearWorkspace = this._logic.clearWorkspace;
    }
}
