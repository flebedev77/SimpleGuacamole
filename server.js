const express = require("express");
const app = express();
const screenshot = require('screenshot-desktop')
const Jimp = require("jimp");
const { exec } = require('child_process');

const io = require("socket.io")(app.listen(3000, console.log("Server listening on port 3000")));

app.use(express.static("public"));

let password = generatePassword(2);
let authenticatedSockets = [];

console.log(password);

const FPS = 1;

function generatePassword(len) {
    const letters = "abcdefghijklnmopqrstuvwxyz1234567890";
    let pass = "";

    for (let i = 0; i < len; i++) {
        pass += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return pass;
}

io.on("connection", (socket) => {
    //if socket was authenticated then remove from authenticated array
    socket.on("disconnect", () => {
        authenticatedSockets.forEach((sock, i) => {
            if (sock == socket.id) authenticatedSockets.splice(i, 1);
        })
    })

    //authentication checking
    socket.on("auth", (pass) => {
        if (pass == password) {
            socket.emit("authSucess", FPS);
            authenticatedSockets.push(socket.id);
            socket.join("Authed");
            console.log(authenticatedSockets);
        } else {
            socket.emit("wrong");
        }
    })

    //Sync mouse position
    socket.on("UpdateMousePosition", (mousePos) => {
        //check for inavlid requests
        if (mousePos == undefined || mousePos.x == undefined || mousePos.y == undefined || Number(mousePos.x) == undefined || Number(mousePos.y) == undefined) return;

        //check if the current socket has access
        let authed = false;
        authenticatedSockets.forEach((authenticatedSocket) => {
            if (authenticatedSocket == socket.id) {
                authed = true;
            }
        });

        //start a C++ executable which will move the mouse
        exec(`cd libs & MoveMouseJSLib.exe ${mousePos.x} ${mousePos.y}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            if (stderr) {
                console.log(stderr);
                return;
            }
        })
    })

    //check for clicks
    socket.on("MouseClick", (click) => {
        //check for inavlid requests
        if (click == undefined || click.code == undefined) return;

        //check if the current socket has access
        let authed = false;
        authenticatedSockets.forEach((authenticatedSocket) => {
            if (authenticatedSocket == socket.id) {
                authed = true;
            }
        });

        //start a C++ executable which will click the mouse
        exec(`cd libs & MouseClickJSLib.exe ${click.code}`, (err, stdout, stderr) => {
            if (err) {
                console.error(err);
                return;
            }
            if (stderr) {
                console.log(stderr);
                return;
            }
        })
    })

    socket.on("KeyPress", (key) => {
        //check for inavlid requests
        if (key == undefined || key.code == undefined) return;

        //check if the current socket has access
        let authed = false;
        authenticatedSockets.forEach((authenticatedSocket) => {
            if (authenticatedSocket == socket.id) {
                authed = true;
            }
        });

        //start a C++ executable which will press keys
        // exec(`cd libs & KeyPressJSLib.exe ${key.code}`, (err, stdout, stderr) => {
        //     if (err) {
        //         console.error(err);
        //         return;
        //     }
        //     if (stderr) {
        //         console.log(stderr);
        //         return;
        //     }
        // })
    })

})


setInterval(function () {
    //don't take screenshots when there is no one to send to
    if (authenticatedSockets.length != 0) {
        screenshot().then((img) => {
            io.sockets.to("Authed").emit("SendImage", img.toString("base64"));
        }).catch((err) => {
            if (err != undefined) {
                console.error(err);
            }
        })
    }

}, 1000 / FPS);