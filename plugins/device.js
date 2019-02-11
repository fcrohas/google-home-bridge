const http = require('axios');

class Device {
	constructor() {
	}

	static getDriverName() {
		return 'interface';
	}

	static getDevices() {
		return [];
	}

	httpGet(url, callback) {
		http.get(url).then(resp => {
			callback(resp.data);
		}).catch(err => {
			console.log('Error:',err.message);
		});
	}

	open() {

	}

	close() {
		
	}

	start() {

	}

	stop() {

	}

	getCapabilities() {
		return [];
	}

	write(name, value) {

	}

	read(name) {
		return "";
	}

        execute(action, params) {
        }

	listen(callback) {
		
	}
}

module.exports = Device;
