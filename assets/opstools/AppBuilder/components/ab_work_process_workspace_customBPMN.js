/*
 * ab_work_object_workspace_customElements
 *
 * Provide customized interface modifications to BPMN Modler
 *
 */
import PaletteProvider from "./ab_work_process_workspace_customBPMN_paletteProvider";
import ReplaceMenuProvider from "./ab_work_process_workspace_customBPMN_replaceMenuProvider";

export default {
    __init__: ["paletteProvider", "replaceMenuProvider"],
    paletteProvider: ["type", PaletteProvider],
    replaceMenuProvider: ["type", ReplaceMenuProvider]
};
