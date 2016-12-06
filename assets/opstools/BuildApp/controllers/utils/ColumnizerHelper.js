steal(function () {
	return {
		// Take an array of views and transform it into a single view that uses columns to layout the the views
		columnize: function (views, columnCount) {
			var columnLength = views.length / columnCount;
			return {
				view: 'layout',
				autowidth: true,
				cols: $.map(new Array(columnCount), function (_, index) {
					return {
						autowidth: true,
						rows: views.slice(Math.ceil(index * columnLength), Math.ceil((index + 1) * columnLength))
					};
				}),
			}
		},

		// Return an array of the columns of a columized layout view
		getColumns: function (columnView) {
			// The columns are nested within groups, so flatten the two-dimensional hierarchy into a one-dimensional
			// array of column views
			return $.map(columnView ? columnView.getChildViews() : [], function (group) {
				return group.getChildViews();
			});
		}
	}
});
