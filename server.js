const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser } = require('./utils/users')

const app = express();
const server = http.createServer(app);
const io = socketio(server)

app.use(express.static(path.join(__dirname, 'public')))
const botName = 'admin'


io.on('connection', socket => {	
	socket.on('joinRoom', ({username, room}) => {
		const user = userJoin(socket.id, username, room)
		socket.join(user.room)
		//Welcome Message
		socket.emit('message', formatMessage(botName,'Welcome to NTTML Chat !!!'))
		//Broadcast message
		socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} is Joined ..`));
	})
	
	//Listen for chatMessage
	socket.on('chatMessage', msg => {
		const user = getCurrentUser(socket.id)
		io.to(user.room).emit('message', formatMessage(user.username, msg))
	})
	//client disconnect
	socket.on('disconnect', () =>{
		io.emit('message', formatMessage(botName,'A user is left'))
		})
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Socket.io Server running on port ${PORT}`));
