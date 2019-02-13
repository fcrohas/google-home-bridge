const Device = require('../device');
const lirc = require('node-lirc');

class SwitchDevice extends Device {

	constructor(id, config)	{
	   super();
	   this.id = id;
	   this.config = config;
	   this.baseURI = 'http://'+config.host+':'+config.port;
	   this.power = true;
           this.remote = "CYP_CR-72";
	   lirc.init();
	}
	
	static getDriverName() {
	   return 'Commutateur';
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
	  const commutateurDevices = config.devices.filter(device => device.config.driver == 'Commutateur');
	  // Create device reference
	  for (var i=0; i<commutateurDevices.length; i++) {
	  	const device = commutateurDevices[i];
		devices['commutateur-'+i] = new SwitchDevice('commutateur-'+i, device.config);
		//console.log('Added device with serial commutateur-'+i);
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
		       	defaultNames : ["Sélecteur"],
		     	name: "Sélecteur",
		       	nicknames: ["Sélecteur"]
		      },
		      willReportState : true,
		      roomHint :"Salon",
		      deviceInfo: {
		       	manufacturer : "Cypress",
		       	model: "CR-72",
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
                  // infra red switch
                  lirc.send(this.remote,"KEY_POWER");
                  break;
              default:
                  lirc.send(this.remote,action);
     	    }
	}

	getType() {
		return 'SWITCH';
	}

	getName() {
		return 'Commutateur SPDIF';
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

module.exports= SwitchDevice;
