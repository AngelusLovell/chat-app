const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('./utils/message')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
const { createRoom, deleteRoom, getRoom, getAllRooms } = require('./utils/rooms')

const app = express()
const server = http.createServer(app) // !imp - Right after the express()
const io = socketio(server)

const port = process.env.PORT
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
	
	socket.on('join', (options, callback) => {
		const { error, user } = addUser({ id: socket.id, ...options })
		
		// created a room
		const room = getRoom(user.room)
		if(room !== user.room) {
			createRoom(user.room)
		}
		
		if(error) {
			return callback(error)
		}
		
		socket.join(user.room)
		
		// when a new user joins
		socket.emit('message', generateMessage('Welcome to the chat-app', 'Admin'))
		socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`, 'Admin'))
		io.to(user.room).emit('roomData', {
			room : user.room,
			users : getUsersInRoom(user.room)
		})
		
		callback()
	})
	
	
	// when a user leaves
	socket.on('disconnect', () => {		
		const user = removeUser(socket.id)
		
		if(user) {
			const isLastUser = getUsersInRoom(user.room).length === 0 ? true : false
			if(isLastUser) {
				deleteRoom(user.room)
			}
			
			io.to(user.room).emit('message', generateMessage(`${user.username} has left!`, 'Admin'))
			io.to(user.room).emit('roomData', {
				room : user.room,
				users : getUsersInRoom(user.room)
			})
		}
	})
	
	// Normal message
	socket.on('sendMsg', (message, callback) => {
		const user = getUser(socket.id)
		
		
		const filter = new Filter()
		if(filter.isProfane(message)) {
			return callback('Profanity is not allowed!')
		}
		
		io.to(user.room).emit('message', generateMessage(message, user.username))
		callback()
	})
	
})

server.listen(port, () => {
	console.log(`Server is up on port ${port}!`)
})