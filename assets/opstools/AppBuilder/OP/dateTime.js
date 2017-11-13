var moment = require('moment');

export default {
	
	regEx: "^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$",
	
	sqlformat:function(inputDate) {
		newDate = moment(inputDate).format('YYYY-MM-DD HH:mm:ss');
		return newDate;
	}

}