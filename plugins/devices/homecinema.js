const Device = require('../device');
const lirc = require('node-lirc');

class HomecineDevice extends Device {

	constructor(id, config)	{
	   super();
	   this.id = id;
	   this.config = config;
	   this.baseURI = 'http://'+config.host+':'+config.port;
	   this.power = true;
           this.remote = "RM-ADP054";
	   lirc.init();
	}
	
	static getDriverName() {
	   return 'Homecine';
	}

	static getDevices() {
	  // load config
	  const node_config = process.env.NODE_ENV || 'development';
	  const config = require('config-node')({
	    dir: 'config', // where to look for files  
	    ext: null, // spoil the fun, tell me which one it is ('' for directory). Improves performance. 
	    env: node_config // set which one instead of smart defaults 
	  });
	  // Detect homecine
	  var devices = [];
	  // Get setup devices
	  const homecineDevices = config.devices.filter(device => device.config.driver == 'Homecine');
	  // Create device reference
	  for (var i=0; i<homecineDevices.length; i++) {
	  	const device = homecineDevices[i];
		devices['homecine-'+i] = new HomecineDevice('homecine-'+i, device.config);
		//console.log('Added device with serial homecine-'+i);
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
		       	defaultNames : ["Homecine"],
		     	name: "Homecine",
		       	nicknames: ["Homecine"]
		      },
		      willReportState : true,
		      roomHint :"Salon",
		      deviceInfo: {
		       	manufacturer : "Sony",
		       	model: "BDV-E370",
		       	hwVersion : "1"
		     } 
		};
            callback(device);
	}

	getStatus(callback) {
	  callback({
            on : this.power,
            online: true
          });
	}

	execute(command, params) {
	}

	sendCommand(action, value, callback) {
            switch(action) {
	      case "POWER" : 
                  lirc.send(this.remote,"KEY_POWER");
                  this.power = !this.power;
                  break;
              default:
                  lirc.send(this.remote,action);
     	    }
	}

	getType() {
		return 'HOMECINE';
	}

	getName() {
		return 'Sony BDV-E370';
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
}

module.exports= HomecineDevice;
