# google-home-bridge
NodeJS bridge to add more devices like IR, PS4, or IR TV control to Google Home devices

Create a Google Action application :

https://console.actions.google.com/

Register the bridge to Google actions with following command line

gactions update --project <project ID> --action_package ./action.json

Edit config/development.json and update project ID and client secret token

start application with node index.js

