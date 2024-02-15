# THIS IS A SIMPLE APACHE GUACAMOLE CLONE
## By flebedev77
---

## What is SimGauc?
This software allows you to access a host computer from a web browser on another computer.

## How do i use SimGuac?

### Server setup
 - Firstly make sure you have nodejs installed on your host computer
 - Also make sure you have git installed
 - With a cli cd into a folder of your choice and get the code by running this command `git clone https://github.com/flebedev77/SimpleGuacamole.git .`
 - Next run `npm i socket.io express` to install dependencies
 - Then lastly run `node server.js`
 - (Optional) with `ngrok` open a reverse proxy tunnel with `ngrok http 3000`
 - And that is everything for the server!

### Client setup
 - Open a web browser
 - If you didn't open the ngrok tunnel then navigate to `http://<your_host_machine_ip>:3000` and replace <your_host_machine_ip> with the actual ip of the host machine
 - If you did open an ngrok tunnel then navigate to the url it randomly generated
 - That is it! Have fun!