# ldapcli
## CLI application to simplify LDAP.
<br>

## Requirements
This software needs node.js and typescript to work properly. If you are using the docker, everything should be fine and you can skip this section.<br />
If the code is compiled and executed manually (not inside a docker container), make sure to install the following:<br /><br />
node: 15.4.0 or higher<br />
npm: 7.0.15 or higher<br />
tsc (typescript): 3.9.6 <br />
<br />

Links to install docker and docker-compose:<br />
[Debian](https://docs.docker.com/engine/install/debian/)<br />
[Ubuntu](https://docs.docker.com/engine/install/ubuntu/)<br /><br />

## Installation

Clone the code: 
```
With SSH:

git clone git@github.com:thesaintboy/ldapcli.git
```
or 

```
With HTTP:

git clone https://github.com/thesaintboy/ldapcli.git
```

## Usage

### PROD Usage

#### Modify the **src/config/ldapconfig.json** to connect to your LDAP-Server.
**Note:** You need to recompile the code after making changes to this file.<br />

#### Compile the TypeScript:
```
cd server:

npm run build
```

#### After the code is compiled, you can directly start using the following commands:
```
node dist/admin/cli/attributeTypes.js   // Retrieves the specifications of the requested attributeType
node dist/admin/cli/backup.js           // Creates two backup scripts in json and ldif
node dist/admin/cli/create.js           // Use this to create new objects
node dist/admin/cli/delete.js           // Use this to delete objects
node dist/admin/cli/modify.js           // Use this to modify objects
node dist/admin/cli/objectClass.js      // Retrieves the specifications of the requested objectClass
node dist/admin/cli/purge_caches.js     // Purges the caches
node dist/admin/cli/search_advance.js   // Use this to perform an advanced search query
node dist/admin/cli/search.js           // Use this to perform a search query based on dn or attribute of objects
```


### DEV Usage
If you do not have a functional LDAP or want to test this software, you can use the prepared LDAP server from the docker.
#### Start the docker:
```
sudo docker-compose up
```
**Note:** Use **--build** to create a new image without changing the image version and prevent caching issues:<br />
```
sudo docker-compose up --build
```

##### You can now log in to the server container and perform the exact same actions:
```
sudo docker exec -it $ID /bin/bash

node dist/admin/cli/search.js 
```

#### Stop the docker:
```
sudo docker-compose down
```
**Note:** Use **--remove-orphans** to stop cached images:<br />
```
sudo docker-compose down --remove-orphans
```
### Passwords
See the **passwords.passwd** file for the credentials.<br />


### Useful docker commands

#### Images

List images:
```
sudo docker ps
```
**Note:** Use -a to list all images:<br />
```
sudo docker ps -a
```
Log into an image:
```
sudo docker exec -it $ID /bin/bash/
```

#### Volumes

List volumes:
```
sudo docker volume ls
```
Remove a volume:
```
sudo docker volume rm $ID
```
Remove all volumes:
```
sudo docker volume prune
```
