const Device = require('../device');

class CameraDevice extends Device {

	constructor(id, config)	{
	   super();
	   this.id = id;
	   this.config = config;
	   this.baseURI = 'http://'+config.host+':'+config.port;
	   this.power = true;
           this.remote = "FOSCAM-9900P";
	}
	
	static getDriverName() {
	   return 'Camera';
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
	  const cameraDevices = config.devices.filter(device => device.config.driver == 'Camera');
	  // Create device reference
	  for (var i=0; i<cameraDevices.length; i++) {
	  	const device = cameraDevices[i];
		devices['camera-'+i] = new CameraDevice('camera-'+i, device.config);
		console.log('Added device with serial camera-'+i);
	  }
	  return devices;
	}

	setConfig(config) {
		this.config = config;
	}

	getInformation(callback) {
	   const device = {
                 id: this.id,
		 type: "action.devices.types.CAMERA",
		 traits: ["action.devices.traits.CameraStream"],
		      name : {
		       	defaultNames : ["Camera"],
		     	name: "Camera",
		       	nicknames: ["Camera"]
		      },
		      willReportState : true,
		      attributes: {
			cameraStreamSupportedProtocols: ["dash"],
			cameraStreamNeedAuthToken: false,
			cameraStreamNeedDrmEncryption: false
		      },
		      roomHint :"Jardin",
		      deviceInfo: {
		       	manufacturer : "Foscam",
		       	model: "FI-9900P",
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
	      case "POWER" : 
                  break;
              default:
     	    }
	}

	getType() {
		return 'CAMERA';
	}

	getName() {
		return 'Camera';
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
		this.sendCommand("POWER",null);
	}

	stop() {
		console.log('Power off.');
		this.sendCommand("POWER",null);
	}

	listen(callback) {
	}
}

module.exports= CameraDevice;
