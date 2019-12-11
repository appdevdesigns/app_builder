/*
 * ab_work_object_workspace_customElements
 *
 * Provide customized interface modifications to BPMN Modler
 *
 */

function PaletteProvider(
    palette,
    create,
    elementFactory,
    spaceTool,
    lassoTool,
    handTool,
    translate
) {
    this._palette = palette;
    this._create = create;
    this._elementFactory = elementFactory;
    this._spaceTool = spaceTool;
    this._lassoTool = lassoTool;
    this._handTool = handTool;
    this._translate = translate;

    palette.registerProvider(this);
}

PaletteProvider.$inject = [
    "palette",
    "create",
    "elementFactory",
    "spaceTool",
    "lassoTool",
    "handTool",
    "translate",
    "eventBus"
];

PaletteProvider.prototype.getPaletteEntries = function(element) {
    var actions = {},
        create = this._create,
        elementFactory = this._elementFactory,
        spaceTool = this._spaceTool,
        lassoTool = this._lassoTool,
        handTool = this._handTool,
        translate = this._translate;

    function createAction(type, group, className, title, options) {
        function createListener(event) {
            var sOptions = { type: type };
            if (options) {
                for (var o in options) {
                    sOptions[o] = options[o];
                }
            }
            var shape = elementFactory.createShape(sOptions);

            if (options) {
                shape.businessObject.di.isExpanded = options.isExpanded;
            }

            create.start(event, shape);
        }

        var shortType = type.replace(/^bpmn\:/, "");

        return {
            group: group,
            className: className,
            title: title || translate("Create {type}", { type: shortType }),
            action: {
                dragstart: createListener,
                click: createListener
            }
        };
    }
    function createParticipant(event, collapsed) {
        create.start(event, elementFactory.createParticipantShape(collapsed));
    }

    var actions = {
        "hand-tool": {
            group: "tools",
            className: "bpmn-icon-hand-tool",
            title: translate("Activate the hand tool"),
            action: {
                click: function(event) {
                    handTool.activateHand(event);
                }
            }
        },
        "lasso-tool": {
            group: "tools",
            className: "bpmn-icon-lasso-tool",
            title: translate("Activate the lasso tool"),
            action: {
                click: function(event) {
                    lassoTool.activateSelection(event);
                }
            }
        },
        "space-tool": {
            group: "tools",
            className: "bpmn-icon-space-tool",
            title: translate("Activate the create/remove space tool"),
            action: {
                click: function(event) {
                    spaceTool.activateSelection(event);
                }
            }
        },
        "tool-separator": {
            group: "tools",
            separator: true
        },
        "create.start-event": createAction(
            "bpmn:StartEvent",
            "event",
            "bpmn-icon-start-event-none"
        ),
        // 'create.intermediate-event-catch-timer': createAction(
        //    'bpmn:TimerEventDefinition', 'activity', 'bpmn-icon-intermediate-event-catch-timer'
        // ),

        // "create.intermediate-event": createAction(
        //     "bpmn:IntermediateThrowEvent",
        //     "event",
        //     "bpmn-icon-intermediate-event-none"
        // ),
        "create.end-event": createAction(
            "bpmn:EndEvent",
            "event",
            "bpmn-icon-end-event-none"
        ),
        "create.exclusive-gateway": createAction(
            "bpmn:ExclusiveGateway",
            "gateway",
            "bpmn-icon-gateway-xor"
        ),
        // "create.user-task": createAction(
        //     "bpmn:UserTask",
        //     "activity",
        //     "bpmn-icon-user-task"
        // ),
        //'create.BoundaryEvent': createAction(
        //    'bpmn:BoundaryEvent', 'activity', 'bpmn-icon-intermediate-event-catch-timer'
        //),

        "create.task": createAction("bpmn:Task", "activity", "bpmn-icon-task"),
        //'create.data-object': createAction(
        //  'bpmn:DataObjectReference', 'data-object', 'bpmn-icon-data-object'
        //),
        // "create.Service-Task": createAction(
        //     "bpmn:ServiceTask",
        //     "activity",
        //     "bpmn-icon-service"
        // ),
        // "create.data-store": createAction(
        //     "bpmn:DataStoreReference",
        //     "data-store",
        //     "bpmn-icon-data-store"
        // ),
        //'create.subprocess-expanded': createAction(
        //  'bpmn:SubProcess', 'activity', 'bpmn-icon-subprocess-expanded', translate('Create expanded SubProcess'),
        //  { isExpanded: true }
        //),
        "create.participant-expanded": {
            group: "collaboration",
            className: "bpmn-icon-participant",
            title: translate("Create Pool/Participant"),
            action: {
                dragstart: createParticipant,
                click: createParticipant
            }
        }
    };
    console.log("customPalletProvider.getPalletEntries():", actions);
    return actions;
};

export default PaletteProvider;
