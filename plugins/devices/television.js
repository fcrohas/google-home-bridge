const Device = require('../device');
const lirc = require('node-lirc');

class TelevisionDevice extends Device {

	constructor(id, config)	{
	   super();
	   this.id = id;
	   this.config = config;
	   this.baseURI = 'http://'+config.host+':'+config.port;
	   this.power = true;
           this.remote = "Samsung_BN59-00685A";
	   lirc.init();
	}
	
	static getDriverName() {
	   return 'Television';
	}

	static getDevices() {
	  // load config
	  const node_config = process.env.NODE_ENV || 'development';
	  const config = require('config-node')({
	    dir: 'config', // where to look for files  
	    ext: null, // spoil the fun, tell me which one it is ('' for directory). Improves performance. 
	    env: node_config // set which one instead of smart defaults 
	  });
	  // Detect television
	  var devices = [];
	  // Get setup devices
	  const televisionDevices = config.devices.filter(device => device.config.driver == 'Television');
	  // Create device reference
	  for (var i=0; i<televisionDevices.length; i++) {
	  	const device = televisionDevices[i];
		devices['television-'+i] = new TelevisionDevice('television-'+i, device.config);
		//console.log('Added device with serial television-'+i);
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
		       	defaultNames : ["Television"],
		     	name: "Television",
		       	nicknames: ["Television"]
		      },
		      willReportState : true,
		      roomHint :"Salon",
		      deviceInfo: {
		       	manufacturer : "Samsung",
		       	model: "LE46A676",
		       	hwVersion : "4"
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
                  lirc.send(this.remote,"KEY_POWER");
                  // additional remote to power
                  // infra red switch
                  lirc.send("CYP_CR-72","KEY_POWER");
                  // sony homecinema
                  lirc.send("RM-ADP054","KEY_POWER");
                  break;
              case "KEY_VOLUMEUP":
              case "KEY_VOLUMEDOWN":
              case "KEY_MUTE":
                  lirc.send("RM-ADP054",action);
                  break;
              default:
                  lirc.send(this.remote,action);
     	    }
	}

        execute(action, params) {
          console.log("action=",action,"params=",params);
          if (action == "biz.linuxgeek.actions.ChannelChange") {
            if (params.channelNumber !== undefined) {
            } else if (params.channelText !== undefined) {
	    } 
          }
        }

	getType() {
		return 'TV';
	}

	getName() {
		return 'Television Samsung';
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

module.exports= TelevisionDevice;
