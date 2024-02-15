const socket = io();
let image = document.getElementById("image");
const pingDisplay = document.getElementById("ping-display");

let passwordCorrent = false;
let fps = 10; //syncs to the server's fps

let mouse = {
    prevPosition: {
        x: 0,
        y: 0
    },
    position: {
        x: 0,
        y: 0
    },
    down: false
}

let lastPingTime = Date.now();

window.onload = function () {
    auth();
}

function auth() {
    let pass = prompt("Enter server password");

    socket.emit("auth", pass);
}

//called when server verified the password
socket.on("authSucess", (FPS) => {
    alert("Correct password! You're in!");
    passwordCorrent = true;
    fps = FPS;
})

//called when wrong password was sent to server
socket.on("wrong", () => {
    auth();
    passwordCorrent = false;
})

socket.on("SendImage", (img) => {
    //check if it is worth sending the new mouse position
    if (mouse.prevPosition.x != mouse.position.x || mouse.prevPosition.y != mouse.position.y) {
        socket.emit("UpdateMousePosition", { x: mouse.position.x, y: mouse.position.y });
    }

    //update previous mouse position
    mouse.prevPosition.x = mouse.position.x;
    mouse.prevPosition.y = mouse.position.y;

    updatePing();
    image.src = `data:image/png;base64,${img}`;
})

window.onmousemove = function (e) {
    mouse.position.x = e.x;
    mouse.position.y = e.y;
}
window.onmousedown = function (e) {
    mouse.down = true;
    let code = "dl";

    if (checkRightMB(e)) {
        code = "dr";
    }
    socket.emit("MouseClick", { code });
}
window.onmouseup = function (e) {
    mouse.down = false;
    let code = "ul";

    if (checkRightMB(e)) {
        code = "ur";
    }
    socket.emit("MouseClick", { code });
}

window.onkeydown = function(e) {

    socket.emit("KeyPress", { code: "d" + e.key });

    //return false;
}

window.onkeyup = function(e) {

    socket.emit("KeyPress", { code: "u" + e.key });

    //return false;
}

function updatePing() {
    let pingTime = Date.now();
    let deltaTime = Math.abs(pingTime - lastPingTime);
    pingDisplay.innerText = "PING: " + deltaTime;
    lastPingTime = pingTime;
}

//disable right click
document.addEventListener('contextmenu', event => {
    event.preventDefault();
});

function checkRightMB(event) {
    let isRightMB;

    if ("which" in event)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
        isRightMB = event.which == 3;
    else if ("button" in event)  // IE, Opera 
        isRightMB = event.button == 2;

    return isRightMB;
}