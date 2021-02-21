const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const botname = "admin";
//Set static folder
app.use(express.static(path.join(__dirname, "public")));

//Run when client connect
io.on("connect", (socket) => {
	//Listen event join room
	socket.on("joinRoom", ({ username, room }) => {
		const user = userJoin(socket.id, username, room);

		socket.join(user.room);

		//Welcome only current user
		socket.emit("message", formatMessage(botname, "Welcome to chatbox"));

		// Broadcast when user connect(expect client)
		socket.broadcast
			.to(user.room)
			.emit(
				"message",
				formatMessage(botname, `${user.username} has joined the chat`)
			);

		//Send user and room info
		io.to(user.room).emit("roomUser", {
			room: user.room,
			users: getRoomUsers(user.room),
		});
	});

	//Run when client disconnect
	socket.on("disconnect", () => {
		const user = userLeave(socket.id);

		if (user) {
			io.to(user.room).emit(
				"message",
				formatMessage(botname, `${user.username} has left the chat`)
			);
		}
	});

	//Listen for chatMessage
	socket.on("chatMessage", (msg) => {
		const user = getCurrentUser(socket.id);

		io.to(user.room).emit("message", formatMessage(user.username, msg));
	});
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => {
	console.log("Server run");
});
