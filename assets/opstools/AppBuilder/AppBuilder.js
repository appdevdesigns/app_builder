// import 'OP';
// import '../../../../../assets/js/webix/webix'

const AB = require("./components/ab");

AD.Control.OpsTool.extend("BuildApp", {
   init: function(element, options) {
      var self = this;

      options = AD.defaults(
         {
            templateDOM: "/opstools/BuildApp/views/BuildApp/BuildApp.ejs",
            resize_notification: "BuildApp.resize",
            tool: null // the parent opsPortal Tool() object
         },
         options
      );
      self.options = options;

      // Call parent init
      self._super(element, options);

      self.data = {};

      self.webixUiId = {
         loadingScreen: "ab-loading-screen",
         syncButton: "ab-sync-button"
      };

      self.initDOM(function() {
         self.initWebixUI();
      });

      window.onbeforeunload = function() {
         return true;
      };
   },

   initDOM: function(cb) {
      var _this = this;

      can.view(this.options.templateDOM, {}, function(fragment) {
         _this.element.html(fragment);

         // _this.element.find(".ab-app-list").show();
         // _this.element.find(".ab-app-workspace").hide();

         cb();
      });
   },

   initWebixUI: function() {
      // get the AppBuilder (AB) Webix Component
      // var AppBuilder = OP.Component['ab']();
      var AppBuilder = new AB();
      var ui = AppBuilder.ui;

      // tell the AppBuilder where to attach
      ui.container = "ab-main-container";

      // instantiate the UI first
      this.AppBuilder = webix.ui(ui);

      // then perform the init()
      AppBuilder.init();
   },

   resize: function(height) {
      var self = this;

      height = height.height || height;

      var appListDom = $(self.element);

      if (appListDom) {
         var width = appListDom.parent().css("width");
         if (width) {
            width = parseInt(width.replace("px", ""));
         }
         appListDom.width(width);

         // Removed this because the 140 pixels was causing the list to not scroll to the bottom of the page
         // var computedHeight = height - 140;

         var computedHeight = height;
         // console.log("computed height: " + computedHeight);
         var mh = parseInt(appListDom.css("min-height").replace("px", ""));
         // console.log("min-height: " + mh);
         if (mh < computedHeight) {
            appListDom.height(computedHeight);
            $("#ab-main-container").height(computedHeight);
         } else {
            appListDom.height(mh);
            $("#ab-main-container").height(mh);
         }

         if (this.AppBuilder) {
            // this.AppBuilder.define('height', height - 140);
            this.AppBuilder.adjust();
         }
      }
   }
});
