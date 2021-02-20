const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client connect
io.on("connect", (socket) => {
	//Welcome only current user
	socket.emit("message", "Welcome to chatbox");

	// Broadcast when user connect(expect client)
	socket.broadcast.emit("message", "A User has joined the chat");

	//Run when client disconnect
	socket.on("disconnect", () => {
		io.emit("message", "A user has left the chat");
	});

	//Listen for chatMessage
	socket.on("chatMessage", (msg) => {
		console.log(msg);
	});
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
	console.log("Server run");
});
