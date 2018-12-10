export default class RowFilter {

	constructor() {

	}

	getSeparateItems() {

		return [
			{ id: ",", value: "Comma (,)" },
			{ id: "\t", value: "Tab (&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)" },
			{ id: ";", value: "Semicolon (;)" },
			{ id: "\s", value: "Space ( )" }
		];
	}

	/**
	 * @method validateFile
	 * Validate file extension
	 * 
	 * @param {*} fileInfo - https://docs.webix.com/api__ui.uploader_onbeforefileadd_event.html
	 * 
	 * @return {boolean} 
	 */
	validateFile(fileInfo) {

		// validate file type
		let extensionType = fileInfo.file.type.toLowerCase();
		if (extensionType == "text/csv" ||
			extensionType == "application/vnd.ms-excel") {
			return true;
		}
		else {
			return false;
		}

	}

	/**
	 * @method getDataRows
	 * Pull data rows from the CSV file
	 * 
	 * @param {Object} fileInfo - https://docs.webix.com/api__ui.uploader_onbeforefileadd_event.html
	 * @param {string} separatedBy
	 * 
	 * @return {Promise} -[
	 * 						["Value 1.1", "Value 1.2", "Value 1.3"],
	 * 						["Value 2.1", "Value 2.2", "Value 2.3"],
	 * 					]
	 */
	getDataRows(fileInfo, separatedBy) {

		if (!this.validateFile(fileInfo))
			return Promise.reject();

		return new Promise((resolve, reject) => {

			// read CSV file
			let reader = new FileReader();
			reader.onload = (e) => {

				let result = [];

				// split lines
				let dataRows = reader.result
					.split('\n')
					.filter(row => row && row.length > 0);

				// split columns
				(dataRows || []).forEach(row => {

					let dataCols = row.split(separatedBy);

					result.push(dataCols.map(dCol => this.reformat(dCol)));
				});

				resolve(result);

			}
			reader.readAsText(fileInfo.file);

		});

	}

	/**
	 * @method getGuessDataType
	 * 
	 * @param dataRows {Array} - [
	 * 								["Value 1.1", "Value 1.2", "Value 1.3"],
	 * 								["Value 2.1", "Value 2.2", "Value 2.3"],
	 * 							]
	 * @param colIndex {Number}
	 * 
	 * @return {string}
	 */
	getGuessDataType(dataRows, colIndex) {
		var data,
			repeatNum = 10;

		// Loop to find a value
		for (var i = 1; i <= repeatNum; i++) {
			var line = dataRows[i];
			if (!line) break;

			data = line[colIndex];

			if (data != null && data.length > 0)
				break;
		}

		if (data == null || data == "") {
			return 'string'
		}
		else if (data == 0 || data == 1 || data == true || data == false || data == 'checked' || data == 'unchecked') {
			return 'boolean';
		}
		else if (!isNaN(data)) {
			return 'number';
		}
		else if (Date.parse(data)) {
			return 'date';
		}
		else {
			if (data.length > 100)
				return 'LongText';
			else
				return 'string';
		}
	}


	/**
	 * @method reformat
	 * 
	 * @param {string} str 
	 */
	reformat(str) {
		if (!str) return '';

		return str.trim().replace(/"/g, '').replace(/'/g, '');
	}



}