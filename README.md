# fabric-script

Node-js script to automate the process from user registration to chaincode instantiation. Processes covered - 

- **Register** - registers a user for each org.
- **Create Channel** - creates single channel.
- **Join Channel** - makes each org to join the created channel.
- **Install Chaincode** - installs single chaincode into every peer.
- **Instantiate Chaincode** - instantiates chaincode to first peer of first Org only.

Change the config.json accoriding to your use.
Tested with fabric 1.1 balance transfer application.