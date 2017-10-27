
// import 'OP';
// import '../../../../../assets/js/webix/webix'


import AB from './components/ab'


AD.Control.OpsTool.extend('BuildApp', {

	init: function (element, options) {
		var self = this;
		
		if (typeof window._currentUser == "undefined") {
			console.log("start");
			
			var xmlHttp = null;
			xmlHttp     = new XMLHttpRequest();

			xmlHttp.open( "GET", "/site/user/data", false );
			xmlHttp.send( null );

			var json = xmlHttp.responseText;
			var obj = JSON.parse(json);

			var user1 = [{ id: obj.data.user.username, text: obj.data.user.username }];
			var user2 = obj.data.user.username
			window._currentUser = {
				selectivity: user1,
				webix: user2
			};

			console.log("done");
			
			// OP.Comm.Service.get({ url: "/site/user/data" }).then((data) => {
			// 	var user1 = [{ id: data.user.username, text: data.user.username }];
			// 	var user2 = data.user.username
			// 	window._currentUser = {
			// 		selectivity: user1,
			// 		webix: user2
			// 	};
			// });			
		}

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

		// get the AppBuilder (AB) Webix Component
		// var AppBuilder = OP.Component['ab']();
		var AppBuilder = new AB();
		var ui = AppBuilder.ui;

		// tell the AppBuilder where to attach
		ui.container = 'ab-main-container'

		// instantiate the UI first
		this.AppBuilder = webix.ui(ui);

		// then perform the init()
		AppBuilder.init();

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

			// Removed this because the 140 pixels was causing the list to not scroll to the bottom of the page
			// var computedHeight = height - 140;

			var computedHeight = height;
			// console.log("computed height: " + computedHeight);
			var mh = parseInt(appListDom.css('min-height').replace('px', ''));
			// console.log("min-height: " + mh);
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
