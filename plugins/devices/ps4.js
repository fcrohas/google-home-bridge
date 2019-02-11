const DeviceP = require('../device');
const {Device} = require('ps4-waker');

class Ps4Device extends DeviceP {

	constructor(id, config)	{
	   super();
	   this.id = id;
	   this.config = config;
	   this.baseURI = 'http://'+config.host+':'+config.port;
	   this.power = true;
           this.remote = "PS4";
           this.ps4 = new Device();
	}
	
	static getDriverName() {
	   return 'PS4';
	}

	static getDevices() {
	  // load config
	  const node_config = process.env.NODE_ENV || 'development';
	  const config = require('config-node')({
	    dir: 'config', // where to look for files  
	    ext: null, // spoil the fun, tell me which one it is ('' for directory). Improves performance. 
	    env: node_config // set which one instead of smart defaults 
	  });
	  // Detect switch
	  var devices = [];
	  // Get setup devices
	  const ps4Devices = config.devices.filter(device => device.config.driver == 'PS4');
	  // Create device reference
	  for (var i=0; i<ps4Devices.length; i++) {
	  	const device = ps4Devices[i];
		devices['ps4-'+i] = new Ps4Device('ps4-'+i, device.config);
		//console.log('Added device with serial ps4-'+i);
	  }
	  return devices;
	}

	setConfig(config) {
		this.config = config;
	}

	getInformation(callback) {
	   const device = {
                 id: this.id,
		 type: "action.devices.types.SWITCH",
		 traits: ["action.devices.traits.OnOff"],
		      name : {
		       	defaultNames : ["PS4"],
		     	name: "PS4",
		       	nicknames: ["PS4"]
		      },
		      willReportState : true,
		      roomHint :"Salon",
		      deviceInfo: {
		       	manufacturer : "Sony",
		       	model: "PS4 Pro",
		       	hwVersion : "1"
		      }
		};
            callback(device);
	}

	getStatus(callback) {
		callback(this.power);
	}

	sendCommand(action, value, callback) {
            switch(action) {
	      case "POWERON" : 
                  // infra red switch
                  this.ps4.turnOn().then(() => callback());
                  break;
	      case "POWEROFF" : 
                  // infra red switch
                  this.ps4.turnOff().then(() => callback());
                  break;
              default:
     	    }
	}

	getType() {
		return 'PS4';
	}

	getName() {
		return 'PS4 Pro';
	}

	getSerial() {
		return 'XXXXXXXXXX01';
	}

	getDevice() {
		return this.device;		
	}

	open() {
		console.log('Device opened.');
	}

	close() {
		console.log('Device closed.');
	}

	start() {
		console.log('Power on.');
		this.sendCommand("POWERON",()=> {
		});
	}

	stop() {
		console.log('Power off.');
		this.sendCommand("POWEROFF",()=> {
		});
	}

	listen(callback) {
		if (this.reader != null) {
			this.reader.on('message', (event) => {
				const floatarr = new Float32Array(event.length);
				for(let i = 0; i < event.length; i++) {
					floatarr[i] = event.data[i];
				}
				callback(floatarr);
			});
		}
	}
}

module.exports= Ps4Device;
