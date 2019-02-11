const Device = require('../device');

class HASensorDevice extends Device {

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
           this.remote = "Homeassistant Temperature Sensor";
	}
	
	static getDriverName() {
	   return 'Capteur de temperature';
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
	  const HASensorDevices = config.devices.filter(device => device.config.driver == 'Capteur de temperature');
	  // Create device reference
	  for (var i=0; i<HASensorDevices.length; i++) {
	  	const device = HASensorDevices[i];
		devices['ha-sensor-'+i] = new HASensorDevice('ha-sensor-'+i, device.config);
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
		 type: "action.devices.types.THERMOSTAT",
		 traits: ["action.devices.traits.TemperatureSetting"],
		      name : {
		       	defaultNames : ["Climatisation"],
		     	name: "Climatisation",
		       	nicknames: ["Climatisation"]
		      },
		      willReportState : true,
		      roomHint : this.config.room,
		      deviceInfo: {
		       	manufacturer : "Homeassistant",
		       	model: "Temperature",
		       	hwVersion : "1"
		      }
		};
            callback(device);
	}

	getStatus(callback) {
		console.log("Retrieve temperature/humidity...");
		(async() => {
		  const sensor = await this.hass.states.get('sensor', this.config.sensorName);
		  console.log("Sensor temperature/humidity = " + 
				sensor.attributes.Temperature + " / " + sensor.attributes.Humidity);
		  callback({
		  	online : true,
			thermostatMode : "off",
		  	thermostatTemperatureSetpoint : sensor.attributes.Temperature,
		  	thermostatTemperatureAmbient : sensor.attributes.Temperature,
		  	thermostatHumidityAmbient : sensor.attributes.Humidity 
		  });
		})();
	}

	sendCommand(action, value, callback) {
	    console.log(action);
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
		//this.sendCommand("POWER",null);
	}

	stop() {
		console.log('Power off.');
		//this.sendCommand("POWER",null);
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

module.exports= HASensorDevice;
