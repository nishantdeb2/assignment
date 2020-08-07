
## Software Requirements

* Node.js (Minimum 8.9)
* MongoDb

## Setup

### Configuration File

The repo has a config directory in the root. Look for the `/config/sample.json` file. This file takes a few things like

* The ports for server.
* The databse connections (we use dev for local development and need to change for staging or live.)

Fill in the necessery details in the json file and start your pm2 instances.

## Start Server


### Local Development
```
NODE_ENV="dev" npm start
```

## Install Instructions

### Ubuntu (18)

```
sudo apt-get install nodejs
sudo apt-get install mongodb

npm install -g pm2


cp config/sample.json config/dev.json

// Add DB crendetials
// make a database named "assignment"
