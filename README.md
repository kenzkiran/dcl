# DCL New Backend Server

The DCL Backend Server is based on nodejs and uses [strongloop] (http://strongloop.com).

## Software Installation:
#### Git And Source code: 
* Download Git for the specific version of OS from https://git-scm.com/downloads.
* Open Git shell and cd to the desired location where you want to download the source code.(I use c:\dev)
* Execute the command: git clone https://dclwebgroup1@bitbucket.org/dclweb/dcl-server.git. This should prompt you for a password. Reach out to the Ravi/Kris for the password if you don't already have one. 

#### Installing MongoDB:
Windows: Go to http://www.mongodb.org/downloads and download the latest version of MongoDB for Windows, which should be a plain zip file. Once the download is done, extract the contents of the zip file to a memorable directory, such as ‘c:\dev\mongodb’.

Set environment variable MONGO_HOME=‘c:\dev\mongodb’ and add it to the path variable: set PATH=%PATH%;%MONGO_HOME\bin%
That’s it! After the installation process is done, you should be able to run the command in a bash shell

```
mongod 
```
directly from your command line. If you skip adding it to your classpath, you’ll need to run it as

```
/c/dev/mongodb/bin/mongod
```
You should see the following exception.
```
XXXX-XXX-XXTXX:XX:XX-XXXX I CONTROL  Hotfix KB2731284 or later update is not installed, will zero-out data files
XXXX-XXX-XXTXX:XX:XX-XXXX I STORAGE  [initandlisten] exception in initAndListen: 29 Data directory c:\data\db\ not found., terminating
XXXX-XXX-XXTXX:XX:XX-XXXX I CONTROL  [initandlisten] dbexit:  rc: 100
```
Create an empty data folder in C:\ and db folder within data. Think of mongod as your local MongoDB server- you need to have a mongod process running in order to be able to use MongoDB. You can now leave mongod running, open up another terminal, and run

```
mongo test
```
This should open up the MongoDB shell. Hit ctrl-c to close the MongoDB shell.

#### Installing NodeJS and npm (node package manager).

Windows: Download the installer from http://nodejs.org/download/. I recommend using the installer rather than the binary to save yourself the extra work of adding the binary location to the system path.

Once you have successfully installed NodeJS, you should be able to run the “node” and “npm” commands from your terminal. When you run “node,” you should see a single “>.” This is the node shell, hit ctrl-c to close it.

When you run “npm” with no arguments, you should see a bunch of usage information. Keep in mind that “npm” often requires root permissions to run. If an npm command fails for unclear reasons, try running it through “sudo.”

#### Installing Grunt:

Run the following command:

```
npm install -g grunt
```

#### Installing Bower:

Run the following command:

```
npm install -g bower
```

#### Build and execute server
```
cd <BASE_PATH>/dcl-server
npm install
// client side install
cd <BASE_PATH>/dcl-server/client
npm install
bower install
// server side install
cd <BASE_PATH>/dcl-server/server
grunt build
```

Note: 'npm install' need to be run only for the first time or whenever package.info changes
Note: .jshintrc and .jscsrc enforce rules via Gruntfile.js
**Note: Make sure jshint and jscs have ZERO errors before Checking any Code**  

### Run 
```
cd <BASE_PATH>  
npm start | bunyan
```

Note: bunyan is the most popular logging framework in node. pipe the output through bunyan. 

The server api is now available at http://localhost:3000/explorer


#### Build and execute client
```
cd <BASE_PATH>/dcl-server/client
npm install
bower install
grunt build
grunt watch //For continuous update.
```

### Centralized Build System (a.k.a CBS)

The basic folder structure is as follows:

Base: dcl-server
Client: dcl-server/client
Server: dcl-server/server

Four new grunt tasks are added to make it easy for building server and client and packing at one place.

Note 1: Irrespective of the 'Centralized Build System', we can still build client and server from above instructions.
Note 2: Even with centralized build system, we need to make sure we run `npm install` in both client and server, and additionally `bower install` in client folders

The four new tasks are:

* `grunt buildClient` : Will execute the grunt build command in the client folder.
* `grunt buildServer`: Will execute the grunt build command in the server folder.
* `grunt startServer`: Will start a localhost server. (This is same as running `npm start` inside the server folder)
 
The last task is a packaging task:

* `grunt release`: Will build and package the server and client. This command does the following

* Builds the client
* Makes a package (a folder called `package`)
* The package contains two folders: 'dist' and 'server'.
* The 'dist' is the built client files
* The 'server' folder is the server with all the necessary files related to models and mongoDB config.
* This task also makes a compressed package for upload to server: `package.tgz`
    

### How To Upload New Release:

### Step 1: Change HOST IP on the config-production.json
 * Replace HOST_MACHINE_IP with the correct host machine IP.
 * This is the config file, production server will use.
 * Current Digital Host Machine IP: 157.245.133.22
```
{
  "restApiRoot": "/api",
  "host": "<HOST_MACHINE_IP>",
  "port": 80,
  "url": "http://<HOST_MACHINE_IP>:80/",
  "legacyExplorer": false,
  "bloggerBlogId": "5647976881277887395",
  "logoutSessionsOnSensitiveChanges": true,
  "remoting": {
    "errorHandler": {
      "disableStackTrace": false
    }
  }
}
```
### Step 2: Prepare Release Package on Local Machine

* Run the `grunt release` command from base directory.
* A release package : 'package.tgz' is created.
* Check with R.Ramachandra for credentials.
```
scp package.tgz  root@<HOST_MACHINE_IP>:/root/package.tgz
```


### Step 3: On the remote machine (our host): 
* Make sure we have copied 'package.tgz' using the above mentioned `scp` command.
* Untar the package: `tar -xzf package.tgz`
* `cd package/server` - Go to server folder
* `npm install` - Install server dependency.
* IMP Note: No need to build the client, as the 'dist' folder already contains the client.
* `forever list` - List the forever started processes.
* If forever is not installed on server install using the following:
* `npm install -g forever`
* IMP Note: If you don't have mongod installed, use the following link to install:
* https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/


```
// Output looks like this.
root@ubuntu-512mb-sfo1-01:~# forever list
info:    Forever processes running
data:        uid  command         script    forever pid   id logfile                 uptime      
data:    [0] ur_r /usr/bin/nodejs server.js 20596   20601    /root/.forever/ur_r.log 2:0:8:9.930
// The example pid is 20601
```
* `forever stop <pid>` (if we have previously started the server process, stop it)
* `forever start server.js` 

Note: Make sure the `mongod` daemon is running else the server start will fail
Note: Make sure the check if the about page is showing up: 'http://45.55.25.115:3000/index.html'

To Run Mongo Db:
* Check or Create data folder: mkdir -p /root/data/log
* Then run `mongod --dbpath=/root/data --fork --logpath=/root/data/log/mongodb.log`

#### Tests
We use 'mocha' and 'chai' for tests. Our 'grunt' currently will run tests.
The tests are located here: <BASE_PATH>/dcl-server/server/api-test

To run tests:  
```
cd <BASE_PATH>/dcl-server  
mocha api-test/
```

Note: Will run all tests under the folder 'api-test'. Check mocha to run individual tests.

## Explore models
* Go to your favorite browser
* Go to link: [http://localhost:3000/explorer] (http://localhost:3000/explorer)

Note: To use loopback-explorer. You need to explicitly install npm package loopback-explorer : npm install loopback-explorer

## Some Apis Examples

* Get List of Players: [click here] (http://localhost:3000/api/Players)

* Get Player with Id: 1 and have Include the 'owner': [click here] (http://localhost:3000/api/Players/1?filter=%7B%20%22include%22%20%3A%20%22owner%22%20%7D)

## References
[https://strongloop.com/node-js/loopback-framework/] (https://strongloop.com/node-js/loopback-framework/)

## Models
Models are defined here: https://drive.google.com/file/d/0Bz-vxAL-7pnTY2ZsLWNLV3FhQU0/view?usp=sharing
