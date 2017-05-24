async.series([

	function (next) {
		var stealMeta = steal.config("meta");

		var reauthIndex = -1;
		stealMeta.appdev.deps.filter(function (dep, index) {
			if (dep == 'appdev/auth/reauth')
				reauthIndex = index;
		});

		if (reauthIndex > -1) {
			stealMeta.appdev.deps.splice(reauthIndex, 1);

			steal.config({
				meta: {
					"appdev": stealMeta.appdev
				}
			});
		}

		next();
	},

	// Load dependencies of appdev
	function (next) {
		System.import('appdev')
			.then(function () {
				next();

				AD = AD || {};
				AD.ui = AD.ui || {};
				AD.ui.reauth = {
					inProgress: function () { return false; },
					start: function () {
						var deferred = AD.sal.Deferred();

						deferred.resolve();

						return deferred;
					}
				};
			});
	},

	// Load dependencies of OpsPortal
	function (next) {
		System.import('OpsPortal/OpsPortal')
			.then(function () { next(); });
	},

	// Load dependencies of BuildApp
	function (next) {
		System.import('opstools/BuildApp')
			.then(function () { next(); });
	},


	// Setup Mocha
	// and set expect & assert to global variable
	function (next) {
		mocha.setup({
			ui: 'bdd',
			timeout: 9000,
			reporter: 'html'
		});

		expect = chai.expect;
		assert = chai.assert;

		next();
	},


	// Load all test cases
	function (next) {
		// Tell steal to know the generated file is global format
		// (We don't want steal to do anything in this file)
		steal.config({
			meta: {
				"opstools/AppBuilder/test/bin/test_app_builder": {
					format: "global"
				}
			}
		});

		// Load a generated test case file to browser
		System.import('opstools/AppBuilder/test/bin/test_app_builder').then(function () {
			next();
		});
	},


	// Execute Mocha
	function (next) {
		if (window.mochaPhantomJS) {
			mochaPhantomJS.run();
		} else {
			mocha.run();
		}

		next();
	}
]);