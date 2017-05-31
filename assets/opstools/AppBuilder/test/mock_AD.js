var AD = AD || {};

AD.util = {
	// AD.util.uuid
	uuid: function () {
		return webix.uid();
	},
	// AD.util.string.replaceAll
	string: {
		replaceAll: function (origString, replaceThis, withThis) {
			var re = new RegExp(AD.util.string.quoteRegExp(replaceThis), "g");
			return origString.replace(re, withThis);
		}
	}
};

AD.op = {
	// AD.op.Dialog
	Dialog: {
		Alert: function (opts) { },
		Confirm: function (opts) { },
		ConfirmDelete: function (opts) { }
	}
};


AD.comm = {
	// AD.comm.service
	service: {

	}
};

AD.error = {
	// AD.error.log
	log: function (message, data) {
	}
};


AD.lang = {
	// AD.lang.currentLanguage
	currentLanguage: 'en',
	// AD.lang.label.getLabel
	label: {
		getLabel: function (key) {
			return "Label of " + key;
		}
	}
};

AD.Control = {
	// AD.Control.OpsTool.extend
	OpsTool: {
		extend: function (name, staticDef, instanceDef) {
			return {};
		}
	}
}