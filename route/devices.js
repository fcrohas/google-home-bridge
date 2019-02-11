const express = require('express');
const router = express.Router();		
const devices = {
	devicesManager : null,
	setDevicesManager : function(devicesManager) {
		this.devicesManager = devicesManager;
	}, 
	getDevicesManager : function() {
		return this.devicesManager;
	},
	getRouter : function() {
		return router;
	}
};

devices.getRouter().post('/', function(req,res,next) {
	console.log('Request headers: ' + JSON.stringify(req.headers));
  	console.log('Request body: ' + JSON.stringify(req.body));
  	let reqdata = req.body;
    if (!reqdata.inputs) {
      response.status(401).set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }).json({error: "missing inputs"});
    }
    for (let i = 0; i < reqdata.inputs.length; i++) {
      let input = reqdata.inputs[i];
      let intent = input.intent;
      if (!intent) {
        response.status(401).set({
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }).json({error: "missing inputs"});
        continue;
      }
      switch (intent) {
        case "action.devices.SYNC":
        	console.log('post /smarthome SYNC');
        	const devicesList = devices.getDevicesManager().getDevices();
        	devicesSupport = [];
        	let count = 0;
        	var serials = Object.keys(devicesList);
        	for (let i=0; i< serials.length; i++) {
        		const device = devicesList[serials[i]];
        		device.getInformation((information) => {
			   devicesSupport.push(information);        			
			   count++;
			   // leave
			   if (count == serials.length) {
			     console.log('devicesSupport',JSON.stringify(devicesSupport));        	
			     let deviceProps = {
				   requestId: reqdata.requestId,
				   payload: {
				     agentUserId: "googleassistant",
				     devices: devicesSupport
				   }
			      };
			      res.status(200).json(deviceProps);       	
			    }
        		});
        	}
        	break;
        case "action.devices.QUERY":
          console.log('post /smarthome QUERY');
          const deviceId = input.payload.devices[0].id;
          const device = devices.getDevicesManager().getDevice(deviceId);
          const devicesItems = {};
          device.getStatus(status => {
		  devicesItems[deviceId] = status;
	          let queryRes = {
			      requestId: reqdata.requestId,
			      payload: {
			      	devices: devicesItems 
	          	  }
	          };
		  console.log('Send device status',JSON.stringify(queryRes));
	          res.status(200).json(queryRes);       	
          });
          break;
        case "action.devices.EXECUTE":
          console.log('post /smarthome EXECUTE');
          //for each device
          const ids = [];
          const states = {on:false,online:true};
          for (let x=0; x < input.payload.commands.length;x++) {
          	const queryDevice = input.payload.commands[x];
          	for (let y=0; y < input.payload.commands.length;y++) {
          	 const deviceDescription = input.payload.commands[y];
          	 const device = devices.getDevicesManager().getDevice(deviceDescription.devices[0].id);
          	 // Check command to send
          	 for (let z=0; z < deviceDescription.execution.length;z++) {
          	 	const execution = deviceDescription.execution[z];
          	 	switch(execution.command) {
          	 		case "action.devices.commands.OnOff":
          	 			if (execution.params.on == true) {
          	 				device.start();
          	 				states.on = true;
          	 				states.online = true;
          	 			} else {
          	 				device.stop();
          	 			}
          	 			break;
                                default:
                                    device.execute(execution.command, execution.params);
          	 	}
          	 }
          	 ids.push(deviceDescription.id);
          	}
          }
          let executeRes = {
		      requestId: reqdata.requestId,
		      payload: {
		      	commands: [{
		      		ids:ids,
		      		status: "SUCCESS",
		      		states: states
		      	}
		      	]
          	  }
          };
          res.status(200).json(executeRes);       	
          break;
        case "action.devices.DISCONNECT":
          let bye = {
		      requestId: reqdata.requestId
	  };
          res.status(200).json(bye);       	
	  break;
        default:
          res.status(401).set({
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }).json({error: "missing intent"});
          break;          
	  }
	 }  	
});

module.exports = devices;
