module.exports = {
   paths: {
      "opstools/BuildApp": "opstools/BuildApp/BuildApp.js",
      "bundles/opstools/BuildApp": "dist/bundles/opstools/BuildApp.js?v=2"
   },
   bundle: ["opstools/BuildApp"],
   meta: {
      "opstools/BuildApp/OP_Bundle": {
         format: "global",
         sideBundle: true
      },
      "opstools/BuildApp": {
         deps: [
            "async",
            "webix",
            "js/webix/extras/tinymce",
            "js/selectivity/selectivity.min",
            "js/vfs_fonts",
            "js/moment-locales.min",
            "js/docxtemplater-image-module.v3.0.2.min",
            "OpsPortal/classes/OpsWebixDataCollection",
            "opstools/BuildApp/OP_Bundle",
            "js/formio/formio.full.min",
            "js/webix/components/activecontent",
            "js/pdftron/webviewer.min"
         ],
         format: "global"
      },
      "js/selectivity/selectivity.min": {
         format: "global",
         deps: ["js/selectivity/selectivity.min.css"],
         sideBundle: true
      },
      "js/vfs_fonts": {
         format: "global",
         deps: ["js/pdfmake"],
         sideBundle: true
      },
      "js/pdfmake": {
         format: "global",
         deps: [],
         sideBundle: true
      },
      "js/docxtemplater-image-module.v3.0.2.min": {
         format: "global",
         deps: ["js/docxtemplater.v3.0.12.min"],
         sideBundle: true
      },
      "js/docxtemplater.v3.0.12.min": {
         format: "global",
         deps: ["js/jszip.min", "js/jszip-utils.min"],
         sideBundle: true
      },
      "js/jszip.min": {
         format: "global",
         deps: [],
         sideBundle: true
      },
      "js/jszip-utils.min": {
         format: "global",
         deps: [],
         sideBundle: true
      },
      "js/formio/formio.full.min": {
         format: "global",
         deps: [
            "js/formio/formio.builder.min.css",
            "js/formio/formio.form.min.css"
         ],
         sideBundle: true
      },
      "js/pdftron/webviewer.min": {
         format: "global",
         deps: [],
         sideBundle: true
      }
   }
};
