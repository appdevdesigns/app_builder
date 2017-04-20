steal(
	function () {
		var fields_tab = function () {
			var self = this;

			self.getEditView = function (form) {
				return form;
			};

			return self;
		}

		return fields_tab;
	}
);