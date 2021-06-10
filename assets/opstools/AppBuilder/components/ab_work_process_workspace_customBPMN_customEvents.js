/*
 * ab_work_object_workspace_customElements
 *
 * Provide definitions for our special events/UI diagrams
 *
 */

/**
 * For Example, see the following :
 * https://github.com/bpmn-io/bpmn-js-example-model-extension
 */
export default function customEvents() {
    return {
        name: "AppBuilder",
        uri: "http://some-company/schema/bpmn/ab",
        prefix: "ab",
        xml: {
            tagAlias: "lowerCase"
        },
        types: [
            {
                name: "SignalLifecycle",
                extends: ["bpmn:SignalEventDefinition"],
                // extends: ["bpmn:FlowNode"],
                properties: []
            },
            {
                name: "SignalTriggerTimer",
                extends: ["bpmn:SignalEventDefinition"],
                // extends: ["bpmn:FlowNode"],
                properties: []
            }
        ],
        emumerations: [],
        associations: []
    };
}
