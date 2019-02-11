const express = require('express');
const router = express.Router();		
const sleep = require('sleep');
const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const natural = require('natural');
const channels = ["tf1","france 2","france 3","canal+","france 5","m6","arte","c8","w9","tmc","tfx","nrj12","lcp","france 4","bfm tv","cnews","star","gulli","france o","tf1 series film","l'equipe","6ter","numero 23","rmc decouverte","cherie 25","lci","france info"];
const switches = ["ps4","freebox","tv"];
let lastcommand="";
const jarvis = {
	devicesManager : null,
	setDevicesManager : function(devicesManager) {
		this.devicesManager = devicesManager;
	}, 
        getDevicesManager : function() {
                return this.devicesManager;
        },
	getRouter : function() {
		return router;
	},
        lookForChannel : function(input) {
          let channelNumber = -1;
          // textual channel ?
          console.log("text to parse :"+input);
          for (let i=0;i<channels.length;i++) {
            if ( input.toLowerCase().indexOf(channels[i])!=-1) {
               channelNumber = i + 1;
            }
          }
          // is a numeric channel ?
          if (channelNumber == -1) {
             const number = input.replace(/[^0-9]/g,"");
             if ( !isNaN(number)) {
                channelNumber = number;
             }
          }
          console.log("extracted channel : "+channelNumber);
          return channelNumber;
        }
};


jarvis.getRouter().all('/', function(req,res,next) {
	const app = new ActionsSdkApp({request: req, response: res});
});

