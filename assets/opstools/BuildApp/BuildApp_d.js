
import './OP';
// import '../../../../../assets/js/webix/webix'

import './components/ab_choose'
// import './components/applicationWorkspace'




AD.Control.OpsTool.extend('BuildApp', {

	init: function (element, options) {
		var self = this;

		options = AD.defaults({
			templateDOM: '/opstools/BuildApp/views/BuildApp/BuildApp.ejs',
			resize_notification: 'BuildApp.resize',
			tool: null   // the parent opsPortal Tool() object
		}, options);
		self.options = options;

		// Call parent init
		self._super(element, options);

		self.data = {};

		self.webixUiId = {
			loadingScreen: 'ab-loading-screen',
			syncButton: 'ab-sync-button'
		};

		self.initDOM(function(){
			self.initWebixUI();
		});
		

	},


	initDOM: function (cb) {
		var _this = this;

		can.view(this.options.templateDOM, {}, function(fragment){
			_this.element.html(fragment);

			// _this.element.find(".ab-app-list").show();
			// _this.element.find(".ab-app-workspace").hide();

			cb();
		});
	},
	

	initWebixUI: function () {


		function L(key, altText) {
			return AD.lang.label.getLabel(key) || altText;
		}

		var appUUID = webix.uid();

		var options = {
			unique: function(key) { return key+appUUID; },
			labels:{
				common:{
					import: L('ab.common.import', '*Import')
				}
			}
		}

		var AppChooser = OP.Component['ab_choose'](options);

		this.AppBuilder = webix.ui({
			id: options.unique('buld_app_loading_screen'),
			container:'ab-main-container',
			autoheight:true,
    		autowidth:true,
			rows:[
				AppChooser.ui
			]
		});
		this.AppBuilder.adjust();



		AppChooser.logic.init();

	},

	resize: function (height) {
		var self = this;

		height = height.height || height;

		var appListDom = $(self.element);

		if (appListDom) {
			var width = appListDom.parent().css('width');
			if (width) {
				width = parseInt(width.replace('px', ''));
			}
			appListDom.width(width);

			var computedHeight = height - 140;
			var mh = parseInt(appListDom.css('min-height').replace('px', ''));
			if (mh < computedHeight) {
				appListDom.height(computedHeight);
				$('#ab-main-container').height(computedHeight);
			} else {
				appListDom.height(mh);
				$('#ab-main-container').height(mh);
			}

			if (this.AppBuilder) {
				// this.AppBuilder.define('height', height - 140);
				this.AppBuilder.adjust();
			}
			
		}
	}

});