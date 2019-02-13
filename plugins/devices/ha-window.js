const Device = require('../device');

class HAWindowSensorDevice extends Device {

	constructor(id, config)	{
	   super();
	   process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
           const HomeAssistant = require('homeassistant');
	   this.id = id;
	   this.config = config;
	   this.baseURI = 'http://'+config.host+':'+config.port;
           this.hass = new HomeAssistant({
             host: 'https://'+config.host,
             port: config.port,
             ignoreCert: true
           });

	   this.power = true;
           this.remote = "Homeassistant Window Sensor";
	}
	
	static getDriverName() {
	   return 'Capteur de fenetre';
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
	  const HASensorDevices = config.devices.filter(device => device.config.driver == 'Capteur de fenetre');
	  // Create device reference
	  for (var i=0; i<HASensorDevices.length; i++) {
	  	const device = HASensorDevices[i];
		devices['ha-window-sensor-'+i] = new HAWindowSensorDevice('ha-window-sensor-'+i, device.config);
		//console.log('Added device with serial ha-sensor-'+i);
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
		       	defaultNames : ["la fenetre"],
		     	name: "la fenetre",
		       	nicknames: ["la fenetre"]
		      },
		      willReportState : true,
		      roomHint : this.config.room,
		      deviceInfo: {
		       	manufacturer : "Homeassistant",
		       	model: "Fenetre",
		       	hwVersion : "1"
		      }
		};
            callback(device);
	}

	getStatus(callback) {
		console.log("Retrieve sensor/state...");
		(async() => {
		  const sensor = await this.hass.states.get('sensor', this.config.sensorName);
	          console.log("Sensor attributes= ", JSON.stringify(sensor)); 
		  callback({
		  	online : true,
	  		on : (sensor.state != "Normal") ? true : false
		  });
		})();
	}

	sendCommand(action, value, callback) {
            switch(action) {
	      case "POWER" : 
                  // infra red switch
                  break;
              default:
     	    }
	}

	getType() {
		return 'SENSOR';
	}

	getName() {
		return 'Temperature Sensor';
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
	}

	stop() {
		console.log('Power off.');
	}

	listen(callback) {
	}
}

module.exports= HAWindowSensorDevice;