jarvis.getRouter().post('/welcome', function(req,res,next) {
	console.log('Request headers: ' + JSON.stringify(req.headers));
  	console.log('Request body: ' + JSON.stringify(req.body));	
  	console.log('Request query: ' + JSON.stringify(req.query));	

	const app = new ActionsSdkApp({request: req, response: res});
	const intent = app.getIntent();
        let isDirect = false;
	switch (intent) {
	    case app.StandardIntents.MAIN:
	      const welcome = 'Comment puis je vous aider ?';
	      const inputPrompt = app.buildInputPrompt(false, welcome);
	      app.ask(inputPrompt);
	      break;

	    case "biz.linuxgeek.CHANNEL":
	        const television = jarvis.getDevicesManager().getDevice('television-0');
	        if (app.getArgument("chanstr")) {
                   const channel = jarvis.lookForChannel(app.getArgument("chanstr"));
		   if (channel == -1){
		     app.tell("Impossible de trouver la chaine " + chanstr);
		     break;
		   }
                   const chstr = new String(channel);
                   for ( let i=0; i<chstr.length; i++) {
		     television.sendCommand("KEY_" + chstr[i],"",null);
                     sleep.sleep(1);
                   }
		} else if (app.getArgument("channum")) {
                   const channel = jarvis.lookForChannel(app.getArgument("channum"));
		   if (channel == -1){
		     app.tell("Impossible de trouver la chaine " + chanstr);
		     break;
		   }
                   const chstr = new String(channel);
                   for ( let i=0; i<chstr.length; i++) {
		    television.sendCommand("KEY_" + chstr[i],"",null);
                    sleep.sleep(1);
                   }
		}
       		app.tell("a plus");
		break;
	    case "biz.linuxgeek.VOLUME":
	        const homecine = jarvis.getDevicesManager().getDevice('homecine-0');
	        if (app.getArgument("volup")) {
		  const volume = app.getArgument("volup");
		  for (let i = 0; i < volume; i++) {
		   homecine.sendCommand("KEY_VOLUMEUP","",null);
                   sleep.sleep(1);
		  }
       		  app.tell("a plus");
		  break;
		} else if (app.getArgument("voldown")) {
		  const volume = app.getArgument("voldown");
		  for (let i = 0; i < volume; i++) {
		   homecine.sendCommand("KEY_VOLUMEDOWN","",null);
                   sleep.sleep(1);
		  }
       		  app.tell("a plus");
		  break;
		} else {
                   natural.PorterStemmerFr.attach();
                   const text = app.getRawInput();
                   const stem = text.tokenizeAndStem();
		   console.log(stem);
                   if ((stem.indexOf('coup')!=-1) || (stem.indexOf('remet'))) {
		     homecine.sendCommand("KEY_MUTE","",null);
		   }
       		  app.tell("a plus");
		  break;
		}
	    case app.StandardIntents.TEXT:
	        const devicesList = jarvis.getDevicesManager().getDevices();
	        var serials = Object.keys(devicesList);
                natural.PorterStemmerFr.attach();
                const text = app.getRawInput();
                const stem = text.tokenizeAndStem();
                for (let i=0; i< serials.length; i++) {
		    const device = devicesList[serials[i]];
                    console.log(stem);
                    if ((device.getType() == "TV") && (stem.indexOf("sélecteur")==-1))
                    {
                      // action to do
                      if(stem.indexOf('mettr') != -1) {
                        // look for known channel
                        const channel = jarvis.lookForChannel(text);
                        if (channel != -1) {
                          // send channel to tv
                          const chstr = new String(channel);
                          for ( let i=0; i<chstr.length; i++) {
			    device.sendCommand("KEY_" + chstr[i],"",null);
                            sleep.sleep(1);
                          }
                          if (channel < channels.length) {
	                    app.ask("J'ai changer de chaine pour " + channels[channel-1]);
                          } else {
	                    app.ask("J'ai changer de chaine pour la " + channel);
                          }
                        } else {
	                  app.ask("Impossible de trouver une chaine.");
                        }
		      } else if (stem.indexOf('affich')!=-1) {
                        // afficher
                        if (stem.indexOf('inform')!= -1) {
			  device.sendCommand("KEY_INFO","",null);
                        } else if (stem.indexOf('sourc')!=-1) {
			  device.sendCommand("KEY_CYCLEWINDOWS","",null);
                        }
	                app.ask("C'est fait !");
		      } else if (stem.indexOf('sourc')!=-1) {
                        // aller sur les sources
                        if (stem.indexOf('tv') != -1) {
			   device.sendCommand("KEY_TV","",null);
                        } else {
			   device.sendCommand("HDMI","",null);
                           lastcommand = "HDMI";
                        }
	                app.ask("C'est fait !");
		      } else if ((stem.indexOf('aller') != -1) || (stem.indexOf('allez')!=-1)) {
                        if (stem.indexOf('bas') != -1) {
			   device.sendCommand("KEY_DOWN","",null);
                           lastcommand = "KEY_DOWN";
                        } else if (stem.indexOf('haut')!=-1) {
			   device.sendCommand("KEY_UP","",null);
                           lastcommand = "KEY_UP";
                        }
	                app.ask("C'est fait !");

                      } else if(stem.indexOf('valid')!=-1) {
			   device.sendCommand("KEY_ENTER","",null);
	                   app.ask("C'est fait !");
                      } else if(stem.indexOf('quitt')!=-1) {
			   device.sendCommand("KEY_EXIT","",null);
	                   app.ask("C'est fait !");
                      } else if(stem.indexOf('silenc')!=-1) {
			   device.sendCommand("KEY_MUTE","",null);
	                   app.ask("C'est fait !");
                      } else if(stem.indexOf('volum')!=-1) {
                        if (stem.indexOf('mont') != -1) {
			   device.sendCommand("KEY_VOLUMEUP","",null);
                           lastcommand = "KEY_VOLUMEUP";
                        } else if (stem.indexOf('baiss')!= -1) {
			   device.sendCommand("KEY_VOLUMEDOWN","",null);
                           lastcommand = "KEY_VOLUMEDOWN";
                        }
	                app.ask("C'est fait !");
                      } else if(stem.indexOf('merc')!=-1) {
	                   app.tell("Au revoir !");
                      } else if(stem.indexOf('encor')!=-1) {
                           if (lastcommand != "") {
			     device.sendCommand(lastcommand,"",null);
	                     app.ask("C'est fait !");
			   } else {
	                     app.ask("Aucune commande a répéter!");
                           }
                      } else {
	                   app.ask("Je n'ai pas compris !");
                      }
                    } else if ((stem.indexOf("sélecteur")!=-1) && (device.getType()=="SWITCH")) {
                      let position = -1;
                      for (let i=0;i<switches.length;i++) {
                        if (text.toLowerCase().indexOf(switches[i])!=-1) {
                           position = i + 1;
                        }
                      }
                      if (position != -1) {
                         device.sendCommand("KEY_"+position, "", null);
	                 app.ask("C'est fait !");
                      } else {
	                   app.ask("Je n'ai pas compris !");
                      }
                    }
                }
	      break;
	}
     if (isDirect) {
     }
});

module.exports = jarvis;
